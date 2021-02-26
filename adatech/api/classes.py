import pandas as pd
import numpy as np
from .models import Dataset


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
            output = self.summary_output(self.df)
            return output + ["dataset/" + self.id]
        else:
            df = self.df.fillna("NaN")
            return ["table", [self.columns, df.values.tolist()], None]

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
        return ["table", [df.columns.values.tolist(), basic_values]]

    def random_samples(self, n, columns, random_state):
        if random_state == "null":
            rs = None
        else:
            rs = int(random_state)
        samples = self.df[columns].sample(n=int(n), random_state=rs)
        samples.fillna("NaN", inplace=True)
        columns = samples.columns.values.tolist()
        values = samples.values.tolist()
        if len(samples) > 20:
            output = self.summary_output(samples)
            new_document = Dataset()
            new_document.id_name = f"{self.author}_samples_{self.id_name}"
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
                return ["text", "No missing values were detected"]
            missing_num = []
            for col in missing_cols:
                missing_num.append(int(self.df[col].isnull().sum()))
            missing_num.insert(0, "Amount of Missing Values")
            missing_cols.insert(0, "")
            return ["table", [missing_cols, [missing_num]], None]

    def handle_nans(self, cols, substitute):
        self.df.fillna(substitute, inplace=True)
        return self.initial_output(self.id)


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
