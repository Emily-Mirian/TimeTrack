const usuario = exigirPerfil(["gestor"]);
document.getElementById("nome-usuario").textContent = usuario.nome;

const classesTag = {
  warn: "tag-amarelo",
  info: "tag-azul",
  bad: "tag-vermelho",
};

const tabelaPendencias = document.querySelector("#tabela-pendencias tbody");

async function carregarPendencias() {
  const pendencias = await chamarApi("/pendencias");
  tabelaPendencias.innerHTML = "";

  if (pendencias.length === 0) {
    tabelaPendencias.innerHTML =
      "<tr><td colspan='3'>Nenhuma pendência no setor 🎉</td></tr>";
    return;
  }

  for (const p of pendencias) {
    tabelaPendencias.innerHTML += `
      <tr>
        <td><strong>${escapar(p.n)}</strong></td>
        <td><span class="tag ${classesTag[p.c] || "tag-azul"}">${escapar(p.s)}</span></td>
        <td><button class="btn" data-id="${p.id}" data-acao="${escapar(p.a)}">${escapar(p.a)}</button></td>
      </tr>`;
  }
}

async function carregarAuditoria() {
  const registros = await chamarApi("/auditoria");
  preencherTabela(
    "tabela-auditoria",
    registros.map((a) => [a.usuario, a.acao, a.data]),
  );
}

tabelaPendencias.addEventListener("click", async (evento) => {
  const botao = evento.target.closest("button");
  if (!botao) return;

  try {
    await chamarApi("/pendencias/" + botao.dataset.id, "PATCH", {
      acao: botao.dataset.acao,
    });
    carregarPendencias();
    carregarAuditoria();
  } catch (erro) {
    alert(erro.message);
  }
});

carregarPendencias().catch((erro) => alert(erro.message));
carregarAuditoria().catch((erro) => alert(erro.message));
