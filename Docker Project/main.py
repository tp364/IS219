from __future__ import annotations

import argparse
import logging
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import qrcode
from qrcode.constants import ERROR_CORRECT_H, ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q


ERROR_CORRECTION_LEVELS = {
    "L": ERROR_CORRECT_L,
    "M": ERROR_CORRECT_M,
    "Q": ERROR_CORRECT_Q,
    "H": ERROR_CORRECT_H,
}


def parse_int_env(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def slugify_url(url: str) -> str:
    parsed = urlparse(url)
    base = f"{parsed.netloc}{parsed.path}" if parsed.netloc else parsed.path
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()
    return slug or "qr-code"


def resolve_output_path(url: str, output: str | None, qr_codes_dir: Path) -> Path:
    if output:
        path = Path(output)
        if path.is_absolute():
            return path
        return qr_codes_dir / path

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return qr_codes_dir / f"{slugify_url(url)}-{timestamp}.png"


def setup_logger(logs_dir: Path, log_file: str | None) -> logging.Logger:
    logger = logging.getLogger("qr_generator")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()

    if not log_file:
        log_path = logs_dir / "app.log"
    else:
        log_path = Path(log_file)
        if not log_path.is_absolute():
            log_path = logs_dir / log_path

    log_path.parent.mkdir(parents=True, exist_ok=True)
    handler = logging.FileHandler(log_path, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(handler)
    return logger


def generate_qr_code(url: str, output_path: Path, error_correction: str, box_size: int, border: int) -> None:
    qr = qrcode.QRCode(
        version=1,
        error_correction=ERROR_CORRECTION_LEVELS[error_correction],
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate a QR code image from a URL.")
    parser.add_argument("--url", default=os.getenv("QR_URL", "http://github.com/kaw393939"), help="URL to encode.")
    parser.add_argument(
        "--output",
        default=os.getenv("QR_OUTPUT"),
        help="Output file path (relative paths are placed under QR_CODES_DIR).",
    )
    parser.add_argument(
        "--error-correction",
        choices=["L", "M", "Q", "H"],
        default=os.getenv("QR_ERROR_CORRECTION", "M").upper(),
        help="QR error correction level.",
    )
    parser.add_argument("--box-size", type=int, default=parse_int_env("QR_BOX_SIZE", 10), help="QR box size.")
    parser.add_argument("--border", type=int, default=parse_int_env("QR_BORDER", 4), help="QR border thickness.")
    parser.add_argument("--log-file", default=os.getenv("QR_LOG_FILE", "app.log"), help="Log filename or path.")
    return parser


def main() -> int:
    args = build_parser().parse_args()

    qr_codes_dir = Path(os.getenv("QR_CODES_DIR", "qr_codes"))
    logs_dir = Path(os.getenv("LOGS_DIR", "logs"))
    qr_codes_dir.mkdir(parents=True, exist_ok=True)
    logs_dir.mkdir(parents=True, exist_ok=True)

    logger = setup_logger(logs_dir, args.log_file)
    output_path = resolve_output_path(args.url, args.output, qr_codes_dir)

    generate_qr_code(
        url=args.url,
        output_path=output_path,
        error_correction=args.error_correction,
        box_size=args.box_size,
        border=args.border,
    )

    logger.info("Generated QR code for %s at %s", args.url, output_path)
    print(f"Generated QR code at {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
