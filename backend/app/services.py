from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Account, Transaction

class TransferService:
    @staticmethod
    def execute_transfer(origin_account: Account, destination_account: Account, value: float, description: str):

        if value <= 0:
            raise ValidationError("O valor da transferência deve ser positivo.")
        
        if not origin_account.is_active or not destination_account.is_active:
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

            tx_envio = Transaction.objects.create(
                account=origin,                     
                origin_account=origin,               
                destination_account=destination,      
                value=value,                         
                balance_after=origin.balance,        
                type=Transaction.Type.ENVIO,         
                description=description,
                related_transaction=None
            )

            tx_recebimento = Transaction.objects.create(
                account=destination,                
                origin_account=origin,               
                destination_account=destination,     
                value=value,
                balance_after=destination.balance,   
                type=Transaction.Type.RECEBIMENTO,   
                description=description,
                related_transaction=None    
            )

            return tx_envio, tx_recebimento
