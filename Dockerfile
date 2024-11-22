# Stage 1: Frontend setup
FROM node:16
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache
COPY frontend/ .

# Stage 2: Backend setup
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ .

# Expose the updated ports for both frontend and backend
# EXPOSE ${FRONTEND_PORT} ${BACKEND_PORT}
EXPOSE ${FRONTEND_PORT}

# Run both backend and frontend servers concurrently
# CMD ["sh", "-c", "node server.js & npm start --prefix ../frontend"]
CMD ["sh", "-c", "node server.js & npm start --prefix ../frontend"]
