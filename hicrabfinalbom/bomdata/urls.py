from django.urls import path
from . import views

urlpatterns = [
    path('', views.initial_view, name='initial_page'),  # This will show the initial view
    path('homepage/', views.homepage_view, name='homepage'),  # Add this line to link to the homepage
    path('create-bom/', views.create_bom, name='create_bom'),
    path('delete-bom/<int:bom_id>/', views.delete_bom_view, name='delete_bom'),
    path('delete-component/<int:component_id>/', views.delete_component_view, name='delete_component'),
    path('delete-specification/<int:specification_id>/', views.delete_specification_view, name='delete_specification'),
    path('get_bomdata_bom/', views.get_bomdata_bom, name='get_bomdata_bom'),
    path('api/get_bom_details/<int:bom_id>/', views.get_bom_details, name='get_bom_details'),
    path('edit-bom/<int:bom_id>/', views.edit_bom_view, name='edit_bom'),
    path('edit-component/<int:component_id>/', views.edit_component_view, name='edit_component'),
    path('edit-specification/<int:specification_id>/', views.edit_specification_view, name='edit_specification'),
    path('api/get_component_details/<int:component_id>/', views.get_component_details, name='get_component_details'),
]
