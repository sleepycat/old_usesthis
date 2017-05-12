FROM mhart/alpine-node:7.10
MAINTAINER Mike Williamson <mike@korora.ca>

ENV NODE_ENV production

WORKDIR /src
ADD . .

EXPOSE 3000
CMD npm start
