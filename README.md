# extensao_comunidade_web
## Visão Geral
Sistema de reserva e gerenciamento de laboratorios
## Fluxo de Trabalho (Workflow)
Este projeto utiliza duas branches principais:
- **main**: branch estável, contendo versões prontas para produção.
- **dev**: branch de desenvolvimento, onde todas as novas funcionalidades e correções devem ser feitas.
----
## Como contribuir
1. Faça um fork do repositório. **Desmarque a opção de copiar somente a `main`**
2. Instale as dependências do projeto (entre na pasta com package.json e rode):
   ```bash
   cd src
   npm install
   cd ..
   ```
3. Crie uma nova branch para sua atividade:
   ```bash
   git checkout -b feature/nome-da-atividade
   ```
4. Faça suas alterações, commits e push para o seu fork (origin):
   ```bash
   git add .
   git commit -m "feat: descrição da alteração"
   git push origin feature/nome-da-atividade
   ```
5. Abra um Pull Request (PR) do seu fork para a branch `dev` do repositório original (`isaqxd/sys_lab`).
# Regras e Boas Práticas
- Sempre trabalhe a partir da branch `dev`.
- Nunca dê push diretamente no repositório original.
- Mantenha seus commits claros e descritivos.
- Antes de abrir um PR, garanta que seu código esteja testado e funcionando.
- Caso encontre bugs ou problemas, abra issues para discutirmos.
