import pandas as pd
import numpy as np
from .models import Dataset
from sklearn.impute import SimpleImputer
import parser


class DatasetHolder:

    def __init__(self, model):
        self.id = str(model["id"])
        self.name = model["name"]
        self.author = model["author"]
        self.columns = model["columns"]
        self.values = model["values"]
        self.df = pd.DataFrame(data=self.values, columns=self.columns)
        self.columns_info()

    def columns_info(self):
        self.numerical_columns = self.df.select_dtypes(
            include=np.number).columns.tolist()
        self.object_columns = self.df.select_dtypes(
            exclude=np.number).columns.tolist()

        return self.columns, self.numerical_columns, self.object_columns

    def update_values(self):
        self.columns_info()
        # self.df_values = self.df.values.tolist()

    def update_document(self):
        document = Dataset.objects(id=self.id)[0]
        document.columns = self.df.columns.values.tolist()
        document.values = self.df.values.tolist()
        document.save()

    def to_document(self):
        document = Dataset()
        document.id_name = self.id_name
        document.author = self.author
        document.columns = self.columns
        document.values = self.df.values.tolist()
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
        return {"columns": df.columns.values.tolist(),
                "values": df.values.tolist()}

    def summary_output(self, df):
        df.fillna("NaN", inplace=True)
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
        new_dataset.columns = new_df_cols
        new_dataset.values = new_df_values
        new_dataset.save()
        if len(new_df) > 20:
            output = self.summary_output(new_df.reset_index())
            output = output + ["dataset/" + str(new_dataset.id)]
            return new_dataset, new_df, output
        else:
            output_df = new_df.reset_index()
            output_cols = output_df.columns.values.tolist()
            output_cols[0] = ""
            output_values = output_df.values.tolist()
            output = ["table", [output_cols, output_values], None]
            return new_dataset, new_df, output

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
                self.update_document()
                return False, None, self.initial_output()
        else:
            if new_dataframe:
                new_df = self.df.dropna(axis=int(drop_by))
                return self.new_dataset_return(new_df, new_dataframe_value)
            else:
                self.df.dropna(axis=int(drop_by), inplace=True)
                self.update_document()
                return False, None,  self.initial_output()

    def handle_nans_substitute(self, cols, substitute, custom_symbol,
                               custom_symbol_value, new_dataframe,
                               new_dataframe_value):
        if custom_symbol:
            if new_dataframe:
                new_df = self.df.replace(custom_symbol_value, substitute)
                return self.new_dataset_return(new_df, new_dataframe_value)
            else:
                self.df.replace(custom_symbol_value, substitute, inplace=True)
                self.update_document()
                return False, None, self.initial_output()
        else:
            if new_dataframe:
                new_df = self.df.fillna(substitute)
                return self.new_dataset_return(new_df, new_dataframe_value)
            else:
                self.df.fillna(substitute, inplace=True)
                self.update_document()
                return False, None, self.initial_output()

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
                self.update_document()
                return False, None, self.initial_output()
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
                self.update_document()
                return False, None, self.initial_output()

    def sort(self, column, sort_order, missing_position,
             new_dataframe, new_dataframe_value):
        sorted_df = self.df.sort_values(by=column,
                                        ascending=(sort_order == "ascending"),
                                        na_position=missing_position)
        if new_dataframe:
            return self.new_dataset_return(sorted_df, new_dataframe_value)
        else:
            self.df = sorted_df
            self.update_document()
            return False, None, self.initial_output()

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
            return False, None, ["text", "No rows matched the given value"]
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
                return False, None, output
            else:
                return False, None, ["table", [columns, values], None]

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
                return False, None, output
            else:
                filtered_df.reset_index(inplace=True)
                columns = filtered_df.columns.values.tolist()
                columns[0] = ""
                values = filtered_df.values.tolist()
                return False, None, ["table", [columns, values], None]

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


class NotebookHolder:

    def __init__(self, model):
        self.datasets = model.datasets
        self.dataset_names = model.dataset_names
        self.columns = model.dataset_columns
        self.num_columns = {}
        self.object_columns = {}

    def add_dataset(self, dataset_name, dataset):
        self.datasets[dataset_name] = dataset
        self.dataset_names.append(dataset_name)
        self.update_columns(dataset_name)

    def update_columns(self, dataset_name):
        columns = self.datasets[dataset_name].columns_info()
        self.columns[dataset_name] = columns[0]
        self.num_columns[dataset_name] = columns[1]
        self.object_columns[dataset_name] = columns[3]


class DatasetHolder2(DatasetHolder):

    def __init__(self, document):
        self.id_name = document.id_name
        self.name = document.name
        self.author = document.author
        self.columns = document.columns
        self.values = document.values
        self.df = pd.DataFrame(data=self.values, columns=self.columns)
