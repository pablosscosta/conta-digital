from django.urls import path, include
from .views import UserRegistrationView, BalanceAPIView, AdminUsersAPIView, DepositView, TransferView, StatementView, AdminStatementView, ReverseTransferView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from drf_spectacular.utils import extend_schema_view, extend_schema


urlpatterns = [
    # Autenticação
    path('auth/register/', UserRegistrationView.as_view(), name='user_registration'),
    path('auth/login/', extend_schema_view(
        post=extend_schema(
            tags=['Autenticação'], 
            summary="Login e obtencao de token",
            description="Autentica o usuario e retorna os tokens access e refresh."
        )
    )(TokenObtainPairView.as_view()), name='token_obtain_pair'),
    path('auth/refresh/', extend_schema_view(
        post=extend_schema(exclude=True)
    )(TokenRefreshView.as_view()), name='token_refresh'),

    # Conta e Saldo
    path('account/balance/', BalanceAPIView.as_view(), name='my_balance'),
    path('admin/users/', AdminUsersAPIView.as_view(), name='admin_users_balances'),

    # Operações Financeiras
    path('account/deposit/', DepositView.as_view(), name='deposit'),
    path('account/transfer/', TransferView.as_view(), name='transfer'),
    path('admin/reverse/<int:id>', ReverseTransferView.as_view(), name='reverse'),

    # Extrato
    path('account/statement/', StatementView.as_view(), name='my_statement'),
    path('admin/users/<int:id>/statement', AdminStatementView.as_view(), name='admin_users_statement'),


    # Documentação da API
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

]
