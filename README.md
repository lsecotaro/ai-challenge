## Description

Using AI to clean and enrich data.

To run the project:
* Configure .env, you can make a copy of .env.example and set openAi Key
* Follow the below instruction from:
  * Project setup
  * DB Setup
  * RabbitMQ Setup
  * Compile and run the project

## Environment variables

Make a copy of .env.example, rename to .env and set the values

## Project setup

```bash
$ yarn install
```
## DB setup

```bash
$ docker-compose up --build
$ npx prisma migrate dev --name "init"
```

## RabbitMQ Setup
Access RabbitMQ Management UI: Open your browser and go to http://localhost:15672. Log in with the credentials defined in RABBITMQ_DEFAULT_USER and RABBITMQ_DEFAULT_PASS.
Creating a queue:
After docker-compose is up run this

```bash
$ chmod +x rabbitmq-init.sh
$ ./rabbitmq-init.sh
```
## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
