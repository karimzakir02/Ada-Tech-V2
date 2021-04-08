import pandas as pd
import numpy as np
from .models import Dataset
from sklearn.impute import SimpleImputer
import parser
import re


class DatasetHolder:

    def __init__(self, model, dataframe=None):
        self.id = str(model["id"])
        self.name = model["name"]
        self.author = model["author"]
        self.columns = model["columns"]
        self.numerical_columns = model["numerical_columns"]
        self.object_columns = model["object_columns"]
        self.values = model["values"]
        if dataframe is not None:
            self.df = dataframe
        else:
            self.df = pd.DataFrame(data=self.values, columns=self.columns)
        self.df.index = model["index"]
        self.notebook_id = model["notebook"]

    def columns_type(self, df):
        num_columns = df.select_dtypes(include=np.number).columns.tolist()
        object_columns = df.select_dtypes(exclude=np.number).columns.tolist()
        return num_columns, object_columns

    def update_document(self):
        document = Dataset.objects(id=self.id)[0]
        document.index = self.df.index.values.tolist()
        document.columns = self.df.columns.values.tolist()
        document.numerical_columns = self.df.select_dtypes(
            include=np.number).columns.tolist()
        document.object_columns = self.df.select_dtypes(
            exclude=np.number).columns.tolist()
        document.values = self.df.values.tolist()
        document.save()
        return document

    def initial_output(self):
        if len(self.df) > 20:
            output = self.summary_output(self.df.reset_index())
            return output + ["dataset/" + self.id]
        else:
            df = self.df.fillna("NaN")
            df.reset_index(inplace=True)
            columns = df.columns.values.tolist()
            columns[0] = ""
            values = df.values.tolist()
            return ["table", [columns, values], None]

    def full_output(self):
        df = self.df.fillna("NaN")
        df.reset_index(inplace=True)
        columns = df.columns.values.tolist()
        columns[0] = ""
        return {"columns": columns,
                "values": df.values.tolist()}

    def summary_output(self, df):
        try:
            df.fillna("NaN", inplace=True)
        except ValueError:
            pass
        first5 = df.head()
        basic_values = first5.values.tolist()
        last5 = df.tail()
        ellipses = ["..." for column in df.columns]
        basic_values.append(ellipses)
        basic_values.extend(last5.values.tolist())
        output_cols = df.columns.values.tolist()
        output_cols[0] = ""
        return ["table", [output_cols, basic_values]]

    def new_dataset_return(self, new_df, new_dataframe_value):
        new_df_cols = new_df.columns.values.tolist()
        new_df_values = new_df.values.tolist()
        new_dataset = Dataset()
        new_dataset.name = new_dataframe_value
        new_dataset.index = new_df.index.values.tolist()
        new_dataset.columns = new_df_cols
        new_dataset.values = new_df_values
        new_dataset.numerical_columns = new_df.select_dtypes(
            include=np.number).columns.tolist()
        new_dataset.object_columns = new_df.select_dtypes(
            exclude=np.number).columns.tolist()
        new_dataset.notebook = self.notebook_id
        new_dataset.save()

        if len(new_df) > 20:
            output = self.summary_output(new_df.reset_index())
            output = output + ["dataset/" + str(new_dataset.id)]
            return new_dataset, output
        else:
            output_df = new_df.reset_index()
            output_cols = output_df.columns.values.tolist()
            output_cols[0] = ""
            output_values = output_df.values.tolist()
            output = ["table", [output_cols, output_values], None]
            return new_dataset, output

    def random_samples(self, n, columns, random_state):
        if random_state == "null":
            rs = None
        else:
            rs = int(random_state)
        samples = self.df[columns].sample(n=int(n), random_state=rs)
        samples.fillna("NaN", inplace=True)
        samples.reset_index(inplace=True)
        columns = samples.columns.values.tolist()
        columns[0] = ""
        values = samples.values.tolist()
        if len(samples) > 20:
            output = self.summary_output(samples)
            new_document = Dataset()
            new_document.name = f"samples_{self.name}"
            new_document.columns = columns
            new_document.values = values
            new_document.save()
            return output + ["dataset/" + str(new_document.id)]
        else:
            return ["table", [columns, values], None]

    def describe_data(self, columns, extra_percentiles):
        if extra_percentiles == "null" or extra_percentiles == "":
            percentiles = [0.25, 0.75]
        else:
            es = extra_percentiles.split(" ")
            percentiles = [float(percentile) for percentile in es]
            percentiles = percentiles + [0.25, 0.75]
        describe = self.df[columns].describe(percentiles=percentiles)
        describe.reset_index(inplace=True)
        columns = describe.columns.values.tolist()
        columns[0] = ""
        values = describe.values.tolist()
        return ["table", [columns, values], None]

    def unique_values(self, column, count):
        unique_vals = self.df[column].unique().tolist()
        if count:
            count_nums = []
            occurences = self.df[column].value_counts()
            for value in unique_vals:
                count_nums.append(int(occurences[value]))
            del occurences
            unique_vals.insert(0, "")
            count_nums.insert(0, "Occurences")
            return ["table", [unique_vals, [count_nums]]]
        else:
            unique_vals = [str(val) for val in unique_vals]
            output = ", ".join(unique_vals)
            return ["text", output, None]

    def find_nans(self, cols, custom_symbol, custom_symbol_value):
        if custom_symbol:
            values = []
            columns = []
            for col in cols:
                missing = self.df[col].isin([custom_symbol_value]).sum(axis=0)
                if missing:
                    values.append(int(missing))
                    columns.append(col)
            values.insert(0, "Missing Values")
            columns.insert(0, "")
            return ["table", [columns, [values]]]
        else:
            missing_cols = [col for col in cols if self.df[col].isnull().any()]
            if not missing_cols:
                return ["text", "No missing values were found"]
            missing_num = []
            for col in missing_cols:
                missing_num.append(int(self.df[col].isnull().sum()))
            missing_num.insert(0, "Amount of Missing Values")
            missing_cols.insert(0, "")
            return ["table", [missing_cols, [missing_num]], None]

    def handle_nans_drop_by(self, cols, drop_by, custom_symbol,
                            custom_symbol_value, new_dataframe,
                            new_dataframe_value):
        if custom_symbol:
            if new_dataframe:
                if int(drop_by) == 0:
                    missing = self.df[(self.df == custom_symbol_value).any(
                        axis=1)].index.tolist()
                else:
                    missing = (self.df == custom_symbol_value).any(axis=0)
                    missing = missing[missing].index.tolist()
                new_df = self.df.drop(labels=missing, axis=int(drop_by))
                return self.new_dataset_return(new_df, new_dataframe_value)
            else:
                if int(drop_by) == 0:
                    missing = self.df[(self.df == custom_symbol_value).any(
                        axis=1)].index.tolist()
                else:
                    missing = (self.df == custom_symbol_value).any(axis=0)
                    missing = missing[missing].index.tolist()
                self.df.drop(labels=missing, axis=int(drop_by), inplace=True)
                document = self.update_document()
                return document, self.initial_output()
        else:
            if new_dataframe:
                new_df = self.df.dropna(axis=int(drop_by))
                return self.new_dataset_return(new_df, new_dataframe_value)
            else:
                self.df.dropna(axis=int(drop_by), inplace=True)
                document = self.update_document()
                return document,  self.initial_output()

    def handle_nans_substitute(self, cols, substitute, custom_symbol,
                               custom_symbol_value, new_dataframe,
                               new_dataframe_value):
        if custom_symbol:
            if new_dataframe:
                new_df = self.df.replace(custom_symbol_value, substitute)
                return self.new_dataset_return(new_df, new_dataframe_value)
            else:
                self.df.replace(custom_symbol_value, substitute, inplace=True)
                document = self.update_document()
                return document, self.initial_output()
        else:
            if new_dataframe:
                new_df = self.df.fillna(substitute)
                return self.new_dataset_return(new_df, new_dataframe_value)
            else:
                self.df.fillna(substitute, inplace=True)
                document = self.update_document()
                return document, self.initial_output()

    def handle_nans_impute(self, cols, strategy, custom_symbol,
                           custom_symbol_value, new_dataframe,
                           new_dataframe_value):
        if custom_symbol:
            imputer = SimpleImputer(missing_values=custom_symbol_value,
                                    strategy=strategy)
            imputed_cols = pd.DataFrame(imputer.fit_transform(self.df[cols]))
            imputed_cols.columns = self.df.columns
            if new_dataframe:
                new_df = self.df.copy()
                new_df[cols] = imputed_cols
                return self.new_dataset_return(new_df, new_dataframe_value)
            else:
                self.df[cols] = imputed_cols
                document = self.update_document()
                return document, self.initial_output()
        else:
            imputer = SimpleImputer(strategy=strategy)
            imputed_cols = pd.DataFrame(imputer.fit_transform(self.df[cols]))
            imputed_cols.columns = cols
            if new_dataframe:
                new_df = self.df.copy()
                new_df[cols] = imputed_cols
                return self.new_dataset_return(new_df, new_dataframe_value)
            else:
                self.df[cols] = imputed_cols
                document = self.update_document()
                return document, self.initial_output()

    def sort(self, column, sort_order, missing_position,
             new_dataframe, new_dataframe_value):
        sorted_df = self.df.sort_values(by=column,
                                        ascending=(sort_order == "ascending"),
                                        na_position=missing_position)
        if new_dataframe:
            return self.new_dataset_return(sorted_df, new_dataframe_value)
        else:
            self.df = sorted_df
            document = self.update_document()
            return document, self.initial_output()

    def filter(self, expression, new_dataframe, new_dataframe_value):
        # TODO: In the future, will need to handle for invalid inputs
        # TODO: Make sure that the index is displayed like intended
        connectives = {" and ": "&", " or ": "|"}
        for column in self.columns:
            if column in expression:
                expression = expression.replace(column, f"self.df['{column}']")
        for connective, substitute in connectives.items():
            if connective in expression:
                expression = expression.replace(connective, substitute)

        code = parser.expr(expression).compile()
        filtered_df = self.df[eval(code)]
        columns = filtered_df.columns.values.tolist()
        values = filtered_df.values.tolist()
        if len(filtered_df) == 0:
            return False, ["text", "No rows matched the given value"]
        elif new_dataframe:
            return self.new_dataset_return(filtered_df, new_dataframe_value)
        else:
            if len(filtered_df) > 20:
                output = self.summary_output(filtered_df)
                new_document = Dataset()
                new_document.name = f"filtered_{self.name}"
                new_document.columns = columns
                new_document.values = values
                new_document.save()
                output = output + ["dataset/" + str(new_document.id)]
                return False, output
            else:
                return False, ["table", [columns, values], None]

    def filter_index(self, expression, method, new_dataframe,
                     new_dataframe_value):
        if method == "loc":
            if ":" in expression:
                split = expression.split(":")
                x = int(split[0])
                y = int(split[1])
                filtered_df = self.df.loc[x:y]
            else:
                filtered_df = self.df.loc[int(expression)]
        else:
            if ":" in expression:
                split = expression.split(":")
                x = int(split[0])
                y = int(split[1])
                filtered_df = self.df.iloc[x:y]
            else:
                filtered_df = self.df.iloc[int(expression)]
        if isinstance(filtered_df, pd.Series):
            filtered_df = filtered_df.to_frame().transpose()
            for col in self.df.columns:
                filtered_df[col] = filtered_df[col].astype(
                    self.df[col].dtypes.name)
        if new_dataframe:
            return self.new_dataset_return(filtered_df, new_dataframe_value)
        else:
            if len(filtered_df) > 20:
                output = self.summary_output(filtered_df)
                columns = filtered_df.columns.values.tolist()
                values = filtered_df.values.tolist()
                new_document = Dataset()
                new_document.name = f"filtered_{self.name}"
                new_document.columns = columns
                new_document.values = values
                new_document.save()
                output = output + ["dataset/" + str(new_document.id)]
                return False, output
            else:
                filtered_df.reset_index(inplace=True)
                columns = filtered_df.columns.values.tolist()
                columns[0] = ""
                values = filtered_df.values.tolist()
                return False, ["table", [columns, values], None]

    def group_by_calculations(self, cols, group_by_col, calculations):
        if len(calculations) > 1:
            output_df = self.df.groupby(group_by_col).agg(calculations)
        else:
            output_df = self.df.groupby(
                group_by_col).agg(calculations[0])
        if len(output_df) > 20:
            output = self.summary_output(output_df)
            columns = output_df.columns.values.tolist()
            if len(calculations) > 1:
                new_cols = [columns[0][0]]
                for tup in columns[1:]:
                    new_col = tup[0] + ":" + tup[1]
                    new_cols.append(new_col)
                columns = new_cols
            output[1][0] = columns
            values = output_df.values.tolist()
            new_document = Dataset()
            new_document.name = f"grouped_{self.name}_{group_by_col}"
            new_document.columns = columns
            new_document.values = values
            new_document.save()
            output = output + ["dataset/" + str(new_document.id)]
            return output
        else:
            output_df.reset_index(inplace=True)
            columns = output_df.columns.values.tolist()
            if len(calculations) > 1:
                new_cols = [columns[0][0]]
                for tup in columns[1:]:
                    new_col = tup[0] + ":" + tup[1]
                    new_cols.append(new_col)
                columns = new_cols
            columns[0] = "Group"
            values = output_df.values.tolist()
            return ["table", [columns, values], None]

    def add_custom_column(self, column_name, formula):
        operators = "+", "-", "*", "/"
        regular_exp = "|".join(map(re.escape, operators))
        formula_parts = re.split(regular_exp, formula)
        formula_parts = [part.strip() for part in formula_parts]

        for part in formula_parts:
            if part in self.columns:
                formula = formula.replace(part, f"self.df['{part}']")
            else:
                try:
                    formula = formula.replace(part, part)
                except ValueError:
                    pass
        code = parser.expr(formula).compile()
        self.df[column_name] = eval(code)
        document = self.update_document()
        return document, self.initial_output()

    def rolling_mean(self, new_col_name, column, by):
        self.df[new_col_name] = self.df[column].rolling(int(by)).mean()
        document = self.update_document()
        return document, self.initial_output()

    def rolling_sum(self, new_col_name, column, by):
        self.df[new_col_name] = self.df[column].rolling(int(by)).sum()
        document = self.update_document()
        return document, self.initial_output()

    def remove_columns(self, columns, new_dataframe, new_dataframe_value):
        if new_dataframe:
            new_df = self.df.drop(columns, axis=1)
            return self.new_dataset_return(new_df, new_dataframe_value)
        else:
            self.df.drop(columns, axis=1, inplace=True)
        document = self.update_document()
        return document, self.initial_output()

    def shift_column(self, column, shift_by, new_column, new_column_name):
        if new_column:
            column_name = new_column_name
        else:
            column_name = column
        self.df[column_name] = self.df[column].shift(int(shift_by))
        document = self.update_document()
        return document. self.initial_output()

    def set_index(self, column, drop, new_dataframe, new_dataframe_value):
        if new_dataframe:
            new_df = self.df.set_index(column, drop=drop)
            return self.new_dataset_return(new_df, new_dataframe_value)
        else:
            self.df.set_index(column, drop=drop, inplace=True)
            document = self.update_document()
            return document, self.initial_output()

    def reset_index(self, drop, new_dataframe, new_dataframe_value):
        if new_dataframe:
            new_df = self.df.reset_index(drop=drop)
            return self.new_dataset_return(new_df, new_dataframe_value)
        else:
            self.df.reset_index(drop=drop, inplace=True)
            document = self.update_document()
            return document, self.initial_output()

    def merge(self, right_dataset, left_on, right_on, how, indicator,
              left_suffix, right_suffix, new_dataframe, new_dataframe_value):
        right_dataframe = right_dataset.df
        if left_on == "auto":
            left_on = None
        if right_on == "auto":
            right_on = None
        if not left_suffix:
            left_suffix = "_x"
        if not right_suffix:
            right_suffix = "_y"
        suffixes = (left_suffix, right_suffix)
        if left_on == "index" and right_on == "index":
            combined = self.df.merge(right_dataframe, how=how, left_index=True,
                                     right_index=True, suffixes=suffixes,
                                     indicator=indicator)
        elif left_on == "index":
            combined = self.df.merge(right_dataframe, how=how, left_index=True,
                                     right_on=right_on, suffixes=suffixes,
                                     indicator=indicator)
        elif right_on == "index":
            combined = self.df.merge(right_dataframe, how=how, left_on=left_on,
                                     right_index=True, suffixes=suffixes,
                                     indicator=indicator)
        else:
            combined = self.df.merge(right_dataframe, how=how, left_on=left_on,
                                     right_on=right_on, suffixes=suffixes,
                                     indicator=indicator)
        if new_dataframe:
            return self.new_dataset_return(combined, new_dataframe_value)
        self.df = combined
        document = self.update_document()
        return document, self.initial_output()

    def concat(self, right_dataset, how, ignore_index, indicator, sort,
               new_dataframe, new_dataframe_value):
        right_dataframe = right_dataset.df
        if indicator and not ignore_index:
            combined = pd.concat([self.df, right_dataframe], join=how,
                                 ignore_index=ignore_index, sort=sort,
                                 keys=[self.name, right_dataset.name])
            combined.reset_index(inplace=True)
            combined.rename(columns={"level_0": "from"}, inplace=True)
            combined.set_index("level_1", inplace=True)
            cols = combined.columns.values.tolist()
            cols.remove("from")
            combined = combined[cols + ["from"]]

        else:
            combined = pd.concat([self.df, right_dataframe], join=how,
                                 ignore_index=ignore_index, sort=sort)
        if new_dataframe:
            return self.new_dataset_return(combined, new_dataframe_value)
        self.df = combined
        document = self.update_document()
        return document, self.initial_output()

    def rename_row_column(self, axis, from_value, to_value, new_dataframe,
                          new_dataframe_value):
        axis = int(axis)
        if axis == 0:
            if self.df.index.is_integer():
                from_value = int(from_value)
                to_value = int(to_value)
            elif self.df.index.is_floating():
                from_value = float(from_value)
                to_value = float(to_value)
        if new_dataframe:
            new_df = self.df.rename({from_value: to_value}, axis=axis)
            return self.new_dataset_return(new_df, new_dataframe_value)
        self.df.rename({from_value: to_value}, axis=axis, inplace=True)
        document = self.update_document()
        return document, self.initial_output()

    def remove_rows(self, option, expression, new_dataframe,
                    new_dataframe_value):
        if option == "conditional":
            connectives = {" and ": "&", " or ": "|"}
            for column in self.columns:
                if column in expression:
                    expression = expression.replace(column,
                                                    f"self.df['{column}']")
            for connective, substitute in connectives.items():
                if connective in expression:
                    expression = expression.replace(connective, substitute)

            code = parser.expr(expression).compile()
            filtered_df = self.df[eval(code)]
            index_to_remove = filtered_df.index.values.tolist()
        else:
            if ":" in expression:
                split = expression.split(":")
                x = int(split[0])
                y = int(split[1])
                filtered_df = self.df.loc[x:y]
                index_to_remove = filtered_df.index.values.tolist()
            elif "," in expression:
                expression = expression.replace(" ", "")
                split = expression.split(",")
                index_to_remove = [int(i) for i in split]
            else:
                filtered_df = self.df.iloc[int(expression)]
                index_to_remove = filtered_df.index.values.tolist()

        if new_dataframe:
            new_df = self.df.drop(index_to_remove, axis=0)
            return self.new_dataset_return(new_df, new_dataframe_value)

        self.df.drop(index_to_remove, axis=0, inplace=True)
        document = self.update_document()
        return document, self.initial_output()
