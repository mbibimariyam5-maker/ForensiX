from dataclasses import dataclass
from typing import FrozenSet


@dataclass(frozen=True)
class DetectionConfig:
    suspicious_process_paths: tuple[str, ...] = (
        "/temp/",
        "/tmp/",
        "/downloads/",
        "/appdata/local/temp/",
        "/var/tmp/",
    )

    suspicious_parent_processes: FrozenSet[str] = frozenset({
        "winword.exe",
        "excel.exe",
        "outlook.exe",
        "powershell.exe",
        "wscript.exe",
        "cscript.exe",
    })

    suspicious_child_processes: FrozenSet[str] = frozenset({
        "cmd.exe",
        "powershell.exe",
        "wscript.exe",
        "cscript.exe",
        "rundll32.exe",
    })

    suspicious_extensions: FrozenSet[str] = frozenset({
        ".exe",
        ".dll",
        ".ps1",
        ".vbs",
        ".js",
        ".bat",
        ".cmd",
    })

    suspicious_network_ports: FrozenSet[int] = frozenset({
        4444,
        1337,
        31337,
    })

    suspicious_ips: FrozenSet[str] = frozenset({
        "10.10.10.50",
        "192.0.2.50",
    })

    suspicious_domains: FrozenSet[str] = frozenset({
        "suspicious.example",
        "ioc.example",
    })

    suspicious_hashes: FrozenSet[str] = frozenset({
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    })

    failed_auth_threshold: int = 5

    failed_auth_window_seconds: int = 300


DEFAULT_CONFIG = DetectionConfig()