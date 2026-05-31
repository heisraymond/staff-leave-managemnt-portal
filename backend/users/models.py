from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        # For accessing Django Admin Panel
        extra_fields.setdefault("is_staff", True)
        # Provides all permissions
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")

        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):

    username = None

    ROLE_CHOICES = [
        ("employee", "Employee"),
        ("supervisor", "Supervisor"),
        ("admin", "Admin"),
    ]

    # Identity
    full_name = models.CharField(max_length=100)

    email = models.EmailField(
        unique=True,
        max_length=150,
        db_index=True
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="employee"
    )

    department = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_index=True
    )

    supervisor = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subordinates"
    )

    annual_leave_balance = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=20.0,
        validators=[MinValueValidator(0.0)]
    )

    sick_leave_balance = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=12.0,
        validators=[MinValueValidator(0.0)]
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

  
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]