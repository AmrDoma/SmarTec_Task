from datetime import date, timedelta

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from tasks.flow_test import run_task_crud_flow
from tasks.models import Task


class TaskCrudFlowTests(TestCase):
    def test_full_task_crud_flow(self):
        result = run_task_crud_flow()
        self.assertTrue(result["passed"], msg=result)


class TaskApiTests(TestCase):
    def setUp(self):
        Task.objects.all().delete()
        self.client = APIClient()
        today = date.today()
        self.t1 = Task.objects.create(
            title="Alpha review",
            description="contracts and APIs",
            status=Task.Status.DONE,
            priority=Task.Priority.HIGH,
            due_date=today + timedelta(days=2),
        )
        self.t2 = Task.objects.create(
            title="Beta polish",
            description="UI polish pass",
            status=Task.Status.TODO,
            priority=Task.Priority.LOW,
            due_date=today + timedelta(days=10),
        )
        self.t3 = Task.objects.create(
            title="Gamma search hit",
            description="middle priority item",
            status=Task.Status.IN_PROGRESS,
            priority=Task.Priority.MEDIUM,
            due_date=today + timedelta(days=5),
        )

    def test_create_requires_title(self):
        response = self.client.post("/api/tasks/", {"description": "x"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_create_rejects_blank_title(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "   "},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_create_rejects_title_over_100(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "x" * 101},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_create_rejects_invalid_status(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "Bad status", "status": "Pending"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)

    def test_create_rejects_invalid_priority(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "Bad priority", "priority": "Urgent"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("priority", response.data)

    def test_create_returns_uuid_id(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "UUID check"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task_id = response.data["data"]["id"]
        self.assertIsInstance(task_id, str)
        self.assertEqual(len(task_id), 36)

    def test_search_filters_title_and_description(self):
        response = self.client.get("/api/tasks/", {"search": "contracts"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [t["title"] for t in response.data["data"]["results"]]
        self.assertEqual(titles, ["Alpha review"])

    def test_filter_by_status(self):
        response = self.client.get("/api/tasks/", {"status": "Todo"})
        titles = [t["title"] for t in response.data["data"]["results"]]
        self.assertEqual(titles, ["Beta polish"])

    def test_filter_by_priority(self):
        response = self.client.get("/api/tasks/", {"priority": "High"})
        titles = [t["title"] for t in response.data["data"]["results"]]
        self.assertEqual(titles, ["Alpha review"])

    def test_sort_by_title_asc(self):
        response = self.client.get(
            "/api/tasks/",
            {"sort": "title", "order": "asc", "pageSize": 10},
        )
        titles = [t["title"] for t in response.data["data"]["results"]]
        self.assertEqual(titles, ["Alpha review", "Beta polish", "Gamma search hit"])

    def test_pagination(self):
        response = self.client.get("/api/tasks/", {"page": 1, "pageSize": 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertEqual(data["count"], 3)
        self.assertEqual(len(data["results"]), 2)
        self.assertIsNotNone(data["next"])

    def test_due_date_before(self):
        cutoff = (date.today() + timedelta(days=3)).isoformat()
        response = self.client.get(
            "/api/tasks/",
            {"dueDateOp": "before", "dueDate": cutoff},
        )
        titles = [t["title"] for t in response.data["data"]["results"]]
        self.assertEqual(titles, ["Alpha review"])

    def test_due_date_between(self):
        start = (date.today() + timedelta(days=3)).isoformat()
        end = (date.today() + timedelta(days=6)).isoformat()
        response = self.client.get(
            "/api/tasks/",
            {"dueDateOp": "between", "dueDateFrom": start, "dueDateTo": end},
        )
        titles = [t["title"] for t in response.data["data"]["results"]]
        self.assertEqual(titles, ["Gamma search hit"])

    def test_retrieve_404(self):
        missing = "00000000-0000-4000-8000-000000000000"
        response = self.client.get(f"/api/tasks/{missing}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
