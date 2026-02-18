export const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    margin: 0,
    padding: "20px", // Padding extra caso a tela seja pequena
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "450px", // Ligeiramente maior para acomodar mais campos
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px", // Reduzi um pouco o gap para não esticar demais o card
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    padding: "12px 16px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
    backgroundColor: "#fff",
  },
  button: {
    marginTop: "15px",
    padding: "14px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "20px",
    border: "1px solid #fee2e2",
    wordBreak: "break-all", // Para não quebrar o layout se o erro for um JSON longo
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "14px",
  },
  footerText: {
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },

};