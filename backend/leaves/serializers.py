from rest_framework import serializers
from .models import LeaveRequest
from datetime import date, timedelta


class LeaveRequestSerializer(serializers.ModelSerializer):

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

        # overlapping leave request check
        overlapping = LeaveRequest.objects.filter(
            user=user,
            status__in=["pending", "approved"],
            start_date__lte=end_date,
            end_date__gte=start_date,
        )

        if overlapping.exists():
            raise serializers.ValidationError({
                "non_field_errors": [
                    "You already have an overlapping leave request."
                ]
            })

        # calculate working days
        total_days = self.calculate_working_days(
            start_date,
            end_date
        )

        # annual leave balance check
        if (
            data.get("leave_type") == "annual"
            and hasattr(user, "annual_leave_balance")
        ):
            if user.annual_leave_balance < total_days:
                raise serializers.ValidationError({
                    "leave_balance":
                    "Insufficient annual leave balance."
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