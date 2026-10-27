// js/api.js - Configuração da URL do Servidor Node.js

// Certifica-te de que está em HTTP (e não HTTPS) e na porta 3000
const API_URL = "http://localhost:3000";

// Função responsável pelas chamadas de API
async function chamarApi(caminho, metodo = "GET", corpo = null) {
  const opcoes = {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (localStorage.getItem("token") || ""),
    },
  };

  if (corpo) {
    opcoes.body = JSON.stringify(corpo);
  }

  // Tenta conectar ao servidor
  const resposta = await fetch(API_URL + caminho, opcoes);
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      dados.erro || dados.mensagem || "Erro no servidor: " + resposta.status,
    );
  }

  return dados;
}

function salvarSessao(dados) {
  localStorage.setItem("token", dados.token);
  localStorage.setItem(
    "usuario",
    JSON.stringify({
      nome: dados.nome,
      perfil: dados.perfil,
    }),
  );
}
