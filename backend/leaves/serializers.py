from rest_framework import serializers
from users.models import User
from .models import LeaveRequest
from datetime import date, timedelta

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email"]


class LeaveRequestSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)

    class Meta:
        model = LeaveRequest
        fields = "__all__"

        read_only_fields = [
            "user",
            "status",
            "reviewed_by",
            "review_comment",
            "reviewed_at",
            "created_at",
            "total_days",
        ]

    # -----------------------------------
    # VALIDATION LOGIC
    # -----------------------------------
    def validate(self, data):

        start_date = data.get("start_date")
        end_date = data.get("end_date")

        # start date validation
        if start_date < date.today():
            raise serializers.ValidationError({
                "start_date": "Start date cannot be in the past."
            })

        # end date validation
        if end_date < start_date:
            raise serializers.ValidationError({
                "end_date": "End date cannot be before start date."
            })

        # authenticated user
        request = self.context["request"]
        user = request.user

        #  SAME USER OVERLAP CHECK
        user_overlap = LeaveRequest.objects.filter(
            user=user,
            status__in=["pending", "approved"],
            start_date__lte=end_date,
            end_date__gte=start_date,
        )

        if user_overlap.exists():
            raise serializers.ValidationError({
                "non_field_errors": [
                    "You already have an overlapping leave request."
                ]
            })

        # SYSTEM-WIDE DATE CONFLICT CHECK
        system_overlap = LeaveRequest.objects.filter(
            status__in=["pending", "approved"],
            start_date__lte=end_date,
            end_date__gte=start_date,
        ).exclude(user=user)

        if system_overlap.exists():
            raise serializers.ValidationError({
                "non_field_errors": [
                    "Another employee already has leave during these dates."
                ]
            })

        # calculate working days
        total_days = self.calculate_working_days(
            start_date,
            end_date
        )


        # LEAVE BALANCE VALIDATION
        leave_type = data.get("leave_type")
        # Annual Leave
        if leave_type == "annual":
            if user.annual_leave_balance < total_days:
                raise serializers.ValidationError({
                "leave_balance":
                f"Insufficient annual leave balance. Remaining balance is {user.annual_leave_balance} days."
        })
            
        # Sick Leave
        elif leave_type == "sick":

            if user.sick_leave_balance < total_days:
                raise serializers.ValidationError({
                "leave_balance":
                f"Insufficient sick leave balance. Remaining balance is {user.sick_leave_balance} days."
        })

        return data

    # -----------------------------------
    # CREATE LOGIC
    # -----------------------------------
    def create(self, validated_data):

        start_date = validated_data["start_date"]
        end_date = validated_data["end_date"]

        # calculate weekdays only
        total_days = self.calculate_working_days(
            start_date,
            end_date
        )

        leave = LeaveRequest.objects.create(
            total_days=total_days,
            **validated_data
        )

        return leave

    # -----------------------------------
    # BUSINESS LOGIC HELPER
    # -----------------------------------
    def calculate_working_days(
        self,
        start_date,
        end_date
    ):

        total = 0
        current = start_date

        while current <= end_date:

            # Monday-Friday only
            if current.weekday() < 5:
                total += 1

            current += timedelta(days=1)

        return total
