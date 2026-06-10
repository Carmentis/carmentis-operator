<div align="center">

<img src="src/assets/carmentis.svg" alt="Carmentis" width="220" />

# Carmentis Operator

### The server-side gateway that connects your applications to the Carmentis blockchain and external wallets.

</div>

---

## Why the Operator?

The **Carmentis Operator** is a [NestJS](https://nestjs.com/) server that sits between your applications, your
users' wallets, and the Carmentis blockchain. It removes the complexity of talking to a blockchain node directly and
gives you a single, well-defined surface to build on top of.

It is useful when you need to:

- **Expose a workspace API** — manage organisations, applications and oracles through a documented HTTP/GraphQL API
  (Swagger UI is served out of the box).
- **Bridge applications and wallets in real time** — a built-in `socket.io` handler lets an external wallet
  (e.g. an Android wallet) and your application exchange messages for authentication and transaction approval, without
  either side having to poll.
- **Publish data on-chain** — the Operator interacts with a Carmentis node (`node_url`) so your application never has to
  embed blockchain logic itself.
- **Persist and protect data** — supports SQLite, PostgreSQL and MySQL, with transparent encryption of sensitive
  fields.

## Features

- **Workspace API** — manage and expose the workspace endpoints (organisations, applications, oracles).
- **Real-time wallet bridge** — `socket.io` channel for wallet authentication and transaction signing.
- **Blockchain interaction** — publish and read data through a configured Carmentis node.
- **Pluggable storage** — SQLite (default), PostgreSQL or MySQL, with at-rest encryption.
- **Self-documenting** — Swagger UI available under `/swagger`.

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) (the project uses pnpm and `corepack` — run `corepack enable` if needed)
- A reachable Carmentis **node URL**
- Optionally, a PostgreSQL or MySQL server (SQLite is used by default and requires nothing extra)

## Configuration

The Operator is configured through a **TOML file**. At startup it looks for the first available file, in order:

1. The path given by the `CONFIG` (or `OPERATOR_CONFIG`) environment variable
2. `config.toml`, `operator-config.toml` or `config-operator.toml` in the current working directory

A documented template is provided in [`example-config.toml`](./example-config.toml). A minimal configuration only needs
the node URL — everything else falls back to sensible defaults (port `3000`, SQLite storage, auto-generated JWT secret
and database encryption key):

```toml
[operator]
node_url = "http://localhost:3500"
# port = 3000 # optional

# SQLite is used by default. To use PostgreSQL instead, configure this block:
# [operator.database.postgresql]
# user = "your_username"
# password = "your_password"
# database = "your_database_name"
# url = "localhost"
# port = 5432
```

See [`example-config.toml`](./example-config.toml) for the full list of options (JWT, CORS, Swagger, encryption,
protocols and filesystem paths).

## Deploy locally (by hand)

1. Clone the repository and move into it:

   ```bash
   git clone https://github.com/carmentis/operator.git
   cd operator
   ```

2. Install the dependencies:

   ```bash
   pnpm install
   ```

3. Create your configuration file (start from the template):

   ```bash
   cp example-config.toml config.toml
   # then edit config.toml and set at least node_url
   ```

4. Start the server:

   - **Production**:

     ```bash
     pnpm build
     pnpm start:prod
     ```

   - **Development** (with hot reload):

     ```bash
     pnpm start:dev
     ```

The API and Swagger UI are then available on the configured port (default `http://localhost:3000`, docs under
`/swagger`).

## Deploy with Docker

### Option A — build the image yourself

1. Build the image:

   ```bash
   docker build -t carmentis-operator .
   ```

2. Run it, mounting your `config.toml` into the container's working directory (`/app`):

   ```bash
   docker run --rm --name carmentis-operator \
     -p 3000:3000 \
     -v "$(pwd)/config.toml:/app/config.toml" \
     carmentis-operator
   ```

### Option B — use the published image

A pre-built image is available on the GitHub Container Registry:

```bash
docker run --rm --name carmentis-operator \
  -p 3000:3000 \
  -v "$(pwd)/config.toml:/app/config.toml" \
  ghcr.io/carmentis/operator
```

> The container exposes port `3000`. If you change `port` in your config, update the `-p` mapping accordingly.
> When using PostgreSQL or MySQL, make sure the database is running and reachable from the container before starting
> the Operator.

### Running PostgreSQL with Docker (optional)

If you want a PostgreSQL backend for local testing, you can spin one up quickly:

```bash
docker run --rm --name postgres \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=your_database_name \
  -p 5432:5432 postgres
```

Replace `your_username`, `your_password` and `your_database_name` with values matching the
`[operator.database.postgresql]` section of your `config.toml`.

## Wallet integration (socket.io)

The Operator's `socket.io` handler lets external wallets interact with your application in real time, including:

- Wallet authentication.
- Approving and signing transactions.

### Example use case

An external wallet (e.g. on Android) connects to the Operator for authentication or transaction approval. Your
application communicates with the Operator over `socket.io`, and the Operator interacts with the blockchain through the
configured `node_url`.

## Contributing

Contributions to improve or extend the Operator are welcome. Please follow the project's coding standards and submit a
pull request.

## License

Licensed under Apache-2.0. See the [`LICENCE.txt`](./LICENCE.txt) file for details.
