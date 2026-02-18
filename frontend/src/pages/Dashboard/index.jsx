import React from "react";
import { useDashboard } from "./useDashboard";
import { styles } from "./DashboardStyles";

function Dashboard() {
  const {
    balance,
    transactions,
    loading,
    user,
    isModalOpen,
    setIsModalOpen,
    depositValue,
    setDepositValue,
    isTransferModalOpen,
    setIsTransferModalOpen,
    transferData,
    setTransferData,
    isStatementModalOpen,
    setIsStatementModalOpen,
    filters,
    setFilters,
    filteredTransactions,
    handleDeposit,
    handleTransfer,
    getBadgeStyle,
    navigate,
    allUsers,
    fetchAdminData,
    isUserListModalOpen,
    setIsUserListModalOpen,
    selectedUserAccount,
    setSelectedUserAccount,
    adminTargetStatement,
    fetchUserStatement,
    handleReverse
  } = useDashboard();

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

        {user?.role === 'admin' && (
          <div style={styles.adminSection}>
            <div style={styles.adminInfo}>
              <span style={styles.adminBadge}>Modo Administrador</span>
            </div>
            <button 
              style={styles.adminBtn} 
              onClick={() => setIsUserListModalOpen(true)}
            >
              Ver Lista de Usuários
            </button>
          </div>
        )}

        <header style={styles.header}>
          <h1 style={styles.title}>Olá, {user?.full_name}!</h1>
          <p style={styles.subtitle}>
            {user?.role === 'admin' 
              ? "Painel de Gestão: Monitore usuários e realize estornos de transações." 
              : "Gerencie seu saldo e acompanhe seu extrato pessoal."}
          </p>

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
            <button style={styles.depositBtn} onClick={() => setIsModalOpen(true)}>+ Novo Depósito</button>
            <button style={styles.depositBtn} onClick={() => setIsTransferModalOpen(true)}>+ Transferir</button>
            <button style={styles.depositBtn} onClick={() => setIsStatementModalOpen(true)}>Ver Extrato</button>
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
              {transactions.slice(-5).reverse().map((t) => (
                <div key={t.id} style={styles.listItem}>
                  <div style={styles.itemInfo}>
                    <span style={styles.itemType}>{t.type}</span>
                    <span style={styles.itemDate}>
                      {new Date(t.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <span style={{ ...styles.itemAmount, color: (t.type === 'depósito' || t.type === 'recebimento') ? '#10b981' : '#ef4444' }}>
                    {(t.type === 'depósito' || t.type === 'recebimento') ? '+' : '-'} R$ {Number(t.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Depositar Valor</h3>
            <form onSubmit={handleDeposit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Valor (R$)</label>
                <input style={styles.input} type="number" step="0.01" min="1.00" max="10000.00" value={depositValue} onChange={(e) => setDepositValue(e.target.value)} required autoFocus />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" style={styles.confirmBtn}>Confirmar Depósito</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTransferModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsTransferModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Transferir Dinheiro</h3>
            <form onSubmit={handleTransfer}>
              <div style={styles.formGap}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Destinatário (E-mail ou CPF)</label>
                  <input style={styles.input} type="text" value={transferData.identifier} onChange={(e) => setTransferData({...transferData, identifier: e.target.value})} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Valor (R$)</label>
                  <input
                    style={{
                      ...styles.input,
                      borderColor: Number(transferData.value) > Number(balance) ? "#ef4444" : "#d1d5db"
                    }}
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
                      Saldo insuficiente. Disponível: R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </small>
                  )}
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Descrição</label>
                  <input style={styles.input} type="text" value={transferData.description} onChange={(e) => setTransferData({...transferData, description: e.target.value})} />
                </div>
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsTransferModalOpen(false)}>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{
                    ...styles.confirmBtn,
                    backgroundColor: (loading || Number(transferData.value) > Number(balance) || !transferData.value) 
                      ? "#94a3b8" 
                      : "#2563eb",
                    cursor: (loading || Number(transferData.value) > Number(balance) || !transferData.value) 
                      ? "not-allowed" 
                      : "pointer"
                  }} 
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
                <label style={styles.labelSmall}>Início</label>
                <input type="date" style={styles.inputSmall} value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
              </div>
              <div style={styles.inputGroupSmall}>
                <label style={styles.labelSmall}>Fim</label>
                <input type="date" style={styles.inputSmall} value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
              </div>
              <div style={styles.inputGroupSmall}>
                <label style={styles.labelSmall}>Tipo</label>
                <select style={styles.inputSmall} value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
                  <option value="">Todos</option>
                  <option value="depósito">Depósitos</option>
                  <option value="envio">Envios</option>
                  <option value="recebimento">Recebimentos</option>
                  <option value="estorno">Estornos</option>
                </select>
              </div>
              <button style={styles.clearFiltersBtn} onClick={() => setFilters({ startDate: "", endDate: "", type: "" })}>Limpar</button>
            </div>
            <div style={styles.scrollArea}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Tipo</th>
                    <th style={styles.th}>Detalhes</th>
                    <th style={styles.th}>Valor</th>
                    <th style={styles.th}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} style={styles.tableRow}>
                      <td style={styles.td}>{new Date(t.created_at).toLocaleString('pt-BR')}</td>
                      <td style={styles.td}><span style={{ ...styles.badge, ...getBadgeStyle(t.type) }}>{t.type}</span></td>
                      <td style={styles.tdDesc}>{t.description || (t.type === 'envio' ? `Para ${t.destination_name}` : t.type === 'recebimento' ? `De ${t.origin_name}` : "-")}</td>
                      <td style={{ ...styles.tdValue, color: (t.type === 'depósito' || t.type === 'recebimento') ? '#10b981' : '#ef4444' }}>
                        R$ {Number(t.value).toFixed(2)}
                      </td>
                      <td style={styles.tdSaldo}>R$ {Number(t.balance_after).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isUserListModalOpen && (
        <div style={styles.modalOverlay} onClick={() => {
          setIsUserListModalOpen(false);
          setSelectedUserAccount(null); 
        }}>
          <div style={styles.modalContentWide} onClick={(e) => e.stopPropagation()}>
            
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {selectedUserAccount 
                  ? `Extrato: ${selectedUserAccount.user.full_name}` 
                  : "Gestão de Usuários"}
              </h2>
              
              {selectedUserAccount ? (
                <button 
                  style={styles.adminActionBtn} 
                  onClick={() => setSelectedUserAccount(null)}
                >
                  ← Voltar para Lista
                </button>
              ) : (
                <button 
                  style={styles.closeModalBtn} 
                  onClick={() => setIsUserListModalOpen(false)}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.scrollArea}>
              {!selectedUserAccount ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nome</th>
                      <th style={styles.th}>E-mail</th>
                      <th style={styles.th}>Saldo</th>
                      <th style={styles.th}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((item) => (
                      <tr key={item.id} style={styles.tableRow}>
                        <td style={styles.td}><strong>{item.user.full_name}</strong></td>
                        <td style={styles.td}>{item.user.email}</td>
                        <td style={{...styles.td, fontWeight: 'bold', color: '#2563eb'}}>
                          R$ {Number(item.balance).toFixed(2)}
                        </td>
                        <td style={styles.td}>
                          <button 
                            style={styles.adminActionBtn}
                            onClick={() => fetchUserStatement(item)}
                          >
                            Ver Extrato
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Data</th>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Valor</th>
                      <th style={styles.th}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminTargetStatement.slice(0).reverse().map((t) => (
                      <tr key={t.id} style={styles.tableRow}>
                        <td style={styles.td}>{new Date(t.created_at).toLocaleString('pt-BR')}</td>
                        <td style={styles.td}>
                          <span style={{...styles.badge, ...getBadgeStyle(t.type)}}>{t.type}</span>
                        </td>
                        <td style={{
                          ...styles.tdValue, 
                          color: (t.type === 'depósito' || t.type === 'recebimento') ? '#10b981' : '#ef4444'
                        }}>
                          R$ {Number(t.value).toFixed(2)}
                        </td>
                        <td style={styles.td}>
                          {t.type === 'envio' && (
                            <button 
                              style={styles.adminActionBtn} 
                              onClick={() => handleReverse(t.id)}
                              disabled={loading}
                            >
                              {loading ? "..." : "Estornar"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default Dashboard;
