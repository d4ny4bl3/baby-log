from django.contrib.auth.models import User
from django.db import models


class Child(models.Model):
    id = models.CharField(max_length=36, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="children")
    name = models.CharField(max_length=255)
    birth_date = models.DateTimeField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    photo = models.TextField(null=True, blank=True)
    created_at = models.BigIntegerField()
    updated_at = models.BigIntegerField()
    deleted_at = models.BigIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["name"]


class Sleep(models.Model):
    id = models.CharField(max_length=36, primary_key=True)
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name="sleeps")
    started_at = models.BigIntegerField()
    ended_at = models.BigIntegerField(null=True, blank=True)
    created_at = models.BigIntegerField()
    updated_at = models.BigIntegerField()
    deleted_at = models.BigIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]


class Eat(models.Model):
    id = models.CharField(max_length=36, primary_key=True)
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name="eats")
    started_at = models.BigIntegerField()
    type = models.CharField(max_length=20, null=True, blank=True)
    amount = models.IntegerField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    created_at = models.BigIntegerField()
    updated_at = models.BigIntegerField()
    deleted_at = models.BigIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]


class Diaper(models.Model):
    id = models.CharField(max_length=36, primary_key=True)
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name="diapers")
    changed_at = models.BigIntegerField()
    type = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.BigIntegerField()
    updated_at = models.BigIntegerField()
    deleted_at = models.BigIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-changed_at"]
