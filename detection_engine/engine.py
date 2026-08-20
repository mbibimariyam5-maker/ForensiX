from __future__ import annotations

from .config import DEFAULT_CONFIG, DetectionConfig
from .input_adapter import adapt_event
from .models import Event, Finding

from .rules import (
    detect_authentication,
    detect_file,
    detect_ioc,
    detect_network,
    detect_privilege,
    detect_process,
    detect_usb,
)


class DetectionEngine:
    """
    Rule-based Detection Engine.

    Input:
        normalized Event objects or dictionaries

    Output:
        Finding objects using the frozen Backend contract
    """

    def __init__(
        self,
        config: DetectionConfig = DEFAULT_CONFIG,
    ):
        self.config = config

    def detect(
        self,
        events: list[Event | dict],
    ) -> list[Finding]:

        if not events:
            return []

        event_list = []

        for event in events:

            if isinstance(event, Event):
                event_list.append(event)

            else:
                event_list.append(
                    adapt_event(event)
                )

        findings = []

        finding_counter = 1

        for event in event_list:

            rule_results = []

            rule_results.extend(
                detect_process(
                    event,
                    self.config,
                )
            )

            rule_results.extend(
                detect_file(
                    event,
                    self.config,
                )
            )

            rule_results.extend(
                detect_network(
                    event,
                    self.config,
                )
            )

            rule_results.extend(
                detect_usb(
                    event,
                    self.config,
                )
            )

            rule_results.extend(
                detect_privilege(
                    event,
                    self.config,
                )
            )

            rule_results.extend(
                detect_ioc(
                    event,
                    self.config,
                )
            )

            rule_results.extend(
                detect_authentication(
                    event,
                    event_list,
                    self.config,
                )
            )

            for result in rule_results:

                finding = Finding(
                    finding_id=f"F-{finding_counter:03d}",
                    artifact=event.artifact,
                    type=result["type"],
                    severity=result["severity"],
                    score=result["score"],
                    timestamp=event.timestamp,
                    reasons=[result["reason"]],
                    source=event.source,
                )

                findings.append(finding)

                finding_counter += 1

        return findings