from django.urls import path
from .views import NotebookView, CreateNotebookView, GetNotebookView, \
    Analysis, GetDatasetView, CloseNotebookView
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path('notebooks', NotebookView.as_view()),
    path("create-notebook", CreateNotebookView.as_view()),
    path("get-notebook", GetNotebookView.as_view()),
    path("close-notebook", CloseNotebookView.as_view()),
    path("get-dataset", GetDatasetView.as_view()),
    path("add-file", Analysis.file_upload),
    path("random-samples", Analysis.random_samples),
    path("describe-data", Analysis.describe_data),
    path("unique-values", Analysis.unique_values),
    path("find-nans", Analysis.find_nans),
    path("handle-nans", Analysis.handle_nans),
    path("sort", Analysis.sort),
    path("filter", Analysis.filter),
    path("filter-index", Analysis.filter_index),
    path("group-by-calculations", Analysis.group_by_calculations),
    path("add-column", Analysis.add_column),
    path("remove-columns", Analysis.remove_columns),
    path("shift-column", Analysis.shift_column),
    path("set-reset-index", Analysis.set_reset_index),
    path("combine-data", Analysis.combine_data),
    path("rename-row-column", Analysis.rename_row_column),
    path("remove-rows", Analysis.remove_rows)
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
