from rest_framework import serializers
from .models import Notebook


class NotebookSerializer(serializers.ModelSerializer):
    dataframes = serializers.SerializerMethodField()

    class Meta:
        model = Notebook
        fields = ("id", "author", "created_at", "output", "dataframes")

    def get_dataframes(self, dataframes):
        return 0
    # Now, you can change it within views.py without a problem hopefully!
    # Will this work when revising the notebook though? I am not sure
    # I think I will have to end up saving the dataframe in some sort of way
    # Perhaps save it at the end, when user presses the button
