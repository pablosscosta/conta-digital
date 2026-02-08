from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Account, Transaction

admin.site.register(User, UserAdmin)
admin.site.register(Account)
admin.site.register(Transaction)
