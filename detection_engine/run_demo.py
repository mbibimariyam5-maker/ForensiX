import json
from pathlib import Path
from detection_engine import DetectionEngine
from detection_engine.input_adapter import adapt_events


def main():

    event_file = (
        Path(__file__).parent
        / "tests"
        / "simulated_events.json"
    )

    raw_events = json.loads(
        event_file.read_text(
            encoding="utf-8"
        )
    )

    events = adapt_events(raw_events)

    engine = DetectionEngine()

    findings = engine.detect(events)

    print(
        f"Processed events: {len(events)}"
    )

    print(
        f"Generated findings: {len(findings)}"
    )

    print("\nFindings:\n")

    for finding in findings:

        print(
            json.dumps(
                finding.to_dict(),
                indent=2,
            )
        )


if __name__ == "__main__":
    main()