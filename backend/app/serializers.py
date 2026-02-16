from rest_framework import serializers
from .models import User, Account, Transaction
from django.db import transaction
from decimal import Decimal

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'full_name', 'cpf', 'email', 'password', 'role']
		read_only_fields = ['id']
		extra_kwargs = {
			'password': {'write_only': True}
		}

	def validate_email(self, value):
		if User.objects.filter(email=value).exists():
			raise serializers.ValidationError('E-mail já cadastrado')
		return value

	def validate_cpf(self, value):
		if User.objects.filter(cpf=value).exists():
			raise serializers.ValidationError('CPF já cadastrado')
		return value

	def validate_role(self, value):
		if value not in ['admin', 'user']:
			raise serializers.ValidationError('Perfil inválido')
		return value

	def create(self, validated_data):
		return User.objects.create_user(**validated_data)


class AccountSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)

	class Meta:
		model = Account
		fields = [
			'id',
			'user',
			'balance',
			'status',
			'created_at'
		]
		read_only_fields = ['id', 'balance', 'created_at']


class DepositSerializer(serializers.Serializer):

    value = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)


class TransferSerializer(serializers.Serializer):
	identifier = serializers.CharField(max_length = 255)
	value = serializers.DecimalField(max_digits=12, decimal_places=2)
	description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

	def validate_value(self, value):
		if value <= Decimal("0.00"):
			raise serializers.ValidationError("O valor deve ser maior que zero")
		return value


class TransactionStatementSerializer(serializers.ModelSerializer):
	class Meta:
		model = Transaction
		fields = [
			'id',
			'type',
			'value',
			'description',
			'created_at',
			'balance_after',
		]

