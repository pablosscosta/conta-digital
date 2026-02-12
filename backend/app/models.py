from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
	username = None

	class Role(models.TextChoices):
	    ADMIN = 'admin', 'Administrador'
	    USER = 'user', 'Usuário'

	email = models.EmailField(max_length=254, unique=True)
	full_name = models.CharField(max_length=60)
	cpf = models.CharField(max_length=11)
	role = models.CharField(max_length=20, choices=Role.choices)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = []


class Account(models.Model):
	class Status(models.TextChoices):
	    ATIVO = 'ativo', 'Ativo'
	    INATIVO = 'inativo', 'Inativo'
	    BLOQUEADO = 'bloqueado', 'Bloqueado'

	user = models.OneToOneField(User, on_delete=models.PROTECT)
	balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.ATIVO)
	created_at = models.DateTimeField(auto_now_add=True)

class Transaction(models.Model):
	class Type(models.TextChoices):
		DEPÓSITO = 'depósito', 'Depósito'
		ENVIO = 'envio', 'Envio'
		RECEBIMENTO = 'recebimento', 'Recebimento'
		ESTORNO = 'estorno', 'Estorno'

	account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='transactions')
	origin_account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='sent_transfers')
	destination_account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='received_transfers')
	value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
	balance_after = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
	type = models.CharField(max_length=20, choices=Type.choices)
	description = models.CharField(max_length=254, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	related_transaction = models.ForeignKey('Transaction', on_delete=models.PROTECT, null=True, blank=True)