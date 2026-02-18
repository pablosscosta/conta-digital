from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal
from django.core.exceptions import ValidationError
from app.models import User, Account
from app.services import DepositService 

class Command(BaseCommand):
    help = 'Popula o banco de dados com usuários iniciais e saldos via DepositService'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.HTTP_INFO('--- Iniciando Seed de Dados ---'))

        data_seed = [
            {
                'full_name': 'Admin Sulivam', 'cpf': '11111111111', 
                'email': 'admin@sulivam.com', 'pass': 'admin123', 
                'role': User.Role.ADMIN, 'saldo': Decimal('1000.00')
            },
            {
                'full_name': 'João Silva', 'cpf': '22222222222', 
                'email': 'joao@email.com', 'pass': 'user123', 
                'role': User.Role.USER, 'saldo': Decimal('500.00')
            },
            {
                'name': 'Maria Souza', 'cpf': '33333333333', 
                'email': 'maria@email.com', 'pass': 'user123', 
                'role': User.Role.USER, 'saldo': Decimal('250.00')
            },
        ]

        try:
            with transaction.atomic():
                for item in data_seed:
                    user, created = User.objects.get_or_create(
                        email=item['email'],
                        defaults={
                            'full_name': item.get('full_name') or item.get('name'),
                            'cpf': item['cpf'],
                            'role': item['role'],
                            'is_staff': item['role'] == User.Role.ADMIN,
                            'is_superuser': item['role'] == User.Role.ADMIN,
                        }
                    )

                    if created:
                        user.set_password(item['pass'])
                        user.save()


                        account = Account.objects.get(user=user)


                        DepositService.execute_deposit(account, item['saldo'])

                        self.stdout.write(self.style.SUCCESS(
                            f"✓ {item['email']} criado com saldo R$ {item['saldo']}"
                        ))
                    else:
                        self.stdout.write(self.style.WARNING(f"! Usuário {item['email']} já existe. Pulando..."))

            self.stdout.write(self.style.SUCCESS('--- Seed finalizado com sucesso! ---'))

        except ValidationError as e:
            self.stdout.write(self.style.ERROR(f"Erro de validação no depósito: {e}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Erro inesperado: {str(e)}"))
