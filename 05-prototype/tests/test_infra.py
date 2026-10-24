import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class InfrastructureContractTests(unittest.TestCase):
    def test_images_and_named_volumes_are_pinned(self) -> None:
        compose = (ROOT / "docker-compose.yml").read_text(encoding="utf-8")
        self.assertIn("n8nio/n8n:2.44.6", compose)
        self.assertIn("axllent/mailpit:v1.31.5", compose)
        for volume in ("pg_data", "n8n_data", "mailpit_data"):
            self.assertRegex(compose, rf"(?m)^  {re.escape(volume)}:")

    def test_pm4py_is_pinned(self) -> None:
        requirements = (ROOT / "requirements.in").read_text(encoding="utf-8")
        self.assertIn("pm4py==2.7.22", requirements)

    def test_example_env_contains_no_real_secret(self) -> None:
        env = (ROOT / ".env.example").read_text(encoding="utf-8")
        forbidden = ("ghp_", "sk-", "xoxb-", "AIza", "BEGIN PRIVATE KEY")
        self.assertFalse(any(marker in env for marker in forbidden))
        self.assertIn("change-me", env)

    def test_workflow_is_importable_json_and_has_required_steps(self) -> None:
        path = ROOT / "n8n" / "workflows" / "student-certificate.json"
        workflow = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual("student-certificate-v1", workflow["id"])
        nodes = workflow["nodes"]
        types = [node["type"] for node in nodes]
        self.assertIn("n8n-nodes-base.webhook", types)
        self.assertIn("n8n-nodes-base.if", types)
        self.assertIn("n8n-nodes-base.emailSend", types)
        http_nodes = [n for n in nodes if n["type"] == "n8n-nodes-base.httpRequest"]
        self.assertGreaterEqual(len(http_nodes), 4)
        raw = path.read_text(encoding="utf-8")
        self.assertIn("certificate-process", raw)
        self.assertIn("X-Internal-Token", raw)
        self.assertIn("Idempotency-Key", raw)
        self.assertIn("$env.INTERNAL_API_TOKEN", raw)
        self.assertNotIn("change-me", raw)

    def test_reset_is_scoped(self) -> None:
        script = (ROOT / "scripts" / "reset-demo.sh").read_text(encoding="utf-8")
        self.assertIn("/api/demo/reset", script)
        self.assertIn("X-Admin-Token", script)
        self.assertNotIn("docker compose down -v", script)

    def test_e2e_smoke_checks_orchestrator_and_mail_evidence(self) -> None:
        script = (ROOT / "scripts" / "smoke-e2e.py").read_text(encoding="utf-8")
        for marker in ("PRECHECK_OK", "ISSUED", "SYNCED", "NOTIFY_SENT", "/api/v1/messages"):
            self.assertIn(marker, script)
        self.assertIn("Idempotency-Key", script)


if __name__ == "__main__":
    unittest.main()

