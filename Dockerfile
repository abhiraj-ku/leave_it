#stage 1
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .


#stage 2
FROM node:18-alpine AS production
WORKDIR /app

# Copy only needed files from build stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]
