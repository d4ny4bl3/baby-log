from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChildViewSet, SleepViewSet, EatViewSet, DiaperViewSet, SyncPullView

router = DefaultRouter()
router.register("children", ChildViewSet, basename="child")
router.register("sleep", SleepViewSet, basename="sleep")
router.register("eat", EatViewSet, basename="eat")
router.register("diaper", DiaperViewSet, basename="diaper")

urlpatterns = [
    path("", include(router.urls)),
    path("sync/pull/", SyncPullView.as_view(), name="sync_pull"),
]
