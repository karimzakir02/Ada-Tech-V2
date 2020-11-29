from django.urls import path
from .views import NotebookView

urlpatterns = [
    path('notebooks', NotebookView.as_view()),
]
