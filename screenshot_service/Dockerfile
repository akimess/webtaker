FROM node:alpine

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      harfbuzz@edge \
      nss@edge

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN mkdir -p /app
WORKDIR /app

RUN npm install -g nodemon

COPY package.json /app/package.json
RUN npm install \
    && npm ls \
    && npm cache clean --force\
    && mv /app/node_modules /node_modules

COPY . /app

ENV PORT 80
EXPOSE 80

CMD ["node", "server.js"]
