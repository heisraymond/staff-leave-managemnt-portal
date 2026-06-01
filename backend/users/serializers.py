from rest_framework import serializers
from .models import User

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email", "role"]


class UserSerializer(serializers.ModelSerializer):
    supervisor = SimpleUserSerializer(read_only=True)

    annual_leave_balance = serializers.FloatField()
    sick_leave_balance = serializers.FloatField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "role",
            "department",
            "supervisor",
            "annual_leave_balance",
            "sick_leave_balance",
            "created_at",
            "updated_at",
        ]

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            "email",
            "full_name",
            "password",
            "role",
            "department",
            "supervisor",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user
    
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class EmployeeBalanceSerializer(serializers.ModelSerializer):
    employee = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "employee",
            "annual_leave_balance",
            "sick_leave_balance",
        ]

    def get_employee(self, obj):
        return {
            "id": obj.id,
            "full_name": obj.full_name,
            "email": obj.email,
        }