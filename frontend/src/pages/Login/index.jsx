import React from "react";
import { useLogin } from "./useLogin";
import { styles } from "./LoginStyles";
import { Link } from 'react-router-dom';

function Login() {
  const { 
    formData, 
    error, 
    loading, 
    handleChange, 
    handleSubmit 
  } = useLogin();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Bem-vindo</h1>
          <p style={styles.subtitle}>Faça login para acessar sua conta digital</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="exemplo@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
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

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Processando..." : "Entrar na Conta"}
          </button>
        </form>
        <div style={styles.footer}>
          <span style={styles.footerText}>Não tem uma conta? </span>
          <Link to="/register" style={styles.link}>
            Registre-se aqui
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
