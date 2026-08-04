from django.urls import path
from rest_framework.routers import DefaultRouter

from tasks.demo import DemoClearView, DemoSeedView, TestEndpointView, TestFlowView
from tasks.views import TaskViewSet

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("test/", TestEndpointView.as_view(), name="api-test"),
    path("test/flow/", TestFlowView.as_view(), name="api-test-flow"),
    path("demo/", DemoSeedView.as_view(), name="api-demo"),
    path("demo/clear/", DemoClearView.as_view(), name="api-demo-clear"),
    *router.urls,
]
