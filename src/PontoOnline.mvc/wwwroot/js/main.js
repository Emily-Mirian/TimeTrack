
function mostrarErro(campoId, erroId, mensagem) {
  document.getElementById(campoId).classList.toggle("erro", !!mensagem);
  document.getElementById(erroId).textContent = mensagem || "";
}

// Controle de Módulos (Visão Global). Retorna true se o módulo está desligado E quem usa não é administrador.
async function moduloBloqueado(modulo) {
  try {
    const perfil = (localStorage.getItem("perfil") || "").toLowerCase();
    if (perfil === "admin") return false;
    const resp = await fetch("/api/modulos");
    if (!resp.ok) return false; // o servidor também valida; aqui é só aviso antecipado
    const estado = await resp.json();
    return estado[modulo] === false;
  } catch {
    return false;
  }
}
const NOMES_MODULO = {
  importacao: "Importação CSV",
  exportacao: "Exportação PDF",
  edicaoPonto: "Edição de Ponto",
};

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

(function telaLogin() {
  const form = document.getElementById("formLogin");
  if (!form) return; 

  const ROTAS_POR_PERFIL = {
    funcionario: "funcionario/inicio.html",
    rh: "rh/pendencias.html",
    admin: "rh/pendencias.html",
  };

  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const btn = document.getElementById("btnLogin");

  function validar() {
    let ok = true;

    if (!email.value.trim()) {
      mostrarErro("campoEmail", "erroEmail", "Informe o e-mail.");
      ok = false;
    } else if (!emailValido(email.value)) {
      mostrarErro("campoEmail", "erroEmail", "E-mail inválido.");
      ok = false;
    } else mostrarErro("campoEmail", "erroEmail", "");

    if (!senha.value) {
      mostrarErro("campoSenha", "erroSenha", "Informe a senha.");
      ok = false;
    } else mostrarErro("campoSenha", "erroSenha", "");

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroGeral").textContent = "";
    if (!validar()) return;

    btn.disabled = true;
    btn.textContent = "Entrando...";

    const usuario = email.value.trim().toLowerCase().split("@")[0];
    const perfil = usuario.includes("admin")
      ? "admin"
      : usuario.includes("rh")
        ? "rh"
        : "funcionario";

    localStorage.setItem("perfil", perfil);

    window.location.href = ROTAS_POR_PERFIL[perfil];
  });
})();

(function telaCadastro() {
  const form = document.getElementById("formCadastro");
  if (!form) return;

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmarSenha");
  const tipoContrato = document.getElementById("tipoContrato");
  const btn = document.getElementById("btnCadastrar");

  tipoContrato.addEventListener("change", () => {
    tipoContrato.classList.toggle("preenchido", !!tipoContrato.value);
  });

  function validar() {
    let ok = true;

    if (nome.value.trim().length < 3) {
      mostrarErro("campoNome", "erroNome", "Informe o nome completo.");
      ok = false;
    } else mostrarErro("campoNome", "erroNome", "");

    if (!emailValido(email.value)) {
      mostrarErro("campoEmail", "erroEmail", "E-mail inválido.");
      ok = false;
    } else mostrarErro("campoEmail", "erroEmail", "");

    if (senha.value.length < 8) {
      mostrarErro(
        "campoSenha",
        "erroSenha",
        "A senha deve ter no mínimo 8 caracteres.",
      );
      ok = false;
    } else mostrarErro("campoSenha", "erroSenha", "");

    if (!confirmarSenha.value || confirmarSenha.value !== senha.value) {
      mostrarErro("campoConfirmar", "erroConfirmar", "As senhas não conferem.");
      ok = false;
    } else mostrarErro("campoConfirmar", "erroConfirmar", "");

    if (!tipoContrato.value) {
      mostrarErro(
        "campoContrato",
        "erroContrato",
        "Selecione o tipo de contrato.",
      );
      ok = false;
    } else mostrarErro("campoContrato", "erroContrato", "");

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroGeral").textContent = "";
    if (!validar()) return;

    btn.disabled = true;
    btn.textContent = "Cadastrando...";

    document.getElementById("sucessoGeral").textContent =
      "Conta criada com sucesso! Redirecionando...";
    setTimeout(() => (window.location.href = "login.html"), 1500);
  });
})();

(function areaLogada() {
  if (!document.querySelector(".pagina-app")) return;

  document.querySelectorAll("[data-ir]").forEach((botao) => {
    botao.addEventListener("click", () => {
      window.location.href = botao.dataset.ir;
    });
  });

  const btnPerfil = document.getElementById("btnPerfil");
  const menuPerfil = document.getElementById("menuPerfil");
  if (btnPerfil) {
    btnPerfil.addEventListener("click", (e) => {
      e.stopPropagation();
      menuPerfil.classList.toggle("oculto");
    });
    document.addEventListener("click", () =>
      menuPerfil.classList.add("oculto"),
    );
  }

  const btnSair = document.getElementById("btnSair");
  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      localStorage.removeItem("perfil"); 
      window.location.href = "../login.html";
    });
  }

})();

(function telaInicioFuncionario() {
  const painel = document.getElementById("painelJornada");
  if (!painel) return;

  const ESTADOS = ["jornada-normal", "jornada-atencao", "jornada-critico"];
  const TEXTOS_STATUS = {
    normal: {
      titulo: "Jornada Normal",
      sub: "Você está dentro do limite diário.",
      alerta: "Dentro do limite",
    },
    atencao: {
      titulo: "Atenção",
      sub: "Você está próximo do limite diário.",
      alerta: "Limite próximo",
    },
    critico: {
      titulo: "Limite Crítico",
      sub: "Seu limite diário está quase no fim.",
      alerta: "Limite próximo",
    },
  };
  function atualizarRelogio() {
    const agora = new Date();
    document.getElementById("relogioHora").textContent =
      agora.toLocaleTimeString("pt-BR");
    document.getElementById("relogioData").textContent =
      agora.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    const dia = agora.toLocaleDateString("pt-BR", { weekday: "long" });
    document.getElementById("relogioDia").textContent =
      dia.charAt(0).toUpperCase() + dia.slice(1);
  }
  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);

  function aplicarEstado(elemento, estado) {
    elemento.classList.remove(...ESTADOS);
    elemento.classList.add("jornada-" + estado);
  }

  function formatarPct(valor) {
    return String(valor).replace(".", ",") + "%";
  }

  function renderizarJornada(j, usuario) {
    aplicarEstado(painel, j.estado);
    const t = TEXTOS_STATUS[j.estado];

    document.getElementById("textoStatus").textContent = t.titulo;
    document.getElementById("textoStatusSub").textContent = t.sub;
    document.getElementById("tipoContrato").textContent = usuario.contrato;
    document.getElementById("limiteDiario").textContent = usuario.limiteDiario;

    document.getElementById("donut").style.setProperty("--pct", j.percentual);
    document.getElementById("pctJornada").textContent = formatarPct(
      j.percentual,
    );
    document.getElementById("horasTrabalhadas").textContent = j.trabalhadas;
    document.getElementById("horasRestantes").textContent = j.restantes;

    document.getElementById("alertaTitulo").textContent = t.alerta;
    document.getElementById("alertaTexto").textContent =
      `Você já utilizou ${formatarPct(j.percentual)} da jornada diária.`;
    document.getElementById("alertaRestante").textContent =
      `Restam ${j.restantes}.`;
  }


  function renderizarPeriodo(id, p) {
    const card = document.getElementById(id);
    if (p.estado === "normal")
      card.classList.remove("jornada-atencao", "jornada-critico");
    else aplicarEstado(card, p.estado);

    card.querySelector(".periodo-horas").textContent = p.horas;
    card.querySelector(".periodo-meta").textContent = "de " + p.meta;
    card.querySelector(".periodo-pct").textContent = formatarPct(p.percentual);
    card.querySelector(".barra-preenchida").style.width =
      Math.min(p.percentual, 100) + "%";
  }

  const STATUS_HISTORICO = {
    normal: '<span class="badge badge-normal">Normal</span>',
    pendente:
      '<span class="badge badge-critico">Pendente de Edição (RH)</span>',
    atestado: '<span class="badge badge-info">Atestado</span>',
  };

  function renderizarHistorico(lista) {
    document.getElementById("tabelaHistorico").innerHTML = lista
      .map(
        (r) => `
        <tr>
          <td>${r.data}</td>
          <td>${r.entrada}</td>
          <td>${r.saida}</td>
          <td>${STATUS_HISTORICO[r.status] || r.status}</td>
          <td class="acoes"><button class="btn-mais" title="Ações">···</button></td>
        </tr>`,
      )
      .join("");
  }

  async function carregar() {
    try {
      const usuarioId = sessionStorage.getItem("usuarioId") || 1;
      const nomeUsuario = sessionStorage.getItem("nome") || "Colaborador";

      const [statusAtual, extrato] = await Promise.all([
        chamarApi(`/Ponto/status-atual/${usuarioId}`, "GET"),
        chamarApi(`/Ponto/extrato/${usuarioId}`, "GET")
      ]);

      document.getElementById("nomeUsuario").textContent = nomeUsuario;
      document.getElementById("regrasTitulo").textContent = "Regras de Carga Horária";
      document.getElementById("regrasTexto").textContent = `Você tem uma meta de ${statusAtual.horasRestantesFormatadas} restantes para cumprir hoje.`;

      const formatoDataBd = new Date().toISOString().split('T')[0];
      const batidaHoje = extrato.historico.find(r => r.dataRegistro && r.dataRegistro.startsWith(formatoDataBd));

      const formatarHora = (dataString) => {
        if (!dataString) return "--:--";
        return new Date(dataString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      };

      document.getElementById("batidaEntrada").textContent = batidaHoje ? formatarHora(batidaHoje.entrada1) : "--:--";
      document.getElementById("batidaAlmoco").textContent = batidaHoje ? formatarHora(batidaHoje.saidaAlmoco) : "--:--";

      const mapaCores = { verde: "normal", amarelo: "atencao", vermelho: "critico" };
      const estadoFront = mapaCores[statusAtual.statusCor] || "normal";

      let percentual = Math.round((statusAtual.minutosTrabalhados / statusAtual.metaDiariaMinutos) * 100);
      if (percentual > 100) percentual = 100;

      const dadosJornada = {
        percentual: percentual,
        trabalhadas: statusAtual.horasTrabalhadasFormatadas,
        restantes: statusAtual.horasRestantesFormatadas,
        estado: estadoFront
      };

      const dadosContrato = {
        contrato: (statusAtual.contrato && statusAtual.contrato.nome) || "Contrato",
        limiteDiario: `${statusAtual.metaDiariaMinutos / 60}h`
      };

      renderizarJornada(dadosJornada, dadosContrato);

      try {
        const respModulos = await fetch("/api/modulos");
        if (respModulos.ok) {
          const modulos = await respModulos.json();
          const cartaoAlerta = document.getElementById("alertaLimite");
          if (cartaoAlerta) cartaoAlerta.classList.toggle("oculto", modulos.alertasJornada === false);
        }
      } catch (e) {
        console.error("Não foi possível ler os módulos:", e);
      }
      
      renderizarPeriodo("periodoHoje", {
        horas: dadosJornada.trabalhadas,
        meta: dadosContrato.limiteDiario,
        percentual: dadosJornada.percentual,
        estado: dadosJornada.estado
      });

      const minTotaisSemana = (statusAtual.minutosSemanaReais || 0); 
      const fmtMeta = (min) => `${Math.round((min / 60) * 10) / 10}h`;
      const metaSemanaMin = statusAtual.metaSemanaMinutos || 2400;
      const metaMesMin = statusAtual.metaMesMinutos || 9600;
      const pctSemana = Math.min(Math.round((statusAtual.minutosSemanaNumerico / metaSemanaMin) * 100), 100) || percentual;

      renderizarPeriodo("periodoSemana", {
        horas: statusAtual.semanaFormatada || "0h 0min",
        meta: fmtMeta(metaSemanaMin),
        percentual: pctSemana,
        estado: pctSemana >= 97 ? "critico" : pctSemana >= 85 ? "atencao" : "normal"
      });

      const pctMes = Math.min(Math.round((statusAtual.minutosMesNumerico / metaMesMin) * 100), 100) || percentual;

      renderizarPeriodo("periodoMes", {
        horas: statusAtual.mesFormatada || "0h 0min",
        meta: fmtMeta(metaMesMin),
        percentual: pctMes,
        estado: pctMes >= 97 ? "critico" : pctMes >= 85 ? "atencao" : "normal"
      });   

      if (extrato && extrato.historico) {
        const historicoFormatado = extrato.historico.map(reg => {
          const formatarData = (dataStr) => {
            if (!dataStr) return "--/--/----";
            return new Date(dataStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
          };
          return {
            data: formatarData(reg.dataRegistro),
            entrada: formatarHora(reg.entrada1),
            saida: formatarHora(reg.saida2),
            status: "normal"
          };
        });
        
        renderizarHistorico(historicoFormatado.reverse().slice(0, 5));
      }
    } catch (e) {
      console.error("Erro ao carregar dados do C#:", e);
    }
  }

  carregar();

  setInterval(() => {
    carregar();
  }, 60000);

  const btnRegistrar = document.getElementById("btnRegistrar");
  if (btnRegistrar) {
    btnRegistrar.addEventListener("click", () => {
      window.location.href = "ponto.html"; 
    });
  }

  const filtroHistorico = document.getElementById("filtroHistorico");
  if (filtroHistorico) {
    filtroHistorico.addEventListener("change", (e) => {
      console.log("Filtro do histórico pendente de ligação com a API:", e.target.value);
    });
  }
})();
(function iniciarResumoDashboard() {
    const elHoje = document.getElementById("horasTrabalhadas");

    async function buscarResumoDoServidor() {
        const usuarioId = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || 1;

        try {
            const resposta = await fetch(`/api/ponto/resumo-dashboard/${usuarioId}`);
            
            if (resposta.ok) {
                const dados = await resposta.json();

                const elHoje = document.getElementById("horasTrabalhadas");
                if (elHoje) elHoje.textContent = dados.hojeStr;

                const elSemana = document.querySelector("#periodoSemana .periodo-horas");
                if (elSemana) elSemana.textContent = dados.semanaStr;

                const elMes = document.querySelector("#periodoMes .periodo-horas");
                if (elMes) elMes.textContent = dados.mesStr;
            }
        } catch (erro) {
            console.error("Erro ao buscar o resumo do dashboard:", erro);
        }
    }

    buscarResumoDoServidor();
})();

(function telaPonto() {
  const card = document.getElementById("cardPonto");
  if (!card) return; 

  const ETAPAS = [
    { chave: "entrada", nome: "Entrada" },
    { chave: "saidaAlmoco", nome: "Saída para Almoço" },
    { chave: "retornoAlmoco", nome: "Retorno do Almoço" },
    { chave: "saida", nome: "Saída" },
  ];

  const btn = document.getElementById("btnBaterPonto");
  const textoBtn = document.getElementById("textoBtnPonto");

  function atualizarRelogio() {
    const agora = new Date();
    document.getElementById("relogioHora").textContent =
      agora.toLocaleTimeString("pt-BR");
    document.getElementById("relogioData").textContent =
      agora.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    const dia = agora.toLocaleDateString("pt-BR", { weekday: "long" });
    document.getElementById("relogioDia").textContent =
      dia.charAt(0).toUpperCase() + dia.slice(1);
  }
  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);

  function mostrarAviso(tipo, texto) {
    const aviso = document.getElementById("avisoPonto");
    aviso.classList.remove("oculto", "aviso-sucesso", "aviso-erro");
    aviso.classList.add(tipo === "erro" ? "aviso-erro" : "aviso-sucesso");
    document.getElementById("avisoIcone").textContent =
      tipo === "erro" ? "!" : "✓";
    document.getElementById("avisoTexto").textContent = texto;
  }

  let batidas = {};

  function renderizar() {
    let proximaMarcada = false;

    ETAPAS.forEach(({ chave }) => {
      const li = document.querySelector(`.etapa[data-etapa="${chave}"]`);
      const hora = batidas[chave];
      li.classList.remove("concluida", "proxima");
      li.querySelector(".etapa-hora").textContent = hora || "--:--";

      if (hora) li.classList.add("concluida");
      else if (!proximaMarcada) {
        li.classList.add("proxima");
        proximaMarcada = true;
      }
    });

    const finalizado = ETAPAS.every(({ chave }) => batidas[chave]);
    btn.disabled = finalizado;
    textoBtn.textContent = finalizado
      ? "Jornada do dia concluída"
      : "Registrar Ponto";
  }

  async function carregar() {
    try {
      const usuarioId = sessionStorage.getItem("usuarioId") || 1;
      
      const extrato = await chamarApi(`/Ponto/extrato/${usuarioId}`, "GET");

      const hoje = new Date();
      const formatoDataBd = hoje.getFullYear() + "-" + 
                            String(hoje.getMonth() + 1).padStart(2, '0') + "-" + 
                            String(hoje.getDate()).padStart(2, '0');

      const registroHoje = extrato?.historico?.find(r => r.dataRegistro && r.dataRegistro.startsWith(formatoDataBd));

      const formatarHora = (dataString) => {
        if (!dataString) return null;
        return new Date(dataString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      };

      if (registroHoje) {
        batidas = {
          entrada: formatarHora(registroHoje.entrada1),
          saidaAlmoco: formatarHora(registroHoje.saidaAlmoco),
          retornoAlmoco: formatarHora(registroHoje.retornoAlmoco),
          saida: formatarHora(registroHoje.saida2)
        };
      } else {
        batidas = { entrada: null, saidaAlmoco: null, retornoAlmoco: null, saida: null };
      }
    } catch (e) {
      console.error("Erro ao carregar batidas de hoje:", e);
    }
    
    renderizar();
  }

  btn.addEventListener("click", async () => {
    const proxima = ETAPAS.find(({ chave }) => !batidas[chave]);
    if (!proxima) return;
    
    btn.disabled = true;

    try {
      const tipos = { entrada: "entrada1", saidaAlmoco: "saidaalmoco", retornoAlmoco: "retornoalmoco", saida: "saida2" };

      const usuarioLogado = sessionStorage.getItem("usuarioId") || 1; 

      await chamarApi(`/Ponto/Registrar/${usuarioLogado}`, "POST", { TipoMarcacao: tipos[proxima.chave] });
      
      await carregar();
      mostrarAviso("sucesso", `${proxima.nome} registrado com sucesso.`);
    } catch (e) {
      mostrarErroPonto(e.message || "Erro ao comunicar com o servidor.");
    }
  });

  function mostrarErroPonto(mensagem) {
    mostrarAviso("erro", mensagem || "Não foi possível registrar o ponto.");
    btn.disabled = false;
  }

  carregar();
})();

(function telaRelatorios() {
  const cardExportar = document.getElementById("cardExportar");
  if (!cardExportar) return;

  const selectMes = document.getElementById("mesReferencia");
  const btnGerar = document.getElementById("btnGerarPdf");
  const tabela = document.getElementById("tabelaRelatorios");

  const ICONE_DOWNLOAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right:5px; vertical-align:text-bottom;"><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg>';

  function renderizarSaldo(s) {
    const card = document.getElementById("cardSaldo");
    card.classList.remove("saldo-positivo", "saldo-negativo", "saldo-neutro", "saldo-inativo");


    if (!s.bancoHorasAtivo) {
      card.classList.add("saldo-inativo");
      document.getElementById("saldoValor").textContent = "Não se aplica";
      document.getElementById("saldoInfo").textContent = "Seu tipo de contrato não possui banco de horas.";
      return;
    }
    const classe = s.saldoMinutos > 0 ? "saldo-positivo"
             : s.saldoMinutos < 0 ? "saldo-negativo"
             : "saldo-neutro";
    card.classList.add(classe);

    card.classList.add(s.positivo ? "saldo-positivo" : "saldo-negativo");
    document.getElementById("saldoValor").textContent = s.saldo;
    document.getElementById("saldoInfo").textContent = `Banco de horas atualizado em ${s.atualizadoEm}.`;
  }

  async function carregar() {
    try {
      const usuarioId = sessionStorage.getItem("usuarioId") || 1;

      const saldo = await chamarApi(`/Relatorios/saldo/${usuarioId}`, "GET");
      renderizarSaldo(saldo);

      const meses = await chamarApi(`/Relatorios/meses/${usuarioId}`, "GET");
      
      selectMes.innerHTML = "";
      if (meses.length === 0) {
        selectMes.innerHTML = '<option value="">Sem registros</option>';
        tabela.innerHTML = '<tr><td colspan="3" class="tabela-vazia">Nenhum mês com registros encontrado no banco.</td></tr>';
        btnGerar.disabled = true;
        return;
      }

      meses.forEach(m => {
        selectMes.insertAdjacentHTML("beforeend", `<option value="${m.valor}">${m.texto}</option>`);
      });

      tabela.innerHTML = meses.map(m => `
        <tr>
          <td><strong>${m.texto}</strong></td>
          <td>Disponível</td>
          <td class="acoes">
            <a href="/api/Relatorios/espelho/${usuarioId}/${String(m.valor).replace('-', '/')}?solicitante=${usuarioId}" target="_blank" class="btn-baixar">
              ${ICONE_DOWNLOAD} Baixar PDF
            </a>
          </td>
        </tr>
      `).join("");

    } catch (e) {
      console.error("Erro ao carregar relatórios:", e);
      tabela.innerHTML = '<tr><td colspan="3" class="tabela-vazia" style="color:red;">Erro ao comunicar com o servidor.</td></tr>';
    }
  }

  btnGerar.addEventListener("click", () => {
    const mesValor = selectMes.value;
    if (!mesValor) return;
    const usuarioId = sessionStorage.getItem("usuarioId") || 1;
    window.open(`/api/Relatorios/espelho/${usuarioId}/${String(mesValor).replace("-", "/")}?solicitante=${usuarioId}`, "_blank");
  });

  carregar();
})();

(function modalAtestado() {
  const modal = document.getElementById("modalAtestado");
  if (!modal) return; 

  const form = document.getElementById("formAtestado");
  const inicio = document.getElementById("atestadoInicio");
  const fim = document.getElementById("atestadoFim");
  const motivo = document.getElementById("atestadoMotivo");
  const arquivo = document.getElementById("atestadoArquivo");
  const areaUpload = document.getElementById("areaUpload");
  const nomeArquivo = document.getElementById("nomeArquivoAtestado");
  const btnEnviar = document.getElementById("btnEnviarAtestado");
  const botoesMenu = document.querySelectorAll('[data-ir$="#atestado"]');
  const botoesInicio = document.querySelectorAll(
    '.menu-item[data-ir="inicio.html"]',
  );
  const marcar = (lista, ligado) =>
    lista.forEach((b) => b.classList.toggle("ativo", ligado));

  const TIPOS_ACEITOS = ["application/pdf", "image/jpeg", "image/png"];
  const TAMANHO_MAX = 5 * 1024 * 1024; 

  function abrir() {
    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    marcar(botoesMenu, true);
    marcar(botoesInicio, false);
    inicio.focus();
  }

  function fechar() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
    marcar(botoesMenu, false);
    marcar(botoesInicio, true);
    limpar();
    history.replaceState(null, "", location.pathname + location.search);
  }

  function limpar() {
    form.reset();
    nomeArquivo.textContent = "";
    btnEnviar.disabled = false;
    btnEnviar.textContent = "Enviar atestado";
    document.getElementById("erroAtestadoGeral").textContent = "";
    document.getElementById("sucessoAtestado").textContent = "";
    [
      ["campoAtestadoInicio", "erroAtestadoInicio"],
      ["campoAtestadoFim", "erroAtestadoFim"],
      ["campoAtestadoMotivo", "erroAtestadoMotivo"],
      ["campoAtestadoArquivo", "erroAtestadoArquivo"],
    ].forEach(([c, e]) => mostrarErro(c, e, ""));
  }

  if (location.hash === "#atestado") abrir();
  window.addEventListener("hashchange", () => {
    if (location.hash === "#atestado") abrir();
  });

  document
    .getElementById("btnFecharAtestado")
    .addEventListener("click", fechar);
  document
    .getElementById("btnCancelarAtestado")
    .addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar();
  }); 
  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape" && !modal.classList.contains("oculto")) fechar();
  });


  function mostrarNomeArquivo() {
    nomeArquivo.textContent = arquivo.files[0]
      ? "📎 " + arquivo.files[0].name
      : "";
  }
  arquivo.addEventListener("change", mostrarNomeArquivo);

  ["dragenter", "dragover"].forEach((ev) =>
    areaUpload.addEventListener(ev, (e) => {
      e.preventDefault();
      areaUpload.classList.add("arrastando");
    }),
  );
  ["dragleave", "drop"].forEach((ev) =>
    areaUpload.addEventListener(ev, (e) => {
      e.preventDefault();
      areaUpload.classList.remove("arrastando");
    }),
  );
  areaUpload.addEventListener("drop", (e) => {
    if (e.dataTransfer.files.length) {
      arquivo.files = e.dataTransfer.files;
      mostrarNomeArquivo();
    }
  });

  function validar() {
    let ok = true;

    if (!inicio.value) {
      mostrarErro(
        "campoAtestadoInicio",
        "erroAtestadoInicio",
        "Informe a data de início.",
      );
      ok = false;
    } else mostrarErro("campoAtestadoInicio", "erroAtestadoInicio", "");

    if (!fim.value) {
      mostrarErro(
        "campoAtestadoFim",
        "erroAtestadoFim",
        "Informe a data de fim.",
      );
      ok = false;
    } else if (inicio.value && fim.value < inicio.value) {
      mostrarErro(
        "campoAtestadoFim",
        "erroAtestadoFim",
        "A data de fim deve ser igual ou posterior ao início.",
      );
      ok = false;
    } else mostrarErro("campoAtestadoFim", "erroAtestadoFim", "");

    if (!motivo.value) {
      mostrarErro(
        "campoAtestadoMotivo",
        "erroAtestadoMotivo",
        "Selecione o motivo.",
      );
      ok = false;
    } else mostrarErro("campoAtestadoMotivo", "erroAtestadoMotivo", "");

    const arq = arquivo.files[0];
    if (!arq) {
      mostrarErro(
        "campoAtestadoArquivo",
        "erroAtestadoArquivo",
        "Anexe o documento do atestado.",
      );
      ok = false;
    } else if (!TIPOS_ACEITOS.includes(arq.type)) {
      mostrarErro(
        "campoAtestadoArquivo",
        "erroAtestadoArquivo",
        "Formato inválido. Use PDF, JPG ou PNG.",
      );
      ok = false;
    } else if (arq.size > TAMANHO_MAX) {
      mostrarErro(
        "campoAtestadoArquivo",
        "erroAtestadoArquivo",
        "O arquivo deve ter no máximo 5 MB.",
      );
      ok = false;
    } else mostrarErro("campoAtestadoArquivo", "erroAtestadoArquivo", "");

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroAtestadoGeral").textContent = "";
    
    if (!validar()) return;

    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    try {
      const usuarioId = sessionStorage.getItem("usuarioId") || 1;
      
      const payload = new FormData();
      payload.append("UsuarioId", usuarioId);
      payload.append("DataInicio", inicio.value);
      payload.append("DataFim", fim.value);
      payload.append("Motivo", motivo.value);
      payload.append("Arquivo", arquivo.files[0]); 

      const resposta = await fetch("/api/Atestado/enviar", {
        method: "POST",
        body: payload 
      });

      const dados = await resposta.json();
      
      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro na comunicação com o servidor.");
      }

      document.getElementById("sucessoAtestado").textContent = dados.mensagem;
      setTimeout(fechar, 1800);
      
    } catch (erro) {
      console.error("Erro no envio:", erro);
      document.getElementById("erroAtestadoGeral").textContent = erro.message || "Falha ao enviar o atestado.";
      btnEnviar.disabled = false;
      btnEnviar.textContent = "Enviar atestado";
    }
  });
})();

(function telaConfiguracoesFuncionarioExclusiva() {
  const formSenha = document.getElementById("formSenhaFuncionario");
  if (!formSenha) return; 

  const usuarioId = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || 1;

  const inputNome = document.getElementById("funcNome");
  const inputEmail = document.getElementById("funcEmail");
  const inputContrato = document.getElementById("funcContrato");

  const senhaAtual = document.getElementById("funcSenhaAtual");
  const novaSenha = document.getElementById("funcNovaSenha");
  const erroAtual = document.getElementById("erroFuncSenhaAtual");
  const erroNova = document.getElementById("erroFuncNovaSenha");
  const msgSucesso = document.getElementById("sucessoFuncSenha");
  const btnSalvar = document.getElementById("btnSalvarSenhaFunc");

  const btnSair = document.getElementById("btnSairFunc");
  if (btnSair) {
    btnSair.addEventListener("click", () => {
      localStorage.removeItem("perfil");
      sessionStorage.removeItem("usuarioId");
      window.location.href = "login.html";
    });
  }

  document.querySelectorAll(".btn-olho").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.alvo);
      if (input) {
        input.type = input.type === "password" ? "text" : "password";
        btn.classList.toggle("visivel");
      }
    });
  });

  async function carregarDados() {
    try {
      const resp = await fetch(`/api/me/${usuarioId}`);
      if (resp.ok) {
        const dados = await resp.json();
        if (inputNome) inputNome.textContent = dados.nome || "Colaborador";
        if (inputEmail) inputEmail.textContent = dados.email || "colaborador@empresa.com";
        if (inputContrato) inputContrato.textContent = dados.contrato || "CLT - Efetivo";
      }
    } catch (e) {
      console.error("Erro ao carregar dados do colaborador:", e);
    }
  }

  formSenha.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (erroAtual) erroAtual.textContent = "";
    if (erroNova) erroNova.textContent = "";
    if (msgSucesso) msgSucesso.textContent = "";

    const valSenhaAtual = senhaAtual.value;
    const valNovaSenha = novaSenha.value;

    if (!valSenhaAtual) {
      if (erroAtual) erroAtual.textContent = "Informe a senha atual.";
      return;
    }
    if (valNovaSenha.length < 8) {
      if (erroNova) erroNova.textContent = "A nova senha deve ter no mínimo 8 caracteres.";
      return;
    }

    if (btnSalvar) {
      btnSalvar.disabled = true;
      btnSalvar.textContent = "Salvando...";
    }

    try {
      const resposta = await fetch(`/api/me/senha/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual: valSenhaAtual, novaSenha: valNovaSenha })
      });

      if (!resposta.ok) {
        const erroJson = await resposta.json().catch(() => ({}));
        if (erroAtual) erroAtual.textContent = erroJson.erro || "Senha atual incorreta.";
        return;
      }

      formSenha.reset();
      if (msgSucesso) msgSucesso.textContent = "Senha alterada com sucesso!";
    } catch (err) {
      if (erroAtual) erroAtual.textContent = "Erro de conexão com o servidor.";
    } finally {
      if (btnSalvar) {
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Alterar Senha";
      }
    }
  });

  carregarDados();
})();

(function controlePerfil() {
  if (!document.querySelector(".pagina-app")) return;


  const perfil = localStorage.getItem("perfil") || "funcionario";

  const acesso = document.body.dataset.acesso;
  if (acesso && !acesso.split(" ").includes(perfil)) {
    alert(
      `Acesso negado: você entrou como "${perfil}". Faça login com um e-mail de RH ou Admin.`,
    );
    window.location.href = "../login.html";
    return;
  }

  document.querySelectorAll("[data-perfil]").forEach((el) => {
    el.classList.toggle(
      "oculto",
      !el.dataset.perfil.split(" ").includes(perfil),
    );
  });

  const saudacao = document.getElementById("saudacaoPerfil");
  if (saudacao)
    saudacao.textContent =
      perfil === "admin" ? "Olá, Administrador" : "Olá, Gestor RH";

  const btnSair = document.getElementById("btnSair");
  if (btnSair)
    btnSair.addEventListener("click", () => localStorage.removeItem("perfil"));
})();

(function telaPendencias() {
  const card = document.getElementById("cardPendencias");
  if (!card) return;

  const tabela = document.getElementById("tabelaPendencias");
  const filtro = document.getElementById("filtroTipo");

  const TIPOS = {
    batida_impar: { texto: "Batida Ímpar", badge: "badge-atencao" },
    atestado: { texto: "Atestado Médico Enviado", badge: "badge-info" },
    falta: { texto: "Falta Injustificada", badge: "badge-critico" },
    excesso_jornada: { texto: "Excesso de Jornada", badge: "badge-critico" },
  };

  function botoes(p) {
    if (p.tipo === "batida_impar")
      return `<button class="btn-acao primario" data-acao="editar" data-id="${p.id}">Editar Ponto</button>`;
    if (p.tipo === "atestado")
      return `<button class="btn-acao" data-acao="anexo" data-id="${p.id}">Visualizar Anexo</button>
              <button class="btn-acao perigo" data-acao="rejeitar" data-id="${p.id}">Rejeitar</button>
              <button class="btn-acao primario" data-acao="aprovar" data-id="${p.id}">Aprovar</button>`;
    return `<button class="btn-acao perigo" data-acao="tratar" data-id="${p.id}">Tratar Ocorrência</button>`;
  }

  let pendencias = [];

  function renderizar() {
    const lista =
      filtro.value === "todos"
        ? pendencias
        : pendencias.filter((p) => p.tipo === filtro.value);
    document.getElementById("contadorPendencias").textContent =
      pendencias.length;

    if (!lista.length) {
      tabela.innerHTML =
        '<tr><td colspan="5" class="tabela-vazia">Nenhuma pendência encontrada. 🎉</td></tr>';
      return;
    }
    tabela.innerHTML = lista
      .map(
        (p) => `
        <tr data-linha="${p.id}">
          <td class="colaborador"><strong>${p.colaborador}</strong><span>${p.contrato}</span></td>
          <td>${p.data}</td>
          <td><span class="badge ${TIPOS[p.tipo].badge}">${TIPOS[p.tipo].texto}</span></td>
          <td class="texto-suave">${p.detalhe}</td>
          <td class="acoes"><div class="acoes-grupo">${botoes(p)}</div></td>
        </tr>`,
      )
      .join("");
  }

  function resolver(id, mensagem) {
    const linha = tabela.querySelector(`[data-linha="${id}"]`);
    if (linha) linha.classList.add("resolvida");
    setTimeout(() => {
      pendencias = pendencias.filter((p) => String(p.id) !== String(id));
      renderizar();
      if (window.atualizarAlertasRh) window.atualizarAlertasRh();
    }, 400);
    const msg = document.getElementById("msgPendencias");
    msg.textContent = mensagem;
    setTimeout(() => (msg.textContent = ""), 2500);
  }

  tabela.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-acao]");
    if (!btn) return;
    const p = pendencias.find((x) => String(x.id) === btn.dataset.id);

    switch (btn.dataset.acao) {
      case "editar":
        if (await moduloBloqueado("edicaoPonto")) {
          alert("O módulo Edição de Ponto está desativado pelo Administrador.");
          break;
        }
        window.abrirEditarPonto(p, () =>
          resolver(p.id, `Ponto de ${p.colaborador} corrigido.`),
        );
        break;

      case "anexo":
        if (p.anexoUrl) {
          window.open(p.anexoUrl, "_blank");
        } else {
          alert("O link do anexo não foi gerado.");
        }
        break;

      case "aprovar":
        btn.disabled = true;
        try {
          const idNumerico = p.id.split("_")[1];
          
          const usuarioLogadoId = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || 1;

          await chamarApi(`/Pendencias/atestado/${idNumerico}/aprovar`, "PUT", {
            UsuarioResponsavelId: parseInt(usuarioLogadoId)
          });

          resolver(p.id, `Atestado de ${p.colaborador} aprovado.`);
        } catch (erro) {
          console.error("Erro na aprovação:", erro);
          alert("Erro ao aprovar atestado.");
          btn.disabled = false;
        }
        break;

      case "rejeitar":
        if (
          !confirm(
            `Rejeitar o atestado de ${p.colaborador}? Os dias não serão abonados e o colaborador poderá ter falta computada.`,
          )
        )
          break;
        btn.disabled = true;
        try {
          const idNumerico = p.id.split("_")[1];
          const usuarioLogadoId = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || 1;

          await chamarApi(`/Pendencias/atestado/${idNumerico}/rejeitar`, "PUT", {
            UsuarioResponsavelId: parseInt(usuarioLogadoId)
          });

          resolver(p.id, `Atestado de ${p.colaborador} rejeitado.`);
        } catch (erro) {
          console.error("Erro ao rejeitar:", erro);
          alert("Erro ao rejeitar atestado.");
          btn.disabled = false;
        }
        break;

      case "tratar":
        if (p.tipo === "excesso_jornada") {
          const justificativa = (
            prompt(
              `Excesso de jornada de ${p.colaborador} em ${p.data}.\nInforme a providência adotada (ex.: orientado, gestor ciente, jornada ajustada):`,
            ) || ""
          ).trim();
          if (!justificativa) {
            alert("A justificativa é obrigatória para tratar a ocorrência.");
            break;
          }
          btn.disabled = true;
          try {
            const pontoId = p.id.split("_")[1];
            const usuarioLogadoId = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || 1;
            await chamarApi(`/Pendencias/excesso/${pontoId}/tratar`, "PUT", {
              UsuarioResponsavelId: parseInt(usuarioLogadoId),
              Justificativa: justificativa,
            });
            resolver(p.id, `Excesso de jornada de ${p.colaborador} tratado e registrado na auditoria.`);
          } catch (erro) {
            console.error("Erro ao tratar excesso:", erro);
            alert("Erro ao registrar o tratamento.");
            btn.disabled = false;
          }
          break;
        }
        if (
          confirm(
            `Confirmar a falta de ${p.colaborador} em ${p.data} como tratada?`,
          )
        )
          resolver(p.id, `Ocorrência de ${p.colaborador} tratada.`);
        break;
    }
  });

  filtro.addEventListener("change", renderizar);

  async function carregar() {
    try {
      pendencias = await chamarApi("/Pendencias", "GET");
      renderizar();
    } catch (erro) {
      console.error("Erro ao carregar pendências:", erro);
      tabela.innerHTML = '<tr><td colspan="5" class="tabela-vazia" style="color:red;">Erro ao buscar dados do servidor. Tente novamente.</td></tr>';
    }
  }

  carregar();
})();
(function modalEditarPonto() {
  const modal = document.getElementById("modalEditarPonto");
  if (!modal) return; 

  const form = document.getElementById("formEditarPonto");
  const data = document.getElementById("editarData");
  const justificativa = document.getElementById("editarJustificativa");
  const contador = document.getElementById("contadorJustificativa");
  const btnSalvar = document.getElementById("btnSalvarEditar");
  const erroHorarios = document.getElementById("erroEditarNovo");

  const campos = {
    entrada1: document.getElementById("editarEntrada"),
    saidaAlmoco: document.getElementById("editarSaidaAlmoco"),
    retornoAlmoco: document.getElementById("editarRetornoAlmoco"),
    saida2: document.getElementById("editarSaida"),
  };
  const ROTULOS = {
    entrada1: "Entrada",
    saidaAlmoco: "Saída Almoço",
    retornoAlmoco: "Retorno Almoço",
    saida2: "Saída",
  };
  const ORDEM = ["entrada1", "saidaAlmoco", "retornoAlmoco", "saida2"];

  let pendenciaAtual = null;
  let aoSalvar = null;

  function paraISO(dataBR) {
    const [d, m, a] = dataBR.split("/");
    return `${a}-${m}-${d}`;
  }

  function abrir(pendencia, callback) {
    pendenciaAtual = pendencia;
    aoSalvar = callback;
    limpar();

    document.getElementById("editarNome").textContent = pendencia.colaborador;
    document.getElementById("editarContrato").textContent = pendencia.contrato;
    document.getElementById("editarAvatar").textContent = pendencia.colaborador
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    data.value = paraISO(pendencia.data);

    const batidas = pendencia.batidas || {};
    ORDEM.forEach((chave) => {
      campos[chave].value = batidas[chave] || "";
      campos[chave].classList.toggle("campo-faltando", !batidas[chave]);
    });

    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    const primeiroVazio = ORDEM.find((c) => !campos[c].value) || "entrada1";
    campos[primeiroVazio].focus();
  }

  function fechar() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
    pendenciaAtual = null;
  }

  function limpar() {
    form.reset();
    contador.textContent = "0/500";
    contador.classList.remove("limite");
    btnSalvar.disabled = false;
    btnSalvar.textContent = "Salvar";
    erroHorarios.textContent = "";
    document.getElementById("erroEditarGeral").textContent = "";
    [
      ["campoEditarJustificativa", "erroEditarJustificativa"],
    ].forEach(([c, e]) => mostrarErro(c, e, ""));
  }

  window.abrirEditarPonto = abrir;

  document.getElementById("btnFecharEditar").addEventListener("click", fechar);
  document
    .getElementById("btnCancelarEditar")
    .addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("oculto")) fechar();
  });

  justificativa.addEventListener("input", () => {
    const total = justificativa.value.length;
    contador.textContent = `${total}/500`;
    contador.classList.toggle("limite", total >= 500);
  });

  function validar() {
    let ok = true;
    erroHorarios.textContent = "";

    const faltando = ORDEM.filter((c) => !campos[c].value);
    if (faltando.length) {
      erroHorarios.textContent =
        "Preencha: " + faltando.map((c) => ROTULOS[c]).join(", ") + ".";
      ok = false;
    } else {
      for (let i = 1; i < ORDEM.length; i++) {
        if (campos[ORDEM[i]].value <= campos[ORDEM[i - 1]].value) {
          erroHorarios.textContent = `${ROTULOS[ORDEM[i]]} deve ser depois de ${ROTULOS[ORDEM[i - 1]]}.`;
          ok = false;
          break;
        }
      }
    }

    if (justificativa.value.trim().length < 10) {
      mostrarErro(
        "campoEditarJustificativa",
        "erroEditarJustificativa",
        "Escreva uma justificativa com pelo menos 10 caracteres.",
      );
      ok = false;
    } else
      mostrarErro("campoEditarJustificativa", "erroEditarJustificativa", "");

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroEditarGeral").textContent = "";
    if (!validar()) return;

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    try {
      const pontoId = parseInt(pendenciaAtual.id.split("_")[1]);

      const usuarioConectado = JSON.parse(localStorage.getItem("usuario") || sessionStorage.getItem("usuario") || "{}");
      const idAutor = usuarioConectado.id || usuarioConectado.usuarioId || sessionStorage.getItem("usuarioId") || 2;

      // Horários enviados como "HH:mm": o servidor monta a data/hora com o dia do registro (sem fuso).
      const resposta = await fetch(`/api/pendencias/ponto/${pontoId}/resolver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entrada1: campos.entrada1.value,
          saidaAlmoco: campos.saidaAlmoco.value,
          retornoAlmoco: campos.retornoAlmoco.value,
          saida2: campos.saida2.value,
          justificativa: justificativa.value.trim(),
          usuarioResponsavelId: parseInt(idAutor)
        })
      });

      if (!resposta.ok) {
        const erroJson = await resposta.json().catch(() => ({}));
        throw new Error(erroJson.erro || "Não foi possível salvar o ajuste no servidor.");
      }

      fechar();
      if (typeof aoSalvar === "function") aoSalvar();

    } catch (error) {
      console.error(error);
      document.getElementById("erroEditarGeral").textContent = error.message;
      btnSalvar.disabled = false; 
      btnSalvar.textContent = "Salvar";
    }
  });
})();

(function telaImportar() {
  const card = document.getElementById("cardImportar");
  if (!card) return;

  const input = document.getElementById("arquivoImportar");
  const area = document.getElementById("areaImportar");
  const nome = document.getElementById("nomeArquivoImportar");
  const btnImportar = document.getElementById("btnImportar");
  const btnLimpar = document.getElementById("btnLimparImportar");
  const tabela = document.getElementById("tabelaImportacoes");

  const EXTENSOES = [".csv", ".xlsx", ".xls"];
  const LIMITE_LINHAS = 5000;
  const STATUS = {
    concluido: '<span class="badge badge-normal">Concluído</span>',
    processando: '<span class="badge badge-info">Processando</span>',
    erro: '<span class="badge badge-critico">Erro</span>',
  };

  let arquivo = null;
  let importacoes = [];

  function renderizarTabela() {
    if (!importacoes.length) {
      tabela.innerHTML =
        '<tr><td colspan="4" class="tabela-vazia">Nenhuma importação realizada.</td></tr>';
      return;
    }
    tabela.innerHTML = importacoes
      .map(
        (i) => `
        <tr>
          <td><strong>${i.arquivo}</strong>${i.erroResumo ? `<div class="erros-importacao">${i.erroResumo}</div>` : ""}</td>
          <td>${i.data}${i.por ? `<div class="texto-suave pequeno">por ${i.por}</div>` : ""}</td>
          <td>${i.linhas != null ? i.linhas.toLocaleString("pt-BR") : "--"}</td>
          <td>${STATUS[i.status] || i.status}</td>
        </tr>`,
      )
      .join("");
  }

  async function carregarHistorico() {
    try {
      const resp = await fetch("/api/historico/importacao");
      if (resp.ok) importacoes = await resp.json();
    } catch (erro) {
      console.error("Erro ao carregar histórico de importações:", erro);
    }
    renderizarTabela();
  }

  function contarLinhasCsv(file) {
    return new Promise((resolve) => {
      const leitor = new FileReader();
      leitor.onload = () =>
        resolve(
          leitor.result.split(/\r?\n/).filter((l) => l.trim()).length - 1,
        ); 
      leitor.onerror = () => resolve(null);
      leitor.readAsText(file);
    });
  }

  async function selecionar(file) {
    mostrarErro("cardImportar", "erroImportar", "");
    card.classList.remove("erro");
    if (!file) return limpar();

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!EXTENSOES.includes(ext)) {
      limpar();
      document.getElementById("erroImportar").textContent =
        "Formato inválido. Use .csv, .xlsx ou .xls.";
      return;
    }

    if (ext === ".csv") {
      const linhas = await contarLinhasCsv(file);
      if (linhas > LIMITE_LINHAS) {
        limpar();
        document.getElementById("erroImportar").textContent =
          `O arquivo tem ${linhas.toLocaleString("pt-BR")} linhas. O limite é ${LIMITE_LINHAS.toLocaleString("pt-BR")}.`;
        return;
      }
    }

    arquivo = file;
    nome.textContent = `📎 ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
    area.classList.add("com-arquivo");
    btnImportar.disabled = false;
    btnLimpar.classList.remove("oculto");
  }

  function limpar() {
    arquivo = null;
    input.value = "";
    nome.textContent = "";
    area.classList.remove("com-arquivo");
    btnImportar.disabled = true;
    btnLimpar.classList.add("oculto");
  }

  input.addEventListener("change", () => selecionar(input.files[0]));
  btnLimpar.addEventListener("click", limpar);

  ["dragenter", "dragover"].forEach((ev) =>
    area.addEventListener(ev, (e) => {
      e.preventDefault();
      area.classList.add("arrastando");
    }),
  );
  ["dragleave", "drop"].forEach((ev) =>
    area.addEventListener(ev, (e) => {
      e.preventDefault();
      area.classList.remove("arrastando");
    }),
  );
  area.addEventListener("drop", (e) => selecionar(e.dataTransfer.files[0]));

  btnImportar.addEventListener("click", async () => {
    if (!arquivo) return;
    btnImportar.disabled = true;
    btnLimpar.classList.add("oculto");

    const progresso = document.getElementById("progressoImportar");
    const barra = document.getElementById("barraImportar");
    const texto = document.getElementById("textoProgresso");
    progresso.classList.remove("oculto");
    
    barra.style.width = "50%";
    texto.textContent = "Processando arquivo...";

    try {
      const payload = new FormData();
      payload.append("arquivo", arquivo);
      payload.append("usuarioId", sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || "");

      const resposta = await fetch("/api/Upload/csv", {
        method: "POST",
        body: payload 
      });

      const dados = await resposta.json();
      
      if (!resposta.ok) throw new Error(dados.Mensagem || "Erro ao processar arquivo");

      barra.style.width = "100%";
      texto.textContent = "Concluído!";

      const resultado = {
        arquivo: arquivo.name,
        data: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
        linhas: dados.Registros ? dados.Registros.length : null,
        status: "concluido"
      };

      await carregarHistorico();
      
      const msg = document.getElementById("msgImportar");
      msg.textContent = dados.Mensagem;
      setTimeout(() => msg.textContent = "", 3000);

    } catch (erro) {
      console.error(erro);
      const resultadoErro = {
        arquivo: arquivo.name,
        data: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
        linhas: null,
        status: "erro",
        erroResumo: erro.message
      };
      await carregarHistorico();
    } finally {
      setTimeout(() => {
        progresso.classList.add("oculto");
        barra.style.width = "0%";
        limpar();
      }, 1500);
    }
  });

  async function carregar() {
    // O servidor também bloqueia (403); aqui o RH já vê o aviso e a área de upload some.
    if (await moduloBloqueado("importacao")) {
      document.getElementById("avisoModuloDesativado")?.classList.remove("oculto");
      area.classList.add("oculto");
      document.querySelector(".importar-acoes")?.classList.add("oculto");
    }
    await carregarHistorico();
  }

  carregar();
})();

(function telaExportarRh() {
  const form = document.getElementById("formExportarRh");
  if (!form) return;

  const alvo = document.getElementById("exportarAlvo");
  const mes = document.getElementById("exportarMes");
  const btn = document.getElementById("btnExportarRh");
  const tabela = document.getElementById("tabelaExportacoes");

  const ICONE_DOWNLOAD =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg>';

  let exportacoes = [];

  function preencherAlvos(setores, colaboradores) {
    let html = '<option value="todos">Todos os colaboradores</option>';
    html +=
      '<optgroup label="Setores">' +
      setores
        .map((s) => `<option value="setor:${s.id}">${s.nome}</option>`)
        .join("") +
      "</optgroup>";
    html +=
      '<optgroup label="Colaboradores">' +
      colaboradores
        .map((c) => `<option value="colaborador:${c.id}">${c.nome}</option>`)
        .join("") +
      "</optgroup>";
    alvo.insertAdjacentHTML("beforeend", html);
  }

  function preencherMeses() {
    const hoje = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const texto = d.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      mes.insertAdjacentHTML(
        "beforeend",
        `<option value="${valor}">${texto.charAt(0).toUpperCase() + texto.slice(1)}</option>`,
      );
    }
  }

  function renderizarTabela() {
    if (!exportacoes.length) {
      tabela.innerHTML =
        '<tr><td colspan="4" class="tabela-vazia">Nenhum relatório exportado ainda.</td></tr>';
      return;
    }
    tabela.innerHTML = exportacoes
      .map(
        (r) => `
        <tr>
          <td><strong>${r.arquivo}</strong>${r.detalhe ? `<div class="texto-suave pequeno">${r.detalhe}</div>` : ""}</td>
          <td>${r.data}</td>
          <td>${r.por}</td>
          <td class="acoes"><button class="btn-baixar" data-id="${r.id}" data-colab="${r.colaboradorId}" data-ano="${r.ano}" data-mes="${r.mes}">${ICONE_DOWNLOAD} Baixar PDF</button></td>
        </tr>`,
      )
      .join("");
  }

  tabela.addEventListener("click", async (e) => {
    const b = e.target.closest(".btn-baixar");
    if (!b) return;
    if (await moduloBloqueado("exportacao")) {
      alert("O módulo Exportação PDF está desativado pelo Administrador.");
      return;
    }
    const solicitante = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || "";
    window.open(`/api/Relatorios/espelho/${b.dataset.colab}/${b.dataset.ano}/${b.dataset.mes}?solicitante=${solicitante}`, "_blank");
    setTimeout(carregarHistorico, 2500);
  });

  function nomeArquivo() {
    const textoAlvo = alvo.options[alvo.selectedIndex].text;
    const [ano, m] = mes.value.split("-");
    const slug = textoAlvo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    return `relatorio_${slug}_${m}-${ano}.pdf`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!alvo.value) {
      alert("Selecione um colaborador.");
      return;
    }

    if (await moduloBloqueado("exportacao")) {
      alert("O módulo Exportação PDF está desativado pelo Administrador.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Gerando...";

    try {
      if (alvo.value.startsWith("colaborador:")) {
        const colaboradorId = alvo.value.split(":")[1];
        
        const partesData = mes.value.split("-"); 
        const ano = partesData[0];
        const mesNum = partesData[1];
        
        const solicitante = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || "";
        window.open(`/api/Relatorios/espelho/${colaboradorId}/${ano}/${parseInt(mesNum)}?solicitante=${solicitante}`, '_blank');
        setTimeout(carregarHistorico, 2500);
        
        const msg = document.getElementById("msgExportarRh");
        if(msg) {
          msg.textContent = `Relatório gerado com sucesso.`;
          setTimeout(() => (msg.textContent = ""), 3000);
        }
      } else {
        alert("Por favor, selecione um colaborador específico para exportar o PDF.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro detalhado: " + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Exportar para PDF";
    }
  });

  async function carregarHistorico() {
    try {
      const resp = await fetch("/api/historico/exportacao");
      if (resp.ok) exportacoes = await resp.json();
    } catch (erro) {
      console.error("Erro ao carregar histórico de exportações:", erro);
    }
    renderizarTabela();
  }

  async function carregar() {
    try {
      const resposta = await fetch("/api/Relatorios/colaboradores");
      const colaboradores = await resposta.json();

      const setores = []; 

      preencherAlvos(setores, colaboradores);
      preencherMeses();
      await carregarHistorico();

    } catch (error) {
      console.error("Erro ao carregar colaboradores do banco:", error);
    }
  }

  carregar();
})();

(function telaAuditoriaRh() {
  const form = document.getElementById("formAuditoria");
  if (!form) return;

  const periodo = document.getElementById("filtroPeriodo");
  const ator = document.getElementById("filtroAtor");
  const evento = document.getElementById("filtroEvento");
  const tabela = document.getElementById("tabelaAuditoria");

  const AUTORES = {
    rh: { classe: "autor-rh" },
    admin: { classe: "autor-admin" },
  };
  const EVENTOS = {
    edicao_ponto: { texto: "Edição de ponto", badge: "badge-atencao" },
    excesso_jornada: { texto: "Tratamento de excesso de jornada", badge: "badge-critico" },
    atestado: { texto: "Validação de atestado", badge: "badge-normal" },
  };

  let logs = [];

  function formatarData(d) {
    return d.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function renderizar(lista) {
    document.getElementById("contadorAuditoria").textContent = lista.length;
    if (!lista.length) {
      tabela.innerHTML =
        '<tr><td colspan="4" class="tabela-vazia">Nenhuma atividade encontrada para os filtros escolhidos.</td></tr>';
      return;
    }
    tabela.innerHTML = lista
      .map(
        (l) => `
        <tr>
          <td class="data-log">${formatarData(l.data)}</td>
          <td><span class="autor ${AUTORES[l.ator].classe}">${l.autor}</span></td>
          <td><span class="badge ${EVENTOS[l.tipo].badge}">${EVENTOS[l.tipo].texto}</span></td>
          <td class="detalhe-log">${l.detalhe}</td>
        </tr>`,
      )
      .join("");
  }

  async function aplicarFiltros() {
    try {
      const dados = await chamarApi("/api/auditoria", "GET");

      logs = dados.map(l => ({
        ...l,
        data: new Date(l.data)
      }));

      const agora = new Date();
      const inicio = new Date(agora);
      if (periodo.value === "hoje") inicio.setHours(0, 0, 0, 0);
      else inicio.setDate(agora.getDate() - Number(periodo.value));

      const filtrados = logs.filter(
        (l) =>
          l.data >= inicio &&
          (ator.value === "todos" || l.ator === ator.value) &&
          (evento.value === "todos" || l.tipo === evento.value)
      );

      renderizar(filtrados);
    } catch (error) {
      console.error("Erro ao carregar auditoria:", error);
    }
  }

  function diasAtras(dias, hora) {
    const d = new Date();
    d.setDate(d.getDate() - dias);
    const [h, m] = hora.split(":");
    d.setHours(h, m, 0, 0);
    return d;
  }
  periodo.addEventListener("change", aplicarFiltros);
  ator.addEventListener("change", aplicarFiltros);
  evento.addEventListener("change", aplicarFiltros);

  aplicarFiltros();
})();
(function telaConfiguracoesRh() {
  const card = document.getElementById("cardDadosGestor");
  if (!card) return;

  const NIVEIS = { rh: "Gestor RH", admin: "Administrador" };

  function mostrarErro(campoId, erroId, mensagem) {
    const campo = document.getElementById(campoId);
    const erro = document.getElementById(erroId);
    if (erro) erro.textContent = mensagem;
    if (campo) {
      if (mensagem) campo.classList.add("com-erro");
      else campo.classList.remove("com-erro");
    }
  }

  async function carregar() {
    try {
      const usuarioId = sessionStorage.getItem("usuarioId") || 1;

      const [resMe, resPrefs] = await Promise.all([
        fetch(`/api/me/${usuarioId}`),
        fetch(`/api/me/preferencias/${usuarioId}`)
      ]);

      if (!resMe.ok || !resPrefs.ok) throw new Error("Erro ao comunicar com o servidor.");

      const me = await resMe.json();
      const prefs = await resPrefs.json();

      document.getElementById("gestorNome").textContent = me.nome;
      document.getElementById("gestorEmail").textContent = me.email;
      document.getElementById("gestorNivel").textContent = NIVEIS[me.perfil] || me.perfil;

      document.querySelectorAll("[data-pref-rh]").forEach((el) => {
        const chave = el.dataset.prefRh;
        if (el.type === "checkbox") el.checked = !!prefs[chave];
        else el.value = prefs[chave];
      });
    } catch (erro) {
      console.error(erro);
    }
  }

  document.querySelectorAll("[data-pref-rh]").forEach((el) => {
    el.addEventListener("change", async () => {
      const usuarioId = sessionStorage.getItem("usuarioId") || 1;
      const valor = el.type === "checkbox" ? el.checked : el.value;
      const chave = el.dataset.prefRh;

      try {
        const resposta = await fetch(`/api/me/preferencias/${usuarioId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [chave]: valor })
        });

        if (!resposta.ok) throw new Error("Falha ao guardar preferência.");
        if (window.atualizarAlertasRh) window.atualizarAlertasRh();

        const msg = document.getElementById("msgPrefRh");
        if (msg) {
          msg.textContent = "Preferência guardada.";
          setTimeout(() => (msg.textContent = ""), 1800);
        }
      } catch (erro) {
        console.error(erro);
        if (el.type === "checkbox") el.checked = !el.checked;
      }
    });
  });

  const modal = document.getElementById("modalSenhaRh");
  const form = document.getElementById("formSenhaRh");
  const atual = document.getElementById("senhaAtualRh");
  const nova = document.getElementById("novaSenhaRh");
  const confirmar = document.getElementById("confirmarSenhaRh");
  const btnSalvar = document.getElementById("btnSalvarSenhaRh");

  const CAMPOS = [
    ["campoSenhaAtualRh", "erroSenhaAtualRh"],
    ["campoNovaSenhaRh", "erroNovaSenhaRh"],
    ["campoConfirmarSenhaRh", "erroConfirmarSenhaRh"],
  ];

  function abrir() {
    if (!form) return;
    form.reset();
    CAMPOS.forEach(([c, e]) => mostrarErro(c, e, ""));
    const erroGeral = document.getElementById("erroSenhaRhGeral");
    if (erroGeral) erroGeral.textContent = "";
    
    btnSalvar.disabled = false;
    btnSalvar.textContent = "Guardar";
    modal.querySelectorAll("input").forEach((i) => (i.type = "password"));
    modal.querySelectorAll(".btn-olho").forEach((b) => b.classList.remove("visivel"));
    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    atual.focus();
  }

  function fechar() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
  }

  const btnAbrir = document.getElementById("btnAbrirSenhaRh");
  if (btnAbrir) btnAbrir.addEventListener("click", abrir);
  
  const btnFechar = document.getElementById("btnFecharSenhaRh");
  if (btnFechar) btnFechar.addEventListener("click", fechar);
  
  const btnCancelar = document.getElementById("btnCancelarSenhaRh");
  if (btnCancelar) btnCancelar.addEventListener("click", fechar);
  
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) fechar();
    });
  }
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("oculto")) fechar();
  });

  if (modal) {
    modal.querySelectorAll(".btn-olho").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.alvo);
        const mostrar = input.type === "password";
        input.type = mostrar ? "text" : "password";
        btn.classList.toggle("visivel", mostrar);
        btn.setAttribute("aria-label", mostrar ? "Esconder senha" : "Mostrar senha");
      });
    });
  }

  function validar() {
    let ok = true;
    if (!atual.value) {
      mostrarErro("campoSenhaAtualRh", "erroSenhaAtualRh", "Informe a senha atual.");
      ok = false;
    } else mostrarErro("campoSenhaAtualRh", "erroSenhaAtualRh", "");

    if (nova.value.length < 8) {
      mostrarErro("campoNovaSenhaRh", "erroNovaSenhaRh", "A nova senha deve ter no mínimo 8 caracteres.");
      ok = false;
    } else if (nova.value === atual.value) {
      mostrarErro("campoNovaSenhaRh", "erroNovaSenhaRh", "A nova senha deve ser diferente da atual.");
      ok = false;
    } else mostrarErro("campoNovaSenhaRh", "erroNovaSenhaRh", "");

    if (!confirmar.value || confirmar.value !== nova.value) {
      mostrarErro("campoConfirmarSenhaRh", "erroConfirmarSenhaRh", "As senhas não conferem.");
      ok = false;
    } else mostrarErro("campoConfirmarSenhaRh", "erroConfirmarSenhaRh", "");
    
    return ok;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const erroGeral = document.getElementById("erroSenhaRhGeral");
      if (erroGeral) erroGeral.textContent = "";
      
      if (!validar()) return;

      btnSalvar.disabled = true;
      btnSalvar.textContent = "A guardar...";

      try {
        const usuarioId = sessionStorage.getItem("usuarioId") || 1;
        const resposta = await fetch(`/api/me/senha/${usuarioId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senhaAtual: atual.value, novaSenha: nova.value })
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
          if (resposta.status === 401) {
            mostrarErro("campoSenhaAtualRh", "erroSenhaAtualRh", dados.erro || "Senha atual incorreta.");
          } else {
            if (erroGeral) erroGeral.textContent = dados.erro || "Falha ao alterar senha.";
          }
          throw new Error("Erro de validação no servidor");
        }

        fechar();
        const msg = document.getElementById("msgSenhaRh");
        if (msg) {
          msg.textContent = "Senha alterada com sucesso.";
          setTimeout(() => (msg.textContent = ""), 2500);
        }
      } catch (erro) {
        console.error(erro);
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Guardar";
      }
    });
  }

  carregar();
})();

(function telaVisaoGlobal() {
  const cardModulos = document.getElementById("cardModulos");
  if (!cardModulos) return;

  const tabela = document.getElementById("tabelaAuditoriaRecente");
  const msg = document.getElementById("msgModulos");

  const BADGE_USUARIO = {
    "Gestor RH": "badge-info",
    Sistema: "badge-sistema",
    Administrador: "badge-admin",
  };

  function avisar(texto) {
    msg.textContent = texto;
    setTimeout(() => (msg.textContent = ""), 2500);
  }

  function aplicarModulos(modulos) {
    document.querySelectorAll("[data-modulo]").forEach((chk) => {
      chk.checked = !!modulos[chk.dataset.modulo];
      chk.closest(".toggle-linha").classList.toggle("desligado", !chk.checked);
    });
  }

  document.querySelectorAll("[data-modulo]").forEach((chk) => {
    chk.addEventListener("change", async () => {
      const nome = chk.dataset.nome;

      if (
        !chk.checked &&
        !confirm(
          `Desativar o módulo "${nome}"? O RH perderá acesso a essa função.`,
        )
      ) {
        chk.checked = true;
        return;
      }

      chk.disabled = true;
      const desejado = chk.checked;

      try {
        const resp = await fetch(`/api/modulos/${chk.dataset.modulo}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ativo: desejado }),
        });
        const dados = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(dados.erro || "Não foi possível salvar.");

        avisar(`Módulo "${nome}" ${desejado ? "ativado" : "desativado"}.`);
        carregarAuditoriaRecente();
      } catch (erro) {
        console.error(erro);
        chk.checked = !desejado; // volta ao estado real
        avisar(erro.message);
      } finally {
        chk.disabled = false;
        chk.closest(".toggle-linha").classList.toggle("desligado", !chk.checked);
      }
    });
  });

  function renderizarAuditoria(lista) {
    if (!lista.length) {
      tabela.innerHTML =
        '<tr><td colspan="3" class="tabela-vazia">Nenhuma movimentação registrada.</td></tr>';
      return;
    }
    tabela.innerHTML = lista
      .map(
        (a) => `
        <tr>
          <td><span class="badge ${BADGE_USUARIO[a.usuario] || "badge-info"}">${a.usuario}</span></td>
          <td>${a.acao}</td>
          <td class="texto-suave">${a.dataHora}</td>
        </tr>`,
      )
      .join("");
  }

  async function carregarAuditoriaRecente() {
    try {
      const resp = await fetch("/api/VisaoGlobal/auditoria-recente");
      if (!resp.ok) throw new Error("Falha ao carregar a auditoria recente.");
      renderizarAuditoria(await resp.json());
    } catch (erro) {
      console.error("Erro ao carregar auditoria recente:", erro);
      tabela.innerHTML =
        '<tr><td colspan="3" class="tabela-vazia">Não foi possível carregar a auditoria recente.</td></tr>';
    }
  }

  async function carregar() {
    try {
      const resp = await fetch("/api/modulos");
      if (!resp.ok) throw new Error("Falha ao carregar os módulos.");
      aplicarModulos(await resp.json());
    } catch (erro) {
      console.error("Erro ao carregar módulos:", erro);
    }
    await carregarAuditoriaRecente();
  }

  carregar();
})();

(function telaConfiguracoesGlobais() {
  const formSeguranca = document.getElementById("formSeguranca");
  if (!formSeguranca) return;

  const expiracao = document.getElementById("expiracaoSessao");
  const senhaForte = document.getElementById("senhaForte");
  const frequencia = document.getElementById("frequenciaBackup");

  function avisar(id, texto) {
    const el = document.getElementById(id);
    el.textContent = texto;
    setTimeout(() => (el.textContent = ""), 2500);
  }

  document.querySelectorAll("[data-config-modulo]").forEach((chk) => {
    chk.addEventListener("change", async () => {
      const nome = chk.dataset.nome;
      if (!chk.checked && !confirm(`Desativar "${nome}"?`)) {
        chk.checked = true;
        return;
      }

      const desejado = chk.checked;
      chk.disabled = true;
      try {
        const resp = await fetch(`/api/modulos/${chk.dataset.configModulo}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ativo: desejado }),
        });
        const dados = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(dados.erro || "Não foi possível salvar.");
        avisar("msgModulosGlobais", `"${nome}" ${desejado ? "ativado" : "desativado"}.`);
      } catch (erro) {
        console.error(erro);
        chk.checked = !desejado;
        avisar("msgModulosGlobais", erro.message);
      } finally {
        chk.disabled = false;
        chk.closest(".toggle-linha").classList.toggle("desligado", !chk.checked);
      }
    });
  });

  async function carregarModulos() {
    try {
      const resp = await fetch("/api/modulos");
      if (!resp.ok) return;
      const estado = await resp.json();
      document.querySelectorAll("[data-config-modulo]").forEach((chk) => {
        chk.checked = estado[chk.dataset.configModulo] !== false;
        chk.closest(".toggle-linha").classList.toggle("desligado", !chk.checked);
      });
    } catch (erro) {
      console.error("Erro ao carregar módulos:", erro);
    }
  }

  formSeguranca.addEventListener("submit", async (e) => {
    e.preventDefault();
    const minutos = Number(expiracao.value);

    if (!Number.isInteger(minutos) || minutos < 5 || minutos > 480) {
      mostrarErro("campoExpiracao", "erroExpiracao", "Informe um valor entre 5 e 480 minutos.");
      return;
    }
    mostrarErro("campoExpiracao", "erroExpiracao", "");

    await fetch("/api/config/seguranca", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiracaoSessao: minutos, senhaForte: senhaForte.checked })
    });

    avisar("msgSeguranca", "Políticas de segurança salvas.");
  });

  frequencia.addEventListener("change", async () => {
    await fetch("/api/config/backup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frequencia: frequencia.value })
    });
    avisar("msgBackup", `Frequência de backup alterada: ${frequencia.options[frequencia.selectedIndex].text}.`);
  });

  async function carregar() {
    const [segurancaRes, backupRes] = await Promise.all([
      fetch("/api/config/seguranca").then(r => r.json()),
      fetch("/api/config/backup").then(r => r.json())
    ]);

    expiracao.value = segurancaRes.expiracaoSessao;
    senhaForte.checked = segurancaRes.senhaForte;
    await carregarModulos();

    frequencia.value = backupRes.frequencia;
    document.getElementById("ultimoBackup").textContent = backupRes.ultimoBackup;
  }

  carregar();
})();

(function telaPermissoes() {
  const tabela = document.getElementById("tabelaPermissoes");
  if (!tabela) return;

  const PERFIS = ["funcionario", "rh", "admin"];
  const NOME_PERFIL = {
    funcionario: "Funcionário",
    rh: "Gestor RH",
    admin: "Administrador",
  };

  const btnSalvar = document.getElementById("btnSalvarPermissoes");
  const btnDescartar = document.getElementById("btnDescartarPermissoes");
  const avisoPendentes = document.getElementById("avisoPendentes");

  const ICONE_CADEADO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>';

  let funcoes = [];
  let original = {}; 
  let atual = {}; 

  function celula(funcao, perfil) {
    const c = funcao.perfis[perfil];
    switch (c.tipo) {
      case "fixo":
        return '<span class="perm perm-fixo" title="Acesso padrão (fixo)">✓</span>';
      case "na":
        return '<span class="perm perm-na" title="Não se aplica">—</span>';
      case "bloqueado":
        return `<span class="perm perm-bloqueado" title="Acesso bloqueado">${ICONE_CADEADO}</span>`;
      case "editavel":
        return `
          <label class="toggle" title="Configurável">
            <input type="checkbox" data-funcao="${funcao.id}" data-papel="${perfil}"
                   aria-label="${funcao.nome} — ${NOME_PERFIL[perfil]}" ${c.ativo ? "checked" : ""} />
            <span class="toggle-trilho"></span>
          </label>`;
      default:
        return "";
    }
  }

  function renderizar() {
    tabela.innerHTML = funcoes
      .map(
        (f) => `
        <tr>
          <td class="funcao"><strong>${f.nome}</strong><span>${f.descricao}</span></td>
          ${PERFIS.map((p) => `<td class="centro" data-celula="${f.id}|${p}">${celula(f, p)}</td>`).join("")}
        </tr>`,
      )
      .join("");
  }

  function alteracoes() {
    return Object.keys(atual)
      .filter((chave) => atual[chave] !== original[chave])
      .map((chave) => {
        const [funcao, perfil] = chave.split("|");
        return { funcao, perfil, ativo: atual[chave] };
      });
  }

  function atualizarEstado() {
    const lista = alteracoes();
    const qtd = lista.length;

    btnSalvar.disabled = qtd === 0;
    btnDescartar.disabled = qtd === 0;
    avisoPendentes.classList.toggle("oculto", qtd === 0);
    avisoPendentes.textContent = `${qtd} ${qtd === 1 ? "alteração não salva" : "alterações não salvas"}`;

    tabela.querySelectorAll("[data-celula]").forEach((td) => {
      const chave = td.dataset.celula;
      td.classList.toggle(
        "alterada",
        chave in atual && atual[chave] !== original[chave],
      );
    });
  }

  tabela.addEventListener("change", (e) => {
    const chk = e.target.closest("[data-funcao]");
    if (!chk) return;
    atual[`${chk.dataset.funcao}|${chk.dataset.papel}`] = chk.checked;
    atualizarEstado();
  });

  window.addEventListener("beforeunload", (e) => {
    if (alteracoes().length) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  btnDescartar.addEventListener("click", () => {
    atual = { ...original };
    tabela.querySelectorAll("[data-funcao]").forEach((chk) => {
      chk.checked = original[`${chk.dataset.funcao}|${chk.dataset.papel}`];
    });
    atualizarEstado();
  });

  btnSalvar.addEventListener("click", async () => {
  const lista = alteracoes();
  if (!lista.length) return;

  const retiradas = lista.filter((a) => !a.ativo);
  if (retiradas.length) {
    const nomes = retiradas
      .map(
        (a) =>
          `• ${funcoes.find((f) => f.id === a.funcao).nome} (${NOME_PERFIL[a.perfil]})`,
      )
      .join("\n");
    if (
      !confirm(`Você vai RETIRAR o acesso a:\n${nomes}\n\nDeseja continuar?`)
    )
      return;
  }

  btnSalvar.disabled = true;
  btnDescartar.disabled = true;
  document.getElementById("erroPermissoes").textContent = "";

  const resposta = await fetch("/api/permissoes", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lista)
  });

  if (!resposta.ok) {
    document.getElementById("erroPermissoes").textContent = "Não foi possível salvar as permissões.";
    atualizarEstado();
    return;
  }

  original = { ...atual };
  atualizarEstado();
  const msg = document.getElementById("msgPermissoes");
  msg.textContent = `${lista.length} ${lista.length === 1 ? "permissão atualizada" : "permissões atualizadas"} com sucesso.`;
  setTimeout(() => (msg.textContent = ""), 3000);
});

  async function carregar() {
  try {
    const resposta = await fetch("/api/permissoes");
    if (!resposta.ok) throw new Error("Erro ao carregar permissões do servidor.");
    
    funcoes = await resposta.json();

    original = {};
    funcoes.forEach((f) => {
      PERFIS.forEach((p) => {
        if (f.perfis[p] && f.perfis[p].tipo === "editavel") {
          original[`${f.id}|${p}`] = !!f.perfis[p].ativo;
        }
      });
    });

    atual = { ...original };

    renderizar();
    atualizarEstado();
  } catch (erro) {
    console.error("Falha ao carregar as permissões:", erro);
    const msgErro = document.getElementById("erroPermissoes");
    if (msgErro) msgErro.textContent = "Não foi possível carregar as permissões do servidor.";
  }
}

  carregar();
})();

(function telaGestaoUsuarios() {
  const card = document.getElementById("cardUsuarios");
  if (!card) return;

  const tabela = document.getElementById("tabelaUsuarios");
  const busca = document.getElementById("buscaUsuarios");
  const filtroPerfil = document.getElementById("filtroPerfilUsuarios");

  const modal = document.getElementById("modalUsuario");
  const form = document.getElementById("formUsuario");
  const campos = {
    nome: document.getElementById("usuarioNome"),
    email: document.getElementById("usuarioEmail"),
    departamento: document.getElementById("usuarioDepto"),
    perfil: document.getElementById("usuarioPerfil"),
    vinculo: document.getElementById("usuarioVinculo"),
  };
  const btnSalvar = document.getElementById("btnSalvarUsuario");
  const btnRemover = document.getElementById("btnRemoverUsuario");

  const PERFIS = {
    funcionario: { texto: "Funcionário", badge: "usr-perfil-func" },
    rh: { texto: "Gestor RH", badge: "usr-perfil-rh" },
    admin: { texto: "Administrador", badge: "usr-perfil-admin" },
  };
  // Os vínculos vêm do banco (Regras e Contratos); o valor do select é o ID do contrato.
  async function carregarContratos() {
    try {
      const resp = await fetch("/api/regras");
      if (!resp.ok) throw new Error("Falha ao carregar contratos.");
      const regras = await resp.json();
      campos.vinculo.innerHTML =
        '<option value="" disabled selected>Selecione</option>' +
        regras.map((r) => `<option value="${r.id}">${esc(r.nome)}</option>`).join("");
    } catch (erro) {
      console.error(erro);
    }
  }

  let usuarios = [];
  let editandoId = null;

  function esc(t) {
    return String(t).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function normalizar(t) {
    return String(t)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }
  function avisar(texto) {
    const msg = document.getElementById("msgUsuarios");
    msg.textContent = texto;
    setTimeout(() => (msg.textContent = ""), 2500);
  }

  function renderizar() {
    const termo = normalizar(busca.value.trim());
    const perfil = filtroPerfil.value;

    const lista = usuarios.filter((u) => {
      const bateBusca =
        !termo ||
        normalizar(`${u.nome} ${u.email} ${u.departamento}`).includes(termo);
      const batePerfil = perfil === "todos" || u.perfil === perfil;
      return bateBusca && batePerfil;
    });

    document.getElementById("contadorUsuarios").textContent = usuarios.length;

    if (!lista.length) {
      tabela.innerHTML =
        '<tr><td colspan="5" class="tabela-vazia">Nenhum colaborador encontrado.</td></tr>';
      return;
    }
    tabela.innerHTML = lista
      .map(
        (u) => `
        <tr>
          <td class="colaborador"><strong>${esc(u.nome)}</strong><span>${esc(u.departamento)}</span></td>
          <td>${esc(u.email)}</td>
          <td><span class="badge ${PERFIS[u.perfil]?.badge || 'usr-perfil-func'}">${PERFIS[u.perfil]?.texto || u.perfil}</span></td>
          <td>${esc(u.vinculoNome || u.vinculo)}</td>
          <td class="acoes"><button type="button" class="btn-acao" data-editar="${u.id}">Editar</button></td>
        </tr>`,
      )
      .join("");
  }

  busca.addEventListener("input", renderizar);
  filtroPerfil.addEventListener("change", renderizar);

  tabela.addEventListener("click", (e) => {
    const b = e.target.closest("[data-editar]");
    if (!b) return;
    abrir(usuarios.find((u) => String(u.id) === b.dataset.editar));
  });

  /* ---------- Modal ---------- */
  const ERROS = [
    ["campoUsuarioNome", "erroUsuarioNome"],
    ["campoUsuarioEmail", "erroUsuarioEmail"],
    ["campoUsuarioDepto", "erroUsuarioDepto"],
    ["campoUsuarioPerfil", "erroUsuarioPerfil"],
    ["campoUsuarioVinculo", "erroUsuarioVinculo"],
  ];

  function abrir(usuario) {
    form.reset();
    ERROS.forEach(([c, e]) => mostrarErro(c, e, ""));
    document.getElementById("erroUsuarioGeral").textContent = "";
    document.getElementById("sucessoUsuario").textContent = "";
    btnSalvar.disabled = false;
    btnSalvar.textContent = "Salvar";

    editandoId = usuario ? usuario.id : null;
    document.getElementById("tituloModalUsuario").textContent = usuario
      ? "Editar Colaborador"
      : "Adicionar Novo Colaborador";
    document
    btnRemover.classList.toggle("oculto", !usuario);

    if (usuario) {
      campos.nome.value = usuario.nome;
      campos.email.value = usuario.email;
      campos.departamento.value = usuario.departamento;
      campos.perfil.value = usuario.perfil;
      campos.vinculo.value = usuario.vinculo;
    }

    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    campos.nome.focus();
  }

  function fechar() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
    editandoId = null;
    if (location.hash === "#novo")
      history.replaceState(null, "", location.pathname);
  }

  document
    .getElementById("btnNovoUsuario")
    .addEventListener("click", () => abrir(null));
  document.getElementById("btnFecharUsuario").addEventListener("click", fechar);
  document
    .getElementById("btnCancelarUsuario")
    .addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("oculto")) fechar();
  });

  function validar() {
    let ok = true;
    const nome = campos.nome.value.trim();
    const email = campos.email.value.trim().toLowerCase();

    if (nome.length < 3) {
      mostrarErro("campoUsuarioNome", "erroUsuarioNome", "Informe o nome completo.");
      ok = false;
    } else mostrarErro("campoUsuarioNome", "erroUsuarioNome", "");

    if (!emailValido(email)) {
      mostrarErro("campoUsuarioEmail", "erroUsuarioEmail", "E-mail inválido.");
      ok = false;
    } else mostrarErro("campoUsuarioEmail", "erroUsuarioEmail", "");

    [
      ["departamento", "campoUsuarioDepto", "erroUsuarioDepto", "Selecione o departamento."],
      ["perfil", "campoUsuarioPerfil", "erroUsuarioPerfil", "Selecione o perfil de acesso."],
      ["vinculo", "campoUsuarioVinculo", "erroUsuarioVinculo", "Selecione o vínculo contratual."],
    ].forEach(([chave, c, e, texto]) => {
      if (!campos[chave].value) {
        mostrarErro(c, e, texto);
        ok = false;
      } else mostrarErro(c, e, "");
    });

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroUsuarioGeral").textContent = "";
    if (!validar()) return;

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    const dados = {
      nome: campos.nome.value.trim(),
      email: campos.email.value.trim(),
      departamento: campos.departamento.value,
      perfil: campos.perfil.value,
      vinculo: campos.vinculo.value,
    };

    try {
      const resposta = await fetch(
        editandoId ? `/api/admin/usuarios/${editandoId}` : "/api/admin/usuarios",
        {
          method: editandoId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        }
      );

      if (!resposta.ok) {
        const erroJson = await resposta.json().catch(() => ({}));
        document.getElementById("erroUsuarioGeral").textContent =
          resposta.status === 409 ? (erroJson.erro || "Este e-mail já está cadastrado.") : "Não foi possível salvar.";
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar";
        return;
      }

      document.getElementById("erroUsuarioGeral").textContent = "";

      await carregar();
      fechar();
      avisar(
        editandoId
          ? `Dados de ${dados.nome} atualizados.`
          : `${dados.nome} adicionado(a) com sucesso!`,
      );
    } catch (erro) {
      console.error(erro);
      btnSalvar.disabled = false;
      btnSalvar.textContent = "Salvar";
    }
  });

  btnRemover.addEventListener("click", async () => {
    const u = usuarios.find((x) => x.id === editandoId);
    if (!u || !confirm(`Remover ${u.nome} do sistema? O acesso será bloqueado.`)) return;

    try {
      const resposta = await fetch(`/api/admin/usuarios/${u.id}`, { method: "DELETE" });
      if (!resposta.ok) throw new Error("Erro ao remover usuário.");

      await carregar();
      fechar();
      avisar(`${u.nome} removido(a).`);
    } catch (erro) {
      console.error(erro);
      alert("Não foi possível remover o usuário.");
    }
  });

  async function carregar() {
    try {
      await carregarContratos();
      const resposta = await fetch("/api/admin/usuarios");
      if (!resposta.ok) throw new Error("Erro ao carregar usuários.");
      
      usuarios = await resposta.json();

      const setores = [
        "Financeiro",
        "Tecnologia",
        "Comercial",
        "Recursos Humanos",
      ];

      campos.departamento.innerHTML = '<option value="">Selecione</option>' + 
        setores.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
      
      renderizar();

      if (location.hash === "#novo") abrir(null);
    } catch (erro) {
      console.error("Erro ao carregar gestão de usuários:", erro);
    }
  }

  carregar();
})();

(function telaRegras() {
  const grade = document.getElementById("gradeRegras");
  if (!grade) return; 

  const modal = document.getElementById("modalRegra");
  const form = document.getElementById("formRegra");
  const titulo = document.getElementById("tituloRegra");
  const btnSalvar = document.getElementById("btnSalvarRegra");
  const msg = document.getElementById("msgRegras");
  const campos = {
    nome: document.getElementById("regraNome"),
    cargas: document.getElementById("regraCargas"),
    semanal: document.getElementById("regraSemanal"),
    tolerancia: document.getElementById("regraTolerancia"),
    bloqueio: document.getElementById("regraBloqueio"),
    banco: document.getElementById("regraBanco"),
  };

  const ICONE_REGRA =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>';

  let regras = [];
  let editandoId = null;

  function escapar(texto) {
    return String(texto).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function textoCargas(cargas) {
    return cargas.map((h) => h + "h").join(" ou ") + " diárias";
  }

  function avisar(texto) {
    msg.textContent = texto;
    setTimeout(() => (msg.textContent = ""), 2500);
  }

  function cartao(r) {
    const bloqueio = r.bloqueioHoraExtra;
    return `
      <article class="card card-regra${bloqueio ? " com-bloqueio" : ""}">
        <h2 class="card-titulo">${ICONE_REGRA} ${escapar(r.nome)}</h2>

        <dl class="regra-dados">
          <div><dt>Carga horária base</dt><dd>${textoCargas(r.cargasDiarias)} / ${r.limiteSemanal}h semanais</dd></div>
          <div><dt>Tolerância de ponto</dt><dd>${r.toleranciaMin} min</dd></div>
        </dl>

        ${
          bloqueio
            ? `
        <div class="aviso aviso-erro aviso-compacto">
          <span class="aviso-icone">!</span>
          <span>Bloqueio de Hora Extra Ativado</span>
        </div>`
            : ""
        }

        <div class="toggle-linha">
          <div>
            <strong>Permitir Banco de Horas Positivo</strong>
            ${bloqueio ? '<span class="texto-suave pequeno">Indisponível com bloqueio de hora extra.</span>' : ""}
          </div>
          <label class="toggle">
            <input type="checkbox" data-banco="${r.id}" ${r.bancoHoras ? "checked" : ""} ${bloqueio ? "disabled" : ""}
                   aria-label="Permitir banco de horas positivo em ${escapar(r.nome)}" />
            <span class="toggle-trilho"></span>
          </label>
        </div>

        <button type="button" class="btn btn-primario btn-editar-regra" data-editar="${r.id}">Editar Regra</button>
      </article>`;
  }

  function renderizar() {
    grade.innerHTML = regras.length
      ? regras.map(cartao).join("")
      : '<p class="texto-suave">Nenhuma regra cadastrada.</p>';
  }

  grade.addEventListener("change", async (e) => {
    const chk = e.target.closest("[data-banco]");
    if (!chk) return;
    const r = regras.find((x) => x.id === chk.dataset.banco);
    chk.disabled = true;

    try {
      const resposta = await fetch(`/api/regras/${r.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: r.nome,
          cargasDiarias: r.cargasDiarias,
          limiteSemanal: r.limiteSemanal,
          toleranciaMin: r.toleranciaMin,
          bancoHoras: chk.checked,
          bloqueioHoraExtra: r.bloqueioHoraExtra
        })
      });

      if (!resposta.ok) throw new Error("Falha ao salvar");

      r.bancoHoras = chk.checked;
      avisar(`Banco de horas ${chk.checked ? "permitido" : "desativado"} em "${r.nome}".`);
    } catch (erro) {
      chk.checked = !chk.checked;
      avisar("Não foi possível salvar.");
    } finally {
      chk.disabled = false;
    }
  });

  grade.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-editar]");
    if (btn) {
      const regraId = btn.dataset.editar;
      const regraEncontrada = regras.find((x) => String(x.id) === String(regraId));
      abrir(regraEncontrada);
    }
  });
  document
    .getElementById("btnNovaRegra")
    .addEventListener("click", () => abrir(null));

  function sincronizarBanco() {
    if (campos.bloqueio.checked) campos.banco.checked = false;
    campos.banco.disabled = campos.bloqueio.checked;
  }
  campos.bloqueio.addEventListener("change", sincronizarBanco);

  function limparErros() {
    [
      ["campoRegraNome", "erroRegraNome"],
      ["campoRegraCargas", "erroRegraCargas"],
      ["campoRegraSemanal", "erroRegraSemanal"],
      ["campoRegraTolerancia", "erroRegraTolerancia"],
    ].forEach(([c, e]) => mostrarErro(c, e, ""));
    document.getElementById("erroRegraGeral").textContent = "";
  }

  function abrir(r) {
    editandoId = r ? (r.id || r.ContratoId) : null; 
    form.reset();
    limparErros();
    titulo.textContent = r ? "Editar Regra" : "Nova Regra";

    if (r) {
      campos.nome.value = r.nome;
      campos.cargas.value = (r.cargasDiarias || [8]).join(", ");
      campos.semanal.value = r.limiteSemanal;
      campos.tolerancia.value = r.toleranciaMin;
      campos.bloqueio.checked = r.bloqueioHoraExtra;
      campos.banco.checked = r.bancoHoras;
    }
    sincronizarBanco();

    btnSalvar.disabled = false;
    btnSalvar.textContent = "Salvar Regra";
    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    campos.nome.focus();
  }

  function fechar() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
    editandoId = null;
  }

  document.getElementById("btnFecharRegra").addEventListener("click", fechar);
  document.getElementById("btnCancelarRegra").addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("oculto")) fechar();
  });

  function lerCargas() {
    return [
      ...new Set(
        campos.cargas.value
          .split(/[^\d]+/)
          .filter(Boolean)
          .map(Number),
      ),
    ];
  }

  function validar() {
    let ok = true;

    const nome = campos.nome.value.trim();
    const duplicado = regras.some(
      (r) => r.nome.toLowerCase() === nome.toLowerCase() && r.id !== editandoId,
    );
    if (nome.length < 3) {
      mostrarErro(
        "campoRegraNome",
        "erroRegraNome",
        "Informe o nome do regime.",
      );
      ok = false;
    } else if (duplicado) {
      mostrarErro(
        "campoRegraNome",
        "erroRegraNome",
        "Já existe uma regra com esse nome.",
      );
      ok = false;
    } else mostrarErro("campoRegraNome", "erroRegraNome", "");

    const cargas = lerCargas();
    if (!cargas.length || cargas.some((h) => h < 1 || h > 12)) {
      mostrarErro(
        "campoRegraCargas",
        "erroRegraCargas",
        "Use de 1 a 12h. Para mais de uma opção: 6, 4",
      );
      ok = false;
    } else mostrarErro("campoRegraCargas", "erroRegraCargas", "");

    const semanal = Number(campos.semanal.value);
    if (!campos.semanal.value || semanal < 1 || semanal > 60) {
      mostrarErro(
        "campoRegraSemanal",
        "erroRegraSemanal",
        "Informe entre 1 e 60 horas.",
      );
      ok = false;
    } else if (cargas.length && semanal < Math.max(...cargas)) {
      mostrarErro(
        "campoRegraSemanal",
        "erroRegraSemanal",
        "Não pode ser menor que a carga diária.",
      );
      ok = false;
    } else mostrarErro("campoRegraSemanal", "erroRegraSemanal", "");

    const tol = campos.tolerancia.value;
    if (tol === "" || Number(tol) < 0 || Number(tol) > 60) {
      mostrarErro(
        "campoRegraTolerancia",
        "erroRegraTolerancia",
        "Informe entre 0 e 60 minutos.",
      );
      ok = false;
    } else mostrarErro("campoRegraTolerancia", "erroRegraTolerancia", "");

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroRegraGeral").textContent = "";
    if (!validar()) return;

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    const dados = {
      nome: campos.nome.value.trim(),
      cargasDiarias: lerCargas(),
      limiteSemanal: Number(campos.semanal.value),
      toleranciaMin: Number(campos.tolerancia.value),
      bloqueioHoraExtra: campos.bloqueio.checked,
      bancoHoras: campos.banco.checked,
    };

    try {
      const criando = !editandoId;
      const resposta = await fetch(criando ? "/api/regras" : `/api/regras/${editandoId}`, {
        method: criando ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      if (!resposta.ok) {
        const erroJson = await resposta.json().catch(() => ({}));
        throw new Error(erroJson.erro || "Erro ao salvar regra.");
      }

      await carregar();
      fechar();
      avisar(criando
        ? `Regra "${dados.nome}" criada com sucesso! Já está disponível no cadastro de colaboradores.`
        : `Regra "${dados.nome}" atualizada com sucesso!`);
    } catch (erro) {
      console.error(erro);
      document.getElementById("erroRegraGeral").textContent = erro.message || "Não foi possível salvar a regra.";
    } finally {
      btnSalvar.disabled = false;
      btnSalvar.textContent = "Salvar Regra";
    }
  });

  async function carregar() {
    try {
      const resposta = await fetch("/api/regras");
      if (!resposta.ok) throw new Error("Erro ao carregar regras.");
      regras = await resposta.json();
      renderizar();
    } catch (erro) {
      console.error("Erro ao carregar regras do banco:", erro);
    }
  }

  carregar();
})();

(function telaCalendario() {
  const grade = document.getElementById("gradeCalendario");
  if (!grade) return;

  const modal = document.getElementById("modalFeriado");
  const form = document.getElementById("formFeriado");
  const campoData = document.getElementById("feriadoData");
  const campoDescricao = document.getElementById("feriadoDescricao");
  const campoTipo = document.getElementById("feriadoTipo");
  const btnSalvar = document.getElementById("btnSalvarFeriado");
  const btnExcluir = document.getElementById("btnExcluirFeriado");
  const tabela = document.getElementById("tabelaFeriados");

  const TIPOS = {
    nacional: { texto: "Feriado Nacional", badge: "badge-info" },
    estadual: { texto: "Feriado Estadual", badge: "badge-admin" },
    municipal: { texto: "Feriado Municipal", badge: "badge-normal" },
    facultativo: { texto: "Ponto Facultativo", badge: "badge-atencao" },
    dispensa: { texto: "Dispensa / Recesso", badge: "badge-sistema" },
  };

  let feriados = [];
  let editandoId = null;
  const hoje = new Date();
  let mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const pad = (n) => String(n).padStart(2, "0");
  const paraISO = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const deISO = (s) => {
    const [a, m, d] = s.split("-").map(Number);
    return new Date(a, m - 1, d);
  };
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  function formatarData(iso) {
    const d = deISO(iso);
    const mes = maiuscula(d.toLocaleDateString("pt-BR", { month: "long" }));
    const semana = d
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .replace(".", "");
    return `<strong>${pad(d.getDate())} de ${mes}</strong><span class="texto-suave pequeno"> · ${semana}</span>`;
  }

  function avisar(texto) {
    const msg = document.getElementById("msgFeriados");
    msg.textContent = texto;
    setTimeout(() => (msg.textContent = ""), 2500);
  }

  function renderizarCalendario() {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    document.getElementById("tituloMes").textContent = maiuscula(
      mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    );

    const primeiroDia = new Date(ano, mes, 1).getDay(); 
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const hojeISO = paraISO(hoje);

    let html = "";
    for (let i = 0; i < primeiroDia; i++)
      html += '<span class="dia vazio"></span>';

    for (let d = 1; d <= diasNoMes; d++) {
      const dataISO = `${ano}-${pad(mes + 1)}-${pad(d)}`;
      const f = feriados.find((x) => x.data === dataISO);
      const diaSemana = new Date(ano, mes, d).getDay();
      const classes = ["dia"];
      if (f) classes.push("feriado", "tipo-" + f.tipo);
      if (diaSemana === 0 || diaSemana === 6) classes.push("fim-semana");
      if (dataISO === hojeISO) classes.push("hoje");

      const titulo = f
        ? `${f.descricao} (${TIPOS[f.tipo].texto})`
        : "Clique para cadastrar";
      html += `<button type="button" class="${classes.join(" ")}" data-data="${dataISO}" title="${titulo}">${d}</button>`;
    }
    grade.innerHTML = html;
  }

  function renderizarTabela() {
    const ano = mesAtual.getFullYear();
    document.getElementById("anoFeriados").textContent = ano;

    const lista = feriados
      .filter((f) => f.data.startsWith(ano + "-"))
      .sort((a, b) => a.data.localeCompare(b.data));

    if (!lista.length) {
      tabela.innerHTML =
        '<tr><td colspan="4" class="tabela-vazia">Nenhum feriado registrado neste ano.</td></tr>';
      return;
    }
    tabela.innerHTML = lista
      .map(
        (f) => `
        <tr>
          <td class="data-feriado">${formatarData(f.data)}</td>
          <td>${f.descricao}</td>
          <td><span class="badge ${TIPOS[f.tipo].badge}">${TIPOS[f.tipo].texto}</span></td>
          <td class="acoes"><button class="btn-acao" data-editar="${f.id}">Editar</button></td>
        </tr>`,
      )
      .join("");
  }

  function renderizar() {
    renderizarCalendario();
    renderizarTabela();
  }

  document.getElementById("btnMesAnterior").addEventListener("click", () => {
    mesAtual.setMonth(mesAtual.getMonth() - 1);
    renderizar();
  });
  document.getElementById("btnMesSeguinte").addEventListener("click", () => {
    mesAtual.setMonth(mesAtual.getMonth() + 1);
    renderizar();
  });
  document.getElementById("btnMesHoje").addEventListener("click", () => {
    mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    renderizar();
  });

  function limparErros() {
    [
      ["campoFeriadoData", "erroFeriadoData"],
      ["campoFeriadoTipo", "erroFeriadoTipo"],
      ["campoFeriadoDescricao", "erroFeriadoDescricao"],
    ].forEach(([c, e]) => mostrarErro(c, e, ""));
    document.getElementById("erroFeriadoGeral").textContent = "";
  }

  function abrirModal(feriado, dataInicial) {
    form.reset();
    limparErros();
    editandoId = feriado ? feriado.id : null;

    document.getElementById("tituloFeriado").textContent = feriado
      ? "Editar Feriado"
      : "Cadastrar Feriado";
    btnExcluir.classList.toggle("oculto", !feriado);
    campoData.value = feriado ? feriado.data : dataInicial || "";
    campoDescricao.value = feriado ? feriado.descricao : "";
    campoTipo.value = feriado ? feriado.tipo : "";
    btnSalvar.disabled = false;
    btnSalvar.textContent = "Salvar";

    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    (campoData.value ? campoDescricao : campoData).focus();
  }

  function fecharModal() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
    editandoId = null;
    if (location.hash)
      history.replaceState(null, "", location.pathname + location.search);
  }

  document
    .getElementById("btnCadastrarFeriado")
    .addEventListener("click", () => abrirModal(null));
  document
    .getElementById("btnFecharFeriado")
    .addEventListener("click", fecharModal);
  document
    .getElementById("btnCancelarFeriado")
    .addEventListener("click", fecharModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("oculto"))
      fecharModal();
  });

  grade.addEventListener("click", (e) => {
    const dia = e.target.closest(".dia[data-data]");
    if (!dia) return;
    const f = feriados.find((x) => x.data === dia.dataset.data);
    f ? abrirModal(f) : abrirModal(null, dia.dataset.data);
  });

  tabela.addEventListener("click", (e) => {
    const b = e.target.closest("[data-editar]");
    if (!b) return;
    abrirModal(feriados.find((x) => String(x.id) === b.dataset.editar));
  });

  function validar() {
    let ok = true;

    if (!campoData.value) {
      mostrarErro("campoFeriadoData", "erroFeriadoData", "Informe a data.");
      ok = false;
    } else if (
      feriados.some((x) => x.data === campoData.value && x.id !== editandoId)
    ) {
      mostrarErro(
        "campoFeriadoData",
        "erroFeriadoData",
        "Já existe um feriado nesta data.",
      );
      ok = false;
    } else mostrarErro("campoFeriadoData", "erroFeriadoData", "");

    if (!campoTipo.value) {
      mostrarErro("campoFeriadoTipo", "erroFeriadoTipo", "Selecione o tipo.");
      ok = false;
    } else mostrarErro("campoFeriadoTipo", "erroFeriadoTipo", "");

    if (campoDescricao.value.trim().length < 3) {
      mostrarErro(
        "campoFeriadoDescricao",
        "erroFeriadoDescricao",
        "Informe a descrição.",
      );
      ok = false;
    } else mostrarErro("campoFeriadoDescricao", "erroFeriadoDescricao", "");

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validar()) return;

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";
    const dados = {
      data: campoData.value,
      descricao: campoDescricao.value.trim(),
      tipo: campoTipo.value,
    };
    const eraEdicao = !!editandoId;

    try {
      const url = eraEdicao ? `/api/feriados/${editandoId}` : "/api/feriados";
      const resposta = await fetch(url, {
        method: eraEdicao ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      if (!resposta.ok) {
        const erroJson = await resposta.json().catch(() => ({}));
        document.getElementById("erroFeriadoGeral").textContent =
          resposta.status === 409 ? "Já existe um feriado nesta data." : (erroJson.erro || "Não foi possível salvar.");
        btnSalvar.disabled = false; 
        btnSalvar.textContent = "Salvar";
        return;
      }

      await carregar();
      fecharModal();
      avisar(`Feriado "${dados.descricao}" ${eraEdicao ? "atualizado" : "cadastrado"}.`);
    } catch (erro) {
      console.error(erro);
      btnSalvar.disabled = false;
      btnSalvar.textContent = "Salvar";
    }
  });
  btnExcluir.addEventListener("click", async () => {
    const f = feriados.find((x) => x.id === editandoId);
    if (!f || !confirm(`Excluir o feriado "${f.descricao}"? O dia volta a contar como dia útil.`)) return;

    try {
      const resposta = await fetch(`/api/feriados/${f.id}`, { method: "DELETE" });
      if (!resposta.ok) throw new Error("Erro ao excluir.");

      await carregar();
      fecharModal();
      avisar(`Feriado "${f.descricao}" excluído.`);
    } catch (erro) {
      console.error(erro);
      alert("Não foi possível excluir o feriado.");
    }
  });
  async function carregar() {
    try {
      const ano = mesAtual.getFullYear();
      const resposta = await fetch(`/api/feriados?ano=${ano}`);
      if (!resposta.ok) throw new Error("Erro ao carregar feriados.");
      
      feriados = await resposta.json();
      renderizar();

      if (location.hash === "#novo") abrirModal(null);
    } catch (erro) {
      console.error("Erro ao carregar calendário:", erro);
    }
  }

  carregar();
})();
(function telaLogs() {
  const tabela = document.getElementById("tabelaLogs");
  if (!tabela) return;

  const filtroData = document.getElementById("filtroLogData");
  const filtroUsuario = document.getElementById("filtroLogUsuario");
  const filtroNivel = document.getElementById("filtroLogNivel");

  const NIVEIS = {
    baixa: { texto: "Baixa", classe: "nivel-baixa", icone: "i" },
    media: { texto: "Média", classe: "nivel-media", icone: "!" },
    alta: { texto: "Alta", classe: "nivel-alta", icone: "!" },
  };
  const USUARIOS = {
    admin: { texto: "Administrador", badge: "badge-admin" },
    rh: { texto: "Gestor RH", badge: "badge-info" },
    nao_identificado: { texto: "Não identificado", badge: "badge-sistema" },
  };

  // O banco guarda o NOME de quem fez a ação (ex.: "Administrador Master"); classifica para o filtro/etiqueta.
  function infoUsuario(nome) {
    const original = String(nome ?? "").trim();
    const lc = original.toLowerCase();
    let chave = "outro";
    if (lc === "não identificado" || lc === "nao identificado" || lc === "desconhecido" || lc === "sistema") chave = "nao_identificado";
    else if (lc === "rh" || lc.includes("gestor rh") || /(^|s)rh(s|$)/.test(lc)) chave = "rh";
    else if (lc.includes("admin")) chave = "admin";

    if (chave === "outro") return { chave, texto: original || "—", badge: "badge-info" };
    return { chave, ...USUARIOS[chave] };
  }

  function escapar(texto) {
    return String(texto ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function formatarData(iso) {
    return new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  let logs = [];

  function filtrados() {
    return logs.filter(
      (l) =>
        (!filtroData.value || l.dataHora.slice(0, 10) === filtroData.value) &&
        (filtroUsuario.value === "todos" ||
          infoUsuario(l.usuario).chave === filtroUsuario.value) &&
        (filtroNivel.value === "todos" || l.nivel === filtroNivel.value),
    );
  }

  function renderizar() {
    const lista = filtrados();
    document.getElementById("contadorLogs").textContent =
      `${lista.length} de ${logs.length} registros`;

    if (!lista.length) {
      tabela.innerHTML =
        '<tr><td colspan="5" class="tabela-vazia">Nenhum registro encontrado para os filtros.</td></tr>';
      return;
    }

    tabela.innerHTML = lista
      .map((l) => {
        const n = NIVEIS[l.nivel] || NIVEIS.baixa;
        const u = infoUsuario(l.usuario);
        return `
          <tr class="${l.nivel === "alta" ? "linha-critica" : ""}">
            <td class="log-data">${formatarData(l.dataHora)}</td>
            <td>
              <div class="log-usuario">
                <span class="nivel-icone ${n.classe}" title="Criticidade ${n.texto}">${n.icone}</span>
                <span class="badge ${u.badge}">${escapar(u.texto)}</span>
              </div>
            </td>
            <td><strong>${escapar(l.acao)}</strong></td>
            <td>${escapar(l.modulo)}</td>
            <td><code class="detalhe-tecnico">${escapar(l.detalhes)}</code></td>
          </tr>`;
      })
      .join("");
  }

  [filtroData, filtroUsuario, filtroNivel].forEach((f) =>
    f.addEventListener("change", () => {
      renderizar();
    }),
  );

  document
    .getElementById("btnLimparFiltrosLogs")
    .addEventListener("click", () => {
      filtroData.value = "";
      filtroUsuario.value = "todos";
      filtroNivel.value = "todos";
      renderizar();
    });

  document.getElementById("btnExportarLogs").addEventListener("click", () => {
    const params = new URLSearchParams({
      data: filtroData.value, 
      usuario: filtroUsuario.value, 
      nivel: filtroNivel.value
    });
    window.location.href = `/api/logs-sistema/exportar?${params}`;
  });

  async function carregar() {
    try {
      const params = new URLSearchParams({
        data: filtroData.value,
        usuario: filtroUsuario.value,
        nivel: filtroNivel.value
      });

      const resposta = await fetch(`/api/logs-sistema?${params}`);
      if (!resposta.ok) throw new Error("Erro ao carregar logs.");
      
      logs = await resposta.json();
      renderizar();
    } catch (erro) {
      console.error("Erro ao carregar logs do sistema:", erro);
    }
  }

  carregar();
})();

(function modalRegrasContrato() {
  const modal = document.getElementById("modalRegras");
  const btnAbrir = document.getElementById("btnSaibaMaisRegras");
  if (!modal || !btnAbrir) return; 

  function horas(lista) {
    return lista.map((h) => h + "h").join(" ou ");
  }

  function renderizar(r) {
    document.getElementById("regrasNomeContrato").textContent = r.nome;

    const itens = [
      { rotulo: "Sua carga diária", valor: r.cargaDoUsuario + "h" },
      { rotulo: "Limite semanal", valor: r.limiteSemanal + "h" },
      { rotulo: "Tolerância de ponto", valor: r.toleranciaMin + " min" },
      {
        rotulo: "Cargas permitidas no contrato",
        valor: horas(r.cargasDiarias),
      },
      {
        rotulo: "Hora extra",
        valor: r.bloqueioHoraExtra ? "Não permitida" : "Permitida",
        bloqueada: r.bloqueioHoraExtra,
      },
      {
        rotulo: "Banco de horas",
        valor: r.bancoHoras ? "Disponível" : "Não se aplica",
      },
    ];

    document.getElementById("listaRegras").innerHTML = itens
      .map(
        (i) => `
        <li class="${i.bloqueada ? "regra-bloqueada" : ""}">
          <span>${i.rotulo}</span><strong>${i.valor}</strong>
        </li>`,
      )
      .join("");

    document
      .getElementById("regrasNotaBloqueio")
      .classList.toggle("oculto", !r.bloqueioHoraExtra);
  }

  async function abrir() {
    const usuarioId = sessionStorage.getItem("usuarioId") || 1;
    let c;
    try {
      const status = await chamarApi(`/Ponto/status-atual/${usuarioId}`, "GET");
      c = status.contrato;
    } catch (e) {
      console.error("Erro ao carregar regras do contrato:", e);
    }
    if (!c) {
      alert("Não foi possível carregar as regras do seu contrato.");
      return;
    }

    const cargaHoras = Math.round((c.cargaDiariaMinutos / 60) * 10) / 10;
    renderizar({
      nome: c.nome,
      cargasDiarias: [cargaHoras],
      cargaDoUsuario: cargaHoras,
      limiteSemanal: Math.round((c.limiteSemanalMinutos / 60) * 10) / 10,
      toleranciaMin: c.toleranciaMinutos,
      bloqueioHoraExtra: !c.permiteHoraExtra,
      bancoHoras: c.permiteBancoHoras,
    });
    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    document.getElementById("btnEntendiRegras").focus();
  }

  function fechar() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
  }

  btnAbrir.addEventListener("click", abrir);
  document.getElementById("btnFecharRegras").addEventListener("click", fechar);
  document.getElementById("btnEntendiRegras").addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("oculto")) fechar();
  });

  window.abrirRegrasContrato = abrir;
})();

(function centralAjuda() {
  const botao = document.querySelector(".menu-ajuda");
  if (!botao) return; 

  const PERGUNTAS = [
    {
      pergunta: "Como registro meu ponto?",
      resposta:
        "Clique em <strong>Registrar Ponto</strong> no Início ou na tela Ponto. O sistema identifica sozinho se é entrada, saída para almoço, retorno ou saída.",
      link: "ponto.html",
      textoLink: "Ir para a tela de Ponto ›",
    },
    {
      pergunta: "Esqueci de bater o ponto. O que faço?",
      resposta:
        "Você não consegue corrigir sozinho. O dia fica como <strong>pendente</strong> e o RH faz o ajuste. Avise o RH informando o dia e o horário correto.",
    },
    {
      pergunta: "O que significam as cores da jornada?",
      resposta:
        "<strong>Verde:</strong> dentro do limite. <strong>Amarelo:</strong> limite próximo, planeje sua saída. <strong>Vermelho:</strong> limite crítico, registre sua saída o quanto antes.",
    },
    {
      pergunta: "Por que não consigo registrar o ponto?",
      resposta:
        "Se você atingiu o limite diário do seu contrato (ex.: 6h no estágio), o sistema bloqueia novas batidas. A mensagem com o motivo aparece na tela de Ponto.",
    },
    {
      pergunta: "Como envio um atestado médico?",
      resposta:
        "Clique em <strong>Atestados</strong> no menu, informe as datas e o motivo e anexe o arquivo em PDF, JPG ou PNG de até 5 MB. O RH analisa e você é avisado.",
      link: "inicio.html#atestado",
      textoLink: "Enviar atestado ›",
    },
    {
      pergunta: "Como gero meu espelho de ponto?",
      resposta:
        "Na tela <strong>Relatórios</strong>, escolha o mês e clique em <strong>Gerar Relatório PDF</strong>. Os espelhos gerados ficam disponíveis para baixar depois.",
      link: "relatorios.html",
      textoLink: "Ir para Relatórios ›",
    },
    {
      pergunta: "Como altero minha senha?",
      resposta:
        "Em <strong>Configurações</strong>, no painel Segurança e Acesso, informe a senha atual e a nova senha.",
      link: "configuracoes.html",
      textoLink: "Ir para Configurações ›",
    },
    {
      pergunta: "Meus dados estão errados. Como corrijo?",
      resposta:
        "Nome, e-mail e tipo de contrato são cadastrados pelo RH. Para corrigir, procure o RH.",
    },
  ];

  const CONTATO_RH = "rh@empresa.com"; 

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal-fundo oculto" id="modalAjuda" role="dialog" aria-modal="true" aria-labelledby="tituloAjuda">
      <div class="modal modal-ajuda">
        <div class="modal-topo">
          <span class="modal-icone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/></svg>
          </span>
          <h2 id="tituloAjuda">Central de Ajuda</h2>
          <button type="button" class="modal-fechar" id="btnFecharAjuda" aria-label="Fechar">✕</button>
        </div>
        <p class="texto-suave pequeno">Tire suas dúvidas sobre o registro de presença.</p>

        <div class="ajuda-busca">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="search" id="buscaAjuda" placeholder="Buscar dúvida..." aria-label="Buscar dúvida" />
        </div>

        <div class="ajuda-lista" id="listaAjuda"></div>

        <div class="ajuda-contato">
          <div>
            <strong>Não encontrou o que procurava?</strong>
            <span>Fale com o RH: ${CONTATO_RH}</span>
          </div>
        </div>
      </div>
    </div>`,
  );

  const modal = document.getElementById("modalAjuda");
  const lista = document.getElementById("listaAjuda");
  const busca = document.getElementById("buscaAjuda");

  function normalizar(t) {
    return t
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/<[^>]+>/g, "")
      .toLowerCase();
  }

  function renderizar() {
    const termo = normalizar(busca.value.trim());
    const itens = PERGUNTAS.filter(
      (p) =>
        !termo || normalizar(p.pergunta + " " + p.resposta).includes(termo),
    );

    lista.innerHTML = itens.length
      ? itens
          .map(
            (p) => `
          <details class="ajuda-item">
            <summary>${p.pergunta}</summary>
            <div class="ajuda-resposta">
              ${p.resposta}
              ${p.link ? `<br><button type="button" class="link-acao" data-ajuda-ir="${p.link}">${p.textoLink}</button>` : ""}
            </div>
          </details>`,
          )
          .join("")
      : '<p class="ajuda-vazio">Nenhuma dúvida encontrada. Fale com o RH abaixo.</p>';
  }

  busca.addEventListener("input", renderizar);

  lista.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ajuda-ir]");
    if (!b) return;
    fechar();
    const destino = b.dataset.ajudaIr;

    if (
      destino.startsWith("inicio.html#") &&
      location.pathname.endsWith("inicio.html")
    ) {
      location.hash = destino.split("#")[1];
    } else {
      window.location.href = destino;
    }
  });

  function abrir() {
    busca.value = "";
    renderizar();
    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    busca.focus();
  }

  function fechar() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
  }

  botao.setAttribute("type", "button");
  botao.addEventListener("click", abrir);
  document.getElementById("btnFecharAjuda").addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("oculto")) fechar();
  });
})();

(function preferenciasFuncionario() {
  const campos = document.querySelectorAll("[data-pref-func]");
  if (!campos.length) return;

  const usuarioId = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || 1;

  function atualizarVisual(chk) {
    const linha = chk.closest(".toggle-linha");
    if (linha) linha.classList.toggle("desligado", !chk.checked);
  }

  async function carregar() {
    try {
      const resp = await fetch(`/api/me/preferencias/${usuarioId}`);
      if (!resp.ok) throw new Error("Falha ao carregar preferências.");
      const prefs = await resp.json();
      campos.forEach((chk) => {
        const chave = chk.dataset.prefFunc;
        if (chave in prefs) chk.checked = !!prefs[chave];
        atualizarVisual(chk);
      });
    } catch (erro) {
      console.error(erro);
    }
  }

  campos.forEach((chk) => {
    chk.addEventListener("change", async () => {
      atualizarVisual(chk);
      try {
        const resp = await fetch(`/api/me/preferencias/${usuarioId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [chk.dataset.prefFunc]: chk.checked }),
        });
        if (!resp.ok) throw new Error("Falha ao guardar preferência.");
      } catch (erro) {
        console.error(erro);
        chk.checked = !chk.checked;
        atualizarVisual(chk);
        alert("Não foi possível guardar a preferência. Tente novamente.");
      }
    });
  });

  carregar();
})();

(function avisosDoRhNaInicio() {
  if (!document.getElementById("painelJornada")) return;

  const usuarioId = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId");
  if (!usuarioId) return;

  (async function () {
    try {
      const resp = await fetch(`/api/notificacoes/pendentes/${usuarioId}`);
      if (!resp.ok) return;
      const avisos = await resp.json();
      for (const a of avisos) alert(a.mensagem);
    } catch (erro) {
      console.error("Erro ao buscar avisos:", erro);
    }
  })();
})();

(function alertasRhAdmin() {
  const itemPendencias = document.querySelector('.menu-item[data-ir="pendencias.html"]');
  const conteudo = document.querySelector("main.conteudo");
  if (!itemPendencias || !conteudo) return; // só nas telas de RH/Admin

  // As telas de funcionário também têm o item "Pendências" no HTML (apenas escondido),
  // então o perfil precisa ser checado: só RH e Admin recebem avisos de estagiário.
  const perfilAtual = (localStorage.getItem("perfil") || "").toLowerCase();
  if (perfilAtual !== "rh" && perfilAtual !== "admin") return;

  const usuarioId = sessionStorage.getItem("usuarioId") || localStorage.getItem("usuarioId") || 1;

  let bolinha = itemPendencias.querySelector(".badge-menu");
  if (!bolinha) {
    bolinha = document.createElement("span");
    bolinha.className = "badge-menu oculto";
    bolinha.setAttribute("aria-label", "Pendências");
    itemPendencias.appendChild(bolinha);
  }

  let faixa = document.getElementById("faixaAlertaEstagiarios");
  if (!faixa) {
    faixa = document.createElement("div");
    faixa.id = "faixaAlertaEstagiarios";
    faixa.className = "faixa-alerta oculto";
    faixa.setAttribute("role", "alert");
    conteudo.insertBefore(faixa, conteudo.firstChild);
  }

  const ROTULO = {
    ultrapassou: "ultrapassou o limite",
    atingiu: "atingiu o limite",
    proximo: "está perto do limite",
  };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  async function obterJson(url) {
    try {
      const r = await fetch(url);
      return r.ok ? await r.json() : null;
    } catch {
      return null;
    }
  }

  async function atualizar() {
    const prefs = (await obterJson(`/api/me/preferencias/${usuarioId}`)) || {};
    const avisarEstagiario = prefs.alertaEstagiario !== false;
    const avisarAtestado = prefs.alertaAtestado !== false;

    // Bolinha vermelha com o número de pendências (atestados só se a preferência estiver ligada).
    const pendencias = (await obterJson("/api/Pendencias")) || [];
    const total = pendencias.filter((p) => {
      if (p.tipo === "atestado") return avisarAtestado;
      if (p.tipo === "excesso_jornada") return avisarEstagiario;
      return true;
    }).length;
    bolinha.textContent = total > 99 ? "99+" : String(total);
    bolinha.classList.toggle("oculto", total === 0);

    // Faixa no topo: estagiários perto/no/além do limite hoje.
    let lista = [];
    if (avisarEstagiario) lista = (await obterJson("/api/alertas/estagiarios")) || [];

    if (!lista.length) {
      faixa.classList.add("oculto");
      faixa.innerHTML = "";
      return;
    }

    const critico = lista.some((a) => a.situacao !== "proximo");
    faixa.classList.toggle("atencao", !critico);
    faixa.classList.remove("oculto");
    faixa.innerHTML = `
      <span aria-hidden="true">⚠️</span>
      <div>
        <strong>${lista.length === 1 ? "1 estagiário" : lista.length + " estagiários"} no limite da jornada hoje</strong>
        <ul>${lista.map((a) => `<li>${esc(a.nome)} ${ROTULO[a.situacao]}: ${esc(a.trabalhado)} de ${esc(a.limite)} (${a.percentual}%)${a.encerrado ? " — jornada encerrada" : ""}</li>`).join("")}</ul>
      </div>
      <button type="button" class="faixa-link" id="faixaIrPendencias">Ver pendências</button>`;
    const ir = document.getElementById("faixaIrPendencias");
    if (ir) ir.addEventListener("click", () => itemPendencias.click());
  }

  window.atualizarAlertasRh = atualizar;
  atualizar();
  setInterval(atualizar, 60000);
})();

(function expiracaoDeSessao() {
  const pagina = location.pathname.toLowerCase();
  if (pagina.endsWith("/login.html") || pagina.endsWith("/cadastro.html") || pagina === "/" ) return;

  const usuarioId = sessionStorage.getItem("usuarioId");
  if (!usuarioId) return; // ninguém logado nesta aba

  const CHAVE = "timetrack_ultima_atividade";
  let limiteMs = 30 * 60 * 1000;

  function agora() { return Date.now(); }
  function registrar() {
    try { localStorage.setItem(CHAVE, String(agora())); } catch {}
  }
  function ultima() {
    try { return Number(localStorage.getItem(CHAVE)) || agora(); } catch { return agora(); }
  }

  function encerrar() {
    try {
      sessionStorage.clear();
      localStorage.removeItem("token");
      localStorage.removeItem("perfil");
      localStorage.removeItem("usuario");
      localStorage.removeItem(CHAVE);
    } catch {}
    alert("Sua sessão expirou por inatividade. Faça login novamente.");
    window.location.href = "/login.html";
  }

  let ultimoRegistro = 0;
  function atividade() {
    const t = agora();
    if (t - ultimoRegistro > 5000) { // evita gravar a cada movimento do mouse
      ultimoRegistro = t;
      registrar();
    }
  }
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((ev) =>
    window.addEventListener(ev, atividade, { passive: true }),
  );

  async function carregarLimite() {
    try {
      const resp = await fetch("/api/config/seguranca");
      if (resp.ok) {
        const cfg = await resp.json();
        if (cfg.expiracaoSessao >= 1) limiteMs = cfg.expiracaoSessao * 60 * 1000;
      }
    } catch (e) {
      console.error("Não foi possível ler a política de sessão:", e);
    }
  }

  registrar();
  carregarLimite();
  setInterval(() => {
    if (agora() - ultima() > limiteMs) encerrar();
  }, 15000);
  setInterval(carregarLimite, 5 * 60 * 1000); // pega mudanças feitas pelo administrador
})();
