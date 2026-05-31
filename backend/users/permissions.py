from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "admin"


class IsSupervisor(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "supervisor"


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "employee"