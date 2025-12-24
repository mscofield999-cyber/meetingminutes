FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production
COPY server ./server
COPY public ./public
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/database.sqlite
RUN mkdir -p /data
EXPOSE 3000
WORKDIR /app/server
CMD ["node","server.js"]
