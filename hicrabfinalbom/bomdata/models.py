from django.db import models

# BOM model (e.g., SQF_80, SQF_100, SQF_120)
class BOM(models.Model):
    name = models.CharField(max_length=100, unique=True)
    model = models.CharField(
        max_length=100,
        choices=[('model_a', 'Model A'), ('model_b', 'Model B'), ('model_c', 'Model C')]
 )
    work_order_number = models.CharField(max_length=100, blank=True, null=True)  # New field for work order number


    def __str__(self):
        return f"{self.name} ({self.get_model_display()})"
    def __str__(self):
        return f"{self.name} ({self.get_model_display()})"

class MainComponent(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# Component model (e.g., Pusher, Heat Chamber, Quenching Tank)
class Component(models.Model):
    name = models.CharField(max_length=100)
    main_component = models.CharField(max_length=100)  # Change this to CharField
    bom = models.ForeignKey(BOM, on_delete=models.CASCADE, related_name='components')

    def __str__(self):
        return self.name # Link to MainComponent


    def __str__(self):
        return f"{self.name} - {self.bom.name}"

# Specification model (this holds the user-input details for each component)
class Specification(models.Model):
    component = models.ForeignKey(Component, on_delete=models.CASCADE, related_name="specifications")
    specification = models.CharField(max_length=255)
    make = models.CharField(max_length=255, choices=[
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
        ('HICARB','HICARB'),
        ('NILL','NIL'),
        ('indian','indian'),
        ('JAISON','JAISON'),
        ('PMA','PMA'),
    ])
    purpose = models.CharField(max_length=255)
    quality = models.CharField(max_length=100)
    rate = models.CharField(max_length=100, default="0")  # or any relevant default value
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    objective = models.CharField(max_length=500, null=True, blank=True)  # New objective field

    def save(self, *args, **kwargs):
        self.total = self.price  #.6You can modify the calculation if needed
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.specification} - {self.component.name}- {self.make}"


