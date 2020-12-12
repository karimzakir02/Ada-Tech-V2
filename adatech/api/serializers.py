from rest_framework import serializers
from .models import Notebook


class NotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notebook
        fields = ("id", "author", "created_at", "output")


class CreateNotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notebook
        fields = ("author", "output")


class GetFilePathSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notebook
        fields = ("file_path")
