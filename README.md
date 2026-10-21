# Sistema de Registro de Presença — Front-end

Front-end em **HTML, CSS e JavaScript puro**, sem frameworks e sem dependências.
Este repositório contém **apenas o front**: não há back-end nem banco de dados.
Todos os pontos que dependem do servidor estão marcados no código e usam **dados fictícios** até a integração.

---

## 1. Como rodar

1. Abra o arquivo `login.html` no navegador. Também funciona com a extensão **Live Server** do VS Code.
2. Faça login com qualquer senha e um e-mail de teste:

| E-mail de teste (exemplo) | Perfil simulado | Página inicial |
|---|---|---|
| `funcionario@empresa.com` | Funcionário | `funcionario/inicio.html` |
| `rh@empresa.com` | Gestor RH | `rh/pendencias.html` |
| `admin@empresa.com` | Administrador | `admin/visao-global.html` |

> A regra do protótipo é: e-mail que contém **"admin"** vira Admin, e-mail que contém **"rh"** vira RH e qualquer outro vira Funcionário. Essa simulação **deve ser removida** na integração (ver seção 6).

---

## 2. Estrutura de pastas

```
/site
 ├── login.html                  Fig. 1  – Login
 ├── cadastro.html               Fig. 2  – Cadastro
 ├── css/
 │    └── style.css              CSS único, dividido em seções numeradas
 ├── js/
 │    └── main.js                JS único, dividido em blocos numerados
 ├── img/                        Imagens (ex.: ilustração do login)
 ├── funcionario/
 │    ├── inicio.html            Fig. 3, 8 e 9 – Dashboard + modal de Atestado (Fig. 6)
 │    ├── ponto.html             Fig. 4  – Registro de ponto
 │    ├── relatorios.html        Fig. 5  – Espelho de ponto e saldo
 │    └── configuracoes.html     Fig. 7  – Conta, senha e notificações
 ├── rh/
 │    ├── pendencias.html        Fig. 10 – Pendências + modal Editar Ponto (Fig. 11)
 │    ├── importar.html          Fig. 12 – Importação CSV/Excel
 │    ├── exportar.html          Fig. 13 – Exportação de relatórios PDF
 │    ├── auditoria.html         Fig. 14 – (pendente)
 │    └── configuracoes.html     Fig. 15 – (pendente)
 └── admin/
      ├── visao-global.html      Fig. 16 – Visão global e controle de módulos
      ├── configuracoes-globais.html  Fig. 17 – (pendente)
      ├── permissoes.html        Fig. 18 – (pendente)
      ├── usuarios.html          Fig. 19 – (pendente)
      ├── regras.html            Fig. 20 – (pendente)
      ├── calendario.html        Fig. 21 – (pendente)
      └── logs.html              Fig. 22 – (pendente)
```

---

## 3. Como o código está organizado

### 3.1 Um CSS e um JS para o sistema inteiro

- **`css/style.css`**: todas as telas usam o mesmo arquivo. Ele começa com as variáveis de cor e os componentes globais (botões, campos, cards, badges, tabela, modal e toggle). Depois vem um bloco por tela.
- **`js/main.js`**: cada tela é um bloco isolado, do tipo `(function telaX() { ... })()`. O bloco começa verificando se um elemento exclusivo daquela tela existe e, se não existir, encerra (`return`). Assim, um bloco nunca interfere em outra tela.

| Seção CSS | Bloco JS | Conteúdo |
|---|---|---|
| 1–3 | 1 | Variáveis, base, componentes globais, estados da jornada / funções compartilhadas |
| 4 | 2 | Login |
| 5 | 3 | Cadastro |
| 6 | 4 | Layout das áreas logadas: menu lateral, cabeçalho, menu do perfil, botão Sair |
| 7 | 5 | Início do Funcionário (Fig. 3, 8 e 9) |
| 8 | 6 | Ponto (Fig. 4) |
| 9 | 7 | Relatórios do Funcionário (Fig. 5) |
| 10 | 8 | Modal Enviar Atestado (Fig. 6) |
| 11 | 9 | Configurações do Funcionário (Fig. 7) |
| 12 | 10 e 11 | Menu RH/Admin + controle de perfil / Pendências (Fig. 10) |
| 13 | 12 | Modal Editar Ponto (Fig. 11) |
| 14 | 13 | Importar Planilhas (Fig. 12) |
| 15 | 14 | Exportar Relatórios do RH (Fig. 13) |
| 16 | 15 | Visão Global do Admin (Fig. 16) |

**Regra para novas telas:** colar o CSS novo no **final** do `style.css` e o JS novo no **final** do `main.js`, com o próximo número de seção.

### 3.2 Caminhos

- Páginas na raiz (`login.html`, `cadastro.html`) usam `css/style.css` e `js/main.js`.
- Páginas dentro de `funcionario/`, `rh/` e `admin/` usam `../css/style.css` e `../js/main.js`.
- Nas subpastas, o CSS é carregado com `@import` dentro de uma tag `style`. Pode ser trocado por uma tag `link` comum, sem efeito no resultado.

### 3.3 Navegação

Os itens de menu são **botões com o atributo `data-ir`**, e não links. O bloco 4 do `main.js` lê esse atributo e faz o redirecionamento.

Exemplo: `data-ir="../rh/importar.html"`.

O modal de Atestado abre pelo endereço `funcionario/inicio.html#atestado`.

### 3.4 Identidade visual

- Todas as cores ficam em variáveis no início do `style.css`, como `--azul-primario`, `--azul-escuro` e `--estado-critico`.
- Os menus de **todos os perfis** usam o mesmo padrão claro. Por decisão do projeto, o menu escuro dos layouts do RH e do Admin **não** foi aplicado.

---

## 4. Marcadores no código

| Marcador | Significado | O que fazer na integração |
|---|---|---|
| `[BACKEND]` | Ponto onde o front precisa de dados ou ações do servidor. Quase sempre traz um `fetch` comentado com a rota sugerida e o formato do JSON. | Ativar o `fetch` e ajustar a rota real. |
| `[PROTÓTIPO]` | Dados fictícios ou simulações que existem só para a tela funcionar sem servidor. | **Apagar.** |
| `[FRONT]` | Observação visual ou de layout (ex.: trocar uma ilustração). | Opcional. |

Para encontrar todos, basta buscar no projeto por `[BACKEND]` e `[PROTÓTIPO]` (Ctrl+Shift+F no VS Code).

---

## 5. Integrações com o back-end

> **Todas as rotas abaixo são sugestões do front.** A equipe de back-end pode alterar os nomes. Basta atualizar o endereço no `fetch` correspondente.

### 5.1 Autenticação e conta

| Método | Rota sugerida | Tela | Envia → Retorna |
|---|---|---|---|
| POST | `/api/auth/login` | Login | `{ email, senha }` → `{ token, perfil, nome }` |
| POST | `/api/auth/logout` | Botão Sair (todas) | — |
| POST | `/api/usuarios` | Cadastro | `{ nome, email, senha, tipoContrato }` → 201 ou 409 (e-mail já existe) |
| GET | `/api/tipos-contrato` | Cadastro | Lista de contratos (CLT, Estágio, Jovem Aprendiz) |
| GET | `/api/me` | Todas as logadas | `{ nome, email, perfil, contrato, limiteDiario }` |
| PUT | `/api/me/senha` | Config. Funcionário | `{ senhaAtual, novaSenha }` → 200, 401 ou 422 |
| GET/PUT | `/api/me/notificacoes` | Config. Funcionário | `{ alertaLimiteEmail, atestadoValidado }` |

### 5.2 Jornada e ponto (Funcionário)

| Método | Rota sugerida | Tela | Envia → Retorna |
|---|---|---|---|
| GET | `/api/jornada/hoje` | Início | `{ percentual, trabalhadas, restantes, estado }` |
| GET | `/api/jornada/resumo` | Início | `{ hoje, semana, mes }`, cada um com `{ horas, meta, percentual, estado }` |
| GET | `/api/regras/meu-contrato` | Início | `{ titulo, texto }` |
| GET | `/api/pontos/hoje` | Início, Ponto | `{ entrada, saidaAlmoco, retornoAlmoco, saida }` (null quando não registrado) |
| POST | `/api/pontos` | Início, Ponto | — → `{ tipo, hora }` ou erro `{ mensagem }` se bloqueado |
| GET | `/api/pontos/historico?limite=5` | Início | Lista `{ data, entrada, saida, status }` |

### 5.3 Relatórios e atestados (Funcionário)

| Método | Rota sugerida | Tela | Envia → Retorna |
|---|---|---|---|
| GET | `/api/banco-horas/saldo` | Relatórios | `{ bancoHorasAtivo, saldo, positivo, atualizadoEm }` |
| GET | `/api/relatorios/meses-disponiveis` | Relatórios | Lista de meses |
| GET | `/api/relatorios/espelho` | Relatórios | Lista `{ id, mes, emissao }` |
| POST | `/api/relatorios/espelho` | Relatórios | `{ mes: "2026-09" }` → `{ id, mes, emissao }` |
| GET | `/api/relatorios/espelho/{id}/download` | Relatórios | Arquivo PDF |
| POST | `/api/atestados` | Modal Atestado | `multipart/form-data`: `dataInicio, dataFim, motivo, arquivo` |
| GET | `/api/atestados/motivos` | Modal Atestado | Lista de motivos |

### 5.4 Portal do RH

| Método | Rota sugerida | Tela | Envia → Retorna |
|---|---|---|---|
| GET | `/api/rh/pendencias` | Pendências | Lista `{ id, colaborador, contrato, data, tipo, tipoPonto, detalhe, anexoUrl }` |
| PUT | `/api/rh/atestados/{id}/aprovar` | Pendências | — |
| PUT | `/api/rh/pendencias/{id}/tratar` | Pendências | — |
| GET | `/api/rh/pontos?colaborador={id}&data={data}` | Editar Ponto | Batidas do dia do colaborador |
| PUT | `/api/rh/pontos` | Editar Ponto | `{ pendenciaId, data, tipo, novoHorario, justificativa }` |
| POST | `/api/rh/importacoes` | Importar | `multipart/form-data`, campo `arquivo` → `{ id, arquivo, linhas, status, erros }` |
| GET | `/api/rh/importacoes?limite=10` | Importar | Histórico de importações |
| GET | `/api/setores` e `/api/rh/colaboradores` | Exportar | Opções do filtro |
| POST | `/api/rh/relatorios` | Exportar | `{ alvo: "todos" \| "setor:x" \| "colaborador:x", mes }` |
| GET | `/api/rh/relatorios?limite=10` | Exportar | Histórico de exportações |
| GET | `/api/rh/relatorios/{id}/download` | Exportar | Arquivo PDF |

### 5.5 Portal do Administrador

| Método | Rota sugerida | Tela | Envia → Retorna |
|---|---|---|---|
| GET | `/api/modulos` | Visão Global | `{ importacao, exportacao, edicaoPonto }` |
| PUT | `/api/modulos/{modulo}` | Visão Global | `{ ativo: true \| false }` |
| GET | `/api/modulos/importacao` e `/api/modulos/exportacao` | Importar, Exportar | `{ ativo }` |
| GET | `/api/auditoria?limite=5` | Visão Global | Lista `{ usuario, acao, dataHora }` |

### 5.6 Responsabilidades que são **do servidor** (não do front)

- **Cálculo da jornada.** O servidor calcula o percentual, as horas restantes e o **estado** (`normal`, `atencao` ou `critico`) a partir das regras de cada contrato (Fig. 20). O front só aplica a classe `jornada-normal`, `jornada-atencao` ou `jornada-critico`, e a cor muda sozinha.
- **Horário oficial da batida.** O relógio da tela usa a hora do navegador **só para exibição**. O horário gravado deve ser o do servidor.
- **Bloqueio de batidas** que ultrapassem o limite do contrato (ex.: estagiário com 6h). A mensagem retornada aparece na barra vermelha da tela de Ponto.
- **Saldo de banco de horas** e se o contrato tem banco de horas ou não.
- **Validação de permissões** em todas as páginas e APIs (ver seção 6.3).
- **Registro de auditoria** de toda edição de ponto, aprovação, mudança de regra e mudança de módulo.
- **Validações finais:** formato e tamanho dos arquivos, limite de 5.000 linhas na importação, força da senha e e-mail duplicado.
- **Geração dos PDFs** no padrão PDF/A (ISO 19005-1).
- **Módulos desativados:** recusar as chamadas de um módulo que o Admin desligou.

---

## 6. Perfis, login e controle de acesso

### 6.1 Perfis

| Perfil | Valor no código | Acessa |
|---|---|---|
| Funcionário | `funcionario` | `/funcionario` |
| Gestor RH | `rh` | `/rh` |
| Administrador | `admin` | `/rh` **e** `/admin` (o Admin também acessa todas as telas do RH) |

A conta criada no Cadastro nasce sempre como **funcionario**. O perfil não é escolhido pelo usuário: quem altera é o Admin, na Gestão de Usuários (Fig. 19).

### 6.2 Fluxo de login

1. O usuário envia e-mail e senha (bloco 2 do `main.js`).
2. O back-end devolve o `perfil`.
3. O front redireciona conforme o objeto `ROTAS_POR_PERFIL`:
   - `funcionario` → `funcionario/inicio.html`
   - `rh` → `rh/pendencias.html`
   - `admin` → `admin/visao-global.html`

### 6.3 Como o front controla o que cada perfil vê (bloco 10 do `main.js`)

Dois atributos fazem esse controle:

| Atributo | Onde fica | Efeito |
|---|---|---|
| `data-acesso="rh admin"` | Tag `body` da página | Se o perfil não estiver na lista, a página redireciona para o login. |
| `data-perfil="admin"` | Qualquer botão ou elemento | O elemento só aparece para os perfis listados. Ex.: a seção **Administração** do menu. |

Valores atuais:

- Páginas de `/rh` usam `data-acesso="rh admin"`.
- Páginas de `/admin` usam `data-acesso="admin"`.
- O menu do RH e do Admin é **o mesmo arquivo de menu em todas as telas**, com duas seções: **Portal do RH** (RH e Admin) e **Administração** (só Admin).

> ⚠️ **Esconder telas no front NÃO é segurança.** Qualquer pessoa pode abrir o código do navegador. O servidor **precisa** validar o perfil em todas as páginas e APIs do RH e do Admin.

### 6.4 O que está simulado hoje (protótipo)

- O login guarda o perfil no navegador com `sessionStorage.setItem("perfil", perfil)`.
- O bloco 10 lê esse valor com `sessionStorage.getItem("perfil")`.
- Se a página for aberta sem passar pelo login, o perfil assume `funcionario`. Por isso o RH e o Admin voltam para o login.

### 6.5 Como trocar pela integração real

1. **Login (bloco 2):** ativar o `fetch` de `POST /api/auth/login`, apagar a simulação que lê o e-mail e apagar a linha do `sessionStorage`.
2. **Sessão:** guardar o token conforme a definição do back-end. O recomendado é um cookie `HttpOnly` definido pelo servidor.
3. **Controle de perfil (bloco 10):** trocar o `sessionStorage.getItem("perfil")` pelo perfil retornado em `GET /api/me`. Se não houver sessão válida, redirecionar para o login.
4. **Saudação:** "Olá, Gestor RH" e "Olá, Administrador" já mudam conforme o perfil.

---

## 7. Como testar as telas sem back-end

| Tela | Como testar |
|---|---|
| Início | Acrescente `?estado=normal`, `?estado=atencao` ou `?estado=critico` ao endereço para ver os 3 estados da jornada (Fig. 3, 8 e 9). |
| Ponto | Clique em **Registrar Ponto**. As etapas são preenchidas em sequência. |
| Atestado | Clique em **Atestados** no menu. Teste datas invertidas e arquivo `.docx` para ver os erros. |
| Relatórios | Em `carregar()`, troque `bancoHorasAtivo` para `false` para ver o caso "Não se aplica". |
| Pendências | **Aprovar** e **Tratar Ocorrência** removem a linha. **Editar Ponto** abre o modal. |
| Importar / Exportar | Em `carregar()`, troque `modulo.ativo` para `false` para ver o aviso de módulo desativado. |
| Visão Global | Desligue um módulo: aparece confirmação e a linha fica apagada. |

---

## 8. Decisões e pontos em aberto

**Decisões tomadas em relação aos layouts**

- Textos padronizados para **português do Brasil**: "Senha" em vez de "Palavra-passe", "Baixar" em vez de "Descarregar" e "Arquivos" em vez de "Ficheiros".
- No menu, a auditoria do RH virou **"Auditoria de Ponto"**, para não confundir com a **"Auditoria de Logs"** do Admin.
- **Configurações Globais** e **Permissões de Acesso** aparecem no menu lateral e também no menu do perfil do Admin.
- O título da Fig. 10 ficou **"Ações Requeridas"**, sem "Qualidade do Cliente".
- Foram adicionados estados que os layouts não mostram: erro de batida bloqueada, saldo negativo ou "Não se aplica", importação com erro e aviso de módulo desativado.

**Pontos em aberto**

- Telas pendentes: Fig. 14, 15 e 17 a 22.
- Quando o módulo **Edição de Ponto** estiver desligado, o botão "Editar Ponto" de Pendências deve sumir. Esse ajuste ainda não foi feito.
- As páginas de `/funcionario` ainda **não têm `data-acesso`**. Na integração, o servidor deve exigir login também nelas.
- Valores que precisam ser confirmados pelo back-end: senha mínima de 8 caracteres, arquivo de atestado de até 5 MB, justificativa mínima de 10 caracteres e lista de motivos do atestado.
- A ilustração da tela de Login é provisória. A imagem final deve ser salva em `img/login-ilustracao.png`.
