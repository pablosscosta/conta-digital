from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from .models import User, Account, Transaction

class CustomUserAdmin(BaseUserAdmin):
    model = User
    list_display = ('email', 'full_name', 'cpf', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('full_name', 'cpf', 'role')}),
        ('Permissões', {'fields': ('is_staff', 'is_superuser', 'is_active', 'groups', 'user_permissions')}),
        ('Datas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'cpf', 'role', 'password1', 'password2'),
        }),
    )
    ordering = ('email',)
    search_fields = ('email', 'full_name', 'cpf')

admin.site.register(User, CustomUserAdmin)
admin.site.register(Account)
admin.site.register(Transaction)
