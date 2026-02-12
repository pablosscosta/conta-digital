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

		with transaction.atomic():

			password = validated_data.pop('password')
			user = User(**validated_data)
			user.set_password(password)
			role = validated_data.get('role')
			user.save()

			if user.role == User.Role.USER:

				Account.objects.create(
					user = user,
					balance = 0.00,
					status = 'ativo'
				)

			return user