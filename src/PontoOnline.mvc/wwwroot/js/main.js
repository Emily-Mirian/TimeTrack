/* =========================================================
   SISTEMA DE REGISTRO DE PRESENÇA — JS ÚNICO
   Seções:
     1. Funções compartilhadas
     2. Tela: Login
     3. Tela: Cadastro
   (as próximas telas serão adicionadas no final)
   Cada tela só executa se o seu formulário/elemento existir na página.
   ========================================================= */

/* =========================================================
   1. FUNÇÕES COMPARTILHADAS
   ========================================================= */
function mostrarErro(campoId, erroId, mensagem) {
  document.getElementById(campoId).classList.toggle("erro", !!mensagem);
  document.getElementById(erroId).textContent = mensagem || "";
}

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}
/* =========================================================
   2. TELA: LOGIN (Figura 1)
   ========================================================= */
(function telaLogin() {
  const form = document.getElementById("formLogin");
  if (!form) return; // não está na tela de login

  const ROTAS_POR_PERFIL = {
    funcionario: "funcionario/inicio.html",
    rh: "rh/pendencias.html",
    // [PROTÓTIPO] O Admin abre Pendências até a Visão Global (Fig. 16) existir.
    // Quando ela estiver pronta, trocar para: "admin/visao-global.html"
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

    /* -------------------------------------------------------
       [BACKEND] SUBSTITUIR PELA CHAMADA REAL:

       const resposta = await fetch("/api/auth/login", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email: email.value.trim(), senha: senha.value })
       });
       if (!resposta.ok) {
         document.getElementById("erroGeral").textContent = "E-mail ou senha inválidos.";
         btn.disabled = false; btn.textContent = "Login";
         return;
       }
       const dados = await resposta.json();   // { token, perfil, nome }
       const perfil = dados.perfil;
       ------------------------------------------------------- */

    // [PROTÓTIPO] O perfil é definido pelo que vem ANTES do @. REMOVER com a API pronta.
    //   admin@empresa.com → Admin | rh@empresa.com → RH | qualquer outro → Funcionário
    const usuario = email.value.trim().toLowerCase().split("@")[0];
    const perfil = usuario.includes("admin")
      ? "admin"
      : usuario.includes("rh")
        ? "rh"
        : "funcionario";

    // [PROTÓTIPO] Guarda o perfil para o menu saber o que mostrar. REMOVER com a API pronta.
    localStorage.setItem("perfil", perfil);

    // [BACKEND] Esconder telas no front NÃO é segurança.
    // Cada página do RH e do Admin precisa validar o perfil no servidor.
    window.location.href = ROTAS_POR_PERFIL[perfil];
  });
})();
/* =========================================================
   3. TELA: CADASTRO (Figura 2)
   ========================================================= */
(function telaCadastro() {
  const form = document.getElementById("formCadastro");
  if (!form) return; // não está na tela de cadastro

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmarSenha");
  const tipoContrato = document.getElementById("tipoContrato");
  const btn = document.getElementById("btnCadastrar");

  // Deixa o texto do select escuro quando uma opção é escolhida
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

    // [BACKEND] A regra de senha também deve ser validada no servidor
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

    /* -------------------------------------------------------
       [BACKEND] SUBSTITUIR PELA CHAMADA REAL:

       const resposta = await fetch("/api/usuarios", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           nome: nome.value.trim(),
           email: email.value.trim(),
           senha: senha.value,
           tipoContrato: tipoContrato.value
         })
       });
       if (!resposta.ok) {
         document.getElementById("erroGeral").textContent =
           resposta.status === 409 ? "Este e-mail já está cadastrado." : "Não foi possível concluir o cadastro.";
         btn.disabled = false; btn.textContent = "Cadastrar";
         return;
       }
       ------------------------------------------------------- */

    // [PROTÓTIPO] Simula sucesso e volta para o login. REMOVER com a API pronta.
    document.getElementById("sucessoGeral").textContent =
      "Conta criada com sucesso! Redirecionando...";
    setTimeout(() => (window.location.href = "login.html"), 1500);
  });
})();
/* =========================================================
   4. FUNÇÕES DAS ÁREAS LOGADAS (menu, perfil, sair)
      Valem para todas as telas com menu lateral.
   ========================================================= */
(function areaLogada() {
  if (!document.querySelector(".pagina-app")) return;

  // Navegação: qualquer botão com data-ir leva para a página indicada
  document.querySelectorAll("[data-ir]").forEach((botao) => {
    botao.addEventListener("click", () => {
      window.location.href = botao.dataset.ir;
    });
  });

  // Abre/fecha o menu "Meu Perfil"
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

  // Sair
  const btnSair = document.getElementById("btnSair");
  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      // [BACKEND] Encerrar a sessão: await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("perfil"); // [PROTÓTIPO] REMOVER depois
      window.location.href = "../login.html";
    });
  }

  // [BACKEND] Em TODAS as telas logadas, o servidor deve verificar se existe
  // sessão válida e se o perfil tem permissão. Sem sessão → redirecionar ao login.
})();

/* =========================================================
   5. TELA: INÍCIO DO FUNCIONÁRIO (Figuras 3, 8 e 9)
   ========================================================= */
(function telaInicioFuncionario() {
  const painel = document.getElementById("painelJornada");
  if (!painel) return; // não está na tela inicial

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

  /* -------------------------------------------------------
     [PROTÓTIPO] DADOS FICTÍCIOS — simulam a resposta do back-end.
     Para testar os 3 estados, abra a página com:
       inicio.html?estado=normal   (Fig. 3)
       inicio.html?estado=atencao  (Fig. 8)
       inicio.html?estado=critico  (Fig. 9)
     REMOVER quando a API estiver pronta.
     ------------------------------------------------------- */
  const EXEMPLOS = {
    normal: {
      jornada: {
        percentual: 48,
        trabalhadas: "4h 12min",
        restantes: "3h 48min",
        estado: "normal",
      },
      periodos: {
        hoje: {
          horas: "4h 12min",
          meta: "6h00",
          percentual: 48,
          estado: "normal",
        },
        semana: {
          horas: "21h 36min",
          meta: "30h00",
          percentual: 72,
          estado: "normal",
        },
        mes: {
          horas: "86h 24min",
          meta: "120h00",
          percentual: 68,
          estado: "normal",
        },
      },
    },
    atencao: {
      jornada: {
        percentual: 72,
        trabalhadas: "4h 19min",
        restantes: "1h 41min",
        estado: "atencao",
      },
      periodos: {
        hoje: {
          horas: "4h 19min",
          meta: "6h00",
          percentual: 72,
          estado: "atencao",
        },
        semana: {
          horas: "21h 43min",
          meta: "30h00",
          percentual: 72,
          estado: "atencao",
        },
        mes: {
          horas: "86h 31min",
          meta: "120h00",
          percentual: 72,
          estado: "atencao",
        },
      },
    },
    critico: {
      jornada: {
        percentual: 98,
        trabalhadas: "5h 53min",
        restantes: "7min",
        estado: "critico",
      },
      periodos: {
        hoje: {
          horas: "5h 53min",
          meta: "6h00",
          percentual: 98,
          estado: "atencao",
        },
        semana: {
          horas: "23h 17min",
          meta: "30h00",
          percentual: 77.6,
          estado: "atencao",
        },
        mes: {
          horas: "88h 05min",
          meta: "120h00",
          percentual: 73.4,
          estado: "atencao",
        },
      },
    },
  };

  const DADOS_FICTICIOS = {
    usuario: {
      nome: "Funcionário",
      contrato: "Estagiário",
      limiteDiario: "6h",
    },
    regras: {
      titulo: "Regras para estagiários",
      texto:
        "Estagiários têm limite diário de 6h e não podem realizar horas extras.",
    },
    batidasHoje: { entrada: "08:00", saidaAlmoco: "12:00" },
    historico: [
      {
        data: "13/09/2026 (Hoje)",
        entrada: "08:00",
        saida: "12:00",
        status: "normal",
      },
      {
        data: "12/09/2026 (Sáb)",
        entrada: "08:12",
        saida: "12:03",
        status: "normal",
      },
      {
        data: "11/09/2026 (Sex)",
        entrada: "08:03",
        saida: "12:05",
        status: "normal",
      },
      {
        data: "10/09/2026 (Qui)",
        entrada: "08:00",
        saida: "12:01",
        status: "pendente",
      },
      {
        data: "09/09/2026 (Qua)",
        entrada: "08:07",
        saida: "12:00",
        status: "normal",
      },
    ],
  };

  /* ---------- Relógio (hora do navegador, só exibição) ---------- */
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

  /* ---------- Aplica o estado (cor) em um elemento ---------- */
  function aplicarEstado(elemento, estado) {
    elemento.classList.remove(...ESTADOS);
    elemento.classList.add("jornada-" + estado);
  }

  function formatarPct(valor) {
    return String(valor).replace(".", ",") + "%";
  }

  /* ---------- Jornada do dia ---------- */
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

  /* ---------- Cards Hoje / Semana / Mês ---------- */
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

  /* ---------- Histórico ---------- */
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

  /* ---------- Carregar a tela ---------- */
  async function carregar() {
    /* -----------------------------------------------------
       [BACKEND] SUBSTITUIR PELAS CHAMADAS REAIS:

       const [me, jornada, resumo, regras, hoje, historico] = await Promise.all([
         fetch("/api/me").then(r => r.json()),                          // nome, contrato, limiteDiario
         fetch("/api/jornada/hoje").then(r => r.json()),                // percentual, trabalhadas, restantes, estado
         fetch("/api/jornada/resumo").then(r => r.json()),              // hoje, semana, mes
         fetch("/api/regras/meu-contrato").then(r => r.json()),         // titulo, texto
         fetch("/api/pontos/hoje").then(r => r.json()),                 // entrada, saidaAlmoco
         fetch("/api/pontos/historico?limite=5").then(r => r.json())    // lista
       ]);

       IMPORTANTE: o "estado" (normal / atencao / critico) e o percentual
       são CALCULADOS NO BACK-END com base nas regras do contrato (Fig. 20).
       O front apenas exibe.
       ----------------------------------------------------- */

    // [PROTÓTIPO] usa os dados fictícios
    const estadoTeste =
      new URLSearchParams(location.search).get("estado") || "normal";
    const exemplo = EXEMPLOS[estadoTeste] || EXEMPLOS.normal;
    const d = DADOS_FICTICIOS;

    document.getElementById("nomeUsuario").textContent = d.usuario.nome;
    document.getElementById("regrasTitulo").textContent = d.regras.titulo;
    document.getElementById("regrasTexto").textContent = d.regras.texto;
    document.getElementById("batidaEntrada").textContent =
      d.batidasHoje.entrada;
    document.getElementById("batidaAlmoco").textContent =
      d.batidasHoje.saidaAlmoco;

    renderizarJornada(exemplo.jornada, d.usuario);
    renderizarPeriodo("periodoHoje", exemplo.periodos.hoje);
    renderizarPeriodo("periodoSemana", exemplo.periodos.semana);
    renderizarPeriodo("periodoMes", exemplo.periodos.mes);
    renderizarHistorico(d.historico);
  }

  /* ---------- Botão Registrar Ponto ---------- */
  const btnRegistrar = document.getElementById("btnRegistrar");
  btnRegistrar.addEventListener("click", async () => {
    btnRegistrar.disabled = true;

    /* [BACKEND] Registrar batida:
       const resposta = await fetch("/api/pontos", { method: "POST" });
       - O SERVIDOR grava o horário oficial e define o tipo da batida
         (entrada, saída almoço, retorno, saída).
       - O servidor também deve BLOQUEAR a batida se ultrapassar o limite do contrato.
       Depois do sucesso, chamar carregar() para atualizar a jornada. */

    // [PROTÓTIPO] Apenas mostra a mensagem
    const hora = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    document.getElementById("msgRegistro").textContent =
      `Ponto registrado às ${hora}.`;
    setTimeout(() => {
      document.getElementById("msgRegistro").textContent = "";
      btnRegistrar.disabled = false;
    }, 3000);
  });

  /* ---------- Filtro do histórico ---------- */
  document.getElementById("filtroHistorico").addEventListener("change", (e) => {
    // [BACKEND] Buscar novamente: GET /api/pontos/historico?limite=${e.target.value}
    console.log("Filtro do histórico:", e.target.value);
  });

  carregar();
})();
/* =========================================================
   6. TELA: PONTO DO FUNCIONÁRIO (Figura 4)
   ========================================================= */
(function telaPonto() {
  const card = document.getElementById("cardPonto");
  if (!card) return; // não está na tela de ponto

  // Ordem das batidas do dia
  const ETAPAS = [
    { chave: "entrada", nome: "Entrada" },
    { chave: "saidaAlmoco", nome: "Saída para Almoço" },
    { chave: "retornoAlmoco", nome: "Retorno do Almoço" },
    { chave: "saida", nome: "Saída" },
  ];

  const btn = document.getElementById("btnBaterPonto");
  const textoBtn = document.getElementById("textoBtnPonto");

  /* ---------- Relógio (hora do navegador, só exibição) ---------- */
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

  /* ---------- Aviso (verde ou vermelho) ---------- */
  function mostrarAviso(tipo, texto) {
    const aviso = document.getElementById("avisoPonto");
    aviso.classList.remove("oculto", "aviso-sucesso", "aviso-erro");
    aviso.classList.add(tipo === "erro" ? "aviso-erro" : "aviso-sucesso");
    document.getElementById("avisoIcone").textContent =
      tipo === "erro" ? "!" : "✓";
    document.getElementById("avisoTexto").textContent = texto;
  }

  /* ---------- Desenha a linha do tempo ---------- */
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

    // Todas as batidas feitas → desativa o botão
    const finalizado = ETAPAS.every(({ chave }) => batidas[chave]);
    btn.disabled = finalizado;
    textoBtn.textContent = finalizado
      ? "Jornada do dia concluída"
      : "Registrar Ponto";
  }

  /* ---------- Carregar batidas do dia ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       batidas = await fetch("/api/pontos/hoje").then(r => r.json());
       // { entrada: "08:00", saidaAlmoco: "12:00", retornoAlmoco: null, saida: null } */

    // [PROTÓTIPO] Igual à Fig. 4: entrada e saída para almoço já registradas. REMOVER depois.
    batidas = {
      entrada: "08:00",
      saidaAlmoco: "12:00",
      retornoAlmoco: null,
      saida: null,
    };
    renderizar();
  }

  /* ---------- Botão Registrar Ponto ---------- */
  btn.addEventListener("click", async () => {
    const proxima = ETAPAS.find(({ chave }) => !batidas[chave]);
    if (!proxima) return;
    btn.disabled = true;

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch("/api/pontos", { method: "POST" });
       - O SERVIDOR define o horário oficial e o tipo da batida.
       - O SERVIDOR deve BLOQUEAR a batida se ultrapassar o limite do contrato
         (ex.: estagiário com 6h) e devolver a mensagem do motivo.
       if (!resposta.ok) {
         const erro = await resposta.json();   // { mensagem: "Limite diário de 6h atingido." }
         mostrarErroPonto(erro.mensagem);
         return;
       }
       const dados = await resposta.json();    // { tipo: "retornoAlmoco", hora: "13:00" }
       batidas[dados.tipo] = dados.hora; */

    // [PROTÓTIPO] Usa a hora do navegador. REMOVER depois.
    batidas[proxima.chave] = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    renderizar();
    mostrarAviso(
      "sucesso",
      `Último registro de ${proxima.nome} efetuado com sucesso.`,
    );
  });

  // [BACKEND] Usar quando a API recusar a batida (limite, fora do horário etc.)
  function mostrarErroPonto(mensagem) {
    mostrarAviso("erro", mensagem || "Não foi possível registrar o ponto.");
    btn.disabled = false;
  }

  carregar();
})();
/* =========================================================
   7. TELA: RELATÓRIOS DO FUNCIONÁRIO (Figura 5)
   ========================================================= */
(function telaRelatorios() {
  const cardExportar = document.getElementById("cardExportar");
  if (!cardExportar) return; // não está na tela de relatórios

  const selectMes = document.getElementById("mesReferencia");
  const btnGerar = document.getElementById("btnGerarPdf");
  const tabela = document.getElementById("tabelaRelatorios");

  const ICONE_DOWNLOAD =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg>';

  function nomeMes(data) {
    const texto = data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return texto.charAt(0).toUpperCase() + texto.slice(1); // "Setembro de 2026"
  }

  /* ---------- Preenche o select com os últimos 12 meses ---------- */
  function preencherMeses() {
    // [BACKEND] Trocar por: GET /api/relatorios/meses-disponiveis
    const hoje = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      selectMes.insertAdjacentHTML(
        "beforeend",
        `<option value="${valor}">${nomeMes(d)}</option>`,
      );
    }
  }

  /* ---------- Saldo acumulado ---------- */
  function renderizarSaldo(s) {
    const card = document.getElementById("cardSaldo");
    card.classList.remove("saldo-positivo", "saldo-negativo", "saldo-inativo");

    if (!s.bancoHorasAtivo) {
      card.classList.add("saldo-inativo");
      document.getElementById("saldoValor").textContent = "Não se aplica";
      document.getElementById("saldoInfo").textContent =
        "Seu tipo de contrato não possui banco de horas.";
      return;
    }
    card.classList.add(s.positivo ? "saldo-positivo" : "saldo-negativo");
    document.getElementById("saldoValor").textContent = s.saldo;
    document.getElementById("saldoInfo").textContent =
      `Banco de horas atualizado em ${s.atualizadoEm}.`;
  }

  /* ---------- Tabela de relatórios ---------- */
  let relatorios = [];

  function renderizarTabela() {
    if (!relatorios.length) {
      tabela.innerHTML =
        '<tr><td colspan="3" class="tabela-vazia">Nenhum relatório gerado ainda.</td></tr>';
      return;
    }
    tabela.innerHTML = relatorios
      .map(
        (r) => `
        <tr>
          <td><strong>${r.mes}</strong></td>
          <td>${r.emissao}</td>
          <td class="acoes">
            <button class="btn-baixar" data-id="${r.id}">${ICONE_DOWNLOAD} Baixar PDF</button>
          </td>
        </tr>`,
      )
      .join("");
  }

  // Clique em "Baixar PDF" (um único listener para todas as linhas)
  tabela.addEventListener("click", (e) => {
    const botao = e.target.closest(".btn-baixar");
    if (!botao) return;
    /* [BACKEND] Baixar o arquivo:
       window.location.href = `/api/relatorios/espelho/${botao.dataset.id}/download`; */
    // [PROTÓTIPO] REMOVER depois
    alert(
      `[Protótipo] Download do relatório ${botao.dataset.id} será feito pelo back-end.`,
    );
  });

  /* ---------- Gerar novo relatório ---------- */
  btnGerar.addEventListener("click", async () => {
    btnGerar.disabled = true;
    const mesTexto = selectMes.options[selectMes.selectedIndex].text;

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch("/api/relatorios/espelho", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ mes: selectMes.value })
       });
       const novo = await resposta.json();   // { id, mes, emissao }
       O PDF é montado pelo SERVIDOR com as batidas do banco de dados. */

    // [PROTÓTIPO] Simula o relatório gerado. REMOVER depois.
    const novo = {
      id: "rel-" + Date.now(),
      mes: mesTexto,
      emissao: new Date().toLocaleDateString("pt-BR"),
    };

    relatorios.unshift(novo);
    renderizarTabela();
    document.getElementById("msgRelatorio").textContent =
      `Espelho de ${mesTexto} gerado com sucesso.`;
    setTimeout(() => {
      document.getElementById("msgRelatorio").textContent = "";
      btnGerar.disabled = false;
    }, 2500);
  });

  /* ---------- Carregar a tela ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELAS CHAMADAS REAIS:
       const [saldo, lista] = await Promise.all([
         fetch("/api/banco-horas/saldo").then(r => r.json()),
         fetch("/api/relatorios/espelho").then(r => r.json())
       ]);
       O SALDO é CALCULADO NO BACK-END conforme as regras do contrato (Fig. 20). */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    // Para testar contrato sem banco de horas, troque bancoHorasAtivo para false.
    const saldo = {
      bancoHorasAtivo: true,
      saldo: "+12h 30min",
      positivo: true,
      atualizadoEm: "13/09/2026",
    };
    relatorios = [
      { id: "rel-08", mes: "Agosto de 2026", emissao: "01/09/2026" },
      { id: "rel-07", mes: "Julho de 2026", emissao: "01/08/2026" },
      { id: "rel-06", mes: "Junho de 2026", emissao: "01/07/2026" },
    ];

    preencherMeses();
    renderizarSaldo(saldo);
    renderizarTabela();
  }

  carregar();
})();
/* =========================================================
   8. MODAL: ENVIAR ATESTADO (Figura 6)
   ========================================================= */
(function modalAtestado() {
  const modal = document.getElementById("modalAtestado");
  if (!modal) return; // modal só existe no inicio.html

  const form = document.getElementById("formAtestado");
  const inicio = document.getElementById("atestadoInicio");
  const fim = document.getElementById("atestadoFim");
  const motivo = document.getElementById("atestadoMotivo");
  const arquivo = document.getElementById("atestadoArquivo");
  const areaUpload = document.getElementById("areaUpload");
  const nomeArquivo = document.getElementById("nomeArquivoAtestado");
  const btnEnviar = document.getElementById("btnEnviarAtestado");
  const botaoMenu = document.querySelector('[data-ir$="#atestado"]');
  const botaoInicio = document.querySelector(
    '.menu-item[data-ir="inicio.html"]',
  );

  const TIPOS_ACEITOS = ["application/pdf", "image/jpeg", "image/png"];
  const TAMANHO_MAX = 5 * 1024 * 1024; // 5 MB  [BACKEND] confirmar o limite com o back-end

  /* ---------- Abrir / fechar ---------- */
  function abrir() {
    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    if (botaoMenu) botaoMenu.classList.add("ativo");
    if (botaoInicio) botaoInicio.classList.remove("ativo");
    inicio.focus();
  }

  function fechar() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
    if (botaoMenu) botaoMenu.classList.remove("ativo");
    if (botaoInicio) botaoInicio.classList.add("ativo");
    limpar();
    // Remove o "#atestado" do endereço sem recarregar a página
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

  // Abre ao entrar com #atestado no endereço ou ao clicar no menu
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
  }); // clique fora
  document.addEventListener("keydown", (e) => {
    // tecla Esc
    if (e.key === "Escape" && !modal.classList.contains("oculto")) fechar();
  });

  /* ---------- Arquivo: clique ou arrastar ---------- */
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

  /* ---------- Validação ---------- */
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

  /* ---------- Envio ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroAtestadoGeral").textContent = "";
    if (!validar()) return;

    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const dados = new FormData(form);   // dataInicio, dataFim, motivo, arquivo
       const resposta = await fetch("/api/atestados", { method: "POST", body: dados });
       if (!resposta.ok) {
         document.getElementById("erroAtestadoGeral").textContent = "Não foi possível enviar o atestado.";
         btnEnviar.disabled = false; btnEnviar.textContent = "Enviar atestado";
         return;
       }
       Depois do envio, o atestado aparece para o RH em Pendências (Fig. 10). */

    // [PROTÓTIPO] Simula sucesso. REMOVER depois.
    document.getElementById("sucessoAtestado").textContent =
      "Atestado enviado para análise do RH.";
    setTimeout(fechar, 1800);
  });
})();
/* =========================================================
   9. TELA: CONFIGURAÇÕES DO FUNCIONÁRIO (Figura 7)
   ========================================================= */
(function telaConfiguracoesFuncionario() {
  const formSenha = document.getElementById("formSenha");
  if (!formSenha) return; // não está na tela de configurações

  /* ---------- Mostrar / esconder senha (olho) ---------- */
  document.querySelectorAll(".btn-olho").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.alvo);
      const mostrar = input.type === "password";
      input.type = mostrar ? "text" : "password";
      btn.classList.toggle("visivel", mostrar);
      btn.setAttribute(
        "aria-label",
        mostrar ? "Esconder senha" : "Mostrar senha",
      );
    });
  });

  /* ---------- Carregar dados ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELAS CHAMADAS REAIS:
       const [me, prefs] = await Promise.all([
         fetch("/api/me").then(r => r.json()),
         fetch("/api/me/notificacoes").then(r => r.json())
       ]); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    const me = {
      nome: "Funcionário Exemplo",
      email: "funcionario@empresa.com",
      contrato: "Estágio (6h diárias)",
    };
    const prefs = { alertaLimiteEmail: true, atestadoValidado: true };

    document.getElementById("dadoNome").textContent = me.nome;
    document.getElementById("dadoEmail").textContent = me.email;
    document.getElementById("dadoContrato").textContent = me.contrato;

    document.querySelectorAll("[data-preferencia]").forEach((chk) => {
      chk.checked = !!prefs[chk.dataset.preferencia];
    });
  }

  /* ---------- Alterar senha ---------- */
  const senhaAtual = document.getElementById("senhaAtual");
  const novaSenha = document.getElementById("novaSenha");
  const btnAlterar = document.getElementById("btnAlterarSenha");

  function validarSenha() {
    let ok = true;
    if (!senhaAtual.value) {
      mostrarErro(
        "campoSenhaAtual",
        "erroSenhaAtual",
        "Informe a senha atual.",
      );
      ok = false;
    } else mostrarErro("campoSenhaAtual", "erroSenhaAtual", "");

    // [BACKEND] A regra de senha forte também deve ser validada no servidor (Fig. 17)
    if (novaSenha.value.length < 8) {
      mostrarErro(
        "campoNovaSenha",
        "erroNovaSenha",
        "A nova senha deve ter no mínimo 8 caracteres.",
      );
      ok = false;
    } else if (novaSenha.value === senhaAtual.value) {
      mostrarErro(
        "campoNovaSenha",
        "erroNovaSenha",
        "A nova senha deve ser diferente da atual.",
      );
      ok = false;
    } else mostrarErro("campoNovaSenha", "erroNovaSenha", "");
    return ok;
  }

  formSenha.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroSenhaGeral").textContent = "";
    document.getElementById("sucessoSenha").textContent = "";
    if (!validarSenha()) return;

    btnAlterar.disabled = true;
    btnAlterar.textContent = "Salvando...";

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch("/api/me/senha", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ senhaAtual: senhaAtual.value, novaSenha: novaSenha.value })
       });
       if (resposta.status === 401) {
         mostrarErro("campoSenhaAtual", "erroSenhaAtual", "Senha atual incorreta.");
         btnAlterar.disabled = false; btnAlterar.textContent = "Alterar Senha";
         return;
       } */

    // [PROTÓTIPO] Simula sucesso. REMOVER depois.
    formSenha.reset();
    document.getElementById("sucessoSenha").textContent =
      "Senha alterada com sucesso.";
    btnAlterar.disabled = false;
    btnAlterar.textContent = "Alterar Senha";
  });

  /* ---------- Notificações (salva a cada clique) ---------- */
  document.querySelectorAll("[data-preferencia]").forEach((chk) => {
    chk.addEventListener("change", async () => {
      /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
         await fetch("/api/me/notificacoes", {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ [chk.dataset.preferencia]: chk.checked })
         });
         Em caso de erro, voltar o toggle: chk.checked = !chk.checked; */

      const msg = document.getElementById("msgPreferencias");
      msg.textContent = "Preferência salva.";
      setTimeout(() => (msg.textContent = ""), 1800);
    });
  });

  carregar();
})();
/* =========================================================
   10. CONTROLE DE PERFIL NO MENU (RH e Admin)
   ========================================================= */
(function controlePerfil() {
  if (!document.querySelector(".pagina-app")) return;

  /* [BACKEND] O perfil deve vir do servidor: GET /api/me → { perfil: "rh" | "admin" }
     O servidor também deve BLOQUEAR as páginas e APIs para quem não tem permissão.
     Esconder botões no front NÃO é segurança. */
  // [PROTÓTIPO] Usa o perfil salvo no login. REMOVER depois.
  const perfil = localStorage.getItem("perfil") || "funcionario";

  // Bloqueia a página se o perfil não tiver acesso (data-acesso no <body>)
  const acesso = document.body.dataset.acesso;
  if (acesso && !acesso.split(" ").includes(perfil)) {
    alert(
      `Acesso negado: você entrou como "${perfil}". Faça login com um e-mail de RH ou Admin.`,
    );
    window.location.href = "../login.html";
    return;
  }

  // Mostra/esconde itens com data-perfil
  document.querySelectorAll("[data-perfil]").forEach((el) => {
    el.classList.toggle(
      "oculto",
      !el.dataset.perfil.split(" ").includes(perfil),
    );
  });

  // Saudação no botão de perfil
  const saudacao = document.getElementById("saudacaoPerfil");
  if (saudacao)
    saudacao.textContent =
      perfil === "admin" ? "Olá, Administrador" : "Olá, Gestor RH";

  // Ao sair, apaga o perfil salvo
  const btnSair = document.getElementById("btnSair");
  if (btnSair)
    btnSair.addEventListener("click", () => localStorage.removeItem("perfil"));
})();
/* =========================================================
   11. TELA: PENDÊNCIAS DO RH (Figura 10)
   ========================================================= */
(function telaPendencias() {
  const card = document.getElementById("cardPendencias");
  if (!card) return;

  const tabela = document.getElementById("tabelaPendencias");
  const filtro = document.getElementById("filtroTipo");

  // Visual de cada tipo de ocorrência
  const TIPOS = {
    batida_impar: { texto: "Batida Ímpar", badge: "badge-atencao" },
    atestado: { texto: "Atestado Médico Enviado", badge: "badge-info" },
    falta: { texto: "Falta Injustificada", badge: "badge-critico" },
  };

  // Botões de ação de cada tipo
  function botoes(p) {
    if (p.tipo === "batida_impar")
      return `<button class="btn-acao primario" data-acao="editar" data-id="${p.id}">Editar Ponto</button>`;
    if (p.tipo === "atestado")
      return `<button class="btn-acao" data-acao="anexo" data-id="${p.id}">Visualizar Anexo</button>
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
    }, 400);
    const msg = document.getElementById("msgPendencias");
    msg.textContent = mensagem;
    setTimeout(() => (msg.textContent = ""), 2500);
  }

  /* ---------- Cliques nos botões da tabela ---------- */
  tabela.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-acao]");
    if (!btn) return;
    const p = pendencias.find((x) => String(x.id) === btn.dataset.id);

    switch (btn.dataset.acao) {
      case "editar":
        // Abre o modal da Fig. 11; ao salvar, a pendência some da tabela
        window.abrirEditarPonto(p, () =>
          resolver(p.id, `Ponto de ${p.colaborador} corrigido.`),
        );
        break;

      case "anexo":
        // [BACKEND] Abrir o arquivo: window.open(p.anexoUrl, "_blank");
        alert(`[Protótipo] Abrir anexo do atestado de ${p.colaborador}.`);
        break;

      case "aprovar":
        // [BACKEND] PUT /api/rh/atestados/{id}/aprovar  → abona os dias e notifica o funcionário
        resolver(p.id, `Atestado de ${p.colaborador} aprovado.`);
        break;

      case "tratar":
        // [BACKEND] PUT /api/rh/pendencias/{id}/tratar  → ex.: confirmar desconto ou justificar
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

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       pendencias = await fetch("/api/rh/pendencias").then(r => r.json()); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    pendencias = [
      {
        id: 1,
        colaborador: "Emily Mirian",
        contrato: "Estágio 6h",
        data: "10/09/2026",
        tipo: "batida_impar",
        detalhe: "3 batidas registradas (falta a saída)",
      },
      {
        id: 2,
        colaborador: "Lucas Andrade",
        contrato: "CLT 8h",
        data: "11/09/2026",
        tipo: "atestado",
        detalhe: "Atestado de 11/09 a 12/09",
      },
      {
        id: 3,
        colaborador: "Rafael Costa",
        contrato: "Jovem Aprendiz",
        data: "12/09/2026",
        tipo: "falta",
        detalhe: "Nenhuma batida no dia",
      },
      {
        id: 4,
        colaborador: "Ana Beatriz",
        contrato: "CLT 8h",
        data: "12/09/2026",
        tipo: "batida_impar",
        detalhe: "Retorno do almoço não registrado",
      },
    ];
    renderizar();
  }

  carregar();
})();
/* =========================================================
   12. MODAL: EDITAR PONTO (Figura 11)
   ========================================================= */
(function modalEditarPonto() {
  const modal = document.getElementById("modalEditarPonto");
  if (!modal) return; // modal só existe no rh/pendencias.html

  const form = document.getElementById("formEditarPonto");
  const data = document.getElementById("editarData");
  const tipo = document.getElementById("editarTipo");
  const original = document.getElementById("editarOriginal");
  const novo = document.getElementById("editarNovo");
  const justificativa = document.getElementById("editarJustificativa");
  const contador = document.getElementById("contadorJustificativa");
  const btnSalvar = document.getElementById("btnSalvarEditar");

  let pendenciaAtual = null;
  let aoSalvar = null;

  // "10/09/2026" → "2026-09-10" (formato do campo de data)
  function paraISO(dataBR) {
    const [d, m, a] = dataBR.split("/");
    return `${a}-${m}-${d}`;
  }

  /* ---------- Busca o horário original ---------- */
  async function carregarOriginal() {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const r = await fetch(`/api/rh/pontos?colaboradorId=${pendenciaAtual.colaboradorId}&data=${data.value}&tipo=${tipo.value}`)
                   .then(r => r.json());   // { horario: "08:12" } ou { horario: null }
       original.value = r.horario || "Não registrado"; */

    // [PROTÓTIPO] Horários fictícios. REMOVER depois.
    const FICTICIOS = {
      entrada: "08:00",
      saidaAlmoco: "12:00",
      retornoAlmoco: "13:00",
      saida: null,
    };
    original.value = FICTICIOS[tipo.value] || "Não registrado";
  }

  /* ---------- Abrir / fechar ---------- */
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
    // [BACKEND] A pendência pode informar qual batida falta (campo "tipoPonto")
    tipo.value = pendencia.tipoPonto || "entrada";
    carregarOriginal();

    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    novo.focus();
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
    document.getElementById("erroEditarGeral").textContent = "";
    [
      ["campoEditarData", "erroEditarData"],
      ["campoEditarNovo", "erroEditarNovo"],
      ["campoEditarJustificativa", "erroEditarJustificativa"],
    ].forEach(([c, e]) => mostrarErro(c, e, ""));
  }

  // Deixa a função disponível para a tabela de Pendências
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

  // Ao trocar data ou tipo, busca de novo o horário original
  data.addEventListener("change", carregarOriginal);
  tipo.addEventListener("change", carregarOriginal);

  /* ---------- Contador de caracteres ---------- */
  justificativa.addEventListener("input", () => {
    const total = justificativa.value.length;
    contador.textContent = `${total}/500`;
    contador.classList.toggle("limite", total >= 500);
  });

  /* ---------- Validação ---------- */
  function validar() {
    let ok = true;

    if (!data.value) {
      mostrarErro("campoEditarData", "erroEditarData", "Informe a data.");
      ok = false;
    } else mostrarErro("campoEditarData", "erroEditarData", "");

    if (!novo.value) {
      mostrarErro(
        "campoEditarNovo",
        "erroEditarNovo",
        "Informe o novo horário.",
      );
      ok = false;
    } else if (novo.value === original.value) {
      mostrarErro(
        "campoEditarNovo",
        "erroEditarNovo",
        "O novo horário é igual ao original.",
      );
      ok = false;
    } else mostrarErro("campoEditarNovo", "erroEditarNovo", "");

    // [BACKEND] Validar também no servidor (justificativa obrigatória para auditoria)
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

  /* ---------- Salvar ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroEditarGeral").textContent = "";
    if (!validar()) return;

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch("/api/rh/pontos", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           pendenciaId: pendenciaAtual.id,
           colaboradorId: pendenciaAtual.colaboradorId,
           data: data.value,
           tipo: tipo.value,
           novoHorario: novo.value,
           justificativa: justificativa.value.trim()
         })
       });
       if (!resposta.ok) {
         document.getElementById("erroEditarGeral").textContent = "Não foi possível salvar o ajuste.";
         btnSalvar.disabled = false; btnSalvar.textContent = "Salvar";
         return;
       }
       O SERVIDOR recalcula a jornada do colaborador e grava o registro na auditoria. */

    // [PROTÓTIPO] Simula sucesso. REMOVER depois.
    const callback = aoSalvar;
    fechar();
    if (callback) callback();
  });
})();
/* =========================================================
   12. TELA: IMPORTAR PLANILHAS (Figura 12)
   ========================================================= */
(function telaImportar() {
  const card = document.getElementById("cardImportar");
  if (!card) return; // não está na tela de importação

  const input = document.getElementById("arquivoImport");
  const area = document.getElementById("areaImport");
  const caixaArquivo = document.getElementById("arquivoSelecionado");
  const btnImportar = document.getElementById("btnImportar");
  const erro = document.getElementById("erroImport");
  const tabela = document.getElementById("tabelaImportacoes");

  const LIMITE_LINHAS = 5000;
  const EXTENSOES = [".csv", ".xlsx", ".xls"];
  const TAMANHO_MAX = 10 * 1024 * 1024; // 10 MB  [BACKEND] confirmar o limite com o back-end

  const STATUS = {
    concluido: '<span class="badge badge-normal">Concluído</span>',
    processando: '<span class="badge badge-info">Processando</span>',
    erro: '<span class="badge badge-critico">Erro</span>',
  };

  let arquivoAtual = null;
  let importacoes = [];

  // Evita que nomes de arquivo com caracteres especiais quebrem a tabela
  function escaparHTML(texto) {
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

  function formatarTamanho(bytes) {
    return bytes < 1024 * 1024
      ? (bytes / 1024).toFixed(0) + " KB"
      : (bytes / 1024 / 1024).toFixed(1) + " MB";
  }

  /* ---------- Limpar seleção ---------- */
  function limpar() {
    arquivoAtual = null;
    input.value = "";
    caixaArquivo.classList.add("oculto");
    area.classList.remove("oculto");
    btnImportar.disabled = true;
    erro.textContent = "";
  }

  /* ---------- Validar o arquivo escolhido ---------- */
  async function selecionar(arquivo) {
    limpar();
    if (!arquivo) return;

    const nome = arquivo.name.toLowerCase();
    if (!EXTENSOES.some((ext) => nome.endsWith(ext))) {
      erro.textContent =
        "Formato inválido. Envie um arquivo .csv, .xlsx ou .xls.";
      return;
    }
    if (arquivo.size > TAMANHO_MAX) {
      erro.textContent = "O arquivo deve ter no máximo 10 MB.";
      return;
    }

    let info = formatarTamanho(arquivo.size);

    // CSV: o front já conta as linhas. Excel: a contagem é feita pelo back-end.
    if (nome.endsWith(".csv")) {
      const texto = await arquivo.text();
      const linhas = texto.split(/\r?\n/).filter((l) => l.trim()).length - 1; // tira o cabeçalho
      if (linhas <= 0) {
        erro.textContent = "O arquivo está vazio ou só tem o cabeçalho.";
        return;
      }
      if (linhas > LIMITE_LINHAS) {
        erro.textContent = `O arquivo tem ${linhas.toLocaleString("pt-BR")} linhas. O limite é ${LIMITE_LINHAS.toLocaleString("pt-BR")}.`;
        return;
      }
      info += ` · ${linhas.toLocaleString("pt-BR")} linhas`;
    } else {
      info += " · linhas verificadas na importação";
    }

    arquivoAtual = arquivo;
    document.getElementById("nomeArquivoImport").textContent = arquivo.name;
    document.getElementById("infoArquivoImport").textContent = info;
    caixaArquivo.classList.remove("oculto");
    area.classList.add("oculto");
    btnImportar.disabled = false;
  }

  /* ---------- Clique ou arrastar ---------- */
  input.addEventListener("change", () => selecionar(input.files[0]));
  document
    .getElementById("btnRemoverArquivo")
    .addEventListener("click", limpar);

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

  /* ---------- Tabela ---------- */
  function renderizarTabela() {
    if (!importacoes.length) {
      tabela.innerHTML =
        '<tr><td colspan="4" class="tabela-vazia">Nenhuma importação realizada ainda.</td></tr>';
      return;
    }
    tabela.innerHTML = importacoes
      .map(
        (i) => `
        <tr>
          <td><strong>${escaparHTML(i.arquivo)}</strong></td>
          <td>${i.data}</td>
          <td>${i.linhas != null ? i.linhas.toLocaleString("pt-BR") : "--"}</td>
          <td>${STATUS[i.status] || i.status}</td>
        </tr>`,
      )
      .join("");
  }

  /* ---------- Importar ---------- */
  btnImportar.addEventListener("click", async () => {
    if (!arquivoAtual) return;
    btnImportar.disabled = true;

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const dados = new FormData();
       dados.append("arquivo", arquivoAtual);
       const resposta = await fetch("/api/rh/importacoes", { method: "POST", body: dados });
       if (!resposta.ok) {
         const e = await resposta.json();  // { mensagem: "Coluna 'data' não encontrada na linha 1." }
         erro.textContent = e.mensagem || "Não foi possível importar o arquivo.";
         btnImportar.disabled = false;
         return;
       }
       const nova = await resposta.json(); // { id, arquivo, data, linhas, status: "processando" }
       O SERVIDOR valida colunas, datas e colaboradores, e grava no banco.
       Para arquivos grandes, consultar o status depois: GET /api/rh/importacoes/{id} */

    // [PROTÓTIPO] Simula o processamento. REMOVER depois.
    const linhasTexto = document
      .getElementById("infoArquivoImport")
      .textContent.match(/([\d.]+) linhas/);
    const nova = {
      id: Date.now(),
      arquivo: arquivoAtual.name,
      data: new Date().toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      linhas: linhasTexto ? Number(linhasTexto[1].replace(/\./g, "")) : null,
      status: "processando",
    };
    importacoes.unshift(nova);
    renderizarTabela();
    limpar();

    const msg = document.getElementById("msgImport");
    msg.textContent = "Arquivo enviado. Processando...";
    setTimeout(() => {
      nova.status = "concluido";
      renderizarTabela();
      msg.textContent = `Importação de ${nova.arquivo} concluída.`;
      setTimeout(() => (msg.textContent = ""), 2500);
    }, 1500);
  });

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       importacoes = await fetch("/api/rh/importacoes?limite=10").then(r => r.json()); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    importacoes = [
      {
        id: 3,
        arquivo: "jornadas_agosto_2026.csv",
        data: "01/09/2026 09:15",
        linhas: 1250,
        status: "concluido",
      },
      {
        id: 2,
        arquivo: "jornadas_julho_2026.xlsx",
        data: "01/08/2026 10:02",
        linhas: 1184,
        status: "concluido",
      },
      {
        id: 1,
        arquivo: "historico_2025.csv",
        data: "15/07/2026 14:30",
        linhas: 4870,
        status: "concluido",
      },
    ];
    renderizarTabela();
  }

  carregar();
})();
/* =========================================================
   13. TELA: IMPORTAR PLANILHAS (Figura 12)
   ========================================================= */
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

  /* ---------- Tabela ---------- */
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
          <td>${i.data}</td>
          <td>${i.linhas != null ? i.linhas.toLocaleString("pt-BR") : "--"}</td>
          <td>${STATUS[i.status] || i.status}</td>
        </tr>`,
      )
      .join("");
  }

  /* ---------- Seleção do arquivo ---------- */
  function contarLinhasCsv(file) {
    return new Promise((resolve) => {
      const leitor = new FileReader();
      leitor.onload = () =>
        resolve(
          leitor.result.split(/\r?\n/).filter((l) => l.trim()).length - 1,
        ); // -1 = cabeçalho
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

    // Pré-verificação do limite só para CSV (Excel precisa ser lido pelo servidor)
    // [BACKEND] O limite de 5.000 linhas deve ser validado no servidor para TODOS os formatos
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

  /* ---------- Importar ---------- */
  btnImportar.addEventListener("click", async () => {
    if (!arquivo) return;
    btnImportar.disabled = true;
    btnLimpar.classList.add("oculto");

    const progresso = document.getElementById("progressoImportar");
    const barra = document.getElementById("barraImportar");
    const texto = document.getElementById("textoProgresso");
    progresso.classList.remove("oculto");

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const dados = new FormData();
       dados.append("arquivo", arquivo);
       const resposta = await fetch("/api/rh/importacoes", { method: "POST", body: dados });
       const resultado = await resposta.json();
       // resultado.status: "concluido" | "processando" | "erro"
       // Se vier "processando", consultar de tempos em tempos: GET /api/rh/importacoes/{id}
       (Para mostrar o progresso real do envio, usar XMLHttpRequest com upload.onprogress) */

    // [PROTÓTIPO] Simula o envio com barra de progresso. REMOVER depois.
    let pct = 0;
    await new Promise((fim) => {
      const timer = setInterval(() => {
        pct = Math.min(pct + 20, 100);
        barra.style.width = pct + "%";
        texto.textContent = `Enviando... ${pct}%`;
        if (pct === 100) {
          clearInterval(timer);
          fim();
        }
      }, 300);
    });
    const resultado = {
      arquivo: arquivo.name,
      data: new Date().toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      linhas: null, // [BACKEND] o servidor informa a quantidade de linhas importadas
      status: "concluido",
    };

    importacoes.unshift(resultado);
    renderizarTabela();
    progresso.classList.add("oculto");
    barra.style.width = "0%";
    limpar();

    const msg = document.getElementById("msgImportar");
    msg.textContent = `Arquivo "${resultado.arquivo}" importado com sucesso.`;
    setTimeout(() => (msg.textContent = ""), 3000);
  });

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELAS CHAMADAS REAIS:
       const modulo = await fetch("/api/modulos/importacao").then(r => r.json()); // { ativo: true }
       importacoes  = await fetch("/api/rh/importacoes?limite=10").then(r => r.json()); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    const modulo = { ativo: true }; // troque para false para ver o módulo desativado
    importacoes = [
      {
        arquivo: "registros_agosto_2026.csv",
        data: "01/09/2026 09:12",
        linhas: 1240,
        status: "concluido",
      },
      {
        arquivo: "registros_julho_2026.xlsx",
        data: "01/08/2026 10:03",
        linhas: 1187,
        status: "concluido",
      },
      {
        arquivo: "legado_2025.csv",
        data: "15/07/2026 14:40",
        linhas: 312,
        status: "erro",
        erroResumo: "12 linhas com colaborador não encontrado",
      },
    ];

    if (!modulo.ativo) {
      document
        .getElementById("avisoModuloDesativado")
        .classList.remove("oculto");
      area.classList.add("oculto");
      document.querySelector(".importar-acoes").classList.add("oculto");
    }
    renderizarTabela();
  }

  carregar();
})();
/* =========================================================
   14. TELA: EXPORTAR RELATÓRIOS DO RH (Figura 13)
   ========================================================= */
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

  /* ---------- Opções dos selects ---------- */
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

  /* ---------- Tabela ---------- */
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
          <td><strong>${r.arquivo}</strong></td>
          <td>${r.geradoEm}</td>
          <td>${r.geradoPor}</td>
          <td class="acoes"><button class="btn-baixar" data-id="${r.id}">${ICONE_DOWNLOAD} Baixar PDF</button></td>
        </tr>`,
      )
      .join("");
  }

  tabela.addEventListener("click", (e) => {
    const b = e.target.closest(".btn-baixar");
    if (!b) return;
    /* [BACKEND] window.location.href = `/api/rh/relatorios/${b.dataset.id}/download`; */
    // [PROTÓTIPO] REMOVER depois
    alert(
      `[Protótipo] O download do relatório ${b.dataset.id} será feito pelo back-end.`,
    );
  });

  /* ---------- Gerar ---------- */
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
      mostrarErro(
        "campoAlvo",
        "erroAlvo",
        "Selecione um colaborador ou setor.",
      );
      return;
    }
    mostrarErro("campoAlvo", "erroAlvo", "");

    btn.disabled = true;
    btn.lastChild.textContent = " Gerando...";

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch("/api/rh/relatorios", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ alvo: alvo.value, mes: mes.value })
       });
       const novo = await resposta.json();   // { id, arquivo, geradoEm, geradoPor } */

    // [PROTÓTIPO] Simula o relatório gerado. REMOVER depois.
    await new Promise((r) => setTimeout(r, 900));
    const novo = {
      id: "rh-" + Date.now(),
      arquivo: nomeArquivo(),
      geradoEm: new Date().toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      geradoPor: document
        .getElementById("saudacaoPerfil")
        .textContent.replace("Olá, ", ""),
    };

    exportacoes.unshift(novo);
    renderizarTabela();
    btn.disabled = false;
    btn.lastChild.textContent = " Exportar para PDF";

    const msg = document.getElementById("msgExportarRh");
    msg.textContent = `Relatório "${novo.arquivo}" gerado com sucesso.`;
    setTimeout(() => (msg.textContent = ""), 3000);
  });

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELAS CHAMADAS REAIS:
       const [modulo, setores, colaboradores, lista] = await Promise.all([
         fetch("/api/modulos/exportacao").then(r => r.json()),      // { ativo: true }
         fetch("/api/setores").then(r => r.json()),
         fetch("/api/rh/colaboradores").then(r => r.json()),
         fetch("/api/rh/relatorios?limite=10").then(r => r.json())
       ]); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    const modulo = { ativo: true }; // troque para false para ver o módulo desativado
    const setores = [
      { id: "financeiro", nome: "Financeiro" },
      { id: "ti", nome: "Tecnologia" },
      { id: "comercial", nome: "Comercial" },
    ];
    const colaboradores = [
      { id: 1, nome: "Emily Mirian" },
      { id: 2, nome: "Lucas Andrade" },
      { id: 3, nome: "Rafael Costa" },
      { id: 4, nome: "Ana Beatriz" },
    ];
    exportacoes = [
      {
        id: "rh-03",
        arquivo: "relatorio_financeiro_08-2026.pdf",
        geradoEm: "01/09/2026 09:30",
        geradoPor: "Gestor RH",
      },
      {
        id: "rh-02",
        arquivo: "relatorio_todos_os_colaboradores_08-2026.pdf",
        geradoEm: "01/09/2026 09:05",
        geradoPor: "Gestor RH",
      },
      {
        id: "rh-01",
        arquivo: "relatorio_emily_mirian_07-2026.pdf",
        geradoEm: "02/08/2026 15:22",
        geradoPor: "Administrador",
      },
    ];

    preencherAlvos(setores, colaboradores);
    preencherMeses();
    renderizarTabela();

    if (!modulo.ativo) {
      document
        .getElementById("avisoExportarDesativado")
        .classList.remove("oculto");
      form.classList.add("oculto");
    }
  }

  carregar();
})();
/* =========================================================
   15. TELA: AUDITORIA DE PONTO (Figura 14)
   ========================================================= */
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
    sistema: { classe: "autor-sistema" },
  };
  const EVENTOS = {
    edicao_ponto: { texto: "Edição de ponto", badge: "badge-atencao" },
    atestado: { texto: "Aprovação de atestado", badge: "badge-normal" },
    bloqueio: { texto: "Bloqueio de acesso", badge: "badge-critico" },
    cadastro: { texto: "Cadastro de usuário", badge: "badge-info" },
    importacao: { texto: "Importação de planilha", badge: "badge-info" },
  };

  let logs = [];

  function formatarData(d) {
    return d.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  /* ---------- Tabela ---------- */
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

  /* ---------- Filtrar ---------- */
  async function aplicarFiltros() {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL (o filtro é feito no SERVIDOR):
       const params = new URLSearchParams({ periodo: periodo.value, ator: ator.value, tipo: evento.value });
       const lista = await fetch(`/api/rh/auditoria?${params}`).then(r => r.json());
       // datas chegam como texto ISO → converter com new Date(l.data)
       renderizar(lista); */

    // [PROTÓTIPO] Filtra os dados fictícios no navegador. REMOVER depois.
    const agora = new Date();
    const inicio = new Date(agora);
    if (periodo.value === "hoje") inicio.setHours(0, 0, 0, 0);
    else inicio.setDate(agora.getDate() - Number(periodo.value));

    renderizar(
      logs.filter(
        (l) =>
          l.data >= inicio &&
          (ator.value === "todos" || l.ator === ator.value) &&
          (evento.value === "todos" || l.tipo === evento.value),
      ),
    );
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    aplicarFiltros();
  });
  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    periodo.value = "7";
    ator.value = "todos";
    evento.value = "todos";
    aplicarFiltros();
  });

  /* ---------- Carregar ---------- */
  function diasAtras(dias, hora) {
    const d = new Date();
    d.setDate(d.getDate() - dias);
    const [h, m] = hora.split(":");
    d.setHours(h, m, 0, 0);
    return d;
  }

  // [PROTÓTIPO] Logs fictícios (datas relativas a hoje, para o filtro funcionar). REMOVER depois.
  logs = [
    {
      data: diasAtras(0, "09:14"),
      ator: "rh",
      autor: "Gestor RH",
      tipo: "edicao_ponto",
      detalhe:
        "Saída de <strong>Emily Mirian</strong> em 10/09: <strong>--:--</strong> → <strong>14:00</strong>. Justificativa: esquecimento de registro.",
    },
    {
      data: diasAtras(1, "17:40"),
      ator: "sistema",
      autor: "Sistema",
      tipo: "bloqueio",
      detalhe:
        "Batida de <strong>Rafael Costa</strong> recusada: limite de jornada do Jovem Aprendiz atingido.",
    },
    {
      data: diasAtras(2, "10:05"),
      ator: "rh",
      autor: "Gestor RH",
      tipo: "atestado",
      detalhe:
        "Atestado de <strong>Lucas Andrade</strong> (11/09 a 12/09) aprovado.",
    },
    {
      data: diasAtras(4, "08:30"),
      ator: "admin",
      autor: "Administrador",
      tipo: "cadastro",
      detalhe:
        "Novo colaborador <strong>Ana Beatriz</strong> cadastrado como CLT 8h.",
    },
    {
      data: diasAtras(12, "09:12"),
      ator: "rh",
      autor: "Gestor RH",
      tipo: "importacao",
      detalhe:
        "Arquivo <strong>registros_agosto_2026.csv</strong> importado (1.240 linhas).",
    },
    {
      data: diasAtras(25, "16:22"),
      ator: "rh",
      autor: "Gestor RH",
      tipo: "edicao_ponto",
      detalhe:
        "Entrada de <strong>Ana Beatriz</strong>: <strong>08:42</strong> → <strong>08:00</strong>. Justificativa: falha no relógio.",
    },
  ];

  aplicarFiltros();
})();
/* =========================================================
   15. TELA: CONFIGURAÇÕES DO RH (Figura 15)
   ========================================================= */
(function telaConfiguracoesRh() {
  const card = document.getElementById("cardDadosGestor");
  if (!card) return;

  const NIVEIS = { rh: "Gestor RH", admin: "Administrador" };

  /* ---------- Carregar dados e preferências ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELAS CHAMADAS REAIS:
       const [me, prefs] = await Promise.all([
         fetch("/api/me").then(r => r.json()),
         fetch("/api/me/preferencias").then(r => r.json())
       ]); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    const perfil = sessionStorage.getItem("perfil") || "rh";
    const me = {
      nome:
        perfil === "admin"
          ? "Administrador do Sistema"
          : "Gestor de RH Exemplo",
      email: perfil === "admin" ? "admin@empresa.com" : "rh@empresa.com",
      perfil,
    };
    const prefs = {
      alertaEstagiario: true,
      alertaAtestado: true,
      resumoPendencias: true,
      formatoExportacao: "pdf",
    };

    document.getElementById("gestorNome").textContent = me.nome;
    document.getElementById("gestorEmail").textContent = me.email;
    document.getElementById("gestorNivel").textContent =
      NIVEIS[me.perfil] || me.perfil;

    document.querySelectorAll("[data-pref-rh]").forEach((el) => {
      const chave = el.dataset.prefRh;
      if (el.type === "checkbox") el.checked = !!prefs[chave];
      else el.value = prefs[chave];
    });
  }

  /* ---------- Salvar preferências (toggle ou select) ---------- */
  document.querySelectorAll("[data-pref-rh]").forEach((el) => {
    el.addEventListener("change", async () => {
      const valor = el.type === "checkbox" ? el.checked : el.value;
      /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
         await fetch("/api/me/preferencias", {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ [el.dataset.prefRh]: valor })
         });
         Em caso de erro, desfazer a mudança no campo. */

      const msg = document.getElementById("msgPrefRh");
      msg.textContent = "Preferência salva.";
      setTimeout(() => (msg.textContent = ""), 1800);
    });
  });

  /* ---------- Modal: Alterar Senha ---------- */
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
    form.reset();
    CAMPOS.forEach(([c, e]) => mostrarErro(c, e, ""));
    document.getElementById("erroSenhaRhGeral").textContent = "";
    btnSalvar.disabled = false;
    btnSalvar.textContent = "Salvar";
    modal.querySelectorAll("input").forEach((i) => (i.type = "password"));
    modal
      .querySelectorAll(".btn-olho")
      .forEach((b) => b.classList.remove("visivel"));
    modal.classList.remove("oculto");
    document.body.classList.add("com-modal");
    atual.focus();
  }

  function fechar() {
    modal.classList.add("oculto");
    document.body.classList.remove("com-modal");
  }

  document.getElementById("btnAbrirSenhaRh").addEventListener("click", abrir);
  document.getElementById("btnFecharSenhaRh").addEventListener("click", fechar);
  document
    .getElementById("btnCancelarSenhaRh")
    .addEventListener("click", fechar);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("oculto")) fechar();
  });

  // Mostrar / esconder senha (olho)
  modal.querySelectorAll(".btn-olho").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.alvo);
      const mostrar = input.type === "password";
      input.type = mostrar ? "text" : "password";
      btn.classList.toggle("visivel", mostrar);
      btn.setAttribute(
        "aria-label",
        mostrar ? "Esconder senha" : "Mostrar senha",
      );
    });
  });

  function validar() {
    let ok = true;
    if (!atual.value) {
      mostrarErro(
        "campoSenhaAtualRh",
        "erroSenhaAtualRh",
        "Informe a senha atual.",
      );
      ok = false;
    } else mostrarErro("campoSenhaAtualRh", "erroSenhaAtualRh", "");

    // [BACKEND] A regra de senha forte também deve ser validada no servidor (Fig. 17)
    if (nova.value.length < 8) {
      mostrarErro(
        "campoNovaSenhaRh",
        "erroNovaSenhaRh",
        "A nova senha deve ter no mínimo 8 caracteres.",
      );
      ok = false;
    } else if (nova.value === atual.value) {
      mostrarErro(
        "campoNovaSenhaRh",
        "erroNovaSenhaRh",
        "A nova senha deve ser diferente da atual.",
      );
      ok = false;
    } else mostrarErro("campoNovaSenhaRh", "erroNovaSenhaRh", "");

    if (!confirmar.value || confirmar.value !== nova.value) {
      mostrarErro(
        "campoConfirmarSenhaRh",
        "erroConfirmarSenhaRh",
        "As senhas não conferem.",
      );
      ok = false;
    } else mostrarErro("campoConfirmarSenhaRh", "erroConfirmarSenhaRh", "");
    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("erroSenhaRhGeral").textContent = "";
    if (!validar()) return;

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch("/api/me/senha", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ senhaAtual: atual.value, novaSenha: nova.value })
       });
       if (resposta.status === 401) {
         mostrarErro("campoSenhaAtualRh", "erroSenhaAtualRh", "Senha atual incorreta.");
         btnSalvar.disabled = false; btnSalvar.textContent = "Salvar";
         return;
       } */

    // [PROTÓTIPO] Simula sucesso. REMOVER depois.
    fechar();
    const msg = document.getElementById("msgSenhaRh");
    msg.textContent = "Senha alterada com sucesso.";
    setTimeout(() => (msg.textContent = ""), 2500);
  });

  carregar();
})();
/* =========================================================
   15. TELA: VISÃO GLOBAL DO ADMIN (Figura 16)
   ========================================================= */
(function telaVisaoGlobal() {
  const cardModulos = document.getElementById("cardModulos");
  if (!cardModulos) return;

  const tabela = document.getElementById("tabelaAuditoriaRecente");
  const msg = document.getElementById("msgModulos");

  // Cor do selo de cada tipo de usuário
  const BADGE_USUARIO = {
    "Gestor RH": "badge-info",
    Sistema: "badge-sistema",
    Administrador: "badge-admin",
  };

  function avisar(texto) {
    msg.textContent = texto;
    setTimeout(() => (msg.textContent = ""), 2500);
  }

  /* ---------- Módulos ---------- */
  function aplicarModulos(modulos) {
    document.querySelectorAll("[data-modulo]").forEach((chk) => {
      chk.checked = !!modulos[chk.dataset.modulo];
      chk.closest(".toggle-linha").classList.toggle("desligado", !chk.checked);
    });
  }

  document.querySelectorAll("[data-modulo]").forEach((chk) => {
    chk.addEventListener("change", async () => {
      const nome = chk.dataset.nome;

      // Desligar um módulo afeta o RH, então pede confirmação
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

      /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
         const resposta = await fetch(`/api/modulos/${chk.dataset.modulo}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ ativo: chk.checked })
         });
         if (!resposta.ok) {
           chk.checked = !chk.checked;   // volta o toggle
           avisar("Não foi possível alterar o módulo.");
           chk.disabled = false;
           return;
         } */

      chk.disabled = false;
      chk.closest(".toggle-linha").classList.toggle("desligado", !chk.checked);
      avisar(`Módulo "${nome}" ${chk.checked ? "ativado" : "desativado"}.`);
    });
  });

  /* ---------- Auditoria recente ---------- */
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

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELAS CHAMADAS REAIS:
       const [modulos, auditoria] = await Promise.all([
         fetch("/api/modulos").then(r => r.json()),
         fetch("/api/auditoria?limite=5").then(r => r.json())
       ]); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    const modulos = { importacao: true, exportacao: true, edicaoPonto: true };
    const auditoria = [
      {
        usuario: "Gestor RH",
        acao: "Edição manual de ponto (Emily Mirian)",
        dataHora: "13/09/2026 10:42",
      },
      {
        usuario: "Sistema",
        acao: "Débito de falta injustificada",
        dataHora: "13/09/2026 00:05",
      },
      {
        usuario: "Gestor RH",
        acao: "Aprovação de atestado médico",
        dataHora: "12/09/2026 16:18",
      },
      {
        usuario: "Administrador",
        acao: "Alteração de regra (Regime de Estágio)",
        dataHora: "12/09/2026 09:30",
      },
      {
        usuario: "Sistema",
        acao: "Bloqueio de acesso após 5 tentativas",
        dataHora: "11/09/2026 22:14",
      },
    ];

    aplicarModulos(modulos);
    renderizarAuditoria(auditoria);
  }

  carregar();
})();
/* =========================================================
   TELA: CONFIGURAÇÕES GLOBAIS DO ADMIN (Figura 17)
   ========================================================= */
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

  /* ---------- Políticas de Segurança ---------- */
  formSeguranca.addEventListener("submit", async (e) => {
    e.preventDefault();
    const minutos = Number(expiracao.value);

    if (!Number.isInteger(minutos) || minutos < 5 || minutos > 480) {
      mostrarErro(
        "campoExpiracao",
        "erroExpiracao",
        "Informe um valor entre 5 e 480 minutos.",
      );
      return;
    }
    mostrarErro("campoExpiracao", "erroExpiracao", "");

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       await fetch("/api/config/seguranca", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ expiracaoSessao: minutos, senhaForte: senhaForte.checked })
       });
       Registrar a alteração na Auditoria de Logs (Fig. 22). */

    avisar("msgSeguranca", "Políticas de segurança salvas.");
  });

  /* ---------- Ativação de Módulos (salva a cada clique) ---------- */
  document.querySelectorAll("[data-config-modulo]").forEach((chk) => {
    chk.addEventListener("change", async () => {
      const nome = chk.dataset.nome;
      if (!chk.checked && !confirm(`Desativar "${nome}"?`)) {
        chk.checked = true;
        return;
      }

      /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL (mesma rota da Visão Global):
         const resposta = await fetch(`/api/modulos/${chk.dataset.configModulo}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ ativo: chk.checked })
         });
         if (!resposta.ok) { chk.checked = !chk.checked; avisar("msgModulosGlobais", "Não foi possível alterar."); return; } */

      chk.closest(".toggle-linha").classList.toggle("desligado", !chk.checked);
      avisar(
        "msgModulosGlobais",
        `"${nome}" ${chk.checked ? "ativado" : "desativado"}.`,
      );
    });
  });

  /* ---------- Backup ---------- */
  frequencia.addEventListener("change", async () => {
    /* [BACKEND] PUT /api/config/backup { frequencia: frequencia.value } */
    avisar(
      "msgBackup",
      `Frequência de backup alterada: ${frequencia.options[frequencia.selectedIndex].text}.`,
    );
  });

  document.getElementById("btnExportarLog").addEventListener("click", () => {
    /* [BACKEND] window.location.href = "/api/config/backup/log"; */
    // [PROTÓTIPO] REMOVER depois
    alert("[Protótipo] O download do log será feito pelo back-end.");
  });

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELAS CHAMADAS REAIS:
       const [seguranca, modulos, backup] = await Promise.all([
         fetch("/api/config/seguranca").then(r => r.json()),
         fetch("/api/modulos").then(r => r.json()),
         fetch("/api/config/backup").then(r => r.json())
       ]); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    const seguranca = { expiracaoSessao: 30, senhaForte: true };
    const modulos = { importacao: true, alertasJornada: true };
    const backup = { frequencia: "6h", ultimoBackup: "13/09/2026 06:00" };

    expiracao.value = seguranca.expiracaoSessao;
    senhaForte.checked = seguranca.senhaForte;

    document.querySelectorAll("[data-config-modulo]").forEach((chk) => {
      chk.checked = !!modulos[chk.dataset.configModulo];
      chk.closest(".toggle-linha").classList.toggle("desligado", !chk.checked);
    });

    frequencia.value = backup.frequencia;
    document.getElementById("ultimoBackup").textContent = backup.ultimoBackup;
  }

  carregar();
})();
/* =========================================================
   16. TELA: PERMISSÕES DE ACESSO (Figura 18)
   ========================================================= */
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
  let original = {}; // estado salvo:  { "importacao|rh": true, ... }
  let atual = {}; // estado na tela

  /* ---------- Desenho de cada célula ---------- */
  // Obs.: usa data-funcao / data-papel (NÃO usar data-perfil, que é do controle do menu)
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

  /* ---------- Controle de alterações não salvas ---------- */
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

    // Destaca as células alteradas
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

  // Avisa antes de sair da página com alterações não salvas
  window.addEventListener("beforeunload", (e) => {
    if (alteracoes().length) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  /* ---------- Descartar ---------- */
  btnDescartar.addEventListener("click", () => {
    atual = { ...original };
    tabela.querySelectorAll("[data-funcao]").forEach((chk) => {
      chk.checked = original[`${chk.dataset.funcao}|${chk.dataset.papel}`];
    });
    atualizarEstado();
  });

  /* ---------- Salvar ---------- */
  btnSalvar.addEventListener("click", async () => {
    const lista = alteracoes();
    if (!lista.length) return;

    // Retirar acesso do RH pede confirmação
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

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch("/api/permissoes", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(lista)
       });
       if (!resposta.ok) {
         document.getElementById("erroPermissoes").textContent = "Não foi possível salvar as permissões.";
         atualizarEstado();
         return;
       } */

    // [PROTÓTIPO] Simula sucesso. REMOVER depois.
    original = { ...atual };
    atualizarEstado();
    const msg = document.getElementById("msgPermissoes");
    msg.textContent = `${lista.length} ${lista.length === 1 ? "permissão atualizada" : "permissões atualizadas"} com sucesso.`;
    setTimeout(() => (msg.textContent = ""), 3000);
  });

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       funcoes = await fetch("/api/permissoes").then(r => r.json()); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    funcoes = [
      {
        id: "registrar_ponto",
        nome: "Registrar Ponto Diário",
        descricao: "Bater o próprio ponto",
        perfis: {
          funcionario: { tipo: "fixo" },
          rh: { tipo: "fixo" },
          admin: { tipo: "fixo" },
        },
      },
      {
        id: "aprovar_atestados",
        nome: "Aprovação de Atestados Médicos",
        descricao: "Aprovar ou recusar atestados enviados",
        perfis: {
          funcionario: { tipo: "na" },
          rh: { tipo: "editavel", ativo: true },
          admin: { tipo: "fixo" },
        },
      },
      {
        id: "editar_ponto",
        nome: "Edição de Ponto",
        descricao: "Ajustar batidas pela tela de Pendências",
        perfis: {
          funcionario: { tipo: "bloqueado" },
          rh: { tipo: "editavel", ativo: true },
          admin: { tipo: "fixo" },
        },
      },
      {
        id: "importacao",
        nome: "Importação de Planilhas (CSV)",
        descricao: "Importar registros antigos de jornada",
        perfis: {
          funcionario: { tipo: "bloqueado" },
          rh: { tipo: "editavel", ativo: true },
          admin: { tipo: "fixo" },
        },
      },
      {
        id: "exportacao",
        nome: "Exportação de Relatórios (PDF)",
        descricao: "Gerar relatórios analíticos consolidados",
        perfis: {
          funcionario: { tipo: "bloqueado" },
          rh: { tipo: "editavel", ativo: true },
          admin: { tipo: "fixo" },
        },
      },
      {
        id: "config_globais",
        nome: "Configurações Globais",
        descricao: "Segurança, módulos e backups do sistema",
        perfis: {
          funcionario: { tipo: "bloqueado" },
          rh: { tipo: "bloqueado" },
          admin: { tipo: "fixo" },
        },
      },
    ];

    // Guarda o estado inicial só das células configuráveis
    original = {};
    funcoes.forEach((f) =>
      PERFIS.forEach((p) => {
        if (f.perfis[p].tipo === "editavel")
          original[`${f.id}|${p}`] = !!f.perfis[p].ativo;
      }),
    );
    atual = { ...original };

    renderizar();
    atualizarEstado();
  }

  carregar();
})();
/* =========================================================
   FIG. 19 — GESTÃO DE USUÁRIOS (Admin)
   ========================================================= */
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
  const VINCULOS = {
    clt_8h: "CLT 8h",
    estagio_6h: "Estágio 6h",
    estagio_4h: "Estágio 4h",
    jovem_aprendiz: "Jovem Aprendiz",
  };

  let usuarios = [];
  let editandoId = null;

  // Evita que nomes vindos do banco quebrem o HTML da tabela
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

  /* ---------- Tabela ---------- */
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
          <td><span class="badge ${PERFIS[u.perfil].badge}">${PERFIS[u.perfil].texto}</span></td>
          <td>${VINCULOS[u.vinculo] || esc(u.vinculo)}</td>
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
      .getElementById("notaConvite")
      .classList.toggle("oculto", !!usuario);
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

  /* ---------- Validação ---------- */
  function validar() {
    let ok = true;
    const nome = campos.nome.value.trim();
    const email = campos.email.value.trim().toLowerCase();

    if (nome.length < 3) {
      mostrarErro(
        "campoUsuarioNome",
        "erroUsuarioNome",
        "Informe o nome completo.",
      );
      ok = false;
    } else mostrarErro("campoUsuarioNome", "erroUsuarioNome", "");

    // [BACKEND] A duplicidade de e-mail também deve ser validada no servidor (409)
    const duplicado = usuarios.some(
      (u) => u.email.toLowerCase() === email && u.id !== editandoId,
    );
    if (!emailValido(email)) {
      mostrarErro("campoUsuarioEmail", "erroUsuarioEmail", "E-mail inválido.");
      ok = false;
    } else if (duplicado) {
      mostrarErro(
        "campoUsuarioEmail",
        "erroUsuarioEmail",
        "Este e-mail já está cadastrado.",
      );
      ok = false;
    } else mostrarErro("campoUsuarioEmail", "erroUsuarioEmail", "");

    [
      [
        "departamento",
        "campoUsuarioDepto",
        "erroUsuarioDepto",
        "Selecione o departamento.",
      ],
      [
        "perfil",
        "campoUsuarioPerfil",
        "erroUsuarioPerfil",
        "Selecione o perfil de acesso.",
      ],
      [
        "vinculo",
        "campoUsuarioVinculo",
        "erroUsuarioVinculo",
        "Selecione o vínculo contratual.",
      ],
    ].forEach(([chave, c, e, texto]) => {
      if (!campos[chave].value) {
        mostrarErro(c, e, texto);
        ok = false;
      } else mostrarErro(c, e, "");
    });

    return ok;
  }

  /* ---------- Salvar ---------- */
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

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch(
         editandoId ? `/api/admin/usuarios/${editandoId}` : "/api/admin/usuarios",
         { method: editandoId ? "PUT" : "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(dados) });
       if (!resposta.ok) {
         document.getElementById("erroUsuarioGeral").textContent =
           resposta.status === 409 ? "Este e-mail já está cadastrado." : "Não foi possível salvar.";
         btnSalvar.disabled = false; btnSalvar.textContent = "Salvar";
         return;
       }
       const salvo = await resposta.json();   // usuário com o id gerado pelo banco */

    // [PROTÓTIPO] Atualiza a lista local. REMOVER depois.
    const eraEdicao = !!editandoId;
    if (eraEdicao) {
      usuarios = usuarios.map((u) =>
        u.id === editandoId ? { ...u, ...dados } : u,
      );
    } else {
      usuarios.unshift({ id: Date.now(), ...dados });
    }

    renderizar();
    fechar();
    avisar(
      eraEdicao
        ? `Dados de ${dados.nome} atualizados.`
        : `${dados.nome} adicionado(a). Convite enviado por e-mail.`,
    );
  });

  /* ---------- Remover ---------- */
  btnRemover.addEventListener("click", async () => {
    const u = usuarios.find((x) => x.id === editandoId);
    if (
      !u ||
      !confirm(`Remover ${u.nome} do sistema? O acesso será bloqueado.`)
    )
      return;

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       await fetch(`/api/admin/usuarios/${u.id}`, { method: "DELETE" });
       Recomendação: DESATIVAR o usuário em vez de apagar, para manter o histórico
       de ponto e a auditoria. */

    // [PROTÓTIPO] REMOVER depois
    usuarios = usuarios.filter((x) => x.id !== u.id);
    renderizar();
    fechar();
    avisar(`${u.nome} removido(a).`);
  });

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELAS CHAMADAS REAIS:
       const [setores, lista] = await Promise.all([
         fetch("/api/setores").then(r => r.json()),
         fetch("/api/admin/usuarios").then(r => r.json())
       ]); */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    const setores = [
      "Financeiro",
      "Tecnologia",
      "Comercial",
      "Recursos Humanos",
    ];
    usuarios = [
      {
        id: 1,
        nome: "Emily Mirian",
        email: "emily.mirian@empresa.com",
        departamento: "Financeiro",
        perfil: "funcionario",
        vinculo: "estagio_6h",
      },
      {
        id: 2,
        nome: "Lucas Andrade",
        email: "lucas.andrade@empresa.com",
        departamento: "Tecnologia",
        perfil: "funcionario",
        vinculo: "clt_8h",
      },
      {
        id: 3,
        nome: "Rafael Costa",
        email: "rafael.costa@empresa.com",
        departamento: "Comercial",
        perfil: "funcionario",
        vinculo: "jovem_aprendiz",
      },
      {
        id: 4,
        nome: "Carla Mendes",
        email: "carla.mendes@empresa.com",
        departamento: "Recursos Humanos",
        perfil: "rh",
        vinculo: "clt_8h",
      },
      {
        id: 5,
        nome: "Administrador",
        email: "admin@empresa.com",
        departamento: "Tecnologia",
        perfil: "admin",
        vinculo: "clt_8h",
      },
    ];

    campos.departamento.insertAdjacentHTML(
      "beforeend",
      setores
        .map((s) => `<option value="${esc(s)}">${esc(s)}</option>`)
        .join(""),
    );
    renderizar();

    // Atalho "Novo Colaborador" da Visão Global (usuarios.html#novo)
    if (location.hash === "#novo") abrir(null);
  }

  carregar();
})();
/* =========================================================
   TELA: REGRAS E CONTRATOS (Figura 20)
   ========================================================= */
(function telaRegras() {
  const grade = document.getElementById("gradeRegras");
  if (!grade) return; // não está na tela de regras

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

  /* ---------- Utilitários ---------- */
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

  /* ---------- Cards ---------- */
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

  /* ---------- Toggle de banco de horas direto no card ---------- */
  grade.addEventListener("change", async (e) => {
    const chk = e.target.closest("[data-banco]");
    if (!chk) return;
    const r = regras.find((x) => x.id === chk.dataset.banco);
    chk.disabled = true;

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch(`/api/regras/${r.id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ bancoHoras: chk.checked })
       });
       if (!resposta.ok) { chk.checked = !chk.checked; chk.disabled = false; avisar("Não foi possível salvar."); return; } */

    r.bancoHoras = chk.checked;
    chk.disabled = false;
    avisar(
      `Banco de horas ${chk.checked ? "permitido" : "desativado"} em "${r.nome}".`,
    );
  });

  /* ---------- Botão Editar Regra ---------- */
  grade.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-editar]");
    if (btn) abrir(regras.find((x) => x.id === btn.dataset.editar));
  });

  document
    .getElementById("btnNovaRegra")
    .addEventListener("click", () => abrir(null));

  /* ---------- Modal: abrir / fechar ---------- */
  function sincronizarBanco() {
    // Com hora extra bloqueada, banco de horas positivo não faz sentido
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
    editandoId = r ? r.id : null;
    form.reset();
    limparErros();
    titulo.textContent = r ? "Editar Regra" : "Nova Regra";

    if (r) {
      campos.nome.value = r.nome;
      campos.cargas.value = r.cargasDiarias.join(", ");
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

  /* ---------- Validação ---------- */
  function lerCargas() {
    // Aceita "8", "6, 4" ou "6 ou 4"
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

  /* ---------- Salvar ---------- */
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
    const eraEdicao = !!editandoId;

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const resposta = await fetch(eraEdicao ? `/api/regras/${editandoId}` : "/api/regras", {
         method: eraEdicao ? "PUT" : "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(dados)
       });
       if (!resposta.ok) {
         document.getElementById("erroRegraGeral").textContent = "Não foi possível salvar a regra.";
         btnSalvar.disabled = false; btnSalvar.textContent = "Salvar Regra";
         return;
       }
       const salva = await resposta.json();   // regra com o id definido pelo servidor */

    // [PROTÓTIPO] Atualiza só na tela. REMOVER depois.
    if (eraEdicao)
      Object.assign(
        regras.find((r) => r.id === editandoId),
        dados,
      );
    else regras.push({ id: "regra-" + Date.now(), ...dados });

    renderizar();
    fechar();
    avisar(
      eraEdicao
        ? `Regra "${dados.nome}" atualizada.`
        : `Regra "${dados.nome}" criada.`,
    );
  });

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       regras = await fetch("/api/regras").then(r => r.json()); */

    // [PROTÓTIPO] Dados fictícios baseados na Fig. 20. REMOVER depois.
    regras = [
      {
        id: "clt",
        nome: "Regime CLT (Efetivos)",
        cargasDiarias: [8],
        limiteSemanal: 44,
        toleranciaMin: 10,
        bancoHoras: true,
        bloqueioHoraExtra: false,
      },
      {
        id: "estagio",
        nome: "Regime de Estágio",
        cargasDiarias: [6, 4],
        limiteSemanal: 30,
        toleranciaMin: 5,
        bancoHoras: false,
        bloqueioHoraExtra: true,
      },
      {
        id: "jovem",
        nome: "Jovem Aprendiz",
        cargasDiarias: [6],
        limiteSemanal: 30,
        toleranciaMin: 5,
        bancoHoras: false,
        bloqueioHoraExtra: true,
      },
    ];
    renderizar();
  }

  carregar();
})();
/* =========================================================
   16. TELA: CALENDÁRIO E FERIADOS (Figura 21)
   ========================================================= */
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

  /* ---------- Funções de data ---------- */
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

  /* ---------- Calendário ---------- */
  function renderizarCalendario() {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    document.getElementById("tituloMes").textContent = maiuscula(
      mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    );

    const primeiroDia = new Date(ano, mes, 1).getDay(); // 0 = domingo
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

  /* ---------- Tabela (feriados do ano exibido) ---------- */
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

  /* ---------- Navegação entre meses ---------- */
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

  /* ---------- Modal ---------- */
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

  // Clique em um dia: dia com feriado → editar | dia livre → cadastrar já com a data
  grade.addEventListener("click", (e) => {
    const dia = e.target.closest(".dia[data-data]");
    if (!dia) return;
    const f = feriados.find((x) => x.data === dia.dataset.data);
    f ? abrirModal(f) : abrirModal(null, dia.dataset.data);
  });

  // Botão "Editar" da tabela
  tabela.addEventListener("click", (e) => {
    const b = e.target.closest("[data-editar]");
    if (!b) return;
    abrirModal(feriados.find((x) => String(x.id) === b.dataset.editar));
  });

  /* ---------- Validação ---------- */
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

  /* ---------- Salvar ---------- */
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

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       const url = eraEdicao ? `/api/feriados/${editandoId}` : "/api/feriados";
       const resposta = await fetch(url, {
         method: eraEdicao ? "PUT" : "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(dados)
       });
       if (!resposta.ok) {
         document.getElementById("erroFeriadoGeral").textContent =
           resposta.status === 409 ? "Já existe um feriado nesta data." : "Não foi possível salvar.";
         btnSalvar.disabled = false; btnSalvar.textContent = "Salvar";
         return;
       }
       const salvo = await resposta.json();   // { id, data, descricao, tipo } */

    // [PROTÓTIPO] Atualiza só na tela. REMOVER depois.
    if (eraEdicao)
      Object.assign(
        feriados.find((x) => x.id === editandoId),
        dados,
      );
    else feriados.push({ id: Date.now(), ...dados });

    // Mostra o mês do feriado salvo
    const d = deISO(dados.data);
    mesAtual = new Date(d.getFullYear(), d.getMonth(), 1);

    fecharModal();
    renderizar();
    avisar(
      `Feriado "${dados.descricao}" ${eraEdicao ? "atualizado" : "cadastrado"}.`,
    );
  });

  /* ---------- Excluir ---------- */
  btnExcluir.addEventListener("click", async () => {
    const f = feriados.find((x) => x.id === editandoId);
    if (
      !f ||
      !confirm(
        `Excluir o feriado "${f.descricao}"? O dia volta a contar como dia útil.`,
      )
    )
      return;

    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       await fetch(`/api/feriados/${f.id}`, { method: "DELETE" }); */

    feriados = feriados.filter((x) => x.id !== f.id);
    fecharModal();
    renderizar();
    avisar(`Feriado "${f.descricao}" excluído.`);
  });

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       feriados = await fetch(`/api/feriados?ano=${mesAtual.getFullYear()}`).then(r => r.json());
       Ao trocar de ano na navegação, buscar novamente os feriados daquele ano. */

    // [PROTÓTIPO] Dados de exemplo. REMOVER depois.
    feriados = [
      {
        id: 1,
        data: "2026-09-07",
        descricao: "Dia da Independência",
        tipo: "nacional",
      },
      {
        id: 2,
        data: "2026-10-12",
        descricao: "Nossa Sra. Aparecida",
        tipo: "nacional",
      },
      { id: 3, data: "2026-11-02", descricao: "Finados", tipo: "nacional" },
      {
        id: 4,
        data: "2026-11-15",
        descricao: "Proclamação da República",
        tipo: "nacional",
      },
      {
        id: 5,
        data: "2026-11-20",
        descricao: "Dia da Consciência Negra",
        tipo: "nacional",
      },
      {
        id: 6,
        data: "2026-12-24",
        descricao: "Véspera de Natal (recesso)",
        tipo: "dispensa",
      },
      { id: 7, data: "2026-12-25", descricao: "Natal", tipo: "nacional" },
    ];

    renderizar();

    // Atalho "Cadastrar Feriado" da Visão Global (calendario.html#novo)
    if (location.hash === "#novo") abrirModal(null);
  }

  carregar();
})();
/* =========================================================
   16. TELA: AUDITORIA DE LOGS DO ADMIN (Figura 22)
   ========================================================= */
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
    sistema: { texto: "Sistema", badge: "badge-sistema" },
  };

  // Evita que textos vindos do banco quebrem o HTML
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

  /* ---------- Filtros ---------- */
  function filtrados() {
    // [PROTÓTIPO] Filtra no navegador. [BACKEND] Na versão final, quem filtra é o servidor.
    return logs.filter(
      (l) =>
        (!filtroData.value || l.dataHora.slice(0, 10) === filtroData.value) &&
        (filtroUsuario.value === "todos" ||
          l.usuario === filtroUsuario.value) &&
        (filtroNivel.value === "todos" || l.nivel === filtroNivel.value),
    );
  }

  /* ---------- Tabela ---------- */
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
        const n = NIVEIS[l.nivel];
        const u = USUARIOS[l.usuario];
        return `
          <tr class="${l.nivel === "alta" ? "linha-critica" : ""}">
            <td class="log-data">${formatarData(l.dataHora)}</td>
            <td>
              <div class="log-usuario">
                <span class="nivel-icone ${n.classe}" title="Criticidade ${n.texto}">${n.icone}</span>
                <span class="badge ${u.badge}">${u.texto}</span>
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
      // [BACKEND] Buscar de novo com os filtros: carregar();
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

  /* ---------- Exportar ---------- */
  document.getElementById("btnExportarLogs").addEventListener("click", () => {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL (o servidor exporta TODOS os registros do filtro):
       const params = new URLSearchParams({
         data: filtroData.value, usuario: filtroUsuario.value, nivel: filtroNivel.value
       });
       window.location.href = `/api/auditoria/exportar?${params}`;
       A exportação também deve ser registrada na própria auditoria. */

    // [PROTÓTIPO] Gera um CSV com os registros visíveis. REMOVER depois.
    const linhas = [
      ["Data/Hora", "Usuário", "Criticidade", "Ação", "Módulo", "Detalhes"],
    ];
    filtrados().forEach((l) =>
      linhas.push([
        formatarData(l.dataHora),
        USUARIOS[l.usuario].texto,
        NIVEIS[l.nivel].texto,
        l.acao,
        l.modulo,
        l.detalhes,
      ]),
    );
    const csv = linhas
      .map((c) => c.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `logs_auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  /* ---------- Carregar ---------- */
  async function carregar() {
    /* [BACKEND] SUBSTITUIR PELA CHAMADA REAL:
       logs = await fetch("/api/auditoria?pagina=1").then(r => r.json());
       // [{ dataHora: "2026-09-13T10:42", usuario: "rh", nivel: "media",
       //    acao: "...", modulo: "...", detalhes: "..." }] */

    // [PROTÓTIPO] Dados fictícios. REMOVER depois.
    logs = [
      {
        dataHora: "2026-09-13T10:42",
        usuario: "rh",
        nivel: "media",
        acao: "Edição Manual de Ponto",
        modulo: "Pendências",
        detalhes: "colaborador_id=1 | tipo=saida | null → 14:00",
      },
      {
        dataHora: "2026-09-13T00:05",
        usuario: "sistema",
        nivel: "alta",
        acao: "Débito de Falta Injustificada",
        modulo: "Jornada",
        detalhes: "colaborador_id=3 | data=2026-09-12 | debito=6h",
      },
      {
        dataHora: "2026-09-12T16:18",
        usuario: "rh",
        nivel: "baixa",
        acao: "Aprovação de Atestado Médico",
        modulo: "Pendências",
        detalhes: "atestado_id=27 | dias=2",
      },
      {
        dataHora: "2026-09-12T09:30",
        usuario: "admin",
        nivel: "alta",
        acao: "Alteração de Regra",
        modulo: "Regras e Contratos",
        detalhes: "regra=estagio | bloqueio_hora_extra=true",
      },
      {
        dataHora: "2026-09-11T22:14",
        usuario: "sistema",
        nivel: "alta",
        acao: "Bloqueio de Acesso",
        modulo: "Autenticação",
        detalhes: "usuario_id=8 | tentativas=5",
      },
      {
        dataHora: "2026-09-11T14:02",
        usuario: "admin",
        nivel: "media",
        acao: "Módulo Desativado",
        modulo: "Controle de Módulos",
        detalhes: "modulo=importacao | ativo=false",
      },
      {
        dataHora: "2026-09-10T09:12",
        usuario: "rh",
        nivel: "baixa",
        acao: "Importação de Planilha",
        modulo: "Importar Planilhas",
        detalhes: "arquivo=registros_agosto_2026.csv | linhas=1240",
      },
    ];
    renderizar();
  }

  carregar();
})();
