from django.urls import path
from .views import (
    LeaveRequestCreateView,
    MyLeaveRequestsView,
    PendingLeaveRequestsView,
    LeaveActionView,
    AllLeaveRequestsView,
)

urlpatterns = [
    path("create/", LeaveRequestCreateView.as_view()),
    path("my/", MyLeaveRequestsView.as_view()),
    path("pending/", PendingLeaveRequestsView.as_view()),
    path("<int:pk>/action/", LeaveActionView.as_view()),
    path("all/", AllLeaveRequestsView.as_view()),
]