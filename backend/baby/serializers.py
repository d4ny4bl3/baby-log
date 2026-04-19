from rest_framework import serializers
from .models import Child, Sleep, Eat, Diaper


class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = ["id", "name", "birth_date", "gender", "photo", "created_at", "updated_at", "deleted_at"]


class SleepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sleep
        fields = ["id", "child", "started_at", "ended_at", "created_at", "updated_at", "deleted_at"]


class EatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eat
        fields = ["id", "child", "started_at", "type", "amount", "note", "created_at", "updated_at", "deleted_at"]


class DiaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diaper
        fields = ["id", "child", "changed_at", "type", "created_at", "updated_at", "deleted_at"]
