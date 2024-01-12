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
For use with dokku, make sure and get a mongodb plugin setup and set the `AUTH_ORIGIN`
environment variable before starting the production server. You can run it with
anything that will run a Dockerfile

## Environment Variables
- `AUTH_ORIGIN` - The origin of the authentication request - `'http://localhost:3000'`
- `AUTH_SECRET` - A random secret to encode passwords - `'somerandomstring'`
- `MONGODB_NAME` - name of the mongodb database - `'dbname'`
- `MONGODB_URL` - The url of the mongodb service - `'mongodb://mongo:27017'`
- `GITHUB_CLIENT_ID` - Client ID for github auth - `'api_key'`
- `GITHUB_CLIENT_SECRET` - Client Secret github auth - `'api_secret'`
- `DIGITAL_OCEAN_SPACES_ENDPOINT` - Endpoint for the digitalocean spaces upload - `https://sfo3.digitaloceanspaces.com`
- `DIGITAL_OCEAN_SPACES_RETRIEVAL_ENDPIONT` - Endpoint to retrieve the images from your digitalocean spaces - `https://3lbsofsaltdevelopment.sfo3.digitaloceanspaces.com/`
- `DIGITAL_OCEAN_SPACES_BUCKET` - Bucket name for your image repo - `3lbsofsaltdevelopment`
- `DIGITAL_OCEAN_SPACES_FILE_PREFIX` - A prefix for this specific project in the spaces bucket so it can be used by more projects - `file_name/`
- `DIGITAL_OCEAN_SPACES_PUBLIC_KEY` - Public API key for your digital ocean spaces - `API_KEY`
- `DIGITAL_OCEAN_SPACES_SECRET_KEY` - Secret API key for your digital ocean spaces - `SECRET_API_KEY`

### Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

### Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
