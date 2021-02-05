from djongo import models


# Create your models here.
class Dataset(models.Model):
    _id = models.ObjectIdField()
    id_name = models.CharField(max_length=100)
    name = models.CharField(max_length=100, blank=True)
    author = models.CharField(max_length=50, blank=True)
    columns = models.JSONField(blank=True)
    values = models.JSONField(blank=True)

    class Meta:
        abstract = True


class Notebook(models.Model):
    _id = models.ObjectIdField(primary_key=True)
    author = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    datasets = models.ArrayField(model_container=Dataset, default=[])
    dataset_names = models.JSONField(default=[])
    dataset_columns = models.JSONField(default=[])
    output = models.JSONField(default=[])
    # Can I store a pd.DataFrame object within the database directly?
