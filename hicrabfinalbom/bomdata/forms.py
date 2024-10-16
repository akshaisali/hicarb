from django import forms
from .models import BOM, Component, Specification

MAKE_CHOICES = [
    ('------', '------'),
    ('Pusher', 'Pusher'),
    ('Cumi', 'Cumi'),
    ('Cumi (Premier)', 'Cumi (Premier)'),
    ('Dimond', 'Dimond'),
    ('Fenner', 'Fenner'),
    ('Emarco', 'Emarco'),
    ('Nu Tech', 'Nu Tech'),
    ('Lovejoy', 'Lovejoy'),
    ('Audco', 'Audco'),
    ('NTN', 'NTN'),
    ('Raicer', 'Raicer'),
    ('Legris', 'Legris'),
    ('Delta', 'Delta'),
    ('Vanaz', 'Vanaz'),
    ('Avcon', 'Avcon'),
    ('IEPL', 'IEPL'),
    ('Champion Coolers', 'Champion Coolers'),
    ('Jhonson', 'Jhonson'),
    ('Auro', 'Auro'),
    ('Bharat Bijlee', 'Bharat Bijlee'),
    ('Rossi', 'Rossi'),
    ('SMC', 'SMC'),
    ('EP', 'EP'),
    ('HICARB', 'HICARB'),
    ('NILL', 'NIL'),
    ('indian', 'indian'),
    ('PMA','PMA'),
]

class BOMForm(forms.ModelForm):
    class Meta:
        model = BOM
        fields = ['name', 'model', 'work_order_number']


class ComponentForm(forms.ModelForm):

    name = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Enter Component'})
    )

    class Meta:
        model = Component
        fields = ['bom', 'name']

class SpecificationForm(forms.ModelForm):
    class Meta:
        model = Specification
        fields = ['component', 'specification', 'make', 'purpose', 'objective', 'quality', 'rate', 'price', 'total']

    def clean(self):
        cleaned_data = super().clean()
        price = cleaned_data.get('price')
        quantity = cleaned_data.get('quantity')
        
        # Calculate total if price and quantity are provided
        if price is not None and quantity is not None:
            cleaned_data['total'] = price * quantity

        return cleaned_data

    class Meta:
        model = Specification
        fields = ['component', 'specification', 'make','purpose', 'quality', 'rate', 'price','objective']
