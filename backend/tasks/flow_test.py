from __future__ import annotations

from typing import Any
from uuid import uuid4

from rest_framework.test import APIClient


def run_task_crud_flow() -> dict[str, Any]:
    """
    End-to-end API flow:
    list → create → list (contains) → patch → retrieve → delete → retrieve 404 / list gone
    """
    client = APIClient()
    steps: list[dict[str, Any]] = []
    title = f"Flow test {uuid4().hex[:8]}"

    def add(name: str, passed: bool, detail: Any = None) -> bool:
        steps.append({"name": name, "passed": passed, "detail": detail})
        return passed

    # 1. Get tasks
    response = client.get("/api/tasks/")
    body = _body(response)
    if not add(
        "GET /api/tasks/",
        response.status_code == 200 and body.get("code") == 200,
        {"status_code": response.status_code, "count": _count(body)},
    ):
        return _result(steps)

    # 2. Create task
    payload = {
        "title": title,
        "description": "Created by flow test",
        "status": "Todo",
        "priority": "Medium",
        "due_date": "2030-01-15",
    }
    response = client.post("/api/tasks/", payload, format="json")
    body = _body(response)
    created = body.get("data") if isinstance(body.get("data"), dict) else None
    if not add(
        "POST /api/tasks/",
        response.status_code == 201
        and isinstance(created, dict)
        and created.get("title") == title,
        {"status_code": response.status_code, "task": created},
    ):
        return _result(steps)

    task_id = created["id"]

    # 3. Get tasks — created task present
    response = client.get("/api/tasks/", {"search": title, "pageSize": 100})
    body = _body(response)
    results = _results(body)
    found = any(task.get("id") == task_id for task in results)
    if not add(
        "GET /api/tasks/ (contains created)",
        response.status_code == 200 and found,
        {"status_code": response.status_code, "found": found},
    ):
        return _result(steps)

    # 4. Patch task
    response = client.patch(
        f"/api/tasks/{task_id}/",
        {"status": "Done", "priority": "High"},
        format="json",
    )
    body = _body(response)
    patched = body.get("data") if isinstance(body.get("data"), dict) else None
    if not add(
        "PATCH /api/tasks/{id}/",
        response.status_code == 200
        and isinstance(patched, dict)
        and patched.get("status") == "Done"
        and patched.get("priority") == "High",
        {"status_code": response.status_code, "task": patched},
    ):
        return _result(steps)

    # 5. Get single task — reflects patch
    response = client.get(f"/api/tasks/{task_id}/")
    body = _body(response)
    fetched = body.get("data") if isinstance(body.get("data"), dict) else None
    if not add(
        "GET /api/tasks/{id}/",
        response.status_code == 200
        and isinstance(fetched, dict)
        and fetched.get("status") == "Done"
        and fetched.get("priority") == "High",
        {"status_code": response.status_code, "task": fetched},
    ):
        return _result(steps)

    # 6. Delete task
    response = client.delete(f"/api/tasks/{task_id}/")
    if not add(
        "DELETE /api/tasks/{id}/",
        response.status_code == 200,
        {"status_code": response.status_code},
    ):
        return _result(steps)

    # 7. Get single — 404
    response = client.get(f"/api/tasks/{task_id}/")
    if not add(
        "GET /api/tasks/{id}/ (after delete)",
        response.status_code == 404,
        {"status_code": response.status_code},
    ):
        return _result(steps)

    # 8. Get tasks — created task gone
    response = client.get("/api/tasks/", {"search": title, "pageSize": 100})
    body = _body(response)
    results = _results(body)
    still_there = any(task.get("id") == task_id for task in results)
    add(
        "GET /api/tasks/ (deleted gone)",
        response.status_code == 200 and not still_there,
        {"status_code": response.status_code, "still_there": still_there},
    )

    return _result(steps)


def _body(response) -> dict[str, Any]:
    data = getattr(response, "data", None)
    return data if isinstance(data, dict) else {}


def _count(body: dict[str, Any]) -> int | None:
    data = body.get("data")
    if isinstance(data, dict):
        return data.get("count")
    return None


def _results(body: dict[str, Any]) -> list[dict[str, Any]]:
    data = body.get("data")
    if isinstance(data, dict) and isinstance(data.get("results"), list):
        return data["results"]
    return []


def _result(steps: list[dict[str, Any]]) -> dict[str, Any]:
    passed = bool(steps) and all(step["passed"] for step in steps)
    return {
        "passed": passed,
        "steps": steps,
        "message": "Task CRUD flow passed" if passed else "Task CRUD flow failed",
    }
