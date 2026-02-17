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
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({identifier: "", value: "", description: ""});
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", type: ""});
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
            <button style={styles.depositBtn} onClick={() => setIsTransferModalOpen(true)}>
              + Transferir
            </button>
            <button style={styles.depositBtn} onClick={() => setIsStatementModalOpen(true)}>
              Ver Extrato
            </button>
          </div>
        </div>


        <div style={styles.transactionsCard}>
          <div style={styles.cardHeaderWithAction}>
            <h3 style={styles.cardTitle}>Resumo das últimas transações</h3>
          </div>

          {transactions.length === 0 ? (
            <p style={styles.emptyMsg}>Nenhuma movimentação.</p>
          ) : (
            <div style={styles.list}>
              {transactions.slice(-5).reverse().map((t) => {
                const isPositive = t.type === 'depósito' || t.type === 'recebimento';
                
                return (
                  <div key={t.id} style={styles.listItem}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemType}>{t.type}</span>
                      <span style={styles.itemDate}>
                        {new Date(t.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    
                    <span style={{ 
                      ...styles.itemAmount, 
                      color: isPositive ? '#10b981' : '#ef4444' 
                    }}>
                      {isPositive ? '+' : '-'} R$ {Number(t.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
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
        
        {isTransferModalOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsTransferModalOpen(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>Transferir Dinheiro</h3>
              <p style={styles.modalSubtitle}>Envie valores para outros usuários via CPF ou E-mail.</p>
              
              <form onSubmit={handleTransfer}>
                <div style={styles.formGap}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Identificador do Destinatário</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="E-mail ou CPF (apenas números)"
                      value={transferData.identifier}
                      onChange={(e) => setTransferData({...transferData, identifier: e.target.value})}
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Valor (R$)</label>
                    <input
                      style={styles.input}
                      type="number"
                      step="0.01"
                      min="1.00"
                      placeholder="0,00"
                      value={transferData.value}
                      onChange={(e) => setTransferData({...transferData, value: e.target.value})}
                      required
                    />
                    {Number(transferData.value) > Number(balance) && (
                      <small style={{ color: "#ef4444", marginTop: "4px", fontWeight: "600" }}>
                        Saldo insuficiente (Disponível: R$ {Number(balance).toFixed(2)})
                      </small>
                    )}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Descrição (Opcional)</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Ex: Aluguel, Jantar..."
                      value={transferData.description}
                      onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setIsTransferModalOpen(false)}>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    style={styles.confirmBtn} 
                    disabled={loading || Number(transferData.value) > Number(balance) || !transferData.value}
                  >
                    {loading ? "Enviando..." : "Confirmar Envio"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isStatementModalOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsStatementModalOpen(false)}>
            <div style={styles.modalContentWide} onClick={(e) => e.stopPropagation()}>
              
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Extrato Completo</h2>
                <button style={styles.closeModalBtn} onClick={() => setIsStatementModalOpen(false)}>✕</button>
              </div>

              <div style={styles.filterSection}>
                <div style={styles.inputGroupSmall}>
                  <label style={styles.labelSmall}>Data Início</label>
                  <input 
                    type="date" 
                    style={styles.inputSmall} 
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>

                <div style={styles.inputGroupSmall}>
                  <label style={styles.labelSmall}>Data Fim</label>
                  <input 
                    type="date" 
                    style={styles.inputSmall} 
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>

                <div style={styles.inputGroupSmall}>
                  <label style={styles.labelSmall}>Tipo</label>
                  <select 
                    style={styles.inputSmall} 
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="">Todos os tipos</option>
                    <option value="depósito">Depósitos</option>
                    <option value="envio">Envios</option>
                    <option value="recebimento">Recebimentos</option>
                    <option value="estorno">Estornos</option>
                  </select>
                </div>

                <button 
                  style={styles.clearFiltersBtn} 
                  onClick={() => setFilters({ startDate: "", endDate: "", type: "" })}
                >
                  Limpar Filtros
                </button>
              </div>


              <div style={styles.scrollArea}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHead}>
                      <th style={styles.th}>Data/Hora</th>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Detalhes</th>
                      <th style={styles.th}>Valor</th>
                      <th style={styles.th}>Saldo Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t) => {
                      const isPositive = t.type === 'depósito' || t.type === 'recebimento';

                      let detalhe = t.description || "-";
                      if (t.type === 'envio' && t.destination_name) detalhe = `Para: ${t.destination_name}`;
                      if (t.type === 'recebimento' && t.origin_name) detalhe = `De: ${t.origin_name}`;
                      if (t.type === 'estorno') detalhe = t.description || "Estorno de transação";

                      return (
                        <tr key={t.id} style={styles.tableRow} className="animate-row">
                          <td style={styles.td}>{new Date(t.created_at).toLocaleString('pt-BR')}</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, ...getBadgeStyle(t.type) }}>
                              {t.type}
                            </span>
                          </td>
                          <td style={styles.tdDesc}>{detalhe}</td>
                          <td style={{ 
                            ...styles.tdValue, 
                            color: isPositive ? '#10b981' : '#ef4444' 
                          }}>
                            {isPositive ? '+' : '-'} R$ {Number(t.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={styles.tdSaldo}>
                            R$ {Number(t.balance_after).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
    padding: "20px",
    boxSizing: "border-box",
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
  modalContentWide: {
      backgroundColor: "#ffffff",
      padding: "32px",
      borderRadius: "20px",
      width: "95%",
      maxWidth: "1000px",
      maxHeight: "85vh",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      boxSizing: "border-box",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    closeModalBtn: {
      background: "none",
      border: "none",
      fontSize: "20px",
      color: "#64748b",
      cursor: "pointer",
      padding: "8px",
    },
    filterSection: {
      display: "flex",
      gap: "16px",
      padding: "16px",
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      marginBottom: "20px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    scrollArea: {
      overflowY: "auto",
      flex: 1,
      paddingRight: "8px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "left",
    },
    th: {
      padding: "12px 16px",
      fontSize: "13px",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      borderBottom: "2px solid #f1f5f9",
      fontWeight: "600",
    },
    td: {
      padding: "16px",
      fontSize: "14px",
      color: "#1e293b",
    },
    tdType: {
      padding: "16px",
      fontSize: "12px",
      fontWeight: "800",
      textTransform: "uppercase",
      color: "#475569",
    },
    tdDesc: {
      padding: "16px",
      fontSize: "14px",
      color: "#64748b",
      maxWidth: "250px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    tdValue: {
      padding: "16px",
      fontSize: "15px",
      fontWeight: "700",
      textAlign: "right",
    },
    tdSaldo: {
      padding: "16px",
      fontSize: "14px",
      color: "#94a3b8",
      textAlign: "right",
      fontWeight: "500",
    },
    inputGroupSmall: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    labelSmall: {
      fontSize: "11px",
      fontWeight: "700",
      color: "#94a3b8",
      textTransform: "uppercase",
    },
    inputSmall: {
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #e2e8f0",
      fontSize: "13px",
      color: "#1e293b",
      outline: "none",
      backgroundColor: "#fff",
    },
    clearFiltersBtn: {
      alignSelf: "flex-end",
      padding: "10px 15px",
      fontSize: "12px",
      fontWeight: "600",
      color: "#ef4444",
      background: "none",
      border: "1px solid #fee2e2",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "0.2s",
    },
    "@keyframes fadeIn": {
      "0%": { opacity: 0, transform: "translateY(5px)" },
      "100%": { opacity: 1, transform: "translateY(0)" }
    },
    tableRow: {
      borderBottom: "1px solid #f1f5f9",
      transition: "background-color 0.2s ease", 
      animation: "fadeIn 0.3s ease-out forwards", 
    },
    badge: {
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase",
      display: "inline-block",
      whiteSpace: "nowrap",
    },
};


export default Dashboard;
