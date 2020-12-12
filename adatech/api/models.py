from django.db import models
import json


# Create your models here.
class Notebook(models.Model):
    id = models.AutoField(primary_key=True)
    author = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    output = models.JSONField(default=json.dumps([]))
