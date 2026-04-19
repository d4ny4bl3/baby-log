from django.contrib import admin
from .models import Child, Sleep, Eat, Diaper


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "gender", "birth_date", "deleted_at"]
    list_filter = ["gender"]
    search_fields = ["name", "user__email"]


@admin.register(Sleep)
class SleepAdmin(admin.ModelAdmin):
    list_display = ["id", "child", "started_at", "ended_at", "deleted_at"]
    search_fields = ["child__name"]


@admin.register(Eat)
class EatAdmin(admin.ModelAdmin):
    list_display = ["id", "child", "started_at", "type", "amount", "deleted_at"]
    list_filter = ["type"]
    search_fields = ["child__name"]


@admin.register(Diaper)
class DiaperAdmin(admin.ModelAdmin):
    list_display = ["id", "child", "changed_at", "type", "deleted_at"]
    list_filter = ["type"]
    search_fields = ["child__name"]
