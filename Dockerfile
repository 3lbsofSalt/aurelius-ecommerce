FROM node:20-alpine
WORKDIR /app

RUN apk update && apk upgrade
RUN apk add git

COPY ./package*.json /app/

RUN npm install && npm cache clean --force

COPY . .

RUN npx nuxi prepare
RUN npm run build
RUN npm prune

ENV PATH ./node_modules/.bin/:$PATH

CMD ["node", ".output/server/index.mjs", "--host"]
