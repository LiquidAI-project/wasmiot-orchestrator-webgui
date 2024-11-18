# Stage 1: Frontend setup
FROM node:16 AS frontend-dev
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .

# Stage 2: Backend setup
FROM node:16
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ .

# Expose the updated ports for both frontend and backend
EXPOSE ${FRONTEND_PORT} ${BACKEND_PORT}

# Run both backend and frontend servers concurrently
CMD ["sh", "-c", "node server.js & npm start --prefix ../frontend"]
