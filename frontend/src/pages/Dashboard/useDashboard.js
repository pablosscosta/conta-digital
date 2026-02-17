import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export const useDashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositValue, setDepositValue] = useState("");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({ identifier: "", value: "", description: "" });
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", type: "" });

  const filteredTransactions = transactions
    .slice(0)
    .reverse()
    .filter((t) => {
      const transactionDate = new Date(t.created_at).toISOString().split('T')[0];
      const matchStart = filters.startDate ? transactionDate >= filters.startDate : true;
      const matchEnd = filters.endDate ? transactionDate <= filters.endDate : true;
      const matchType = filters.type ? t.type === filters.type : true;
      return matchStart && matchEnd && matchType;
    });

  const fetchData = async () => {
    try {
      const [balanceResponse, statementResponse] = await Promise.all([
        api.get("/account/balance/"),
        api.get("/account/statement/"),
      ]);
      setBalance(balanceResponse.data.balance);
      setUser(balanceResponse.data.user);
      setTransactions(statementResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      localStorage.clear();
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/");
      return;
    }
    fetchData();
  }, [navigate]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/account/deposit/", { value: depositValue });
      alert("Depósito realizado com sucesso!");
      setDepositValue("");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.value || "Erro ao realizar depósito.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (Number(transferData.value) > Number(balance)) {
      alert("Saldo insuficiente para realizar esta transferência.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/account/transfer/", transferData);
      alert("Transferência realizada com sucesso!");
      setIsTransferModalOpen(false);
      setTransferData({ identifier: "", value: "", description: "" });
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.non_field_errors || "Erro na transferência.";
      alert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'depósito':
        return { backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #d1fae5" };
      case 'recebimento':
        return { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe" };
      case 'envio':
        return { backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2" };
      case 'estorno':
        return { backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#1f2937" };
    }
  };

  return {
    balance, transactions, loading, user, isModalOpen, setIsModalOpen,
    depositValue, setDepositValue, isTransferModalOpen, setIsTransferModalOpen,
    transferData, setTransferData, isStatementModalOpen, setIsStatementModalOpen,
    filters, setFilters, filteredTransactions, handleDeposit, handleTransfer, getBadgeStyle, navigate
  };
};
