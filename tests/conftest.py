import copy
import pytest
from fastapi.testclient import TestClient

from src.app import app, activities as activities_ref


@pytest.fixture(autouse=True)
def reset_activities():
    """Deep-copy the in-memory `activities` before each test and restore after.
    This keeps tests isolated and deterministic.
    """
    backup = copy.deepcopy(activities_ref)
    yield
    activities_ref.clear()
    activities_ref.update(copy.deepcopy(backup))


@pytest.fixture
def client():
    return TestClient(app)
