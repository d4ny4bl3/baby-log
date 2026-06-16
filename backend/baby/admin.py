from datetime import datetime, timezone

from django.contrib import admin

from .models import Child, Diaper, Eat, Sleep


def _fmt(ms):
    if ms is None:
        return "-"
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).strftime("%Y-%m-%d %H:%M")


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "gender", "birth_date_fmt", "deleted_at_fmt"]
    list_filter = ["gender"]
    search_fields = ["name", "user__email"]

    @admin.display(description="Birth date")
    def birth_date_fmt(self, obj):
        return _fmt(obj.birth_date)

    @admin.display(description="Deleted at")
    def deleted_at_fmt(self, obj):
        return _fmt(obj.deleted_at)


@admin.register(Sleep)
class SleepAdmin(admin.ModelAdmin):
    list_display = ["id", "child", "started_at_fmt", "ended_at_fmt", "deleted_at_fmt"]
    search_fields = ["child__name"]

    @admin.display(description="Started at")
    def started_at_fmt(self, obj):
        return _fmt(obj.started_at)

    @admin.display(description="Ended at")
    def ended_at_fmt(self, obj):
        return _fmt(obj.ended_at)

    @admin.display(description="Deleted at")
    def deleted_at_fmt(self, obj):
        return _fmt(obj.deleted_at)


@admin.register(Eat)
class EatAdmin(admin.ModelAdmin):
    list_display = ["id", "child", "started_at_fmt", "type", "amount", "deleted_at_fmt"]
    list_filter = ["type"]
    search_fields = ["child__name"]

    @admin.display(description="Started at")
    def started_at_fmt(self, obj):
        return _fmt(obj.started_at)

    @admin.display(description="Deleted at")
    def deleted_at_fmt(self, obj):
        return _fmt(obj.deleted_at)


@admin.register(Diaper)
class DiaperAdmin(admin.ModelAdmin):
    list_display = ["id", "child", "changed_at_fmt", "type", "deleted_at_fmt"]
    list_filter = ["type"]
    search_fields = ["child__name"]

    @admin.display(description="Changed at")
    def changed_at_fmt(self, obj):
        return _fmt(obj.changed_at)

    @admin.display(description="Deleted at")
    def deleted_at_fmt(self, obj):
        return _fmt(obj.deleted_at)
