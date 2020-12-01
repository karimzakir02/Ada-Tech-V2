from django.urls import path
from .views import NotebookView, CreateNotebookView, GetNotebookView

urlpatterns = [
    path('notebooks', NotebookView.as_view()),
    path("create-notebook", CreateNotebookView.as_view()),
    path("get-notebook", GetNotebookView.as_view())
]
