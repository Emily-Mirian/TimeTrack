const usuario = exigirPerfil(["func"]);
document.getElementById("nome-usuario").textContent = usuario.nome;

function atualizarRelogio() {
  const agora = new Date();
  document.getElementById("relogio").textContent =
    agora.toLocaleTimeString("pt-BR");
  document.getElementById("data").textContent = agora.toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

function paraMinutos(hora) {
  const partes = hora.split(":");
  return Number(partes[0]) * 60 + Number(partes[1]);
}

function formatar(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = String(minutos % 60).padStart(2, "0");
  return horas + "h " + resto + "min";
}

function calcularJornada(registros) {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const agora = new Date();
  const limite = (usuario.carga || 8) * 60;
  let trabalhado = 0;

  for (const registro of registros) {
    if (registro.data !== hoje) continue;

    const fim = registro.saida
      ? paraMinutos(registro.saida)
      : agora.getHours() * 60 + agora.getMinutes();
    trabalhado += fim - paraMinutos(registro.entrada);
  }

  const porcentagem = Math.min(Math.round((trabalhado / limite) * 100), 100);
  document.getElementById("barra-jornada").value = porcentagem;
  document.getElementById("trabalhadas").textContent = formatar(trabalhado);
  document.getElementById("restantes").textContent = formatar(
    Math.max(limite - trabalhado, 0),
  );
  document.getElementById("limite").textContent =
    (usuario.vinculo || "CLT") +
    " - limite diário de " +
    (usuario.carga || 8) +
    "h (" +
    porcentagem +
    "% utilizado)";
}

async function carregarHistorico() {
  try {
    const registros = await chamarApi("/pontos");
    const tbody = document.querySelector("#tabela-historico tbody");
    tbody.innerHTML = "";

    for (const r of registros) {
      const status =
        r.status === "ok"
          ? '<span class="tag tag-verde">Normal</span>'
          : '<span class="tag tag-vermelho">Pendente de edição (RH)</span>';

      tbody.innerHTML += `
        <tr>
          <td>${escapar(r.data)}</td>
          <td>${escapar(r.entrada)}</td>
          <td>${escapar(r.saida || "—")}</td>
          <td>${status}</td>
        </tr>`;
    }
    calcularJornada(registros);
  } catch (erro) {
    alert(erro.message);
  }
}

document.getElementById("btn-ponto").addEventListener("click", async () => {
  try {
    await chamarApi("/pontos", "POST");
    alert("Ponto registrado às " + new Date().toLocaleTimeString("pt-BR"));
    carregarHistorico();
  } catch (erro) {
    alert(erro.message);
  }
});

carregarHistorico();
