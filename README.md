# SmarTec Task

Name: Amr Doma

A full-stack **Task Management System**. Users can create, edit, delete, search, filter, sort, and paginate tasks through a React UI backed by a Django REST API.

---

## Stack


| Layer        | Choice                                                                | Why                                         |
| ------------ | --------------------------------------------------------------------- | ------------------------------------------- |
| **Backend**  | **Python**, specifically **Django** + **Django REST Framework (DRF)** | Stable Python web stack with built-in tools |
| **Frontend** | **React** + **TypeScript** + **Tailwind CSS** (Vite)                  | Strongly typed UI and easy to style         |
| **API docs** | **Swagger UI** via **drf-spectacular**                                | Interactive docs at `/api/docs/`            |
| **Database** | **SQLite**                                                            | Lightweight and quick setup                 |


Supporting pieces on the frontend: **Sonner** (toasts), **next-themes** (light/dark), **lucide-react** (icons), **react-router-dom** (routing), **react-day-picker** + **date-fns** (due-date filter).

---

## Features

- **Task list**: Shows tasks in a table on larger screens, and as cards on phones. You can select rows, open a side panel for details, and jump to a full detail page.
- **Create task**: Opens a form in the shared modal. Title is required (max 100 characters, with a counter). You can also set description, status, priority, and an optional due date.
- **Edit task**: Same form, filled with the current values. Saves with `PATCH`.
- **Delete task**: Asks for confirmation. You can delete one task or several at once from the checkboxes.
- **Search**: Waits a moment while you type, then searches title and description on the server.
- **Filter**: Filter by status, priority, and due date (`before`, `after`, `on`, `between`). All filtering happens on the backend.
- **Sorting**: Click column headers on desktop, or use the sort controls on mobile. Ascending or descending is sent to the API.
- **Pagination**: Change page and page size. The UI default is **5** tasks per page.
- **Loading and feedback**: Skeleton placeholders while data loads. Sonner toasts for success and errors.
- **Responsive layout**: Cards and stacked filters on small screens. Table and more columns on larger screens. Modals and the side panel adapt to the screen size.
- **Light / dark theme**: Toggle in the navbar.
- **Backend validation**: Title required and max 100 characters. Status must be Todo, In Progress, or Done. Priority must be Low, Medium, or High. Responses use the right HTTP status codes.
- **Success response shape**: Successful calls return `{ code, message, data }`.
- **Demo data and tests**: Migrations add demo tasks. There is an optional startup flow test, plus utility endpoints in Swagger under **Utility**.

---

## High-level architecture and flow

1. The **React** app (Vite on Node) never talks to SQLite directly. It calls the REST API through a small `api/` client (`VITE_API_URL`, default `http://127.0.0.1:8000/api`).
2. **Django views** read query params and request bodies, check them with **serializers** (our DTOs), then use the **ORM** to read or write data.
3. The ORM maps the `**Task` model** to SQLite tables. Those tables come from **migrations**.
4. Responses are JSON. Success responses use `{ code, message, data }`. Frontend TypeScript types match those shapes so the UI stays strongly typed.

### Backend logic (Python / Django)


| Piece                         | Role                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model (`tasks/models.py`)** | The Task table in code: UUID id, title, description, status, priority, due date, timestamps.                                                  |
| **Migrations**                | `0001_initial` creates the table. `0002_seed_demo_tasks` adds demo rows when you run `migrate`.                                               |
| **Serializers (DTOs)**        | Separate serializers for create, update, output, list query params, and the response wrapper. Input and output are not one shared serializer. |
| **Views**                     | `TaskViewSet` for list/create/get/update/delete. Utility views for health, flow test, demo seed, and clear.                                   |
| **Examples + spectacular**    | Example payloads and schema hints so `/api/docs/` stays clear. No login is required for this local app.                                       |


**Serializers in practice**

- `TaskCreateSerializer` / `TaskUpdateSerializer`: input shapes with field checks.
- `TaskOutputSerializer`: the task shape returned to clients.
- `TaskListQuerySerializer`: checks list query params (`page`, `pageSize`, `search`, filters, `sort`, `order`).
- Envelope serializers (`TaskResponseSerializer`, `TaskListResponseSerializer`, and similar): document `{ code, message, data }` in Swagger.

### Frontend logic (React / TypeScript)


| Piece                  | Role                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Types (`types/`)**   | Shared API success type and Task types. Build fails if `any` sneaks in. Task ids are UUID strings.                                              |
| **API layer (`api/`)** | `client.ts` wraps `fetch`. `tasks.ts` calls the task endpoints. `taskCache.ts` keeps recent tasks in memory for the side panel and detail page. |
| **Hooks**              | `useTasks` for the list. `useTask` for one task. (See below.)                                                                                   |
| **Pages**              | `/tasks` list, `/tasks/:id` detail, and a layout with the navbar.                                                                               |
| **Components**         | `shared/` for reusable UI. `tasks/` for task-specific UI built on top of shared pieces.                                                         |


---

## Project layout

```
SmarTec_Task/
├── README.md
├── .gitignore
├── backend/                         # Python / Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/                      # Settings, root URLs, WSGI/ASGI
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── tasks/                       # Task app
│       ├── apps.py
│       ├── models.py                # ORM Task model
│       ├── serializers.py           # DTOs (create / update / output / query)
│       ├── views.py                 # TaskViewSet + response helper
│       ├── urls.py
│       ├── examples.py              # Swagger example payloads
│       ├── demo.py                  # Health, flow, seed, clear views
│       ├── flow_test.py             # Steps used by /api/test/flow/
│       ├── tests.py
│       └── migrations/
│           ├── 0001_initial.py
│           └── 0002_seed_demo_tasks.py
└── frontend/                        # React + TypeScript + Tailwind (Vite)
    ├── index.html
    ├── .env.example
    ├── package.json
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── api/
        │   ├── client.ts
        │   ├── tasks.ts
        │   └── taskCache.ts
        ├── types/
        │   ├── shared/              # Shared types (e.g. ApiSuccess)
        │   └── tasks/               # Task types + UUID check
        ├── hooks/
        │   ├── useTasks.ts
        │   └── useTask.ts
        ├── pages/
        │   ├── AppLayout.tsx
        │   ├── TaskListPage.tsx
        │   └── TaskDetailPage.tsx
        └── components/
            ├── shared/              # Modal, Navbar, Pagination, Skeleton, Toaster
            └── tasks/               # Table, cards, forms, chips, filters, detail
```

### `components/shared` vs `components/tasks`

- `**shared/**`: UI that is not tied to tasks and can be reused anywhere.
  - `**Modal**`: One shared modal (portal, Escape to close, locks page scroll). Create, edit, and delete dialogs all reuse it.
  - `**Navbar**`: Brand link and light/dark toggle.
  - `**Pagination**`: Page controls and page-size select.
  - `**Skeleton**`: Loading placeholders.
  - `**Toaster**`: App-wide toasts using **Sonner**.
- `**tasks/**`: Task-specific UI that uses the shared pieces: `TaskTable`, `TaskCardList` (mobile), `TaskFormModal`, `DeleteTaskModal`, `TaskSlideOver`, `TaskChips` (status and priority), `DueDateFilter`, `SortableHeader`, `TaskDetailContent`, `TaskDetailActions`.

### Hooks

- `**useTasks**`: Loads the task list with the current search, filters, sort, and page. Exposes create, update, delete (including bulk delete), loading, and error state. Updates the in-memory task cache after changes.
- `**useTask**`: Loads one task by UUID. If that task is already in the cache (for example from the list), it shows it right away, then refreshes from the API.

---

## APIs exposed

Base URL (local): `http://127.0.0.1:8000/api`  
Interactive docs: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)

These endpoints need no login locally. Success bodies use `{ code, message, data }`.

### Tasks (main CRUD)


| Method   | Path               | Description                                            |
| -------- | ------------------ | ------------------------------------------------------ |
| `GET`    | `/api/tasks/`      | List tasks with pagination, search, filters, and sort  |
| `POST`   | `/api/tasks/`      | Create a task                                          |
| `GET`    | `/api/tasks/{id}/` | Get one task by UUID                                   |
| `PATCH`  | `/api/tasks/{id}/` | Update part of a task                                  |
| `DELETE` | `/api/tasks/{id}/` | Delete a task (the deleted task is returned in `data`) |


### Utility


| Method | Path               | Description                                                                     |
| ------ | ------------------ | ------------------------------------------------------------------------------- |
| `GET`  | `/api/test/`       | Health check. Confirms the API is reachable.                                    |
| `POST` | `/api/test/flow/`  | Runs the full task CRUD flow test (steps below) and returns which steps passed. |
| `POST` | `/api/demo/`       | Adds another batch of demo tasks.                                               |
| `POST` | `/api/demo/clear/` | Deletes **all** tasks. For local use only. Be careful.                          |


#### What `POST /api/test/flow/` does

It creates a temporary client and walks through these steps in order. If a step fails, it stops and reports the results.

1. **List tasks** (`GET /api/tasks/`): checks the list endpoint returns success.
2. **Create task** (`POST /api/tasks/`): creates a task with a unique title and checks the response.
3. **List again with search**: searches for that title and checks the new task appears.
4. **Update task** (`PATCH /api/tasks/{id}/`): sets status to Done and priority to High, then checks the response.
5. **Get one task** (`GET /api/tasks/{id}/`): checks the task shows the updated status and priority.
6. **Delete task** (`DELETE /api/tasks/{id}/`): deletes the task and checks success.
7. **Get after delete**: requests the same id again and expects **404**.
8. **List after delete**: searches for the title again and checks the task is gone.

The response includes `passed`, a short message, and a `steps` list with each step name and whether it passed.

### List query parameters

```
GET /api/tasks/?page=1&pageSize=10&search=test&status=Done&sort=due_date&order=asc
```


| Param                      | Purpose                                                               |
| -------------------------- | --------------------------------------------------------------------- |
| `page`, `pageSize`         | Pagination (default page size 5, max 100)                             |
| `search`                   | Match title or description (not case sensitive)                       |
| `status`                   | `Todo` | `In Progress` | `Done`                                       |
| `priority`                 | `Low` | `Medium` | `High`                                             |
| `dueDateOp`                | `before` | `after` | `on` | `between`                                 |
| `dueDate`                  | Date used with before, after, or on                                   |
| `dueDateFrom`, `dueDateTo` | Range when `dueDateOp=between`                                        |
| `sort`                     | `due_date`, `title`, `priority`, `status`, `created_at`, `updated_at` |
| `order`                    | `asc` | `desc`                                                        |


### Task fields


| Field                       | Notes                                  |
| --------------------------- | -------------------------------------- |
| `id`                        | UUID, read-only                        |
| `title`                     | Required, max 100 characters           |
| `description`               | Optional text                          |
| `status`                    | `Todo` | `In Progress` | `Done`        |
| `priority`                  | `Low` | `Medium` | `High`              |
| `due_date`                  | Optional date (`YYYY-MM-DD`) or `null` |
| `created_at` / `updated_at` | Read-only timestamps                   |


---

## Database migrations

There is no separate SQL file. Schema and seed data live under `backend/tasks/migrations/`:


| Migration              | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `0001_initial`         | Creates the `Task` table (UUID id and the fields above) |
| `0002_seed_demo_tasks` | Inserts demo tasks the first time you migrate           |


```bash
cd backend
python manage.py migrate
```

---

## Prerequisites

- Python 3.12+ (3.11+ should work)
- Node.js 20+ and npm

## Installation

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
# macOS / Linux: source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux

python manage.py migrate
python manage.py runserver
```

- API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)

### 2. Frontend

```bash
cd frontend
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux

npm install
npm run dev
```

UI: [http://localhost:5173](http://localhost:5173)

`VITE_API_URL` must point at the API base (default `http://127.0.0.1:8000/api`).

## Environment variables

### Backend (`backend/.env.example`)


| Variable                | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `SECRET_KEY`            | Django secret key                                                   |
| `DEBUG`                 | `True` / `False`                                                    |
| `ALLOWED_HOSTS`         | Hosts allowed to reach the app, separated by commas                 |
| `CORS_ORIGINS`          | Frontend origins allowed to call the API (Vite on `:5173`)          |
| `RUN_API_FLOW_ON_START` | If `true`, runs the CRUD flow test shortly after `runserver` starts |


### Frontend (`frontend/.env.example`)


| Variable       | Description                                |
| -------------- | ------------------------------------------ |
| `VITE_API_URL` | Backend API base URL (must include `/api`) |


## Development notes

- CORS is set for the Vite origins in `.env`.
- List filtering, sorting, and pagination run on the backend. The UI only sends query params.
- Set `RUN_API_FLOW_ON_START=false` to skip the startup flow test.
- Run backend tests with: `python manage.py test tasks.tests`

