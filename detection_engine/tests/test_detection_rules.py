from detection_engine.engine import DetectionEngine


def test_process_detection():
    event = {
        "event_id": "E-P1",
        "case_id": "CASE-001",
        "timestamp": "2026-08-19T10:00:00+00:00",
        "category": "process",
        "artifact": "example.exe",
        "action": "execute",
        "source": "simulator",
        "attributes": {
            "path": "C:\\Temp\\example.exe"
        },
    }

    findings = DetectionEngine().detect([event])

    assert any(
        finding.type == "SUSPICIOUS_PROCESS"
        for finding in findings
    )


def test_file_detection():
    event = {
        "event_id": "E-F1",
        "case_id": "CASE-001",
        "timestamp": "2026-08-19T10:00:00+00:00",
        "category": "file",
        "artifact": "payload.exe",
        "action": "create",
        "source": "simulator",
        "attributes": {
            "path": "C:\\Downloads\\payload.exe"
        },
    }

    findings = DetectionEngine().detect([event])

    assert any(
        finding.type == "SUSPICIOUS_FILE"
        for finding in findings
    )


def test_network_detection():
    event = {
        "event_id": "E-N1",
        "case_id": "CASE-001",
        "timestamp": "2026-08-19T10:00:00+00:00",
        "category": "network",
        "artifact": "10.10.10.50",
        "action": "connection",
        "source": "simulator",
        "attributes": {
            "destination_ip": "10.10.10.50",
            "destination_port": 4444,
        },
    }

    findings = DetectionEngine().detect([event])

    assert any(
        finding.type == "IOC_NETWORK_MATCH"
        for finding in findings
    )


def test_authentication_detection():
    events = []

    for i in range(5):
        events.append({
            "event_id": f"E-A{i + 1}",
            "case_id": "CASE-001",
            "timestamp": f"2026-08-19T10:0{i}:00+00:00",
            "category": "authentication",
            "artifact": "admin",
            "action": "login_failed",
            "source": "system_events.log",
            "attributes": {
                "username": "admin"
            },
        })

    findings = DetectionEngine().detect(events)

    auth_findings = [
        finding
        for finding in findings
        if finding.type == "REPEATED_AUTH_FAILURE"
    ]

    assert len(auth_findings) == 1


def test_usb_detection():
    event = {
        "event_id": "E-U1",
        "case_id": "CASE-001",
        "timestamp": "2026-08-19T10:00:00+00:00",
        "category": "usb",
        "artifact": "USB-001",
        "action": "device_connected",
        "source": "system_events.log",
        "attributes": {},
    }

    findings = DetectionEngine().detect([event])

    assert any(
        finding.type == "USB_DEVICE_ACTIVITY"
        for finding in findings
    )


def test_privilege_detection():
    event = {
        "event_id": "E-PR1",
        "case_id": "CASE-001",
        "timestamp": "2026-08-19T10:00:00+00:00",
        "category": "privilege",
        "artifact": "admin",
        "action": "privilege_escalation",
        "source": "system_events.log",
        "attributes": {},
    }

    findings = DetectionEngine().detect([event])

    assert any(
        finding.type == "PRIVILEGE_CHANGE"
        for finding in findings
    )


def test_ioc_detection():
    event = {
        "event_id": "E-I1",
        "case_id": "CASE-001",
        "timestamp": "2026-08-19T10:00:00+00:00",
        "category": "file",
        "artifact": "sample.bin",
        "action": "observed",
        "source": "system_events.log",
    "attributes": {
        "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    },
    }

    findings = DetectionEngine().detect([event])

    assert any(
        finding.type == "IOC_MATCH"
        for finding in findings
    )


def test_finding_contract():
    event = {
        "event_id": "E-C1",
        "case_id": "CASE-001",
        "timestamp": "2026-08-19T10:00:00+00:00",
        "category": "usb",
        "artifact": "USB-001",
        "action": "device_connected",
        "source": "system_events.log",
        "attributes": {},
    }

    findings = DetectionEngine().detect([event])

    assert findings

    assert set(
        findings[0].to_dict().keys()
    ) == {
        "finding_id",
        "artifact",
        "type",
        "severity",
        "score",
        "timestamp",
        "reasons",
        "source",
    }