FROM mhart/alpine-node:6.2.2
MAINTAINER Mike Williamson <mike@korora.ca>

ENV NODE_ENV production

WORKDIR /src
ADD . .

EXPOSE 3000
CMD npm start
