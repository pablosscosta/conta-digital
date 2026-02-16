from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db.models import Q


class CustomUserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
	username = None

	class Role(models.TextChoices):
	    ADMIN = 'admin', 'Administrador'
	    USER = 'user', 'Usuário'

	email = models.EmailField(max_length=254, unique=True)
	full_name = models.CharField(max_length=60)
	cpf = models.CharField(max_length=11, unique=True)
	role = models.CharField(max_length=20, choices=Role.choices)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = []
	objects = CustomUserManager()



class Account(models.Model):
	class Status(models.TextChoices):
	    ATIVO = 'ativo', 'Ativo'
	    INATIVO = 'inativo', 'Inativo'
	    BLOQUEADO = 'bloqueado', 'Bloqueado'

	user = models.OneToOneField(User, on_delete=models.PROTECT)
	balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.ATIVO)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.CheckConstraint(
				condition=models.Q(balance__gte=0),
				name='balance_non_negative'
			)
		]


class Transaction(models.Model):
	class Type(models.TextChoices):
		DEPÓSITO = 'depósito', 'Depósito'
		ENVIO = 'envio', 'Envio'
		RECEBIMENTO = 'recebimento', 'Recebimento'
		ESTORNO = 'estorno', 'Estorno'

	account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='transactions')
	origin_account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='sent_transfers', null=True, blank=True)
	destination_account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='received_transfers', null=True, blank=True)
	value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
	balance_after = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
	type = models.CharField(max_length=20, choices=Type.choices)
	description = models.CharField(max_length=254, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	related_transaction = models.ForeignKey('Transaction', on_delete=models.PROTECT, null=True, blank=True)
