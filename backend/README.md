# Zento Backend

A [NestJS](https://nestjs.com/) backend written in TypeScript.

## Setup

```bash
npm install
cp .env.example .env
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production
npm run build
npm run start:prod
```

The server starts on `http://localhost:3000` (configurable via `PORT`).

## Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## Project structure

```
src/
├── app.controller.ts        # Root controller
├── app.controller.spec.ts   # Controller unit test
├── app.module.ts            # Root module
├── app.service.ts           # Root service
└── main.ts                  # Application entry point
test/
├── app.e2e-spec.ts          # End-to-end tests
└── jest-e2e.json            # e2e Jest config
```
