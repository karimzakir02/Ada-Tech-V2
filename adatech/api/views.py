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


class AnalysisClass():

    @staticmethod
    def dataset_to_document(name, author, path):
        # Maybe there's a way to do this faster, by accesing particular chunks
        # or reading particular lines and certain columns and recreating the
        # output of the function and then asynch loading the rest of the data
        dataset = Dataset()
        dataset.author = author
        dataset.name = name
        data = pd.read_csv(path)
        dataset.columns = data.columns.values.tolist()
        dataset.values = data.values.tolist()
        return dataset

    @api_view(('POST',))
    def file_upload(request):
        id = request.data.get("id")
        notebook = Notebook.objects(id=id)[0]
        file_entry = request.FILES.getlist("file")[0]
        # TODO: return a response for when no files were placed, user cancelled
        fs = FileSystemStorage()
        id_name = fs.save(file_entry.name, file_entry)
        df_name = file_entry.name
        path = fs.path(id_name)
        dataset_document = AnalysisClass.dataset_to_document(df_name,
                                                             notebook.author,
                                                             path)
        dataset_document.save()
        dataset = DatasetHolder(dataset_document)
        fs.delete(id_name)
        output = dataset.initial_output()
        notebook.output.append(output)
        dataset_dict = {df_name: str(dataset_document.id)}
        columns_dict = {df_name: dataset.columns}
        num_columns_dict = {df_name: dataset.numerical_columns}
        notebook.datasets.update(dataset_dict)
        notebook.dataset_columns.update(columns_dict)
        notebook.dataset_numerical_columns.update(num_columns_dict)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        serialized_data = DatasetSerializer(dataset_document).data
        request.session[f"{id}_{df_name}"] = serialized_data
        return Response(data, status=status.HTTP_200_OK)

    @api_view(('POST',))
    def random_samples(request):
        # I think first check what happens if you access it through
        # the database, see the speed, then try working with the sessional data
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        n = request.data.get("number")
        columns = json.loads(request.data.get("columns"))
        random_state = request.data.get("random_state")
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
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
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
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
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
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
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
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
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
        custom_symbol = json.loads(request.data.get("custom_symbol"))
        custom_symbol_value = request.data.get("custom_symbol_value")
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        option = request.data.get("handle_nans_option")
        if option == "drop":
            drop_by = request.data.get("drop_by")
            new_document, new_df, output = dataset.handle_nans_drop_by(
                columns, drop_by,
                custom_symbol,
                custom_symbol_value,
                new_dataframe,
                new_dataframe_value)
        elif option == "substitute":
            substitute = request.data.get("substitute")
            new_document, new_df, output = dataset.handle_nans_substitute(
                columns, substitute,
                custom_symbol,
                custom_symbol_value,
                new_dataframe,
                new_dataframe_value)
        elif option == "impute":
            strategy = request.data.get("strategy")
            numerical_cols = json.loads(request.data.get("numerical_columns"))
            new_document, new_df, output = dataset.handle_nans_impute(
                numerical_cols, strategy,
                custom_symbol,
                custom_symbol_value,
                new_dataframe,
                new_dataframe_value)

        notebook = Notebook.objects(id=id)[0]
        notebook.output.append(output)
        if new_document:
            dataset_dict = {new_dataframe_value: str(new_document.id)}
            columns_dict = {new_dataframe_value: new_document.columns}
            num_columns_dict = {new_dataframe_value: new_df.select_dtypes(
                include=np.number).columns.tolist()}
            notebook.datasets.update(dataset_dict)
            notebook.dataset_columns.update(columns_dict)
            notebook.dataset_numerical_columns.update(num_columns_dict)
            serialized_data = DatasetSerializer(new_document).data
            request.session[f"{id}_{new_dataframe_value}"] = serialized_data

        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
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
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
        new_document, new_df, output = dataset.sort(column, sort_order,
                                                    missing_position,
                                                    new_dataframe,
                                                    new_dataframe_value)
        notebook = Notebook.objects(id=id)[0]
        if new_document:
            dataset_dict = {new_dataframe_value: str(new_document.id)}
            columns_dict = {new_dataframe_value: new_document.columns}
            num_columns_dict = {new_dataframe_value: new_df.select_dtypes(
                include=np.number).columns.tolist()}
            notebook.datasets.update(dataset_dict)
            notebook.dataset_columns.update(columns_dict)
            notebook.dataset_numerical_columns.update(num_columns_dict)
            serialized_data = DatasetSerializer(new_document).data
            request.session[f"{id}_{new_dataframe_value}"] = serialized_data
        notebook.output.append(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def filter(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        expression = request.data.get("expression")
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
        new_document, new_df, output = dataset.filter(expression,
                                                      new_dataframe,
                                                      new_dataframe_value)
        notebook = Notebook.objects(id=id)[0]
        if new_document:
            dataset_dict = {new_dataframe_value: str(new_document.id)}
            columns_dict = {new_dataframe_value: new_document.columns}
            num_columns_dict = {new_dataframe_value: new_df.select_dtypes(
                include=np.number).columns.tolist()}
            notebook.datasets.update(dataset_dict)
            notebook.dataset_columns.update(columns_dict)
            notebook.dataset_numerical_columns.update(num_columns_dict)
            serialized_data = DatasetSerializer(new_document).data
            request.session[f"{id}_{new_dataframe_value}"] = serialized_data
        notebook.output.append(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def filter_index(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        expression = request.data.get("expression")
        method = request.data.get("method")
        new_dataframe = json.loads(request.data.get("new_dataframe"))
        new_dataframe_value = request.data.get("new_dataframe_value")
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
        notebook = Notebook.objects(id=id)[0]
        new_doc, new_df, output = dataset.filter_index(expression, method,
                                                       new_dataframe,
                                                       new_dataframe_value)

        if new_doc:
            dataset_dict = {new_dataframe_value: str(new_doc.id)}
            columns_dict = {new_dataframe_value: new_doc.columns}
            num_columns_dict = {new_dataframe_value: new_df.select_dtypes(
                include=np.number).columns.tolist()}
            notebook.datasets.update(dataset_dict)
            notebook.dataset_columns.update(columns_dict)
            notebook.dataset_numerical_columns.update(num_columns_dict)
            serialized_data = DatasetSerializer(new_doc).data
            request.session[f"{id}_{new_dataframe_value}"] = serialized_data
        notebook.output.append(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        return Response(data, status=status.HTTP_200_OK)

    @api_view(("POST",))
    def group_by_calculations(request):
        id = request.data.get("id")
        dataset_name = request.data.get("dataset")
        columns = json.loads(request.data.get("columns"))
        group_by_column = request.data.get("group_by_column")
        calculations = json.loads(request.data.get("calculations"))
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
        notebook = Notebook.objects(id=id)[0]
        output = dataset.group_by_calculations(columns, group_by_column,
                                               calculations)
        notebook.output.append(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        data["dataset_names"] = list(notebook.datasets.keys())
        return Response(data, status=status.HTTP_200_OK)
