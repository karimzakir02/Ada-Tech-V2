# Generated by Django 3.0.5 on 2021-02-08 17:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_remove_notebook_output'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Notebook',
        ),
    ]
