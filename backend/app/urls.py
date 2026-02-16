from django.urls import path
from .views import UserRegistrationView, BalanceAPIView, AdminUsersAPIView, DepositView, TransferView, StatementView, AdminStatementView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    # Autenticação
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', UserRegistrationView.as_view(), name='user_registration'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Conta e Saldo
    path('account/balance/', BalanceAPIView.as_view(), name='my_balance'),
    path('admin/users/', AdminUsersAPIView.as_view(), name='admin_users_balances'),

    # Operações Financeiras
    path('account/deposit/', DepositView.as_view(), name='deposit'),
    path('account/transfer/', TransferView.as_view(), name='transfer'),

    # Extrato
    path('account/statement/', StatementView.as_view(), name='my_statement'),
    path('admin/users/<int:id>/statement', AdminStatementView.as_view(), name='admin_users_statement'),
]
