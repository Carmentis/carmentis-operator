# Operator

The **Operator** is a crucial middleware that allows seamless communication with a wallet. Beyond this, it provides a
user-friendly interface for organisations and applications, simplifying complex blockchain interactions and
facilitating accessible blockchain-related services.

This repository contains everything you need to deploy and launch the Operator using `docker-compose`. Below, you'll
find step-by-step instructions to get started.

---

## Run the Operator

To launch the Operator, follow these steps:

1. Use the following `docker-compose.yml` file to define and launch the services:

   ```yaml
   version: "3.9"

   services:

     # PostgreSQL Database Service
     db:
       image: postgres:15 # Use the latest stable PostgreSQL image
       container_name: db-operator-carmentis
       restart: always
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: admin
         POSTGRES_DB: postgres
       networks:
         - carmentis-network
       ports:
         - "5432:5432" # Default PostgreSQL port
       volumes:
         - db_data:/var/lib/postgresql/data

     # Backend Service (Nest.js API)
     back.operator:
       image: ghcr.io/carmentis/operator/back:latest
       build:
         context: ./operator
         dockerfile: Dockerfile
       environment:
        - OPERATOR_DATABASE_NAME=postgres             
        - OPERATOR_DATABASE_USERNAME=postgres         
        - OPERATOR_DATABASE_PASSWORD=admin            
        - OPERATOR_DATABASE_HOST=db                   
        - OPERATOR_DATABASE_PORT=5432
        - DB_ENCRYPTION_KEY=toto
        - NODE_URL=<node_url>
        - PORT=4002
       container_name: back-operator-carmentis
       restart: always
       tty: true
       depends_on:
         - db
       networks:
         - carmentis-network
       ports:
         - "4002:4002" # Maps container port 4002 to host port 4002
       env_file:
         - .env

     # Frontend Service (Next.js Workspace)
     front.operator:
       image: ghcr.io/carmentis/operator/front:latest
       build:
         context: ./workspace
         dockerfile: Dockerfile
       environment:
        - OPERATOR_URL=<operator_url>
        - PORT=4003
       container_name: front-operator-carmentis
       tty: true
       depends_on:
         - back.operator
       networks:
         - carmentis-network
       ports:
         - "4003:4003" # Maps container port 4003 to host port 4003

   volumes:
     db_data:

   networks:
     carmentis-network:
       driver: bridge
   ```

2. Run the services using the following command:

   ```bash
   docker-compose up --build
   ```

   The `--build` flag ensures Docker rebuilds the images before launching the containers. Once launched:

    - **Frontend**: Access the user interface at [http://localhost:4003](http://localhost:4003).
    - **Backend (API)**: Access the backend API at [http://localhost:4002](http://localhost:4002).