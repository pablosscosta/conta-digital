from django.db import transaction
from rest_framework.exceptions import ValidationError
from .models import Account, Transaction
from decimal import Decimal

class TransferService:
    @staticmethod
    def execute_transfer(origin_account: Account, destination_account: Account, value: Decimal, description: str):

        if value <= Decimal("0.00"):
            raise ValidationError("O valor da transferência deve ser positivo.")
        
        if not origin_account.status or not destination_account.status:
            raise ValidationError("Ambas as contas precisam estar ativas.")

        if origin_account.id == destination_account.id:
            raise ValidationError("Não é possível transferir para a mesma conta.")

        with transaction.atomic():
            ids = sorted([origin_account.id, destination_account.id])
            accounts_queryset = Account.objects.select_for_update().filter(id__in=ids)

            origin = accounts_queryset.get(id=origin_account.id)
            destination = accounts_queryset.get(id=destination_account.id)

            if origin.balance < value:
                raise ValidationError(f"Saldo insuficiente. Saldo atual: {origin.balance}")

            origin.balance -= value
            destination.balance += value
            
            origin.save()
            destination.save()

            transfer_sent = Transaction.objects.create(
                account=origin,                     
                origin_account=origin,               
                destination_account=destination,      
                value=value,                         
                balance_after=origin.balance,        
                type=Transaction.Type.ENVIO,         
                description=description,
                related_transaction=None
            )

            transfer_received = Transaction.objects.create(
                account=destination,                
                origin_account=origin,               
                destination_account=destination,     
                value=value,
                balance_after=destination.balance,   
                type=Transaction.Type.RECEBIMENTO,   
                description=description,
                related_transaction=None    
            )

            return transfer_sent, transfer_received



class DepositService:

    @staticmethod
    def execute_deposit(account: Account, value: Decimal):

        if value < Decimal("1.00"):
            raise ValidationError("O valor mínimo para depósito é R$ 1,00.")

        if value > Decimal("10000.00"):
            raise ValidationError("O valor máximo por depósito é R$ 10.000,00.")

        with transaction.atomic():

            account.balance += value
            account.save()

            transfer_deposit = Transaction.objects.create(
                account=account,
                origin_account=None,
                destination_account=None,
                value=value,
                balance_after=account.balance,
                type=Transaction.Type.DEPÓSITO,
                description='',
                related_transaction=None
            )

        return transfer_deposit