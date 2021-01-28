from django.urls import path
from .views import NotebookView, CreateNotebookView, GetNotebookView, \
    AnalysisClass
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path('notebooks', NotebookView.as_view()),
    path("create-notebook", CreateNotebookView.as_view()),
    path("get-notebook", GetNotebookView.as_view()),
    # path("add-file", BackEndClass.as_view()),
    # path("add-file", file_upload),
    path("add-file", AnalysisClass.file_upload),
    path("random-samples", AnalysisClass.random_samples),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
