from rest_framework import generics, status
from .serializers import NotebookSerializer, CreateNotebookSerializer
from .models import Notebook
from rest_framework.views import APIView
from rest_framework.response import Response
# from django.shortcuts import render

# Create your views here.


class NotebookView(generics.ListAPIView):
    queryset = Notebook.objects.all()
    serializer_class = NotebookSerializer


class CreateNotebookView(APIView):
    serializer_class = CreateNotebookSerializer

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
                data["is_author"] = self.request.session.session_key == \
                    notebook[0].author
                return Response(data, status=status.HTTP_200_OK)
            return Response({"Notebook not found": "Notebook does not exist"},
                            status=status.HTTP_404_NOT_FOUND)
        return Response({"Bad Request": "Notebook id not found in request"},
                        status=status.HTTP_400_BAD_REQUEST)
