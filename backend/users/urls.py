from django.urls import path
from .views import LoginView, ProfileView, AdminOnlyView

urlpatterns = [
    path("auth/login/", LoginView.as_view()),
    path("auth/profile/", ProfileView.as_view()),
    path("auth/admin-only/", AdminOnlyView.as_view()),
]