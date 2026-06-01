from django.urls import path
from .views import AdminDashboardView, AdminLeaveRequestListView, EmployeeLeaveBalanceView, LeaveReportExportView

urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view()),
    path("leave-requests/", AdminLeaveRequestListView.as_view()),
    path("employee-leave-balances/", EmployeeLeaveBalanceView.as_view()),
    path("reports/export/", LeaveReportExportView.as_view()),
]