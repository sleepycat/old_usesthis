# FROM mhart/alpine-node:5.7.1
FROM node:6-onbuild
MAINTAINER Mike Williamson <mike@korora.ca>

RUN npm run build

EXPOSE 3000
CMD npm start