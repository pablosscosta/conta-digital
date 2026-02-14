from django.urls import path
from .views import UserRegistrationView, BalanceAPIView, AdminUsersAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', UserRegistrationView.as_view(), name='user_registration'),
    path('account/balance/', BalanceAPIView.as_view(), name='my_balance'),
    path('admin/users/', AdminUsersAPIView.as_view(), name='admin_users_balances'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
