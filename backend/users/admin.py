from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):

    model = User

    # What you see in the list view
    list_display = (
        "email",
        "full_name",
        "role",
        "department",
        "supervisor",
        "is_staff",
        "is_active",
    )

    list_filter = (
        "role",
        "department",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "email",
        "full_name",
        "department",
    )

    ordering = ("email",)

    # Main edit form (IMPORTANT FIXED)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name",)}),
        ("Role & Organization", {
            "fields": ("role", "department", "supervisor")
        }),
        ("Permissions", {
            "fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")
        }),
        ("Leave Balances", {
            "fields": ("annual_leave_balance", "sick_leave_balance")
        }),
        ("Timestamps", {
            "fields": ("last_login", "date_joined")
        }),
    )

    # Add user form (creates user in admin)
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email",
                "full_name",
                "password1",
                "password2",
                "role",
                "department",
                "supervisor",
                "is_staff",
                "is_active",
            ),
        }),
    )

    # Remove read-only mistake (IMPORTANT)
    readonly_fields = ("last_login", "date_joined")