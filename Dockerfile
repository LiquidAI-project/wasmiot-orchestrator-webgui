# Stage 1: Frontend setup
FROM node:16
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache
COPY frontend/ .

# Expose the updated ports for both frontend
EXPOSE ${FRONTEND_PORT}

# Run frontend
CMD ["npm start --prefix ../frontend"]
