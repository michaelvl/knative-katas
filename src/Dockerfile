FROM node:16.4.2-alpine3.12

RUN mkdir -p /apps/simple /apps/event-emitter

COPY simple /apps/simple
RUN cd /apps/simple && npm install

COPY event-emitter /apps/event-emitter
RUN cd /apps/event-emitter && npm install

COPY filter /apps/filter
RUN cd /apps/filter && npm install

EXPOSE 8080
WORKDIR /apps/simple

CMD [ "npm", "run", "watch" ]
