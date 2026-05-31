from django.urls import path
from .views import LoginView, ProfileView, AdminOnlyView

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("profile/", ProfileView.as_view()),
    path("admin-only/", AdminOnlyView.as_view()),
]