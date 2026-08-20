#!/usr/bin/env python3
"""Retired insecure MT5 live executor.

This file intentionally cannot start a broker service. The previous developer
prototype accepted unauthenticated localhost orders and could report simulated
fallback orders as successful. A future live executor must be a separately
reviewed, signed component that passes Demo certification and reconciliation.
"""

import sys


def main() -> int:
    print(
        "MT5 LIVE EXECUTOR DISABLED: Paper-only release. "
        "Use the authenticated read-only Demo observer for Shadow validation.",
        file=sys.stderr,
    )
    return 78


if __name__ == "__main__":
    raise SystemExit(main())
