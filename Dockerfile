FROM mhart/alpine-node:5.7.1
MAINTAINER Mike Williamson <mike@korora.ca>

RUN mkdir /app
COPY . /app

WORKDIR /app
RUN /app/node_modules/.bin/webpack -p
EXPOSE 3000
CMD npm start
