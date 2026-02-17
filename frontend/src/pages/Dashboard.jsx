import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositValue, setDepositValue] = useState("");


  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/");
      return;
    }
    fetchData();
  }, [navigate]);

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

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Note que seu serializer espera um campo chamado 'value'
      await api.post("/account/deposit/", { value: depositValue });
      
      alert("Depósito realizado com sucesso!");
      setDepositValue("");
      setIsModalOpen(false);
      
      // Atualiza os dados da dashboard (saldo e extrato) automaticamente
      fetchData(); 
    } catch (err) {
      const msg = err.response?.data?.value || "Erro ao realizar depósito.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.containerCenter}>
        <h2 style={{ color: "#64748b", fontFamily: "sans-serif" }}>Carregando conta...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>Conta<span>Digital</span></h2>
        <button onClick={() => { localStorage.clear(); navigate("/"); }} style={styles.logoutBtn}>Sair</button>
      </nav>

      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.title}>Olá, {user?.full_name}!</h1>
          <p style={styles.subtitle}>Gerencie seu saldo e acompanhe seu extrato</p>
        </header>

        <div style={styles.balanceCard}>
          <div style={styles.balanceInfo}>
            <span style={styles.cardLabel}>Saldo em conta</span>
            <h2 style={styles.balanceValue}>
              R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot}></span>
              <span style={{ color: "#fff" }}>
                {user?.role === 'admin' ? 'Administrador' : 'Conta Ativa'}
              </span>
            </div>            
          </div>
          <div style={styles.actionsContainer}>
            <button style={styles.depositBtn} onClick={() => setIsModalOpen(true)}>
              + Novo Depósito
            </button>
          </div>
        </div>


        <div style={styles.transactionsCard}>
          <h3 style={styles.cardTitle}>Histórico de Transações</h3>

          {transactions.length === 0 ? (
            <p style={styles.emptyMsg}>Nenhuma movimentação registrada.</p>
          ) : (
            <div style={styles.list}>
              {transactions.slice(0).reverse().map((t) => {
                const isPositive = t.type === 'depósito' || t.type === 'recebimento';
                
                const renderDescription = () => {
                  if (t.description) return t.description;

                  if (t.type === 'envio' && t.destination_name) {
                    return `Para ${t.destination_name}`;
                  }
                  if (t.type === 'recebimento' && t.origin_name) {
                    return `De ${t.origin_name}`;
                  }
                  return "Movimentação de conta";
                };

                return (
                  <div key={t.id} style={styles.listItem}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemType}>{t.type}</span>
                      <span style={styles.itemDesc}>{renderDescription()}</span>
                      <span style={styles.itemDate}>
                        {new Date(t.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div style={styles.itemValues}>
                      <span style={{ 
                        ...styles.itemAmount, 
                        color: isPositive ? '#10b981' : '#ef4444' 
                      }}>
                        {isPositive ? '+' : '-'} R$ {Number(t.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span style={styles.balanceAfter}>
                        Saldo: R$ {Number(t.balance_after).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Depositar Valor</h3>
              <p style={styles.modalSubtitle}>Informe o valor que deseja adicionar à sua conta.</p>
              
              <form onSubmit={handleDeposit}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor (R$)</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    min="1.00"
                    max="10000.00"
                    placeholder="0,00"
                    value={depositValue}
                    onChange={(e) => setDepositValue(e.target.value)}
                    required
                    autoFocus
                  />
                  <small style={styles.inputHelp}>Mínimo de R$ 1,00 e máximo de R$ 10.000,00</small>
                </div>

                <div style={styles.modalActions}>
                  <button 
                    type="button" 
                    style={styles.cancelBtn} 
                    onClick={() => { setIsModalOpen(false); setDepositValue(""); }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={styles.confirmBtn} disabled={loading}>
                    {loading ? "Processando..." : "Confirmar Depósito"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",            
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",         
    flexDirection: "column",   
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  containerCenter: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  navbar: {
    width: "100%",              
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 10%",          
    height: "75px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    boxSizing: "border-box",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
  },
  logoutBtn: {
    padding: "8px 20px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    background: "#fff",
    fontWeight: "600",
    color: "#64748b",
  },
  content: {
    width: "100%",
    maxWidth: "1000px",        
    margin: "40px auto",       
    padding: "0 20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "30px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    fontSize: "15px",
    marginTop: "5px",
  },
  balanceCard: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2563eb", 
    padding: "35px",
    borderRadius: "16px",
    marginBottom: "0px",
    boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)", 
    boxSizing: "border-box",
    width: "100%",
  },
  cardLabel: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.8)", 
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: "40px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "8px 0",
  },
  actionsContainer: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.2)", 
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#4ade80", 
    borderRadius: "50%",
  },
  transactionsCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    boxSizing: "border-box",
  },
  cardTitle: {
    padding: "25px",
    fontSize: "19px",
    fontWeight: "700",
    borderBottom: "1px solid #f1f5f9",
    margin: 0,
    color: "#334155",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 25px",
    borderBottom: "1px solid #f8fafc",
  },
  itemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  itemType: {
    fontWeight: "800",
    fontSize: "13px",
    textTransform: "uppercase",
    color: "#475569",
  },
  itemDesc: {
    fontSize: "14px",
    color: "#64748b",
  },
  itemDate: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  itemValues: {
    textAlign: "right",
  },
  itemAmount: {
    fontWeight: "800",
    fontSize: "17px",
  },
  balanceAfter: {
    fontSize: "12px",
    color: "#94a3b8",
    display: "block",
    marginTop: "6px",
  },
  emptyMsg: {
    padding: "50px",
    textAlign: "center",
    color: "#94a3b8",
  },
  depositBtn: {
    backgroundColor: "#ffffff",
    color: "#2563eb",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
    width: "fit-content",
    alignSelf: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    transition: "0.2s"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    color: "#1e293b",
  },
  modalSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "24px",
  },
  inputHelp: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    color: "#64748b",
    fontWeight: "600",
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 2,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
};


export default Dashboard;
