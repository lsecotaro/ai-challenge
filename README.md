## Description

Using AI to clean and enrich data

## Project setup

```bash
$ yarn install
```
## DB setup

```bash
$ docker-compose up --build
$ npx prisma migrate dev --name "init"
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
