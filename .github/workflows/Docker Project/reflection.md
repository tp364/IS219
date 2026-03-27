# Reflection

## What worked well

- The Dockerfile structure worked well because dependency installation was cached by copying `requirements.txt` first.
- Running the container as `myuser` prevented root-level writes and still allowed QR output/log creation in mounted folders.
- The CLI + environment variable design made testing easy with different URLs and output settings.

## Challenges encountered

- Local Python tooling was inconsistent across environments (missing `pip`/`venv` on one host), so Docker-based verification was more reliable.
- Volume mount paths required careful checking (`${PWD}/qr_codes` and `${PWD}/logs`) to ensure files appeared on the host.
- Ubuntu Docker permissions needed setup (`usermod -aG docker $USER`) so Docker commands could run without `sudo`.

## Security checks completed

- Used a minimal base image: `python:3.12-slim-bullseye`.
- Created and switched to a non-root user (`myuser`) before application execution.
- Limited dependency installation to `requirements.txt` with `--no-cache-dir` to reduce image bloat.

## What I would improve next time

- Add image scanning in CI (for example with Trivy) to catch known vulnerabilities automatically.
- Add more unit tests for argument parsing and invalid URL handling.
- Publish semantic version tags (`v1`, `v1.0.0`) to DockerHub in addition to `latest`.
