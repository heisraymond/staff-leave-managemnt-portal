# views.py
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend

from users.serializers import EmployeeBalanceSerializer
from users.models import User
from leaves.models import LeaveRequest

from leaves.serializers import LeaveRequestSerializer
from .filters import LeaveRequestFilter
from .pagination import StandardResultsPagination

from django.utils.dateparse import parse_date
from .services.report_export import export_leave_csv, export_leave_pdf


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Total employees
        total_employees = User.objects.count()

        # Total leave requests
        total_leave_requests = LeaveRequest.objects.count()

        # Status breakdown
        status_counts_qs = (
            LeaveRequest.objects
            .values("status")
            .annotate(count=Count("id"))
        )

        status_counts = {item["status"]: item["count"] for item in status_counts_qs}

        # Leave type breakdown
        leave_type_counts_qs = (
            LeaveRequest.objects
            .values("leave_type")
            .annotate(count=Count("id"))
        )

        leave_type_counts = {
            item["leave_type"]: item["count"]
            for item in leave_type_counts_qs
        }

        return Response({
            "total_employees": total_employees,
            "total_leave_requests": total_leave_requests,
            "status_counts": status_counts,
            "leave_type_counts": leave_type_counts
        })
    

class AdminLeaveRequestListView(ListAPIView):
    permission_classes = [IsAdminUser]
    queryset = LeaveRequest.objects.select_related("user").all()
    serializer_class = LeaveRequestSerializer

    # pagination
    pagination_class = StandardResultsPagination

    # filtering + search
    filterset_class = LeaveRequestFilter
    filter_backends = [DjangoFilterBackend, SearchFilter]

    # search config
    search_fields = ["user__full_name"]


class EmployeeLeaveBalanceView(ListAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = EmployeeBalanceSerializer

    def get_queryset(self):
        return User.objects.only(
            "id",
            "full_name",
            "email",
            "annual_leave_balance",
            "sick_leave_balance"
        )
    

class LeaveReportExportView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        queryset = LeaveRequest.objects.select_related("user").all()

        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")
        status = request.GET.get("status")
        file_type = request.GET.get("type", "csv")

        if start_date:
            queryset = queryset.filter(start_date__gte=parse_date(start_date))

        if end_date:
            queryset = queryset.filter(end_date__lte=parse_date(end_date))

        if status:
            queryset = queryset.filter(status=status)

        if file_type == "pdf":
            return export_leave_pdf(queryset)

        return export_leave_csv(queryset)