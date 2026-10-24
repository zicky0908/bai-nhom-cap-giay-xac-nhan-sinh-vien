import os

os.environ["DATABASE_URL"] = "sqlite:///./test_student_certificate.db"
os.environ["INTERNAL_API_TOKEN"] = "test-internal"
os.environ["ADMIN_TOKEN"] = "test-admin"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

