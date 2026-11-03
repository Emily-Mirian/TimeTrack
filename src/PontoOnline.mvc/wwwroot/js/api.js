const API_URL = 'http://localhost:5242';

// Todo fetch('/api/...') passa a ir para a API e leva o id de quem está logado
const _fetchOriginal = window.fetch.bind(window);
window.fetch = (url, opcoes = {}) => {
  if (typeof url === 'string' && url.startsWith('/api/')) url = API_URL + url;
  if (typeof url === 'string' && url.startsWith(API_URL)) {
    opcoes = {
      ...opcoes,
      headers: { ...(opcoes.headers || {}), 'X-Usuario-Id': sessionStorage.getItem('usuarioId') || '' },
    };
  }
  return _fetchOriginal(url, opcoes);
};

async function chamarApi(caminho, metodo = 'GET', corpo = null) {
  const opcoes = {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
    },
  };
  if (corpo) opcoes.body = JSON.stringify(corpo);

  const rotaFinal = caminho.startsWith('/api') ? caminho : '/api' + caminho;
  const resposta = await fetch(API_URL + rotaFinal, opcoes);
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || dados.mensagem || dados.Mensagem || 'Erro no servidor: ' + resposta.status);
  }
  return dados;
}

function salvarSessao(dados) {
  const perfil = (dados.perfil || 'funcionario').toLowerCase();
  localStorage.setItem('token', dados.token || '');
  localStorage.setItem('perfil', perfil);
  localStorage.setItem('usuario', JSON.stringify({
    id: dados.usuarioId,
    usuarioId: dados.usuarioId,
    nome: dados.nome,
    perfil: perfil,
    vinculo: dados.vinculo,
  }));
  sessionStorage.setItem('usuarioId', dados.usuarioId);
  sessionStorage.setItem('nome', dados.nome);
  sessionStorage.setItem('perfil', perfil);
}