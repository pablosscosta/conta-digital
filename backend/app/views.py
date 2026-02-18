from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsAdminRole
from rest_framework.exceptions import PermissionDenied
from .serializers import UserSerializer, AccountSerializer, DepositSerializer, TransferSerializer, TransactionStatementSerializer
from .models import Account, Transaction
from .services import DepositService, TransferService, ReverseService
from rest_framework.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes


@extend_schema(
    tags=['Autenticação'],
    summary="Cadastro de usuario",
    description="Cria um novo usuario no sistema solicitando nome, CPF, e-mail, senha e tipo de perfil (user ou admin). Acesso publico."
)
class UserRegistrationView(APIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Conta e Saldo'],
    summary="Consultar saldo do usuario logado",
    description="Retorna os dados da conta e o saldo atual do usuario autenticado."
)
class BalanceAPIView(APIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            account = Account.objects.get(user=request.user)
            serializer = AccountSerializer(account)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Account.DoesNotExist:
            return Response({"detail": "Conta não encontrada."}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=['Conta e Saldo'],
    summary="Listar todos os usuarios e saldos",
    description="Rota exclusiva para administradores. Lista todas as contas de usuarios do tipo 'user'."
)
class AdminUsersAPIView(APIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        accounts = Account.objects.filter(user__role='user')
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Operações Financeiras'],
    summary="Depositar valor na propria conta",
    description="Permite que o usuario logado realize um deposito em sua propria conta informando o valor."
)
class DepositView(APIView):
    serializer_class = DepositSerializer
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


@extend_schema(
    tags=['Operações Financeiras'],
    summary="Transferir valor para outro usuario",
    description="Realiza a transferencia de valores entre contas. O destinatario pode ser identificado por E-mail ou CPF."
)
class TransferView(APIView):
    serializer_class = TransferSerializer 
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


@extend_schema(
    tags=['Extrato'],
    summary="Extrato do usuario logado",
    description="Retorna o historico de transacoes do usuario autenticado. Permite filtros por data inicial, final e tipo de transacao.",
    parameters=[
        OpenApiParameter(name='date_start', description='Data inicial (YYYY-MM-DD)', required=False, type=str),
        OpenApiParameter(name='date_end', description='Data final (YYYY-MM-DD)', required=False, type=str),
        OpenApiParameter(name='type', description='Tipo de transacao (deposito, recebimento, envio, estorno)', required=False, type=str),
    ]
)
class StatementView(APIView):
    serializer_class = TransactionStatementSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        account = user.account

        transactions = Transaction.objects.filter(account=account).order_by('created_at')
        date_start = request.query_params.get('date_start')
        date_end = request.query_params.get('date_end')
        transaction_type = request.query_params.get('type')

        if date_start:
            transactions = transactions.filter(created_at__date__gte=date_start)

        if date_end:
            transactions = transactions.filter(created_at__date__gte=date_end)

        if transaction_type:
            transactions = transactions.filter(type=transaction_type)

        serializer = TransactionStatementSerializer(transactions, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

# Extrato de Terceiros (Admin)
@extend_schema(
    tags=['Extrato'],
    summary="Extrato de qualquer usuario",
    description="Rota exclusiva para administradores. Retorna o historico de transacoes de um usuario especifico atraves do ID do usuario.",
    parameters=[
        OpenApiParameter(name='date_start', description='Data inicial (YYYY-MM-DD)', required=False, type=str),
        OpenApiParameter(name='date_end', description='Data final (YYYY-MM-DD)', required=False, type=str),
        OpenApiParameter(name='type', description='Tipo de transacao', required=False, type=str),
    ]
)
class AdminStatementView(APIView):
    serializer_class = TransactionStatementSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, id):

        account = Account.objects.filter(user__id=id).first()

        if not account:
            raise ValidationError("Usuário não encontrado.")

        transactions = Transaction.objects.filter(
            account=account
        ).order_by("-created_at")
        date_start = request.query_params.get("date_start")
        date_end = request.query_params.get("date_end")
        transaction_type = request.query_params.get("type")

        if date_start:
            transactions = transactions.filter(created_at__date__gte=date_start)

        if date_end:
            transactions = transactions.filter(created_at__date__lte=date_end)

        if transaction_type:
            transactions = transactions.filter(type=transaction_type)

        serializer = TransactionStatementSerializer(transactions, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Operações Financeiras'],
    summary="Estornar uma transferencia especifica",
    description="Rota exclusiva para administradores. Realiza o estorno de uma transacao de envio atraves do ID da transacao.",
    request=None,
    responses={201: OpenApiTypes.OBJECT}
)
class ReverseTransferView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, id):

        try:
            reverse_sender, reverse_receiver = ReverseService.execute_reverse(id)
        except Transaction.DoesNotExist:
            raise ValidationError("Transação não encontrada.")

        return Response(
            {
                "message": "Transferência estornada com sucesso.",
                "reverse_transaction_id": reverse_sender.id
            },
            status=status.HTTP_201_CREATED
        )
