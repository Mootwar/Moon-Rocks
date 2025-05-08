# Dockerfile for Node.js backend with static frontend serving
FROM python:3.12-slim AS python-base

WORKDIR /embed-svc
COPY embed-svc/requirements.txt ./
RUN sed -i 's/^pytorch$/torch/' requirements.txt \
 && pip install --no-cache-dir -r requirements.txt

# Node + copy prebuilt /usr/local from python-base
FROM node:18-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libssl3 \
      ca-certificates \
      sqlite3 \
      libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

# bring in the Python env
COPY --from=python-base /usr/local /usr/local

WORKDIR /app

# Node deps
COPY package*.json ./
RUN npm install --production
RUN npm install node-fetch@2
# Copy everything else
COPY . .

# Make sure embed-svc/app.py listens on 0.0.0.0:5000
EXPOSE 3000 5000

CMD sh -c "npm start & python3 embed-svc/app.py"