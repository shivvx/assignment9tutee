FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 5001
# starts API server inside container
CMD ["npm", "start"]
