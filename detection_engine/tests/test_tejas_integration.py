from detection_engine.engine import DetectionEngine
from detection_engine.input_adapter import adapt_events


def test_tejas_repeated_login_failures():

    tejas_events = [
        {
            "event_id": "E-001",
            "case_id": "CASE-001",
            "timestamp": "2026-08-19T10:22:31",
            "category": "authentication",
            "action": "login_failed",
            "artifact": "admin",
            "source": "system_events.log",
            "attributes": {
                "username": "admin"
            }
        },
        {
            "event_id": "E-002",
            "case_id": "CASE-001",
            "timestamp": "2026-08-19T10:23:04",
            "category": "authentication",
            "action": "login_failed",
            "artifact": "admin",
            "source": "system_events.log",
            "attributes": {
                "username": "admin"
            }
        },
        {
            "event_id": "E-003",
            "case_id": "CASE-001",
            "timestamp": "2026-08-19T10:23:41",
            "category": "authentication",
            "action": "login_failed",
            "artifact": "admin",
            "source": "system_events.log",
            "attributes": {
                "username": "admin"
            }
        },
        {
            "event_id": "E-004",
            "case_id": "CASE-001",
            "timestamp": "2026-08-19T10:24:12",
            "category": "authentication",
            "action": "login_failed",
            "artifact": "admin",
            "source": "system_events.log",
            "attributes": {
                "username": "admin"
            }
        },
        {
            "event_id": "E-005",
            "case_id": "CASE-001",
            "timestamp": "2026-08-19T10:25:00",
            "category": "authentication",
            "action": "login_failed",
            "artifact": "admin",
            "source": "system_events.log",
            "attributes": {
                "username": "admin"
            }
        }
    ]

    events = adapt_events(tejas_events)

    findings = DetectionEngine().detect(events)

    assert any(
        finding.type == "REPEATED_AUTH_FAILURE"
        for finding in findings
    )