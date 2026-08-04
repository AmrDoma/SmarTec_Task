from drf_spectacular.utils import OpenApiExample

EXAMPLE_TASK_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
EXAMPLE_TASK_ID_2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901"

TASK_EXAMPLE = {
    "id": EXAMPLE_TASK_ID,
    "title": "Review API contracts",
    "description": "Align request/response shapes with frontend.",
    "status": "In Progress",
    "priority": "High",
    "due_date": "2026-08-10",
    "created_at": "2026-08-04T10:15:00.000Z",
    "updated_at": "2026-08-04T12:30:00.000Z",
}

CREATE_TASK_EXAMPLE = {
    "title": "Review API contracts",
    "description": "Align request/response shapes with frontend.",
    "status": "Todo",
    "priority": "High",
    "due_date": "2026-08-10",
}

UPDATE_TASK_EXAMPLE = {
    "title": "Review API contracts",
    "description": "Updated notes after pairing session.",
    "status": "Done",
    "priority": "Medium",
    "due_date": "2026-08-12",
}

TASK_RESPONSE_EXAMPLE = {
    "code": 200,
    "message": f"Task with ID {EXAMPLE_TASK_ID} successfully retrieved",
    "data": TASK_EXAMPLE,
}

CREATE_RESPONSE_EXAMPLE = {
    "code": 201,
    "message": f"Task with ID {EXAMPLE_TASK_ID} successfully created",
    "data": TASK_EXAMPLE,
}

UPDATE_RESPONSE_EXAMPLE = {
    "code": 200,
    "message": f"Task with ID {EXAMPLE_TASK_ID} successfully edited",
    "data": {
        **TASK_EXAMPLE,
        "status": "Done",
        "priority": "Medium",
        "due_date": "2026-08-12",
        "description": "Updated notes after pairing session.",
        "updated_at": "2026-08-04T14:00:00.000Z",
    },
}

DELETE_RESPONSE_EXAMPLE = {
    "code": 200,
    "message": f"Task with ID {EXAMPLE_TASK_ID} successfully deleted",
    "data": TASK_EXAMPLE,
}

LIST_RESPONSE_EXAMPLE = {
    "code": 200,
    "message": "Tasks retrieved successfully",
    "data": {
        "count": 2,
        "next": "http://127.0.0.1:8000/api/tasks/?page=2&pageSize=5",
        "previous": None,
        "results": [
            TASK_EXAMPLE,
            {
                "id": EXAMPLE_TASK_ID_2,
                "title": "Write unit tests",
                "description": "Cover serializers and list filters.",
                "status": "Todo",
                "priority": "Medium",
                "due_date": "2026-08-15",
                "created_at": "2026-08-04T09:00:00.000Z",
                "updated_at": "2026-08-04T09:00:00.000Z",
            },
        ],
    },
}

list_response_example = OpenApiExample(
    "List tasks response",
    value=LIST_RESPONSE_EXAMPLE,
    response_only=True,
)

create_request_example = OpenApiExample(
    "Create task request",
    value=CREATE_TASK_EXAMPLE,
    request_only=True,
)

create_response_example = OpenApiExample(
    "Create task response",
    value=CREATE_RESPONSE_EXAMPLE,
    response_only=True,
)

get_response_example = OpenApiExample(
    "Get task response",
    value=TASK_RESPONSE_EXAMPLE,
    response_only=True,
)

retrieve_response_example = get_response_example

update_request_example = OpenApiExample(
    "Update task request",
    value=UPDATE_TASK_EXAMPLE,
    request_only=True,
)

update_response_example = OpenApiExample(
    "Update task response",
    value=UPDATE_RESPONSE_EXAMPLE,
    response_only=True,
)

delete_response_example = OpenApiExample(
    "Delete task response",
    value=DELETE_RESPONSE_EXAMPLE,
    response_only=True,
)
