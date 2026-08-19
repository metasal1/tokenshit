#!/usr/bin/env python3
"""Regenerate src/lib/disposable-email-domains.ts from blocklist file or GitHub."""
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
TXT = ROOT / "src/data/disposable-email-domains.txt"
OUT = ROOT / "src/lib/disposable-email-domains.ts"
URL = (
    "https://raw.githubusercontent.com/disposable-email-domains/"
    "disposable-email-domains/master/disposable_email_blocklist.conf"
)

def main():
    try:
        data = urllib.request.urlopen(URL, timeout=60).read().decode()
        TXT.parent.mkdir(parents=True, exist_ok=True)
        TXT.write_text(data)
        print("downloaded", len(data.splitlines()), "lines")
    except Exception as e:
        print("download failed, using local", e)
        data = TXT.read_text()
    domains = sorted({
        ln.strip().lower()
        for ln in data.splitlines()
        if ln.strip() and not ln.strip().startswith("#") and "." in ln.strip()
    })
    body = ",\n".join(f'  "{d}"' for d in domains)
    OUT.write_text(
        "/**\n"
        " * Auto-generated from disposable-email-domains blocklist.\n"
        " * Source: https://github.com/disposable-email-domains/disposable-email-domains\n"
        " * Refresh: python3 scripts/gen-disposable-emails.py\n"
        " */\n"
        "export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([\n"
        f"{body}\n"
        "]);\n"
    )
    print("wrote", OUT, "domains", len(domains))

if __name__ == "__main__":
    main()
