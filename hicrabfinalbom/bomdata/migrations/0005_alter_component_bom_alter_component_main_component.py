# Generated by Django 4.0.6 on 2024-10-08 11:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bomdata', '0004_maincomponent_alter_component_bom_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='component',
            name='bom',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='components', to='bomdata.bom'),
        ),
        migrations.AlterField(
            model_name='component',
            name='main_component',
            field=models.CharField(max_length=100),
        ),
    ]