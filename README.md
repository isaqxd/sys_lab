# 🌐 Sys_lab — Sistema de Reserva de Laboratórios

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![MariaDB](https://img.shields.io/badge/MariaDB/MySQL-10.x-blue?logo=mariadb)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

O **Sys_lab** é um sistema para **reserva e gerenciamento de laboratórios**, desenvolvido como projeto de Extensão acadêmica.  
Gerencie salas, reservas, professores e usuários de forma simples e organizada.

---

## ⭐ Contribuidores do GitHub

Agradecimentos a todos que contribuíram para o projeto!

<table>
  <tbody>
    <tr>
      <!-- Isaque -->
      <td align="center" width="20%">
        <a href="https://github.com/isaqxd">
          <img src="https://avatars.githubusercontent.com/u/156721412?v=4?s=100" width="100px" alt="Isaque Costa"/>
          <br />
          <sub><b>Isaque Costa</b></sub>
        </a>
        <br />
        <a href="https://www.linkedin.com/in/isaqxd">
          <img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=linkedin&logoColor=white" />
        </a>
      </td>
      <!-- Luis Eduardo -->
      <td align="center" width="20%">
        <a href="https://github.com/sunshasdev">
          <img src="https://avatars.githubusercontent.com/u/167632855?v=4?s=100" width="100px" alt="Luis Eduardo"/>
          <br />
          <sub><b>Luis Eduardo</b></sub>
        </a>
        <br />
        <a href="https://www.linkedin.com/in/luis-eduardo-oliveira-maia-464389324/">
          <img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=linkedin&logoColor=white" />
        </a>
      </td>
      <!-- Luiz Gustavo -->
      <td align="center" width="20%">
        <a href="https://github.com/gusta-xis">
          <img src="https://avatars.githubusercontent.com/u/181901272?v=4?s=100" width="100px" alt="Luiz Gustavo"/>
          <br />
          <sub><b>Luiz Gustavo</b></sub>
        </a>
        <br />
        <a href="https://www.linkedin.com/in/devdamascena/">
          <img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=linkedin&logoColor=white" />
        </a>
      </td>
      <!-- Lucas Gabriel -->
      <td align="center" width="20%">
        <a href="https://github.com/devlucasl">
          <img src="https://avatars.githubusercontent.com/u/171864787?v=4?s=100" width="100px" alt="Lucas Gabriel"/>
          <br />
          <sub><b>Lucas Gabriel</b></sub>
        </a>
        <br />
        <a href="https://www.linkedin.com/in/lucasgcss/">
          <img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=linkedin&logoColor=white" />
        </a>
      </td>
    </tr>
  </tbody>
</table>

---

## ✨ Funcionalidades

- Cadastro de **Usuários**, **Professores**, **Salas** e **Reservas**
- Painel com:
  - Reservas atuais
  - Futuras
  - Passadas
  - Canceladas
- Autenticação básica
- API REST organizada por recursos
- Arquitetura modular (Controller → Service → DAO)

---

# 🛠 Tecnologias

## 🚀 Back-end
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![MySQL2](https://img.shields.io/badge/MySQL2-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Dotenv](https://img.shields.io/badge/Dotenv-8A2BE2?style=for-the-badge&logo=dotenv&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-FF6F61?style=for-the-badge)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)

---

## 🎨 Front-end
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Fetch API](https://img.shields.io/badge/Fetch_API-000000?style=for-the-badge)
![UI Modular](https://img.shields.io/badge/UI_Modular-6A5ACD?style=for-the-badge)

---

## 🗄️ Banco de Dados
![Relational](https://img.shields.io/badge/Relational_Model-4D4D4D?style=for-the-badge)
![Foreign Keys](https://img.shields.io/badge/Foreign_Keys-00A8E8?style=for-the-badge)
![Indexes](https://img.shields.io/badge/Indexes-3A86FF?style=for-the-badge)

- Tabelas principais: **Usuários**, **Professores**, **Salas**, **Reservas**, **Horários**
- Relacionamentos via **chaves estrangeiras**
- Índices para otimizar consultas

---

## 🧱 Arquitetura

![MVC](https://img.shields.io/badge/MVC_Simplificado-6C63FF?style=for-the-badge)
![REST API](https://img.shields.io/badge/REST_API-00BFA6?style=for-the-badge)
![Modular](https://img.shields.io/badge/Modular_Code-FF8C42?style=for-the-badge)

### Organização
- **Controllers** — entrada das requisições  
- **Services** — regras de negócio  
- **DAOs** — persistência em MariaDB/MySQL

### Fluxo

```mermaid
flowchart TD

A[Cliente / Front-end] --> B[Controller]
B --> C[Service]
C --> D[DAO]
D --> E[(MariaDB/MySQL)]
```
## 🤝 Como contribuir

Contribuições são super bem-vindas!  

1. Faça um **fork**  
2. Crie uma branch:
    ```bash
    git checkout -b minha-melhoria
    ```
3. Faça suas alterações e commit:
    ```bash
    git commit -m "feat: minha melhoria"
    ```
4. Envie a branch:
    ```bash 
    git push origin minha-melhoria
    ```
5. Abra um Pull Request ❤️

---
