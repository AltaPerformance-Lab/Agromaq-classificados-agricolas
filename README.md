# 🧪 Nosso Laboratório: Plataforma AgroMaq

Este é um dos projetos "prova de conceito" da **Alta Performance Web**.

O **AgroMaq** é uma plataforma SaaS (Software as a Service) full-stack para classificados do agronegócio. Ele foi construído do zero para demonstrar nossa expertise em arquiteturas complexas, lógica de negócios, painéis de administração e performance de ponta.

Este projeto não é apenas um "site bonito"; é um sistema completo em funcionamento.

---

## 🛠️ O Arsenal (Stack de Tecnologia)

Para provar nossa capacidade de lidar com qualquer desafio, este projeto foi construído com um stack robusto e escalável, pronto para produção.

* **Framework Full-Stack:** [Next.js](https://nextjs.org/) (App Router)
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) (Migrado do MySQL)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Containerização:** [Docker](https://www.docker.com/) & Docker Compose
* **Autenticação:** [Auth.js (NextAuth.js)](https://authjs.dev/)
* **Validação:** [Zod](https://zod.dev/)
* **Imagens (Demo):** [Cloudinary](https://cloudinary.com/) (para o seed de dados)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)

---

## 🧑‍💻 Como Rodar esta Demo Localmente

Este projeto é 100% containerizado com Docker para um setup de desenvolvimento rápido e isolado.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/AltaPerformance-Lab/agromaq-plataforma.git](https://github.com/AltaPerformance-Lab/agromaq-plataforma.git)
    cd agromaq-plataforma
    ```

2.  **Configure o Ambiente:**
    * Renomeie o arquivo `.env.example` (se houver) para `.env`.
    * Preencha as variáveis de ambiente (como `NEXTAUTH_SECRET`). O `DATABASE_URL` já está configurado para o Docker (`postgresql://user:password@db:5432/agromaq`).

3.  **Suba os Containers:**
    * Isso vai construir a imagem do Next.js e iniciar o banco de dados PostgreSQL.
    ```bash
    docker-compose up -d --build
    ```

4.  **Rode a Migração do Banco:**
    * Com os containers no ar, execute este comando para criar as tabelas no banco Postgres.
    ```bash
    docker-compose exec app npx prisma migrate dev
    ```

5.  **Popule o Banco (Seed):**
    * Execute o script de "seed" para popular a demo com usuários, máquinas e fazendas de exemplo.
    ```bash
    docker-compose exec app npx prisma db seed
    ```

6.  **Pronto!**
    * Acesse `http://localhost:3001` no seu navegador.
    * **Login Admin:** `admin@agromaq.com`
    * **Senha (para todos):** `password123`