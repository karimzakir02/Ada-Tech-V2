from django.urls import path
from .views import index

urlpatterns = [
    # path("", home),
    # path("notebook/<str:notebookCode")
    path("", index),
    path("notebook", index),
    path("notebook/<str:id>", index),
    path("notebook/dataset/<str:id>", index)
]
