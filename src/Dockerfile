FROM node:16.4.2-alpine3.12

RUN mkdir -p /apps/simple /apps/event-emitter

COPY simple /apps/simple
RUN cd /apps/simple && npm install

COPY event-emitter /apps/event-emitter
RUN cd /apps/event-emitter && npm install

EXPOSE 8080
WORKDIR /apps/simple

CMD [ "npm", "start" ]
