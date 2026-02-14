from rest_framework import serializers
from .models import User, Account
from django.db import transaction

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