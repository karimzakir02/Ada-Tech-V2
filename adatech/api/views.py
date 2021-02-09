from rest_framework import generics, status
from .serializers import NotebookSerializer, DatasetSerializer
from .models import Notebook, Dataset
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files.storage import FileSystemStorage
import json
from rest_framework.decorators import api_view
from .classes import NotebookHolder, DatasetHolder
import pandas as pd

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
            dataset = Dataset.objects(id=id)[0]
            data = DatasetSerializer(dataset).data
            return Response(data, status=status.HTTP_200_OK)


class AnalysisClass():

    @staticmethod
    def dataset_to_document(id_name, author, path):
        dataset = Dataset()
        dataset.id_name = id_name
        dataset.author = author
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
        dataset_document = AnalysisClass.dataset_to_document(id_name,
                                                             notebook.author,
                                                             path)
        dataset_document.save()
        dataset = DatasetHolder(dataset_document)
        notebook.dataset_ids.append(id_name)
        notebook.dataset_names.append(df_name)
        fs.delete(id_name)
        output = dataset.summary_output()
        notebook.output.append(output)
        data = NotebookSerializer(notebook).data
        notebook.save()
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
        dataset_document = request.session.get(f"{id}_{dataset_name}", None)
        dataset = DatasetHolder(dataset_document)
        output = dataset.random_samples(n)
        notebook = Notebook.objects(id=id)[0]
        print(output[2])
        notebook.output.append(output)
        data = NotebookSerializer(notebook).data
        notebook.save()
        return Response(data, status=status.HTTP_200_OK)
