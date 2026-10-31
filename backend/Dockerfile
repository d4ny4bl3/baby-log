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
# Verze pro /api/health/ se zapéká do image, aby přežila restart i znovuvytvoření
# kontejneru. Až na konci, ať změna hashe nerozbije cache instalace závislostí.
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT=$GIT_COMMIT
USER app
EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]
