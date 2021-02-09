import pandas as pd
import numpy as np
from .models import Dataset


class DatasetHolder:

    def __init__(self, name, author, path=False, data=False, reset_index=True):
        self.name = name
        self.author = author
        if path:
            self.df = pd.read_csv(path)
        else:
            self.df = data

        if reset_index:
            self.df.reset_index(inplace=True)

        self.columns_info()
        self.update_values()

    def columns_info(self):
        self.columns = self.df.columns.values.tolist()
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
        dataset.id_name = self.name
        dataset.author = self.author
        dataset.columns = self.columns
        dataset.values = self.df.values.tolist()
        return dataset

    def greater_than_20(self, df):
        if len(df) > 20:
            output = self.initial_output(True, df)
        else:
            output = ["table",
                      [df.columns.values.tolist(), df.values.tolist()]]
        return output

    def initial_output(self, custom=False):
        if custom:
            df = custom
        else:
            df = self.df

        first5 = df.head()
        basic_values = first5.values.tolist()
        last5 = df.tail()
        ellipses = ["..." for column in self.columns]
        basic_values.append(ellipses)
        basic_values.extend(last5.values.tolist())
        return ["table", [df.columns.values.tolist(), basic_values]]

    def random_samples(self, columns, n_samples, weight=None):
        if weight is not None:
            weight = self.df[weight]

        if n_samples < 1:
            samples = self.df[columns].sample(frac=n_samples, weight=weight)
        else:
            samples = self.df[columns].sample(n=int(n_samples), weight=weight)

        # columns = samples.columns.values.tolist()
        # values = samples.values.tolist()
        # For later implementation of a full dataframe
        output = self.greater_than_20(samples)

        return output


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
