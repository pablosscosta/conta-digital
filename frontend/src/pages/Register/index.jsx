import React from "react";
import { useRegister } from "./useRegister";
import { styles } from "./RegisterStyles";
import { Link } from 'react-router-dom';
import { formatCPF } from "../../utils/utils"; 

function Register() {
  const { 
    formData, 
    error, 
    loading, 
    handleChange, 
    handleSubmit,
    emailError 
  } = useRegister();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Criar Conta</h1>
          <p style={styles.subtitle}>Preencha os dados para se cadastrar</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome Completo</label>
            <input
              style={styles.input}
              type="text"
              name="full_name"
              placeholder="Ex: João Silva"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>CPF</label>
            <input
              style={styles.input}
              type="text"
              name="cpf"
              placeholder="000.000.000-00"
              value={formatCPF(formData.cpf)} 
              onChange={handleChange}
              inputMode="numeric"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input
              style={{
                ...styles.input,
                borderColor: emailError ? "#ef4444" : "#d1d5db" 
              }}
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {emailError && (
              <small style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                {emailError}
              </small>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo de Perfil</label>
            <select
              style={styles.input}
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button 
            style={loading ? {...styles.button, opacity: 0.7} : styles.button} 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Finalizar Cadastro"}
          </button>
        </form>
        <div style={styles.footer}>
          <span style={styles.footerText}>Já tem uma conta? </span>
          <Link to="/" style={styles.link}>
            Faça login aqui
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;
