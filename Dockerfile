FROM node:20-alpine3.19


WORKDIR /app


COPY .npmrc ./

COPY package*.json ./

RUN npm install --production

COPY . .

RUN apk update && apk add --no-cache curl

# Expose port
EXPOSE 3000

CMD ["npm", "start"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
