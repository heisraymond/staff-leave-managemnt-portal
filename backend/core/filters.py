# leaves/filters.py

import django_filters
from leaves.models import LeaveRequest


class LeaveRequestFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name="start_date", lookup_expr="gte")
    end_date = django_filters.DateFilter(field_name="end_date", lookup_expr="lte")

    class Meta:
        model = LeaveRequest
        fields = [
            "status",
            "leave_type",
            "user__department",
        ]