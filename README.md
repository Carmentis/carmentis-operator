# Operator

The **Operator** is a crucial middleware that allows seamless communication with a wallet. Beyond this, it provides a user-friendly interface for publishing oracles and applications, simplifying complex blockchain interactions and facilitating accessible blockchain-related services.

This repository contains everything you need to deploy and launch the Operator using `docker-compose`. Below, you'll find step-by-step instructions to get started.

---

## Overview

The Operator is composed of **two main components**:

1. **Backend**: Handles the core communication with the wallet and processes the requests.
2. **Frontend**: A user-friendly interface that enables users to publish and manage oracles or applications.

This setup is bundled with a **PostgreSQL** database to store persistent data and configurations. All services communicate over a shared Docker network using the recommended `docker-compose` configuration.

---

## Getting Started

To successfully launch the Operator, follow these steps:

### 1. Create a `.env` File

Before running the `docker-compose` setup, you need to configure your environment by creating a `.env` file in the root directory. This file will contain all the mandatory and optional configurations for your Operator deployment.

Here is the structure of the `.env` file:

```dotenv
# Mandatory variables
OPERATOR_DATABASE_NAME=postgres             # The database name
OPERATOR_DATABASE_USERNAME=postgres         # The database username
OPERATOR_DATABASE_PASSWORD=admin            # The database password
OPERATOR_DATABASE_PORT=5432                 # The database port (PostgreSQL default: 5432)
OPERATOR_DATABASE_URL=db                    # The hostname for the database container
NEXT_PUBLIC_WORKSPACE_API_BASE_URL=http://localhost:4002/workspace/api  # Backend API base URL for the frontend communication

# Optional variables
OPERATOR_PORT=3002                          # The port where the backend will listen inside the container (default: 3002)
WORKSPACE_PORT=3003                         # The port where the frontend will listen inside the container (default: 3003)
```

### Explanation of Variables

| Variable                           | Required/Optional | Description                                                                                       |
|------------------------------------|--------------------|---------------------------------------------------------------------------------------------------|
| `OPERATOR_DATABASE_NAME`           | Required           | The name of the PostgreSQL database to be used by the Operator backend.                          |
| `OPERATOR_DATABASE_USERNAME`       | Required           | The username for authenticating with PostgreSQL.                                                 |
| `OPERATOR_DATABASE_PASSWORD`       | Required           | The password for the specified database user.                                                    |
| `OPERATOR_DATABASE_PORT`           | Required           | The port on which the PostgreSQL service will run internally.                                    |
| `OPERATOR_DATABASE_URL`            | Required           | The hostname of the database service as defined in the `docker-compose.yml`.                     |
| `NEXT_PUBLIC_WORKSPACE_API_BASE_URL`| Required           | The base URL where the backend API is exposed for the frontend (needs to point to `back.operator`). |
| `OPERATOR_PORT`                    | Optional           | The internal port the backend service listens on within its container (default: `3002`).         |
| `WORKSPACE_PORT`                   | Optional           | The internal port the frontend service listens on within its container (default: `3003`).        |

Ensure you provide all **mandatory variables** in the `.env` file before proceeding.

---

### 2. Use `docker-compose` to Launch the Services

Prepare a `docker-compose.yml` file in the root directory with the following content:

```yaml
version: "3.9"

services:

  # PostgreSQL Database Service
  db:
    image: postgres:15 # Use the latest stable PostgreSQL image
    container_name: db-operator-carmentis
    restart: always
    environment:
      POSTGRES_USER: ${OPERATOR_DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${OPERATOR_DATABASE_PASSWORD}
      POSTGRES_DB: ${OPERATOR_DATABASE_NAME}
    networks:
      - carmentis-network
    ports:
      - "5432" # Default PostgreSQL port
    volumes:
      - db_data:/var/lib/postgresql/data

  # Backend Service (Nest.js API)
  back.operator:
    image: back.operator.themis.carmentis
    build:
      context: ./operator
      dockerfile: Dockerfile
    container_name: back-operator-carmentis
    restart: always
    tty: true
    depends_on:
      - db
    networks:
      - carmentis-network
    ports:
      - "4002:3002" # Maps container port 3002 to host port 4002
    env_file:
      - .env

  # Frontend Service (Next.js Workspace)
  front.operator:
    image: front.operator.themis.carmentis
    build:
      context: ./workspace
      dockerfile: Dockerfile
    container_name: front-operator-carmentis
    tty: true
    depends_on:
      - db
      - back.operator
    networks:
      - carmentis-network
    ports:
      - "4003:3003" # Maps container port 3003 to host port 4003
    env_file:
      - .env

volumes:
  db_data:

networks:
  carmentis-network:
    driver: bridge
```

This `docker-compose` file defines the following services:

1. **`db`**: PostgreSQL service, configured with credentials from the `.env` file.
2. **`back.operator`**: Backend service (`Nest.js` API) communicating with the database.
3. **`front.operator`**: Frontend service (`Next.js` Workspace) that provides the user interface to interact with Oracles and Applications.

---

### 3. Launch the Operator

Once your `.env` and `docker-compose.yml` files are created, launch the services using the following command:

```bash
docker-compose up --build
```

- The `--build` flag is recommended when you are building the services from source code. It ensures Docker rebuilds the images before launching the containers.
- If the images are pre-built and available in a registry, you can simply run:

```bash
docker-compose up
```

---

## Accessing the Services

- **Frontend (Workspace)**: Open your browser and go to [http://localhost:4003](http://localhost:4003).
- **Backend (API)**: The backend is available at [http://localhost:4002](http://localhost:4002).

By default:
- The backend communicates with the configured database on the `carmentis-network`.
- The frontend communicates with the backend using `http://back.operator:3002`, as defined by the `NEXT_PUBLIC_WORKSPACE_API_BASE_URL` variable.

---

## Troubleshooting

1. **Database connection issues**:
   Ensure the `.env` file contains the correct `OPERATOR_DATABASE_*` variables. Check logs with:
   ```bash
   docker logs db-operator-carmentis
   ```

2. **Backend not starting**:
   Verify your `.env` file contains the correct configuration and ensure the database is running. Check backend logs:
   ```bash
   docker logs back-operator-carmentis
   ```

3. **Frontend not connecting to API**:
   Make sure `NEXT_PUBLIC_WORKSPACE_API_BASE_URL` in `.env` is pointing to the correct backend URL.

---

You're now ready to use the Operator. Happy deploying!