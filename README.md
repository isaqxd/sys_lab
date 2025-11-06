# extensao_comunidade_web
## Visão Geral
Sistema de reserva e gerenciamento de laboratorios
## Fluxo de Trabalho (Workflow)
Este projeto utiliza duas branches principais:
- **main**: branch estável, contendo versões prontas para produção.
- **dev**: branch de desenvolvimento, onde todas as novas funcionalidades e correções devem ser feitas.
----
## Como contribuir
1. Faça um fork do repositório.
2. Clone o seu fork localmente:
   ```bash
   git clone https://github.com/[seu_usuario]/sys_lab.git
   cd sys_lab
   ```
3. Adicione o repositório original como remoto upstream (para poder puxar atualizações depois):
   ```bash
   git remote add upstream https://github.com/isaqxd/sys_lab.git
   ```
4. Troque para a branch de desenvolvimento e atualize-a:
   ```bash
   git fetch upstream
   git checkout dev
   git pull upstream dev
   ```
5. Instale as dependências do projeto (entre na pasta com package.json e rode):
   ```bash
   cd src
   npm install
   cd ..
   ```
6. Crie uma nova branch para sua atividade:
   ```bash
   git checkout -b feature/nome-da-atividade
   ```
7. Faça suas alterações, commits e push para o seu fork (origin):
   ```bash
   git add .
   git commit -m "feat: descrição da alteração"
   git push origin feature/nome-da-atividade
   ```
8. Abra um Pull Request (PR) do seu fork para a branch `dev` do repositório original (`isaqxd/sys_lab`).
# Regras e Boas Práticas
- Sempre trabalhe a partir da branch `dev`.
- Nunca dê push diretamente no repositório original.
- Mantenha seus commits claros e descritivos.
- Antes de abrir um PR, garanta que seu código esteja testado e funcionando.
- Caso encontre bugs ou problemas, abra issues para discutirmos.
