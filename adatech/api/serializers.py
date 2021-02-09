from .models import Notebook, Dataset
from rest_framework_mongoengine import serializers


class NotebookSerializer(serializers.DocumentSerializer):

    class Meta:
        model = Notebook
        fields = "__all__"
    # Now, you can change it within views.py without a problem hopefully!
    # Will this work when revising the notebook though? I am not sure
    # I think I will have to end up saving the dataframe in some sort of way
    # Perhaps save it at the end, when user presses the button


class DatasetSerializer(serializers.DocumentSerializer):

    class Meta:
        model = Dataset
        fields = "__all__"
