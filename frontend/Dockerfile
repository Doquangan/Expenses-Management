FROM node:20-alpine

WORKDIR /usr/src/app

# Tận dụng cache của Docker cho dependencies
COPY package*.json ./

RUN npm install

# Chỉ copy code sau khi đã cài xong thư viện
COPY . .

EXPOSE 3001

CMD ["npm", "start"]
