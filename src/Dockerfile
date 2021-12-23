FROM node:16.4.2-alpine3.12

RUN mkdir -p /apps/simple

COPY simple /apps/simple
RUN cd /apps/simple && npm install

EXPOSE 8080
WORKDIR /apps

CMD [ "npm", "start" ]
