from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers

from tasks.examples import (
    CREATE_TASK_EXAMPLE,
    TASK_EXAMPLE,
    UPDATE_TASK_EXAMPLE,
)
from tasks.models import Task

ALLOWED_SORT_FIELDS = (
    "due_date",
    "title",
    "priority",
    "status",
    "created_at",
    "updated_at",
)


@extend_schema_serializer(
    examples=[
        OpenApiExample("Task", value=TASK_EXAMPLE),
    ]
)
class TaskOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Create task",
            value=CREATE_TASK_EXAMPLE,
            request_only=True,
        ),
    ]
)
class TaskCreateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(max_length=100, required=True, allow_blank=False)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    status = serializers.ChoiceField(
        choices=Task.Status.choices,
        required=False,
        default=Task.Status.TODO,
    )
    priority = serializers.ChoiceField(
        choices=Task.Priority.choices,
        required=False,
        default=Task.Priority.MEDIUM,
    )
    due_date = serializers.DateField(required=False, allow_null=True, default=None)

    class Meta:
        model = Task
        fields = ["title", "description", "status", "priority", "due_date"]

    def validate_title(self, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Title is required.")
        return cleaned


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Update task",
            value=UPDATE_TASK_EXAMPLE,
            request_only=True,
        ),
    ]
)
class TaskUpdateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(max_length=100, required=False, allow_blank=False)
    description = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=Task.Status.choices, required=False)
    priority = serializers.ChoiceField(
        choices=Task.Priority.choices, required=False
    )
    due_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ["title", "description", "status", "priority", "due_date"]

    def validate_title(self, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Title is required.")
        return cleaned


class TaskListQuerySerializer(serializers.Serializer):
    page = serializers.IntegerField(required=False, min_value=1, default=1)
    pageSize = serializers.IntegerField(
        required=False, min_value=1, max_value=100, default=5
    )
    search = serializers.CharField(required=False, allow_blank=True, default="")
    status = serializers.ChoiceField(
        choices=Task.Status.choices, required=False, allow_blank=True
    )
    priority = serializers.ChoiceField(
        choices=Task.Priority.choices, required=False, allow_blank=True
    )
    dueDateOp = serializers.ChoiceField(
        choices=[
            ("before", "before"),
            ("after", "after"),
            ("on", "on"),
            ("between", "between"),
        ],
        required=False,
        allow_blank=True,
    )
    dueDate = serializers.DateField(required=False, allow_null=True)
    dueDateFrom = serializers.DateField(required=False, allow_null=True)
    dueDateTo = serializers.DateField(required=False, allow_null=True)
    sort = serializers.ChoiceField(
        choices=[(f, f) for f in ALLOWED_SORT_FIELDS],
        required=False,
        default="created_at",
    )
    order = serializers.ChoiceField(
        choices=[("asc", "asc"), ("desc", "desc")],
        required=False,
        default="desc",
    )

    def validate(self, attrs):
        op = attrs.get("dueDateOp") or ""
        if not op:
            return attrs
        if op == "between":
            if not attrs.get("dueDateFrom") or not attrs.get("dueDateTo"):
                raise serializers.ValidationError(
                    {
                        "dueDateFrom": "Required for between.",
                        "dueDateTo": "Required for between.",
                    }
                )
            if attrs["dueDateFrom"] > attrs["dueDateTo"]:
                raise serializers.ValidationError(
                    {"dueDateTo": "Must be on or after dueDateFrom."}
                )
        elif not attrs.get("dueDate"):
            raise serializers.ValidationError(
                {"dueDate": f"Required when dueDateOp is {op}."}
            )
        return attrs


class TaskListDataSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.CharField(allow_null=True)
    previous = serializers.CharField(allow_null=True)
    results = TaskOutputSerializer(many=True)


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Task response",
            value={
                "code": 200,
                "message": "Task with ID a1b2c3d4-e5f6-7890-abcd-ef1234567890 successfully retrieved",
                "data": TASK_EXAMPLE,
            },
        ),
    ]
)
class TaskResponseSerializer(serializers.Serializer):
    code = serializers.IntegerField()
    message = serializers.CharField()
    data = TaskOutputSerializer()


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "List response",
            value={
                "code": 200,
                "message": "Tasks retrieved successfully",
                "data": {
                    "count": 1,
                    "next": None,
                    "previous": None,
                    "results": [TASK_EXAMPLE],
                },
            },
        ),
    ]
)
class TaskListResponseSerializer(serializers.Serializer):
    code = serializers.IntegerField()
    message = serializers.CharField()
    data = TaskListDataSerializer()


class HealthDataSerializer(serializers.Serializer):
    status = serializers.CharField()
    service = serializers.CharField()


class HealthResponseSerializer(serializers.Serializer):
    code = serializers.IntegerField()
    message = serializers.CharField()
    data = HealthDataSerializer()


class FlowStepSerializer(serializers.Serializer):
    name = serializers.CharField()
    passed = serializers.BooleanField()
    detail = serializers.JSONField(required=False, allow_null=True)


class FlowTestDataSerializer(serializers.Serializer):
    passed = serializers.BooleanField()
    message = serializers.CharField()
    steps = FlowStepSerializer(many=True)


class FlowTestResponseSerializer(serializers.Serializer):
    code = serializers.IntegerField()
    message = serializers.CharField()
    data = FlowTestDataSerializer()


class DemoSeedResponseSerializer(serializers.Serializer):
    code = serializers.IntegerField()
    message = serializers.CharField()
    data = TaskOutputSerializer(many=True)


class ClearDataSerializer(serializers.Serializer):
    deleted = serializers.IntegerField()


class DemoClearResponseSerializer(serializers.Serializer):
    code = serializers.IntegerField()
    message = serializers.CharField()
    data = ClearDataSerializer()
