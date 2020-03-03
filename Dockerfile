FROM node:13.8
WORKDIR /usr/src
COPY package.json package-lock.json /usr/src/
RUN npm i --production
COPY . .

FROM node:13.8-slim
WORKDIR /usr/src
COPY --from=0 /usr/src .
COPY . .
EXPOSE 3000
CMD ["npm", "start"]