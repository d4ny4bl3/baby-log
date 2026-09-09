from unittest.mock import patch

from django.db import OperationalError
from django.test import TestCase, override_settings
from django.urls import reverse


class HealthTests(TestCase):
    def setUp(self):
        self.url = reverse('health')

    def test_healthy_returns_200_and_full_payload(self):
        with override_settings(APP_NAME='Baby log', GIT_COMMIT='abc1234'):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload['status'], 'ok')
        self.assertEqual(payload['app'], 'Baby log')
        self.assertEqual(payload['version'], 'abc1234')
        self.assertEqual(payload['checks']['database']['status'], 'ok')
        self.assertEqual(payload['checks']['migrations']['status'], 'ok')
        self.assertIsInstance(payload['uptime_seconds'], int)
        self.assertGreaterEqual(payload['uptime_seconds'], 0)
        self.assertTrue(payload['timestamp'])

    def test_available_without_authentication(self):
        self.assertEqual(self.client.get(self.url).status_code, 200)

    def test_broken_database_returns_503(self):
        with patch('core.health.connection.cursor', side_effect=OperationalError('boom')):
            with self.assertLogs('core.health', 'ERROR'):
                response = self.client.get(self.url)

        self.assertEqual(response.status_code, 503)
        payload = response.json()
        self.assertEqual(payload['status'], 'error')
        self.assertEqual(payload['checks']['database']['status'], 'error')

    def test_database_error_does_not_leak_message(self):
        secret = 'password authentication failed for user "babylog"'
        with patch('core.health.connection.cursor', side_effect=OperationalError(secret)):
            with self.assertLogs('core.health', 'ERROR'):
                response = self.client.get(self.url)

        self.assertNotIn('babylog', response.content.decode())
        self.assertEqual(response.json()['checks']['database']['detail'], 'OperationalError')

    def test_pending_migrations_return_503(self):
        plan = [(FakeMigration('baby', '0099_neco'), False)]
        with patch('core.health.MigrationExecutor.migration_plan', return_value=plan):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, 503)
        payload = response.json()
        self.assertEqual(payload['status'], 'error')
        self.assertEqual(payload['checks']['database']['status'], 'ok')
        migrations = payload['checks']['migrations']
        self.assertEqual(migrations['status'], 'error')
        self.assertIn('baby.0099_neco', migrations['detail'])

    def test_many_pending_migrations_are_truncated(self):
        plan = [(FakeMigration('baby', f'{index:04d}_neco'), False) for index in range(9)]
        with patch('core.health.MigrationExecutor.migration_plan', return_value=plan):
            response = self.client.get(self.url)

        detail = response.json()['checks']['migrations']['detail']
        self.assertIn('9 nespuštěných migrací', detail)
        self.assertIn('+4 dalších', detail)
        self.assertNotIn('0008_neco', detail)

    def test_response_is_not_cached(self):
        response = self.client.get(self.url)
        self.assertIn('no-cache', response.headers['Cache-Control'])

    def test_allows_cross_origin_read(self):
        response = self.client.get(self.url)
        self.assertEqual(response.headers['Access-Control-Allow-Origin'], '*')

    def test_post_is_rejected(self):
        self.assertEqual(self.client.post(self.url).status_code, 405)


class FakeMigration:
    def __init__(self, app_label, name):
        self.app_label = app_label
        self.name = name
