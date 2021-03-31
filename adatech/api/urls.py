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
    path("find-nans", AnalysisClass.find_nans),
    path("handle-nans", AnalysisClass.handle_nans),
    path("sort", AnalysisClass.sort),
    path("filter", AnalysisClass.filter),
    path("filter-index", AnalysisClass.filter_index),
    path("group-by-calculations", AnalysisClass.group_by_calculations),
    path("add-column", AnalysisClass.add_column),
    path("remove-columns", AnalysisClass.remove_columns),
    path("shift-column", AnalysisClass.shift_column),
    path("set-reset-index", AnalysisClass.set_reset_index),
    path("combine-data", AnalysisClass.combine_data),
    path("rename-row-column", AnalysisClass.rename_row_column),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
