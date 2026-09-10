# TimeTrack / Ponto Online

Aplicação para registro, controle e monitoramento da jornada de trabalho e do banco de horas de colaboradores em regime CLT, Estágio e Jovem Aprendiz, com aplicação automática das regras de tolerância da CLT (Art. 58, § 1º) e da Lei nº 11.788.

Projeto acadêmico desenvolvido para a disciplina de Elicitação de Requisitos / Desenvolvimento de Software Visual — Universidade Positivo (2026).

---

## 📋 Sobre o projeto
O TimeTrack tem como objetivo eliminar o controle manual de ponto (planilhas, papel, relógios físicos), reduzindo o retrabalho do RH na auditoria mensal e prevenindo passivos trabalhistas decorrentes de cálculo incorreto de horas extras e tolerância.

**Principais capacidades:**
* Registro de entrada, saída para almoço, retorno e encerramento do expediente.
* Cálculo automático da tolerância legal (até 5 min por batida / 10 min por dia).
* Bloqueio automático de horas extras para Estagiários e Jovens Aprendizes (Lei nº 11.788).
* Dashboard visual com alertas coloridos (verde / amarelo / vermelho) sobre o status da jornada.
* Importação de planilhas de ponto legadas (CSV/Excel).
* Exportação de relatórios analíticos em PDF.
* Gestão de atestados médicos, feriados e faltas injustificadas.
* Auditoria de edições manuais de ponto.

Para o detalhamento completo de requisitos funcionais, não funcionais, casos de uso, priorização (MoSCoW) e rastreabilidade, consulte a documentação do projeto (`/docs`).

---

## 🛠️ Tecnologias utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Back-end API** | C# (.NET 9 / ASP.NET Core Web API) |
| **Arquitetura** | MVC e Arquitetura em Camadas (Domain, Infrastructure, API) |
| **ORM** | Entity Framework Core (v9.0.0) |
| **Banco de dados** | MySQL |
| **Front-end** | ASP.NET Core MVC (Razor Pages, HTML5, CSS3, JS) |
| **Geração de relatórios** | PDF (ex.: QuestPDF) |
| **Autenticação** | Hash de senha (Bcrypt) + token com expiração por inatividade |

*Escopo não coberto por esta versão: integração com relógios físicos de ponto (REP), módulo de folha de pagamento, aplicativo mobile nativo e notificações push/SMS.*

---

## 📁 Estrutura do projeto

```text
TimeTrack/
├── src/
│   ├── PontoOnline.API/            # Endpoints, Controllers e exposição dos dados
│   ├── PontoOnline.Infrastructure/ # Configurações do EF Core, Migrations e Repositórios
│   ├── PontoOnline.Domain/         # Entidades do banco e Interfaces de regras de negócio
│   └── PontoOnline.mvc/            # Interface visual do usuário (Views, Controllers HTML/CSS)
├── database/
│   └── database.sql                # Script SQL inicial com a estrutura das tabelas
└── README.md

## ✅ Pré-requisitos
* .NET SDK 9.0+
* Ferramenta Global: `dotnet-ef` (v9.0.0+)
* MySQL Server 8.0+
* (Opcional) MySQL Workbench para administração do banco

---

## 🚀 Como executar o projeto

### 1. Clonar o repositório
```bash
git clone [https://github.com/Emily-Mirian/TimeTrack.git](https://github.com/Emily-Mirian/TimeTrack.git)
cd TimeTrack
git checkout main
```

### 2. Configurar o banco de dados MySQL
Crie o banco de dados vazio no seu servidor MySQL:
```sql
CREATE DATABASE IF NOT EXISTS PontoOnlineDb;
```

Abra o arquivo `src/PontoOnline.API/appsettings.json` e configure a sua senha local na string de conexão:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=PontoOnlineDb;Uid=root;Pwd=SUA_SENHA_AQUI;"
  }
}
```

### 3. Restaurar dependências e aplicar Migrations
Na raiz da solução (onde está o `.sln`), execute os comandos para compilar os projetos e gerar as tabelas no banco de dados automaticamente via Entity Framework:
```bash
dotnet restore
dotnet build
dotnet ef database update -p src/PontoOnline.Infrastructure -s src/PontoOnline.API
```

### 4. Executar os projetos
O sistema funciona com dois processos simultâneos (a API fornecendo os dados e o MVC exibindo as telas). Em terminais separados, execute:

**Terminal 1 - Rodar a API:**
```bash
dotnet run --project src/PontoOnline.API
```

**Terminal 2 - Rodar a Interface Web:**
```bash
dotnet run --project src/PontoOnline.mvc
```

---

## 📐 Regras de negócio principais

| ID | Regra |
| :--- | :--- |
| **RN-01** | Estagiários e Jovens Aprendizes não podem gerar saldo positivo de banco de horas (Lei nº 11.788). |
| **RN-02** | Tolerância legal de 5 min por batida, limitada a 10 min por dia (Art. 58, § 1º CLT). |
| **RN-03** | Dia com número ímpar de batidas fica "Pendente de Edição (RH)" e o saldo é congelado. |
| **RN-06** | Módulos de exportação/importação não podem ser acessados pelos perfis Estagiário ou Funcionário. |
| **RN-09** | Sessões inativas por mais de 30 min são encerradas automaticamente. |

---

## 📄 Licença
Projeto acadêmico sem fins comerciais, desenvolvido para fins de avaliação da disciplina.
