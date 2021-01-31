from rest_framework import generics, status
from .serializers import NotebookSerializer
from .models import Notebook
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files.storage import FileSystemStorage
import json
from rest_framework.decorators import api_view
from .classes import NotebookClass, Data

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
        id = notebook.id
        notebook_dict = request.session.get("notebook_dict", {})
        notebook_dict[f"{id}_notebook"] = json.dumps(NotebookClass(id, author))
        request.session["notebook_dict"] = notebook_dict
        return Response(NotebookSerializer(notebook).data,
                        status=status.HTTP_201_CREATED)


class GetNotebookView(APIView):
    serializer_class = NotebookSerializer
    lookup_url_kwarg = "id"

    def get(self, request, format=None):
        id = request.GET.get(self.lookup_url_kwarg)
        if id is not None:
            notebook = Notebook.objects.filter(id=id)
            if len(notebook) > 0:
                data = NotebookSerializer(notebook[0]).data
                data["id"] = id
                data["is_author"] = self.request.session.session_key == \
                    notebook[0].author
                df_list = request.session.get("df_list", [])
                data["dataframes"] = json.dumps(df_list)
                return Response(data, status=status.HTTP_200_OK)
            return Response({"Notebook not found": "Notebook does not exist"},
                            status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad Request": "Notebook id not found in request"},
                        status=status.HTTP_400_BAD_REQUEST)


class AnalysisClass():

    @api_view(('POST',))
    def file_upload(request):
        id = request.data.get("id")
        notebook = Notebook.objects.get(id=id)
        file_entry = request.FILES.getlist("file")[0]
        # TODO: return a response for when no files were placed
        # user cancelled his shit
        fs = FileSystemStorage()
        name = fs.save(file_entry.name, file_entry)
        df_name = file_entry.name
        path = fs.path(name)
        df_class = Data(df_name, path)
        fs.delete(name)
        output = json.loads(notebook.output)
        new_output = df_class.initial_output()
        output.append(new_output)
        notebook.output = json.dumps(output)
        notebook.save()
        request.session[f"{id}_notebook"].add_dataset(df_name, df_class)
        dataset_list = request.session[f"{id}_notebook"].dataset_names
        data = NotebookSerializer(notebook).data
        data["dataframes"] = json.dumps(dataset_list)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(('POST',))
    def random_samples(request):
        return Response({"output": "Random Samples got called",
                        "dataframes": "dataframes"},
                        status=status.HTTP_200_OK)
