# Aurelius E-Commerce Software

## Setup
### Development
There is a docker-compose file located in the root directory of the project.
For running on your local machine, you can run `docker-compose -f compose.dev.yaml`.
To then setup the db, create a user account with the website, which should be working,
then review the scripts in the scripts directory to ensure that they will make the correct changes
and run them from inside of the mongo docker container by running `mongosh relevantScript.js`.

### Production
This repo is currently not set up to have a production build.


## Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

### Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

### Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
