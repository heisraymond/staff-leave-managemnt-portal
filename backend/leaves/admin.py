from django.contrib import admin
from .models import LeaveRequest


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "leave_type",
        "start_date",
        "end_date",
        "total_days",
        "status",
        "reviewed_by",
        "created_at",
    )

    list_filter = (
        "status",
        "leave_type",
        "created_at",
    )

    search_fields = (
        "user__email",
        "user__full_name",
        "reason",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "total_days",
        "created_at",
    )

    fieldsets = (
        ("Applicant Info", {
            "fields": ("user", "leave_type")
        }),
        ("Dates", {
            "fields": ("start_date", "end_date", "total_days")
        }),
        ("Reason", {
            "fields": ("reason",)
        }),
        ("Review", {
            "fields": ("status", "reviewed_by", "review_comment", "reviewed_at")
        }),
        ("System", {
            "fields": ("created_at",)
        }),
    )