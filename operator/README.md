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