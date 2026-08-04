from django.db.models import Q
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)
from rest_framework import status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from tasks.examples import (
    create_request_example,
    create_response_example,
    delete_response_example,
    list_response_example,
    retrieve_response_example,
    update_request_example,
    update_response_example,
)
from tasks.models import Task
from tasks.serializers import (
    TaskCreateSerializer,
    TaskListQuerySerializer,
    TaskListResponseSerializer,
    TaskOutputSerializer,
    TaskResponseSerializer,
    TaskUpdateSerializer,
)


class TaskPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = "pageSize"
    max_page_size = 100


def ok(code: int, message: str, data) -> Response:
    return Response({"code": code, "message": message, "data": data}, status=code)


@extend_schema_view(
    list=extend_schema(
        summary="List tasks",
        parameters=[
            OpenApiParameter(
                "page",
                OpenApiTypes.INT,
                OpenApiParameter.QUERY,
                description="Page number (default: 1)",
            ),
            OpenApiParameter(
                "pageSize",
                OpenApiTypes.INT,
                OpenApiParameter.QUERY,
                description="Items per page (default: 5, max: 100)",
            ),
            OpenApiParameter(
                "search",
                OpenApiTypes.STR,
                OpenApiParameter.QUERY,
                description="Search in title and description",
            ),
            OpenApiParameter(
                "status",
                OpenApiTypes.STR,
                OpenApiParameter.QUERY,
                enum=["Todo", "In Progress", "Done"],
            ),
            OpenApiParameter(
                "priority",
                OpenApiTypes.STR,
                OpenApiParameter.QUERY,
                enum=["Low", "Medium", "High"],
            ),
            OpenApiParameter(
                "dueDateOp",
                OpenApiTypes.STR,
                OpenApiParameter.QUERY,
                description="Due-date filter mode",
                enum=["before", "after", "on", "between"],
            ),
            OpenApiParameter(
                "dueDate",
                OpenApiTypes.DATE,
                OpenApiParameter.QUERY,
                description="Date for before / after / on",
            ),
            OpenApiParameter(
                "dueDateFrom",
                OpenApiTypes.DATE,
                OpenApiParameter.QUERY,
                description="Range start (with dueDateOp=between)",
            ),
            OpenApiParameter(
                "dueDateTo",
                OpenApiTypes.DATE,
                OpenApiParameter.QUERY,
                description="Range end (with dueDateOp=between)",
            ),
            OpenApiParameter(
                "sort",
                OpenApiTypes.STR,
                OpenApiParameter.QUERY,
                enum=[
                    "due_date",
                    "title",
                    "priority",
                    "status",
                    "created_at",
                    "updated_at",
                ],
            ),
            OpenApiParameter(
                "order",
                OpenApiTypes.STR,
                OpenApiParameter.QUERY,
                enum=["asc", "desc"],
            ),
        ],
        responses={200: TaskListResponseSerializer},
        examples=[list_response_example],
    ),
    create=extend_schema(
        summary="Create task",
        request=TaskCreateSerializer,
        responses={201: TaskResponseSerializer},
        examples=[create_request_example, create_response_example],
    ),
    retrieve=extend_schema(
        summary="Get task",
        responses={200: TaskResponseSerializer},
        examples=[retrieve_response_example],
    ),
    partial_update=extend_schema(
        summary="Update task",
        request=TaskUpdateSerializer,
        responses={200: TaskResponseSerializer},
        examples=[update_request_example, update_response_example],
    ),
    destroy=extend_schema(
        summary="Delete task",
        responses={200: TaskResponseSerializer},
        examples=[delete_response_example],
    ),
)
class TaskViewSet(viewsets.ModelViewSet):
    pagination_class = TaskPagination
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return TaskCreateSerializer
        if self.action == "partial_update":
            return TaskUpdateSerializer
        return TaskOutputSerializer

    def get_queryset(self):
        qs = Task.objects.all()
        if self.action != "list":
            return qs

        query = TaskListQuerySerializer(data=self.request.query_params)
        query.is_valid(raise_exception=True)
        p = query.validated_data

        if search := p.get("search", "").strip():
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if p.get("status"):
            qs = qs.filter(status=p["status"])
        if p.get("priority"):
            qs = qs.filter(priority=p["priority"])

        due_op = p.get("dueDateOp") or ""
        if due_op == "before":
            qs = qs.filter(due_date__lt=p["dueDate"])
        elif due_op == "after":
            qs = qs.filter(due_date__gt=p["dueDate"])
        elif due_op == "on":
            qs = qs.filter(due_date=p["dueDate"])
        elif due_op == "between":
            qs = qs.filter(
                due_date__gte=p["dueDateFrom"],
                due_date__lte=p["dueDateTo"],
            )

        sort = p.get("sort", "created_at")
        return qs.order_by(sort if p.get("order") == "asc" else f"-{sort}")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        data = TaskOutputSerializer(page if page is not None else queryset, many=True).data
        if page is not None:
            data = self.paginator.get_paginated_response(data).data
        return ok(status.HTTP_200_OK, "Tasks retrieved successfully", data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        data = TaskOutputSerializer(task).data
        return ok(
            status.HTTP_201_CREATED,
            f"Task with ID {task.id} successfully created",
            data,
        )

    def retrieve(self, request, *args, **kwargs):
        task = self.get_object()
        data = TaskOutputSerializer(task).data
        return ok(
            status.HTTP_200_OK,
            f"Task with ID {task.id} successfully retrieved",
            data,
        )

    def partial_update(self, request, *args, **kwargs):
        task = self.get_object()
        serializer = self.get_serializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        data = TaskOutputSerializer(task).data
        return ok(
            status.HTTP_200_OK,
            f"Task with ID {task.id} successfully edited",
            data,
        )

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        data = TaskOutputSerializer(task).data
        task_id = task.id
        task.delete()
        return ok(
            status.HTTP_200_OK,
            f"Task with ID {task_id} successfully deleted",
            data,
        )
