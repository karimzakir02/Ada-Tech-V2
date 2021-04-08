from rest_framework import generics, status
from .serializers import NotebookSerializer, DatasetSerializer
from .models import Notebook, Dataset
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files.storage import FileSystemStorage
import json
from rest_framework.decorators import api_view
from .Classes import DatasetHolder
import pandas as pd
# import time
import numpy as np

# from django.views import View
# from django.shortcuts import render

# Create your views here.


class NotebookView(generics.ListAPIView):
    queryset = Notebook.objects.all()
    serializer_class = NotebookSerializer


class CreateNotebookView(APIView):

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        author = self.request.session.session_key
        notebook = Notebook(author=author)
        notebook.save()
        return Response(NotebookSerializer(notebook).data,
                        status=status.HTTP_201_CREATED)


class GetNotebookView(APIView):
    serializer_class = NotebookSerializer
    lookup_url_kwarg = "id"

    def get(self, request, format=None):
        id = request.GET.get(self.lookup_url_kwarg)
        if id is not None:
            notebook = Notebook.objects(id=id)[0]
            if len(notebook) > 0:
                data = NotebookSerializer(notebook).data
                data["is_author"] = self.request.session.session_key == \
                    notebook.author
                data["dataset_names"] = list(notebook.datasets.keys())
                # notebook_session = NotebookHolder(notebook)
                # notebooks = request.session.get("notebooks", {})
                # notebooks[f"{id}_notebook"] = notebook_session
                # request.session["notebooks"] = notebooks
                return Response(data, status=status.HTTP_200_OK)
            return Response({"Notebook not found": "Notebook does not exist"},
                            status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad Request": "Notebook id not found in request"},
                        status=status.HTTP_400_BAD_REQUEST)


class CloseNotebookView(APIView):

    def post(self, request):
        id = request.data.get("id")
        datasets = json.loads(request.data.get("datasets"))
        print("Closed")
        for dataset in datasets:
            if f"{id}_{dataset}" in request.session:
                del request.session[f"{id}_{dataset}"]
        return Response(status=status.HTTP_200_OK)


class GetDatasetView(APIView):
    serializer_class = DatasetSerializer
    lookup_url_kwarg = "id"

    def get(self, request, format=None):
        id = request.GET.get(self.lookup_url_kwarg)
        if id is not None:
            dataset_document = Dataset.objects(id=id)[0]
            dataset = DatasetHolder(dataset_document)
            output = dataset.full_output()
            return Response(output, status=status.HTTP_200_OK)


def dataset_init(name, author, path, notebook_id):
    # Maybe there's a way to do this faster, by accesing particular chunks
    # or reading particular lines and certain columns and recreating the
    # output of the function and then asynch loading the rest of the data
    dataset = Dataset()
    dataset.author = author
    dataset.name = name
    data = pd.read_csv(path)
    dataset.index = data.index.values.tolist()
    dataset.columns = data.columns.values.tolist()
    dataset.numerical_columns = data.select_dtypes(
        include=np.number).columns.tolist()
    dataset.object_columns = data.select_dtypes(
        exclude=np.number).columns.tolist()
    dataset.values = data.values.tolist()
    dataset.notebook = notebook_id
    dataset.save()
    dataset_class = DatasetHolder(dataset, data)
    return dataset_class, dataset


def get_dataset(request, notebook_id, dataset_name):
    dataset_document = request.session.get(f"{notebook_id}_{dataset_name}")
    if not dataset_document:
        dataset_document = Dataset.objects(name=dataset_name,
                                           notebook=notebook_id)[0]
        serialized_document = DatasetSerializer(dataset_document).data
        request.session[f"{notebook_id}_{dataset_name}"] = serialized_document
    dataset = DatasetHolder(dataset_document)
    return dataset


def update_notebook(request, document, notebook):
    dataset_dict = {document.name: str(document.id)}
    columns_dict = {document.name: document.columns}
    num_columns_dict = {document.name: document.numerical_columns}
    object_columns_dict = {document.name: document.object_columns}
    serialized_data = DatasetSerializer(document).data
    request.session[f"{notebook.id}_{document.name}"] = serialized_data
    notebook.datasets.update(dataset_dict)
    notebook.dataset_columns.update(columns_dict)
    notebook.dataset_numerical_columns.update(num_columns_dict)
    notebook.dataset_object_columns.update(object_columns_dict)
    notebook.save()
    serialized_notebook = NotebookSerializer(notebook).data
    serialized_notebook["dataset_names"] = list(notebook.datasets.keys())
    return serialized_notebook


class Analysis():

    @api_view(('POST',))
    def file_upload(request):
        id = request.data.get("id")
        notebook = Notebook.objects(id=id)[0]
        file_entry = request.FILES.getlist("file")[0]
        # TODO: return a response for when no files were placed, user cancelled
        fs = FileSystemStorage()
        id_name = fs.save(file_entry.name, file_entry)
        name = file_entry.name
        path = fs.path(id_name)
        dataset, dataset_doc = dataset_init(name, notebook.author, path, id)
        fs.delete(id_name)
        output = dataset.initial_output()
        notebook.output.append(output)
        data = update_notebook(request, dataset_doc, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(('POST',))
    def random_samples(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        n = request.data.get("number")
        columns = json.loads(request.data.get("columns"))
        random_state = request.data.get("random_state")
        dataset = get_dataset(request, id, dataset_name)
        output = dataset.random_samples(n, columns, random_state)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def describe_data(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        columns = json.loads(request.data.get("columns"))
        percentiles = request.data.get("percentiles")
        dataset = get_dataset(request, id, dataset_name)
        output = dataset.describe_data(columns, percentiles)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST", ))
    def unique_values(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        column = request.data.get("column")
        count = json.loads(request.data.get("count"))
        dataset = get_dataset(request, id, dataset_name)
        output = dataset.unique_values(column, count)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST", ))
    def find_nans(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        columns = json.loads(request.data.get("columns"))
        custom_symbol = json.loads(request.data.get("custom_symbol"))
        custom_symbol_value = request.data.get("custom_symbol_value")
        dataset = get_dataset(request, id, dataset_name)
        output = dataset.find_nans(columns, custom_symbol, custom_symbol_value)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST", ))
    def handle_nans(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        columns = request.data.get("columns")
        dataset = get_dataset(request, id, dataset_name)
        custom_symbol = json.loads(request.data.get("custom_symbol"))
        custom_symbol_value = request.data.get("custom_symbol_value")
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        option = request.data.get("handle_nans_option")
        if option == "drop":
            drop_by = request.data.get("drop_by")
            new_document, output = dataset.handle_nans_drop_by(
                columns, drop_by,
                custom_symbol,
                custom_symbol_value,
                new_dataframe,
                new_dataframe_value)
        elif option == "substitute":
            substitute = request.data.get("substitute")
            new_document, output = dataset.handle_nans_substitute(
                columns, substitute,
                custom_symbol,
                custom_symbol_value,
                new_dataframe,
                new_dataframe_value)
        elif option == "impute":
            strategy = request.data.get("strategy")
            numerical_cols = json.loads(request.data.get("numerical_columns"))
            new_document, output = dataset.handle_nans_impute(
                numerical_cols, strategy,
                custom_symbol,
                custom_symbol_value,
                new_dataframe,
                new_dataframe_value)

        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST", ))
    def sort(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        column = request.data.get("column")
        sort_order = request.data.get("sort_order")
        missing_position = request.data.get("missing_position")
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        dataset = get_dataset(request, id, dataset_name)
        new_document, output = dataset.sort(column, sort_order,
                                            missing_position,
                                            new_dataframe,
                                            new_dataframe_value)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def filter(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        expression = request.data.get("expression")
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        dataset = get_dataset(request, id, dataset_name)
        new_document, output = dataset.filter(expression,
                                              new_dataframe,
                                              new_dataframe_value)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def filter_index(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        expression = request.data.get("expression")
        method = request.data.get("method")
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        dataset = get_dataset(request, id, dataset_name)
        notebook = Notebook.objects(id=id)[0]
        new_document, output = dataset.filter_index(expression, method,
                                                    new_dataframe,
                                                    new_dataframe_value)

        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def group_by_calculations(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        columns = json.loads(request.data.get("columns"))
        group_by_column = request.data.get("group_by_column")
        calculations = json.loads(request.data.get("calculations"))
        dataset = get_dataset(request, id, dataset_name)
        notebook = Notebook.objects(id=id)[0]
        output = dataset.group_by_calculations(columns, group_by_column,
                                               calculations)
        notebook.output.append(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def add_column(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        column_name = request.data.get("new_column_name")
        option = request.data.get("option")
        expression = request.data.get("expression")
        dataset = get_dataset(request, id, dataset_name)
        if option == "custom":
            new_document, output = dataset.add_custom_column(column_name,
                                                             expression)
        elif option == "rolling_mean":
            column = request.data.get("column")
            new_document, output = dataset.rolling_mean(column_name, column,
                                                        expression)
        elif option == "rolling_sum":
            column = request.data.get("column")
            new_document, output = dataset.rolling_sum(column_name, column,
                                                       expression)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def remove_columns(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        columns = json.loads(request.data.get("columns"))
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        dataset = get_dataset(request, id, dataset_name)
        new_document, output = dataset.remove_columns(columns, new_dataframe,
                                                      new_dataframe_value)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def shift_column(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        column = request.data.get("column")
        shift_by = request.data.get("shift_by")
        new_column = json.loads(request.data.get("new_column"))
        new_column_name = request.data.get("new_column_name")
        dataset = get_dataset(request, id, dataset_name)
        new_document, output = dataset.shift_column(column, shift_by,
                                                    new_column,
                                                    new_column_name)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def set_reset_index(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        option = request.data.get("option")
        drop = json.loads(request.data.get("drop"))
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        dataset = get_dataset(request, id, dataset_name)
        if option == "set":
            column = request.data.get("column")
            new_document, output = dataset.set_index(column, drop,
                                                     new_dataframe,
                                                     new_dataframe_value)
        else:
            new_document, output = dataset.reset_index(drop, new_dataframe,
                                                       new_dataframe_value)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def combine_data(request):
        id = request.data.get("id")
        left_data = request.data.get("left_dataset")
        right_data = request.data.get("right_dataset")
        option = request.data.get("option")
        indicator = json.loads(request.data.get("indicator"))
        left_dataset = get_dataset(request, id, left_data)
        right_dataset = get_dataset(request, id, right_data)
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        if option == "horizontal":
            how = request.data.get("horizontal_how")
            left_on = request.data.get("left_on")
            right_on = request.data.get("right_on")
            left_suffix = request.data.get("left_suffix")
            right_suffix = request.data.get("right_suffix")
            new_document, output = left_dataset.merge(right_dataset, left_on,
                                                      right_on, how, indicator,
                                                      left_suffix,
                                                      right_suffix,
                                                      new_dataframe,
                                                      new_dataframe_value)
        else:
            how = request.data.get("vertical_how")
            ignore_index = json.loads(request.data.get("ignore_index"))
            sort = json.loads(request.data.get("sort"))
            new_document, output = left_dataset.concat(right_dataset, how,
                                                       ignore_index, indicator,
                                                       sort, new_dataframe,
                                                       new_dataframe_value)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def rename_row_column(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        axis = request.data.get("option")
        from_value = request.data.get("from")
        to_value = request.data.get("to")
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        dataset = get_dataset(request, id, dataset_name)
        new_document, output = dataset.rename_row_column(axis, from_value,
                                                         to_value,
                                                         new_dataframe,
                                                         new_dataframe_value)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def remove_rows(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        option = request.data.get("option")
        expression = request.data.get("expression")
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        dataset = get_dataset(request, id, dataset_name)
        new_document, output = dataset.remove_rows(option, expression,
                                                   new_dataframe,
                                                   new_dataframe_value)
        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        data = update_notebook(request, new_document, notebook)
        return Response(data, status=status.HTTP_200_OK)
