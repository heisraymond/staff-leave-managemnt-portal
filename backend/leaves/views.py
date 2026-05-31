from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from users.permissions import IsAdmin, IsSupervisor, IsEmployee

class LeaveRequestCreateView(generics.CreateAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsEmployee]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MyLeaveRequestsView(generics.ListAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsEmployee]

    def get_queryset(self):
        return LeaveRequest.objects.filter(
            user=self.request.user
        ).order_by("-created_at")
    

class PendingLeaveRequestsView(generics.ListAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsSupervisor]

    def get_queryset(self):
        return LeaveRequest.objects.filter(status="pending")
    

class LeaveActionView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisor]

    def post(self, request, pk):
        action = request.data.get("action")  # approve | reject
        comment = request.data.get("comment", "")

        leave = get_object_or_404(LeaveRequest, pk=pk)

        if leave.status != "pending":
            return Response(
                {"message": "Leave already processed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave.reviewed_by = request.user
        leave.reviewed_at = timezone.now()

        # APPROVE
        if action == "approve":
            leave.status = "approved"

            # 🔥 DEDUCT BALANCE HERE (IMPORTANT)
            user = leave.user
            if hasattr(user, "annual_leave_balance"):
                user.annual_leave_balance -= leave.total_days
                user.save()

        # REJECT
        elif action == "reject":
            leave.status = "rejected"
            leave.review_comment = comment

        else:
            return Response(
                {"message": "Invalid action"},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave.save()

        return Response(
            {"message": f"Leave {leave.status} successfully"},
            status=status.HTTP_200_OK
        )
    

class AllLeaveRequestsView(generics.ListAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return LeaveRequest.objects.all().order_by("-created_at")