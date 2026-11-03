const usuario = exigirPerfil(["admin"]);
document.getElementById("nome-usuario").textContent = usuario.nome;

async function carregarDados() {
  try {
    const colaboradores = await chamarApi("/colaboradores");
    const feriados = await chamarApi("/feriados");
    const auditoria = await chamarApi("/auditoria");

    preencherTabela(
      "tabela-colaboradores",
      colaboradores.map((c) => [
        c.nome,
        c.email,
        c.setor,
        c.vinculo,
        c.carga + "h",
      ]),
    );

    preencherTabela(
      "tabela-feriados",
      feriados.map((f) => [
        f.data.split("-").reverse().join("/"),
        f.nome,
        f.tipo,
      ]),
    );

    preencherTabela(
      "tabela-auditoria",
      auditoria.map((a) => [a.usuario, a.acao, a.data]),
    );

    const select = document.getElementById("v-colaborador");
    if (select) {
      select.innerHTML = "";
      for (const c of colaboradores) {
        select.add(new Option(c.nome, c.nome));
      }
    }
  } catch (erro) {
    alert(erro.message);
  }
}

document.querySelectorAll("[data-abrir]").forEach((botao) => {
  botao.addEventListener("click", () => {
    document.getElementById(botao.dataset.abrir).showModal();
  });
});

document.querySelectorAll("[data-fechar]").forEach((botao) => {
  botao.addEventListener("click", () => {
    botao.closest("dialog").close();
  });
});

function ligarFormulario(idFormulario, caminho) {
  const form = document.getElementById(idFormulario);
  if (!form) return;

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(form));

    if (dados.vinculo === "Estágio" && Number(dados.carga) > 6) {
      alert("Estagiário pode ter no máximo 6h por dia.");
      return;
    }

    try {
      const resposta = await chamarApi(caminho, "POST", dados);
      if (resposta.senhaTemp) {
        alert("Colaborador criado! Senha temporária: " + resposta.senhaTemp);
      }
      form.reset();
      form.closest("dialog").close();
      carregarDados();
    } catch (erro) {
      alert(erro.message);
    }
  });
}

ligarFormulario("form-colaborador", "/colaboradores");
ligarFormulario("form-vinculo", "/vinculos");
ligarFormulario("form-feriado", "/feriados");

carregarDados();
