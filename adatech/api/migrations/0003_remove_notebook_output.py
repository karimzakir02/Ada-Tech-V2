# Generated by Django 3.0.5 on 2021-02-01 22:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_notebook_output'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notebook',
            name='output',
        ),
    ]