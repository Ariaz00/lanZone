FROM node:23-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json /app/ 
RUN npm install
# RUN npm install -g nodemon
COPY . .
EXPOSE 3000
CMD ["npm", "start"] 




