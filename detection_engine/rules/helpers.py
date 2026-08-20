from pathlib import PurePath


def lower(value) -> str:
    return str(value or "").lower()


def normalized_path(value) -> str:
    return lower(value).replace("\\", "/")


def extension(value) -> str:
    name = PurePath(str(value or "")).name.lower()
    return PurePath(name).suffix