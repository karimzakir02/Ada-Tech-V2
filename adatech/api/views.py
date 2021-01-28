from rest_framework import generics, status
from .serializers import NotebookSerializer
from .models import Notebook
from rest_framework.views import APIView
from rest_framework.response import Response
import pandas as pd
from django.core.files.storage import FileSystemStorage
import json
from rest_framework.decorators import api_view

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
            notebook = Notebook.objects.filter(id=id)
            if len(notebook) > 0:
                data = NotebookSerializer(notebook[0]).data
                data["id"] = id
                data["is_author"] = self.request.session.session_key == \
                    notebook[0].author
                return Response(data, status=status.HTTP_200_OK)
            return Response({"Notebook not found": "Notebook does not exist"},
                            status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad Request": "Notebook id not found in request"},
                        status=status.HTTP_400_BAD_REQUEST)


class AnalysisClass():

    @api_view(('POST',))
    def file_upload(request):
        url = request.META["HTTP_REFERER"]
        to_find = "notebook/"
        length = len(to_find)
        index = url.rfind(to_find) + length
        id = int(url[index:])
        notebook = Notebook.objects.get(id=id)
        file_entry = request.FILES.getlist("file")[0]
        # TODO: return a response for when no files were placed
        # user cancelled his shit
        fs = FileSystemStorage()
        name = fs.save(file_entry.name, file_entry)
        df_name = file_entry.name
        path = fs.path(name)
        df = pd.read_csv(path)
        fs.delete(name)
        first5 = df.head()
        basic_values = first5.values.tolist()
        last5 = df.tail()
        ellipses = ["..." for column in df.columns]
        basic_values.append(ellipses)
        basic_values.extend(last5.values.tolist())
        data_summary = [df.columns.values.tolist(), basic_values]
        new_output = ["table", data_summary]
        output = json.loads(notebook.output)
        output.append(new_output)
        notebook.output = json.dumps(output)
        notebook.save()
        data = NotebookSerializer(notebook).data
        df_list = request.session.get("df_list", [])
        df_list.append(df_name)
        request.session["df_list"] = df_list
        data["dataframes"] = json.dumps(df_list)
        return Response(data, status=status.HTTP_200_OK)

    @api_view(('POST',))
    def random_samples(request):
        print("I was called!")
        return Response({"All Good!": "Random Samples got called"},
                        status=status.HTTP_200_OK)
