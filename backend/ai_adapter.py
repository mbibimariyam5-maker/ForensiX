import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


AI_ENGINE_URL = "http://127.0.0.1:8001/ai/explain"


def explain_finding(finding: dict):
    """
    Send a finding to Irfan's AI engine
    and return the explanation response.
    """

    request_data = json.dumps(finding).encode("utf-8")

    request = Request(
        AI_ENGINE_URL,
        data=request_data,
        headers={
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urlopen(request, timeout=10) as response:
            response_data = response.read().decode("utf-8")
            return json.loads(response_data)

    except HTTPError as error:
        raise RuntimeError(
            f"AI engine returned HTTP {error.code}"
        )

    except URLError:
        raise RuntimeError(
            "AI engine is not running at "
            "http://127.0.0.1:8001"
        )

    except json.JSONDecodeError:
        raise RuntimeError(
            "AI engine returned invalid JSON"
        )