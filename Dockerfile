FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        dumb-init && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN node --version && \
    npm --version && \
    python --version
WORKDIR /app
COPY backend/package*.json /app/backend/
WORKDIR /app/backend
RUN npm ci --omit=dev
COPY backend/ /app/backend/
WORKDIR /app/ml_service
COPY ml_service/requirements.txt /app/ml_service/
RUN pip install --no-cache-dir -r requirements.txt
COPY ml_service/ /app/ml_service/
ENV NODE_ENV=production
ENV PORT=5000
ENV ML_PORT=8000

ENV ML_SERVICE_URL=http://localhost:8000

EXPOSE 5000
EXPOSE 8000

WORKDIR /app

CMD ["dumb-init", "sh", "-c", "uvicorn ml_service.main:app --host 0.0.0.0 --port 8000 & exec node backend/server.js"]