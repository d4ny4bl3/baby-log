from rest_framework import serializers
from .models import Child, Sleep, Eat, Diaper


class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = ["id", "name", "birth_date", "gender", "photo", "created_at", "updated_at", "deleted_at"]


class ChildOwnedSerializer(serializers.ModelSerializer):
    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request is not None:
            fields["child"].queryset = Child.objects.filter(user=request.user, deleted_at__isnull=True)
        return fields


class SleepSerializer(ChildOwnedSerializer):
    class Meta:
        model = Sleep
        fields = ["id", "child", "started_at", "ended_at", "created_at", "updated_at", "deleted_at"]


class EatSerializer(ChildOwnedSerializer):
    class Meta:
        model = Eat
        fields = ["id", "child", "started_at", "type", "amount", "note", "created_at", "updated_at", "deleted_at"]


class DiaperSerializer(ChildOwnedSerializer):
    class Meta:
        model = Diaper
        fields = ["id", "child", "changed_at", "type", "created_at", "updated_at", "deleted_at"]
