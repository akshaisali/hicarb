from django.http import JsonResponse
from django.shortcuts import render, redirect
from .forms import BOMForm, ComponentForm, SpecificationForm
from .models import BOM, Component, Specification
from django.shortcuts import render, get_object_or_404, redirect
from .forms import BOMForm, ComponentForm, SpecificationForm
from django.contrib import messages


def initial_view(request):
    return render(request, 'initial_page.html')
def homepage_view(request):
    bom_list = BOM.objects.prefetch_related('components__specifications').all()
    
    context = {
        'bom_list': bom_list
    }
    return render(request, 'homepage.html', context)
def create_bom(request):
    bom_form = BOMForm()
    component_form = ComponentForm()
    specification_form = SpecificationForm()

    if request.method == 'POST':
        bom_form = BOMForm(request.POST)
        component_form = ComponentForm(request.POST)
        specification_form = SpecificationForm(request.POST)

        if bom_form.is_valid():
            bom_form.save()
            return redirect('create_bom')

        if component_form.is_valid():
            component_form.save()
            return redirect('create_bom')

        if specification_form.is_valid():
            specification_form.save()
            return redirect('create_bom')

    bom_list = BOM.objects.all()  # Retrieve all BOMs for display
    return render(request, 'create_bom.html', {
        'bom_form': bom_form,
        'component_form': component_form,
        'specification_form': specification_form,
        'bom_list': bom_list,
    })

def delete_bom_view(request, bom_id):
    bom = get_object_or_404(BOM, id=bom_id)
    bom.delete()
    return redirect('homepage')  # Redirect after deletion to a homepage or BOM list page

# Delete Component view
def delete_component_view(request, component_id):
    component = get_object_or_404(Component, id=component_id)
    component.delete()
    return redirect('homepage')

# Delete Specification view
def delete_specification_view(request, specification_id):
    specification = get_object_or_404(Specification, id=specification_id)
    specification.delete()
    messages.success(request, 'Specification deleted successfully.')
    return redirect('homepage')

# Edit BOM view
def edit_bom_view(request, bom_id):
    bom = get_object_or_404(BOM, id=bom_id)
    if request.method == 'POST':
        form = BOMForm(request.POST, instance=bom)
        if form.is_valid():
            form.save()
            return redirect('homepage')
    else:
        form = BOMForm(instance=bom)
    return render(request, 'edit_bom.html', {'form': form})

# Edit Component view
def edit_component_view(request, component_id):
    component = get_object_or_404(Component, id=component_id)
    if request.method == 'POST':
        form = ComponentForm(request.POST, instance=component)
        if form.is_valid():
            form.save()
            return redirect('homepage')
    else:
        form = ComponentForm(instance=component)
    return render(request, 'edit_component.html', {'form': form})

# Edit Specification view
def edit_specification_view(request, specification_id):
    specification = get_object_or_404(Specification, id=specification_id)
    if request.method == 'POST':
        form = SpecificationForm(request.POST, instance=specification)
        if form.is_valid():
            form.save()
            messages.success(request, 'Specification updated successfully.')
            return redirect('homepage')
        else:
            messages.error(request, 'There were errors in the form.')
    else:
        form = SpecificationForm(instance=specification)
    return render(request, 'edit_specification.html', {'form': form})

   
def get_bomdata_bom(request):
    if request.method == 'GET':
        sqf_type = request.GET.get('NAME', None)

        # # Check if the type is valid
        # if sqf_type and sqf_type in dict(BOMForm.TYPE_CHOICES).keys():
        #     sqf_entries = sqffieldDATA.objects.filter(type=sqf_type)
        # else:
        #     # Fetch all entries if type is None or invalid type is provided
        #     sqf_entries = sqffieldDATA.objects.all()
        bom_list = BOM.objects.all()
        print(bom_list)
        #data = list(sqf_type.values())
        return bom_list
    
    return JsonResponse({'error': 'Invalid HTTP method'}, status=405)
def get_bom_details(request, bom_id):
    try:
        bom = BOM.objects.get(id=bom_id)
        components = Component.objects.filter(bom=bom).prefetch_related('specifications')

        component_list = []
        for component in components:
            specifications = component.specifications.values(
                'id',  # Include the specification id
                'specification',
                'make',
                'purpose',
                'quality',
                'objective',
                'rate',
                'price',
                'total'
            )

            component_list.append({
                'id': component.id,  # Add component id here
                'name': component.name,
                'specifications': list(specifications)  # Convert QuerySet to list
            })

        return JsonResponse({
            'success': True,
            'bom': {
                'id': bom.id,  # Include BOM id here
                'name': bom.name,
                'work_order_number': bom.work_order_number
            },
            'components': component_list
            
        })
    except BOM.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'BOM not found.'})
from django.http import JsonResponse
from .models import Component

def get_component_details(request, component_id):
    try:
        component = Component.objects.get(id=component_id)
        specifications = component.specifications.values(
            'specification', 'make', 'purpose','objective','quality','rate' 'price', 'total'
        )
        return JsonResponse({
            'success': True,
            'component': {
                'id': component.id,
                'name': component.name,
                'specifications': list(specifications),
            }
        })
    except Component.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Component not found.'}, status=404)
