import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { validateEmail } from "../../utils/utils"; 

export const useRegister = () => {
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    cpf: "",
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    const { name, value } = e.target;
    if (name === "email") {
      setFormData({ ...formData, email: value });
      if (value && !validateEmail(value)) {
        setEmailError("Formato de e-mail inválido.");
      } else {
        setEmailError("");
      }
    } 

    if (name === "cpf") {
      const rawValue = value.replace(/\D/g, "").slice(0, 11);
      setFormData({ ...formData, cpf: rawValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register/", formData);
      alert("Usuário cadastrado com sucesso!");
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Erro ao cadastrar usuário.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit,
    emailError
  };
};
