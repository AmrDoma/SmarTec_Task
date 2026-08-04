from datetime import date, timedelta

from django.db import migrations


def seed_demo(apps, schema_editor):
    Task = apps.get_model("tasks", "Task")
    # Import here so migration stays runnable if demo helpers evolve carefully.
    from tasks.demo import DEMO_TASKS

    today = date.today()
    Task.objects.bulk_create(
        [
            Task(
                title=item["title"],
                description=item["description"],
                status=item["status"],
                priority=item["priority"],
                due_date=today + timedelta(days=item["due_offset"]),
            )
            for item in DEMO_TASKS
        ]
    )


def unseed_demo(apps, schema_editor):
    Task = apps.get_model("tasks", "Task")
    titles = [
        "Draft project brief",
        "Review API contracts",
        "Write unit tests",
        "Fix pagination edge case",
        "Update Swagger descriptions",
        "Seed staging database",
        "Polish task table UI",
        "Add dark mode QA checklist",
        "Document install steps",
        "Optimize list query",
        "Handle CORS for local Vite",
        "Create delete confirm copy",
        "Slide-over animation polish",
        "Bulk delete selection UX",
        "Prepare assessment demo",
    ]
    Task.objects.filter(title__in=titles).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_demo, unseed_demo),
    ]
