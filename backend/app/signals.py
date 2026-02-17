from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Account

@receiver(post_save, sender=User)
def create_user_account(sender, instance, created, **kwargs):
    if created:
        Account.objects.create(
            user=instance,
            balance=0.00,
            status='ativo'
        )
