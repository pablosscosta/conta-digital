from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsAdminRole
from rest_framework.exceptions import PermissionDenied
from .serializers import UserSerializer, AccountSerializer, DepositSerializer, TransferSerializer
from .models import Account
from .services import DepositService, TransferService
from rest_framework.exceptions import ValidationError

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

class TransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = TransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        origin_account = user.account

        identifier = serializer.validated_data["identifier"]
        value = serializer.validated_data["value"]
        description = serializer.validated_data.get("description", "")

        destination_account = Account.objects.filter(
            user__email=identifier
        ).first()

        if not destination_account:
            destination_account = Account.objects.filter(
                user__cpf=identifier
            ).first()

        if not destination_account:
            raise ValidationError("Destinatário não encontrado.")


        transfer_sent, _ = TransferService.execute_transfer(
            origin_account=origin_account,
            destination_account=destination_account,
            value=value,
            description=description
        )

        return Response(
            {
                "message": "Transferência realizada com sucesso.",
                "transfer_id": transfer_sent.id
            },
            status=status.HTTP_201_CREATED
        )

