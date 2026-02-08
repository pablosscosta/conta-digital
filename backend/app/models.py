from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
	class Role(models.TextChoices):
	    ADMIN = 'admin', 'Administrador'
	    CUSTOMER = 'user', 'Usuário'

	email = models.CharField(max_length=60, unique=True)
	full_name = models.CharField(max_length=60)
	cpf = models.CharField(max_length=11)
	role = models.CharField(max_length=20, choices=Role.choices)