FROM node:22-slim

# Install python and pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Install python dependencies for grok-api
RUN pip3 install --no-cache-dir -r services/grok-api/requirements.txt --break-system-packages

EXPOSE 3000
CMD ["./run.sh"]
