from rest_framework import generics, status
from .serializers import NotebookSerializer
from .models import Notebook
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files.storage import FileSystemStorage
import json
from rest_framework.decorators import api_view
from .classes import NotebookHolder, DatasetHolder

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


class AnalysisClass():

    @api_view(('POST',))
    def file_upload(request):
        # The first thing to do would be to make sure that the Data is saved
        # as an embedded document in the notebook
        # Perhaps have a function within the data class that just converts
        # the class automatically to what you need to embed the document
        # There is also a different way to doing this, using the data model
        # itself
        # The only way to do this is using the actual model stoopid
        id = request.data.get("id")
        notebook = Notebook.objects(id=id)[0]
        file_entry = request.FILES.getlist("file")[0]
        # TODO: return a response for when no files were placed, user cancelled
        fs = FileSystemStorage()
        id_name = fs.save(file_entry.name, file_entry)
        df_name = file_entry.name
        path = fs.path(id_name)
        dataset = DatasetHolder(id_name, df_name, notebook.author, path=path)
        dataset_document = dataset.to_document()
        dataset_document.save()
        notebook.dataset_ids.append(id_name)
        notebook.dataset_names.append(df_name)
        fs.delete(id_name)
        output = dataset.initial_output()
        notebook.output.append(output)
        data = NotebookSerializer(notebook).data
        notebook.save()
        return Response(data, status=status.HTTP_200_OK)

    @api_view(('POST',))
    def random_samples(request):
        return Response({"output": "Random Samples got called",
                         "dataframes": "dataframes"},
                        status=status.HTTP_200_OK)
