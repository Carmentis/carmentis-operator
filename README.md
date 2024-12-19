# Operator Server

This repository contains the source code of the operator and the workspace (the administration interface of the operator).

## Environment variables

```dotenv
# mandatory variables
OPERATOR_DATABASE_NAME=db-operator
OPERATOR_DATABASE_USERNAME=postgres
OPERATOR_DATABASE_PASSWORD=admin
OPERATOR_DATABASE_PORT=3001
OPERATOR_DATABASE_URL=localhost
NEXT_PUBLIC_WORKSPACE_API_BASE_URL=http://localhost:3002/workspace/api

# optional variables
OPERATOR_PORT=3002
WORKSPACE_PORT=3003
```

We resume the scope of each variable below:

| Variable                             | Used by   | Comment                                                       |
|--------------------------------------|-----------|---------------------------------------------------------------
| `OPERATOR_DATABASE_USERNAME`         | Operator  | User's name to access database.                               |
| `OPERATOR_DATABASE_PASSWORD`         | Operator  | User's password to access database.                           |
| `OPERATOR_DATABASE_URL`              | Operator  | URL where the database is listening.                          |
| `OPERATOR_DATABASE_PORT`             | Operator  | Port where the database server is listening.                  |
| `OPERATOR_DATABASE_NAME`             | Operator  | Name of the database.                                         |
| `OPERATOR_PORT`                      | Operator  | Listening port of the operator. (Default: 3000)               |
| `NEXT_PUBLIC_WORKSPACE_API_BASE_URL` | Workspace | URL where the backend API used by the workspace is listening. |
| `WORKSPACE_PORT`                     | Workspace | Listening port of the workspace. (Default: 3000)              |






## Deploy the operator using host

Deploying the operator requires **three active terminals**, one for the operator, one for the (ui of the) workspace
and another one for the database (we use `docker` to run the database).

### First terminal: The database
Go to the 

### Second terminal: The operator

### Third terminal: The workspace


## Deploy the operator using Docker

The deployment of the operator is done in two steps: (1) creates the environment file `.env` and (2) run the docker-compose
file.  To run the operator, execute the following docker command **next to the `.env` file**:
```shell
docker-compose up
```