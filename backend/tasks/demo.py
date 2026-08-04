from datetime import date, timedelta

from django.db import transaction
from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from tasks.models import Task
from tasks.serializers import (
    DemoClearResponseSerializer,
    DemoSeedResponseSerializer,
    FlowTestResponseSerializer,
    HealthResponseSerializer,
    TaskOutputSerializer,
)
from tasks.views import ok

DEMO_TASKS = [
    {
        "title": "Draft project brief",
        "description": "Outline goals and success metrics.",
        "status": "Todo",
        "priority": "High",
        "due_offset": 2,
    },
    {
        "title": "Review API contracts",
        "description": "Align request/response shapes with frontend.",
        "status": "In Progress",
        "priority": "High",
        "due_offset": 1,
    },
    {
        "title": "Write unit tests",
        "description": "Cover serializers and list filters.",
        "status": "Todo",
        "priority": "Medium",
        "due_offset": 5,
    },
    {
        "title": "Fix pagination edge case",
        "description": "Empty last page should still return 200.",
        "status": "In Progress",
        "priority": "Medium",
        "due_offset": 3,
    },
    {
        "title": "Update Swagger descriptions",
        "description": "Tighten summaries for task endpoints.",
        "status": "Done",
        "priority": "Low",
        "due_offset": -2,
    },
    {
        "title": "Seed staging database",
        "description": "Prepare demo data for stakeholder review.",
        "status": "Done",
        "priority": "Medium",
        "due_offset": -5,
    },
    {
        "title": "Polish task table UI",
        "description": "Chips, sorting headers, and skeletons.",
        "status": "In Progress",
        "priority": "High",
        "due_offset": 0,
    },
    {
        "title": "Add dark mode QA checklist",
        "description": "Verify contrast on primary and danger actions.",
        "status": "Todo",
        "priority": "Low",
        "due_offset": 7,
    },
    {
        "title": "Document install steps",
        "description": "README for backend venv and frontend Vite.",
        "status": "Todo",
        "priority": "Medium",
        "due_offset": 4,
    },
    {
        "title": "Optimize list query",
        "description": "Ensure indexes for status and due_date filters.",
        "status": "Todo",
        "priority": "High",
        "due_offset": 6,
    },
    {
        "title": "Handle CORS for local Vite",
        "description": "Confirm localhost:5173 is allowed.",
        "status": "Done",
        "priority": "Low",
        "due_offset": -1,
    },
    {
        "title": "Create delete confirm copy",
        "description": "Include title and ID in confirm modal.",
        "status": "Done",
        "priority": "Medium",
        "due_offset": -3,
    },
    {
        "title": "Slide-over animation polish",
        "description": "Enter and exit transitions with dark backdrop.",
        "status": "In Progress",
        "priority": "Low",
        "due_offset": 2,
    },
    {
        "title": "Bulk delete selection UX",
        "description": "Select-all and danger action in toolbar.",
        "status": "Todo",
        "priority": "Medium",
        "due_offset": 8,
    },
    {
        "title": "Prepare assessment demo",
        "description": "Walk through CRUD, filters, and pagination.",
        "status": "Todo",
        "priority": "High",
        "due_offset": 1,
    },
]


def seed_demo_tasks(task_model=Task) -> list:
    """Create the standard demo tasks. task_model allows use from migrations."""
    today = date.today()
    created = []
    with transaction.atomic():
        for item in DEMO_TASKS:
            created.append(
                task_model.objects.create(
                    title=item["title"],
                    description=item["description"],
                    status=item["status"],
                    priority=item["priority"],
                    due_date=today + timedelta(days=item["due_offset"]),
                )
            )
    return created


def clear_all_tasks(task_model=Task) -> int:
    deleted, _ = task_model.objects.all().delete()
    return deleted


class TestEndpointView(APIView):
    @extend_schema(
        summary="Test endpoint",
        tags=["Utility"],
        request=None,
        responses={200: HealthResponseSerializer},
        examples=[
            OpenApiExample(
                "Health response",
                value={
                    "code": 200,
                    "message": "API is reachable",
                    "data": {
                        "status": "ok",
                        "service": "task-management",
                    },
                },
                response_only=True,
            ),
        ],
    )
    def get(self, request: Request) -> Response:
        return ok(
            status.HTTP_200_OK,
            "API is reachable",
            {
                "status": "ok",
                "service": "task-management",
            },
        )


class TestFlowView(APIView):
    @extend_schema(
        summary="Run task CRUD flow test",
        tags=["Utility"],
        request=None,
        responses={
            200: FlowTestResponseSerializer,
            500: FlowTestResponseSerializer,
        },
        examples=[
            OpenApiExample(
                "Flow passed",
                value={
                    "code": 200,
                    "message": "Task CRUD flow passed",
                    "data": {
                        "passed": True,
                        "message": "Task CRUD flow passed",
                        "steps": [
                            {
                                "name": "GET /api/tasks/",
                                "passed": True,
                                "detail": {"status_code": 200, "count": 15},
                            }
                        ],
                    },
                },
                response_only=True,
                status_codes=["200"],
            ),
        ],
    )
    def post(self, request: Request) -> Response:
        from tasks.flow_test import run_task_crud_flow

        result = run_task_crud_flow()
        code = (
            status.HTTP_200_OK
            if result["passed"]
            else status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        return ok(code, result["message"], result)


class DemoSeedView(APIView):
    @extend_schema(
        summary="Seed demo tasks",
        tags=["Utility"],
        request=None,
        responses={201: DemoSeedResponseSerializer},
        examples=[
            OpenApiExample(
                "Seed response",
                value={
                    "code": 201,
                    "message": "15 demo tasks successfully created",
                    "data": [
                        {
                            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                            "title": "Draft project brief",
                            "description": "Outline goals and success metrics.",
                            "status": "Todo",
                            "priority": "High",
                            "due_date": "2026-08-07",
                            "created_at": "2026-08-04T10:00:00.000Z",
                            "updated_at": "2026-08-04T10:00:00.000Z",
                        }
                    ],
                },
                response_only=True,
                status_codes=["201"],
            ),
        ],
    )
    def post(self, request: Request) -> Response:
        created = seed_demo_tasks()
        return ok(
            status.HTTP_201_CREATED,
            f"{len(created)} demo tasks successfully created",
            TaskOutputSerializer(created, many=True).data,
        )


class DemoClearView(APIView):
    @extend_schema(
        summary="Clear all tasks",
        tags=["Utility"],
        request=None,
        responses={200: DemoClearResponseSerializer},
        examples=[
            OpenApiExample(
                "Clear response",
                value={
                    "code": 200,
                    "message": "15 tasks successfully cleared",
                    "data": {"deleted": 15},
                },
                response_only=True,
            ),
        ],
    )
    def post(self, request: Request) -> Response:
        deleted = clear_all_tasks()
        return ok(
            status.HTTP_200_OK,
            f"{deleted} tasks successfully cleared",
            {"deleted": deleted},
        )
