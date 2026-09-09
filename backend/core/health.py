import logging
import time

from django.conf import settings
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_safe

logger = logging.getLogger(__name__)

OK = 'ok'
ERROR = 'error'

# Vyhodnotí se při importu, tedy prakticky při startu gunicorn workeru. monotonic()
# proto, že uptime nesmí rozhodit posun systémového času.
_STARTED_AT = time.monotonic()

MAX_PENDING_LISTED = 5


def _failure(exc):
    # Ven jen jméno třídy: text hlášky od psycopg umí obsahovat hostname, jméno DB
    # i uživatele, a tenhle endpoint je veřejný. Celá výjimka jde do logu.
    logger.exception('Health check selhal')
    return {'status': ERROR, 'detail': type(exc).__name__}


def check_database():
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
    # Široký except schválně: health check nesmí spadnout, jinak vrátí 500 místo 503.
    except Exception as exc:
        return _failure(exc)
    return {'status': OK}


def check_migrations():
    try:
        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
    except Exception as exc:
        return _failure(exc)

    if plan:
        names = [f'{migration.app_label}.{migration.name}' for migration, _ in plan]
        listed = ', '.join(names[:MAX_PENDING_LISTED])
        if len(names) > MAX_PENDING_LISTED:
            listed += f' (+{len(names) - MAX_PENDING_LISTED} dalších)'
        return {'status': ERROR, 'detail': f'{len(names)} nespuštěných migrací: {listed}'}
    return {'status': OK}


@require_safe
@never_cache
def health(request):
    checks = {
        'database': check_database(),
        'migrations': check_migrations(),
    }
    healthy = all(check['status'] == OK for check in checks.values())

    payload = {
        'status': OK if healthy else ERROR,
        'app': settings.APP_NAME,
        'version': settings.GIT_COMMIT,
        'timestamp': timezone.now().isoformat(),
        'uptime_seconds': round(time.monotonic() - _STARTED_AT),
        'checks': checks,
    }

    response = JsonResponse(payload, status=200 if healthy else 503)
    # Monitoring běží na jiné doméně a čte jen tenhle veřejný read-only výstup.
    response['Access-Control-Allow-Origin'] = '*'
    return response
