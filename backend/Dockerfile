FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN addgroup --system app && adduser --system --ingroup app app \
    && mkdir -p /app/staticfiles \
    && chown -R app:app /app
RUN chmod +x /app/entrypoint.sh
USER app
EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]
