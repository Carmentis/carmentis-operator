# Operator Server API

The **Operator** is the server-side API designed for managing the workspace's APIs. It also includes a `socket.io`
handler enabling real-time communication to transmit data between an external wallet (e.g., an Android wallet) and an
application that needs wallet interactions, such as authentication or transaction approval.

## Features

- **API Server**: Manages and exposes the workspace API endpoints.
- **Real-Time Communication**: Utilizes `socket.io` to enable seamless interaction between external wallets and your
  application.
- **Blockchain Interaction**: Facilitates publishing data to a blockchain network via a configured node.

## Environment Variables

The Operator can be configured using the following environment variables:

- **`PORT`**: Defines the port the server will use to listen for requests.
- **`JWT_SECRET`**: Secret key used to sign JWT tokens for authentication.
- **`NODE_URL`**: URL of a blockchain node, useful for operations such as publishing data on-chain.
- **`OPERATOR_DATABASE_URL`**: URL of the database used by the Operator.
- **`OPERATOR_DATABASE_PORT`**: Port number of the database.
- **`OPERATOR_DATABASE_USERNAME`**: Username for authenticating with the database.
- **`OPERATOR_DATABASE_PASSWORD`**: Password for authenticating with the database.
- **`OPERATOR_DATABASE_NAME`**: Name of the database.
- **`ENABLE_PUBLIC_ACCOUNT_CREATION`**: Enable the public account creation (default at `0`).
- **`MAX_ORACLES_IN_ORGANISATION`**: Maximum number of oracles by organisation (default at `30`).
- **`MAX_ORACLES_IN_APPLICATIONS`**: Maximum number of applications by organisation (default at `30`).
- **`MAX_ORGANISATIONS_IN_WHICH_USER_IS_ADMIN`**: Maximum number of organisations in which a user is involved as administrator (default at `10`).

## Installation

1. Clone the repository or navigate to the appropriate directory containing the Operator.
2. Install the necessary dependencies using npm:

   ```bash
   npm install
   ```

## Usage

To start the Operator, you can use the following commands based on your environment:

- **Production**:
  ```bash
  npm run start
  ```

- **Development**:
  ```bash
  npm run start:dev
  ```

## Launching the Operator

There are three ways to launch the Operator:

1. **Manually (like any other Nest.js project)**:
   Follow the steps in the installation section, then use the appropriate command from the [Usage](#usage) section to
   launch the server in production or development.

2. **Build and launch with the provided Dockerfile**:
   a. Build the Docker image:
   ```bash
   docker build -t operator-back .
   ```
   b. Run the image:
   ```bash
   docker run --rm --name operator-back \
   --env PORT=4002 \
   --env JWT_SECRET=toto \
   --env NODE_URL=http://localhost:3500 \
   --env OPERATOR_DATABASE_URL=your_database_url \
   --env OPERATOR_DATABASE_PORT=5432 \
   --env OPERATOR_DATABASE_USERNAME=your_database_username \
   --env OPERATOR_DATABASE_PASSWORD=your_database_password \
   --env OPERATOR_DATABASE_NAME=your_database_name \
   --env ENABLE_PUBLIC_ACCOUNT_CREATION=0\
   --network host operator-back
   ```

3. **Use the published image**:
   Run the following command to use the pre-built image available on GitHub Container Registry:
   ```bash
   docker run --rm --name carmentis-operator-back \
   --env PORT=4002 \
   --env JWT_SECRET=toto \
   --env NODE_URL=http://localhost:3500 \
   --env OPERATOR_DATABASE_URL=your_database_url \
   --env OPERATOR_DATABASE_PORT=5432 \
   --env OPERATOR_DATABASE_USERNAME=your_database_username \
   --env OPERATOR_DATABASE_PASSWORD=your_database_password \
   --env OPERATOR_DATABASE_NAME=your_database_name \
   --env ENABLE_PUBLIC_ACCOUNT_CREATION=0\
   --network host ghcr.io/carmentis/operator/back
   ```

   Ensure that a PostgreSQL database is running and accessible before launching the server.

## Launching a PostgreSQL Server with Docker

To run a PostgreSQL server using Docker, you can use the following command:

```bash
docker run --rm --name postgres -e POSTGRES_USER=your_username \
-e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=your_database_name \
-p 5432:5432 postgres
```

Replace `your_username`, `your_password`, and `your_database_name` with the corresponding values that match your
environment configuration.

## Socket.io Integration

The Operator's `socket.io` handler enables interaction with external wallets to facilitate various operations,
including:

- Wallet authentication.
- Approving and signing transactions.

## Example Use Case

An external wallet (e.g., on Android) connects to the Operator for authentication or transaction approval. The
application communicates with the Operator over `socket.io`, and the Operator interacts with the blockchain via the
provided `NODE_URL`.

## Contributing

Contributions to improve or extend the Operator are welcome. Please make sure to follow the project's coding standards
and submit a pull request.

## License

See `LICENSE` file for details.