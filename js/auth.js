const formLogin = document.getElementById("form-login");
if (formLogin) {
  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const erro = document.getElementById("erro");
    erro.textContent = "";

    try {
      const dados = await chamarApi("/auth/login", "POST", {
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value,
      });

      salvarSessao(dados);

      const paginas = {
        func: "funcionario.html",
        gestor: "gestor.html",
        admin: "admin.html",
      };

      window.location.href = paginas[dados.perfil] || "login.html";
    } catch (e) {
      erro.textContent = e.message;
    }
  });
}

const formCadastro = document.getElementById("form-cadastro");
if (formCadastro) {
  formCadastro.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const erro = document.getElementById("erro");
    const senha = document.getElementById("senha").value;

    if (senha.length < 8) {
      erro.textContent = "A senha precisa ter pelo menos 8 caracteres.";
      return;
    }

    if (senha !== document.getElementById("confirmar-senha").value) {
      erro.textContent = "As senhas não conferem.";
      return;
    }

    try {
      await chamarApi("/auth/register", "POST", {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: senha,
      });

      alert("Conta criada com sucesso! Faça seu login.");
      window.location.href = "login.html";
    } catch (e) {
      erro.textContent = e.message;
    }
  });
}
