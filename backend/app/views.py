from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsAdminRole
from rest_framework.exceptions import PermissionDenied
from .serializers import UserSerializer, AccountSerializer, DepositSerializer
from .models import Account
from .services import DepositService

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BalanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'user':
            return Response(
                {"detail": "Apenas usuários podem consultar o próprio saldo."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            account = Account.objects.get(user=request.user)
        except Account.DoesNotExist:
            return Response(
                {"detail": "Conta não encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AccountSerializer(account)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUsersAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        accounts = Account.objects.filter(user__role='user')
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DepositView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = DepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        account = request.user.account
        value = serializer.validated_data["value"]

        transaction = DepositService.execute_deposit(
            account=account,
            value=value
        )

        return Response(
            {
                "id": transaction.id,
                "value": transaction.value,
                "balance_after": transaction.balance_after,
                "type": transaction.type,
                "description": transaction.description,
                "created_at": transaction.created_at,
            },
            status=status.HTTP_201_CREATED
        )