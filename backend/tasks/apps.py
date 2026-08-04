from django.apps import AppConfig


class TasksConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "tasks"

    def ready(self) -> None:
        import os
        import threading

        from django.conf import settings

        # Only in the reloader child process, and only when enabled.
        if os.environ.get("RUN_MAIN") != "true":
            return
        if not settings.DEBUG:
            return

        flag = os.getenv("RUN_API_FLOW_ON_START", "true").lower()
        if flag not in ("1", "true", "yes"):
            return

        def _run_flow_after_startup() -> None:
            # Defer so we do not query the DB during AppConfig.ready().
            import time

            time.sleep(0.25)
            try:
                from django.db import connection

                connection.ensure_connection()
                from tasks.flow_test import run_task_crud_flow

                result = run_task_crud_flow()
                status_label = "PASSED" if result["passed"] else "FAILED"
                print(f"[api-flow-test] {status_label}: {result['message']}")
                for step in result["steps"]:
                    mark = "OK" if step["passed"] else "FAIL"
                    print(f"  [{mark}] {step['name']}")
            except Exception as exc:  # noqa: BLE001 — never block server start
                print(f"[api-flow-test] ERROR: {exc}")

        threading.Thread(
            target=_run_flow_after_startup,
            name="api-flow-test",
            daemon=True,
        ).start()
