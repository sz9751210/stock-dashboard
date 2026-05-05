#!/usr/bin/env python3
"""Generate a static market snapshot using twstock.

Usage:
  rtk python3 scripts/update_twstock_snapshot.py 2330 2308 3017
  rtk python3 scripts/update_twstock_snapshot.py --output public-market-snapshot.json 2330 2308
  rtk python3 scripts/update_twstock_snapshot.py --tickers-file public/tracked-tickers.json --output public/market-snapshot.json
  rtk python3 scripts/update_twstock_snapshot.py --tickers-file public/tracked-tickers.json --list-tickers

The web app is static, so this script is an offline data-prep helper. Install
twstock in your local Python environment before running it:
  rtk python3 -m pip install twstock
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def build_snapshot(ticker: str) -> dict:
    try:
        import twstock
    except ImportError as exc:
        raise SystemExit(
            "twstock is not installed. Run: rtk python3 -m pip install twstock"
        ) from exc

    stock = twstock.Stock(ticker)
    realtime = twstock.realtime.get(ticker)
    latest_price = None
    if realtime.get("success") and realtime.get("realtime"):
        latest_price = realtime["realtime"].get("latest_trade_price")

    last_price = float(latest_price or stock.price[-1])
    previous = float(stock.price[-2]) if len(stock.price) > 1 else last_price
    change_pct = round(((last_price - previous) / previous) * 100, 2) if previous else 0

    return {
        "ticker": ticker,
        "lastPrice": last_price,
        "changePct": change_pct,
        "volume": int(stock.capacity[-1]) if stock.capacity else 0,
        "signal": "twstock 更新",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("tickers", nargs="*")
    parser.add_argument("--tickers-file", type=Path)
    parser.add_argument("--list-tickers", action="store_true")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    tickers = list(args.tickers)
    if args.tickers_file:
        tickers.extend(json.loads(args.tickers_file.read_text(encoding="utf-8")))
    tickers = sorted(set(tickers))
    if not tickers:
        raise SystemExit("No tickers provided.")
    if args.list_tickers:
        print(json.dumps(tickers, ensure_ascii=False))
        return

    snapshots = [build_snapshot(ticker) for ticker in tickers]
    payload = json.dumps(snapshots, ensure_ascii=False, indent=2)

    if args.output:
        args.output.write_text(payload + "\n", encoding="utf-8")
    else:
        print(payload)


if __name__ == "__main__":
    main()
