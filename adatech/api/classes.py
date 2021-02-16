import pandas as pd
import numpy as np
from .models import Dataset


class DatasetHolder:

    def __init__(self, model):
        self.id_name = model["id_name"]
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

    def to_document(self):
        dataset = Dataset()
        dataset.id_name = self.id_name
        dataset.author = self.author
        dataset.columns = self.columns
        dataset.values = self.df.values.tolist()
        return dataset

    def initial_output(self, id):
        if len(self.df) > 20:
            output = self.summary_output(self.df)
            return output + ["dataset/" + str(id)]
        else:
            return ["table", [self.columns, self.df.values.tolist()], None]

    def summary_output(self, df):

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
        columns = samples.columns.values.tolist()
        values = samples.values.tolist()
        if len(samples) > 20:
            # Needs to be a link, not the other thing
            output = self.summary_output(samples)
            model = Dataset()
            model.id_name = f"{self.author}_samples_{self.id_name}"
            model.name = f"samples_{self.name}"
            model.columns = columns
            model.values = values
            model.save()
            return output + ["dataset/" + str(model.id)]
        else:
            return ["table", [columns, values], None]
        # columns = samples.columns.values.tolist()
        # values = samples.values.tolist()
        # For later implementation of a full dataframe

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
            output = ", ".join(unique_vals)
            return ["text", output, None]


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
