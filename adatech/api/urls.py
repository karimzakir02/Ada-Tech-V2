from django.urls import path
from .views import NotebookView, CreateNotebookView, GetNotebookView, \
    AnalysisClass, GetDatasetView
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path('notebooks', NotebookView.as_view()),
    path("create-notebook", CreateNotebookView.as_view()),
    path("get-notebook", GetNotebookView.as_view()),
    path("get-dataset", GetDatasetView.as_view()),
    path("add-file", AnalysisClass.file_upload),
    path("random-samples", AnalysisClass.random_samples),
    path("describe-data", AnalysisClass.describe_data),
    path("unique-values", AnalysisClass.unique_values),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
