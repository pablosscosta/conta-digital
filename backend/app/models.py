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


class Account(models.Model):
	class Status(models.TextChoices):
	    ATIVO = 'ativo', 'Ativo'
	    BLOQUEADO = 'bloqueado', 'Bloqueado'

	user = models.OneToOneField(User, on_delete=models.CASCADE)
	account_number = models.IntegerField(unique=True)
	balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.ATIVO)
	created_at = models.DateTimeField(auto_now_add=True)