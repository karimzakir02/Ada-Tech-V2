from django.shortcuts import render
from rest_framework import generics
from .serializers import NotebookSerializer
from .models import Notebook
# Create your views here.

class NotebookView(generics.ListAPIView):
    queryset = Notebook.objects.all()
    serializer_class = NotebookSerializer
