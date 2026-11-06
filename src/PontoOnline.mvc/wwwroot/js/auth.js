const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const erroGeral = document.getElementById("erroGeral");
    if (erroGeral) erroGeral.textContent = "";

    try {
      const dados = await chamarApi("/auth/login", "POST", {
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value,
      });

      if (typeof salvarSessao === 'function') salvarSessao(dados);

      const perfil = (dados.perfil || "funcionario").toLowerCase();
      localStorage.setItem("perfil", perfil);
      sessionStorage.setItem("perfil", perfil);
      sessionStorage.setItem("usuarioId", dados.usuarioId);
      sessionStorage.setItem("nome", dados.nome);
      localStorage.setItem("usuario", JSON.stringify({
        id: dados.usuarioId,
        usuarioId: dados.usuarioId,
        nome: dados.nome,
        perfil: perfil,
        vinculo: dados.vinculo,
      }));
      
      const paginas = {
        funcionario: "inicio.html",
        rh: "pendencias.html",
        admin: "visao-global.html",
      };
      window.location.href = paginas[perfil] || "inicio.html";

    } catch (e) {
      if (erroGeral) erroGeral.textContent = e.message || "Erro ao conectar com o servidor.";
      console.error("Erro no login:", e);
    }
  });
}

const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
  formCadastro.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const erroGeral = document.getElementById("erroGeral");
    const sucessoGeral = document.getElementById("sucessoGeral");
    if (erroGeral) erroGeral.textContent = "";
    if (sucessoGeral) sucessoGeral.textContent = "";

    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (senha.length < 8) {
      erroGeral.textContent = "A senha precisa ter pelo menos 8 caracteres.";
      return;
    }
    if (senha !== confirmarSenha) {
      erroGeral.textContent = "As senhas não conferem.";
      return;
    }

    const tipo = document.getElementById("tipoContrato").value;
    if (!tipo) {
      erroGeral.textContent = "Selecione o tipo de contrato.";
      return;
    }
    const contratoId = { clt: 1, estagio: 2, jovem_aprendiz: 3 }[tipo];

    try {
      await chamarApi("/auth/registrar", "POST", {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: senha,
        tipoContratoId: contratoId,
      });
      sucessoGeral.textContent = "Conta criada com sucesso! Redirecionando...";
      setTimeout(() => (window.location.href = "login.html"), 1500);
    } catch (e) {
      console.error("Erro no cadastro:", e);
      erroGeral.textContent = e.message || "Erro ao conectar com o servidor.";
    }
  });
}
