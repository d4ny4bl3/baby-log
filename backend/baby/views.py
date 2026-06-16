from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status

from .models import Child, Sleep, Eat, Diaper
from .serializers import ChildSerializer, SleepSerializer, EatSerializer, DiaperSerializer


# --- ViewSet ---

class BabyViewSet(ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(updated_at=int(timezone.now().timestamp() * 1000))

    def perform_update(self, serializer):
        serializer.save(updated_at=int(timezone.now().timestamp() * 1000))

    def perform_destroy(self, instance):
        now = int(timezone.now().timestamp() * 1000)
        instance.deleted_at = now
        instance.updated_at = now
        instance.save()


class ChildViewSet(BabyViewSet):
    serializer_class = ChildSerializer

    def get_queryset(self):
        return Child.objects.filter(user=self.request.user, deleted_at__isnull=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, updated_at=int(timezone.now().timestamp() * 1000))


class SleepViewSet(BabyViewSet):
    serializer_class = SleepSerializer

    def get_queryset(self):
        return Sleep.objects.filter(child__user=self.request.user, deleted_at__isnull=True)


class EatViewSet(BabyViewSet):
    serializer_class = EatSerializer

    def get_queryset(self):
        return Eat.objects.filter(child__user=self.request.user, deleted_at__isnull=True)


class DiaperViewSet(BabyViewSet):
    serializer_class = DiaperSerializer

    def get_queryset(self):
        return Diaper.objects.filter(child__user=self.request.user, deleted_at__isnull=True)


# --- Sync ---

class SyncPullView(APIView):
    def get(self, request):
        since = request.query_params.get("since")
        if not since:
            return Response({"error": "since parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            since = int(since)
        except ValueError:
            return Response({"error": "since must be a timestamp in milliseconds"}, status=status.HTTP_400_BAD_REQUEST)

        children = Child.objects.filter(user=request.user, updated_at__gt=since)
        sleeps = Sleep.objects.filter(child__user=request.user, updated_at__gt=since)
        eats = Eat.objects.filter(child__user=request.user, updated_at__gt=since)
        diapers = Diaper.objects.filter(child__user=request.user, updated_at__gt=since)

        server_time = int(timezone.now().timestamp() * 1000)

        return Response({
            "server_time": server_time,
            "children": ChildSerializer(children, many=True).data,
            "sleeps": SleepSerializer(sleeps, many=True).data,
            "eats": EatSerializer(eats, many=True).data,
            "diapers": DiaperSerializer(diapers, many=True).data,
        })


# #  --- Function-based ---

# @api_view(["GET", "POST"])
# def children_fbv(request):
#     if request.method == "GET":
#         qs = Child.objects.filter(user=request.user, deleted_at__isnull=True)
#         return Response(ChildSerializer(qs, many=True).data)
#     elif request.method == "POST":
#         serializer = ChildSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save(user=request.user)
#         return Response(serializer.data, status=201)


# @api_view(["GET", "PATCH", "DELETE"])
# def child_detail_fbv(request, pk):
#     child = get_object_or_404(Child, pk=pk, user=request.user)
#     if request.method == "GET":
#         return Response(ChildSerializer(child).data)
#     elif request.method == "PATCH":
#         serializer = ChildSerializer(child, data=request.data, partial=True)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(serializer.data)
#     elif request.method == "DELETE":
#         child.delete()
#         return Response(status=204)


# # --- Class-based ---

# class ChildListView(APIView):
#     def get(self, request):
#         qs = Child.objects.filter(user=request.user, deleted_at__isnull=True)
#         return Response(ChildSerializer(qs, many=True).data)

#     def post(self, request):
#         serializer = ChildSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save(user=request.user)
#         return Response(serializer.data, status=201)


# class ChildDetailView(APIView):
#     def get_object(self, request, pk):
#         return get_object_or_404(Child, pk=pk, user=request.user)

#     def get(self, request, pk):
#         return Response(ChildSerializer(self.get_object(request, pk)).data)

#     def patch(self, request, pk):
#         serializer = ChildSerializer(self.get_object(request, pk), data=request.data, partial=True)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(serializer.data)

#     def delete(self, request, pk):
#         self.get_object(request, pk).delete()
#         return Response(status=204)
