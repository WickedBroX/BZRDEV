FROM node:20-alpine

WORKDIR /app

# Copy root config files for workspace support
COPY package.json package-lock.json ./

# Copy backend package.json to the correct location
COPY backend/package.json ./backend/
# We also need frontend package.json because 'npm ci' at root will look for all workspaces defined in root package.json
COPY frontend/package.json ./frontend/

# Install dependencies (from root, respecting workspaces)
RUN npm ci

# Copy the rest of the backend source code
COPY backend/ ./backend/

# Switch to backend directory to run
WORKDIR /app/backend

EXPOSE 3001

CMD ["node", "server.js"]
