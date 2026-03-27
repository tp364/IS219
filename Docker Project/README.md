# QR Code Generator Docker Assignment

This repository contains a Dockerized Python QR Code Generator that:

- Accepts a URL via CLI argument or environment variable
- Generates a PNG QR code in `qr_codes/`
- Writes logs to `logs/`
- Runs as a non-root user inside Docker

## 1. Ubuntu Setup (Native Linux, No WSL)

If you are using Ubuntu directly, WSL is not required.

Install Docker:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

Allow your user to run Docker without `sudo`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker run hello-world
```

## 2. Run the App with Docker

Run these commands from this folder:

```bash
cd "/home/tirth-patel/Documents/IS219/Docker Project"
```

Build image:

```bash
docker build -t qr-code-generator-app .
```

Remove old container (if it exists):

```bash
docker rm -f qr-generator 2>/dev/null || true
```

Run with mounted output folders:

```bash
mkdir -p "$PWD/qr_codes" "$PWD/logs"
docker run --name qr-generator \
  -v "$PWD/qr_codes:/app/qr_codes" \
  -v "$PWD/logs:/app/logs" \
  qr-code-generator-app \
  --url "https://www.njit.edu"
```

Show container logs:

```bash
docker logs qr-generator
```

Show generated files:

```bash
ls -la "$PWD/qr_codes" "$PWD/logs"
```

Stop and remove container:

```bash
docker stop qr-generator
docker rm -f qr-generator
```

## 3. Docker Compose (Optional)

```bash
docker compose up --build
```

This runs `qr-generator` and generates a QR code for `https://www.njit.edu`.

## 4. Push to DockerHub

Login:

```bash
docker login
```

Tag and push to DockerHub:

```bash
docker tag qr-code-generator-app tirthpatel117/qr-code-generator-app:latest
docker push tirthpatel117/qr-code-generator-app:latest
```

DockerHub image link:

```text
https://hub.docker.com/r/tirthpatel117/qr-code-generator-app
```

Current latest image reference (as of 2026-03-27):

```text
docker.io/tirthpatel117/qr-code-generator-app:latest
tirthpatel117/qr-code-generator-app@sha256:7a5c747e81f1f5d1494e9c06db0800a317b8274512c155438d21db0ebfeb46dd
```

## 5. Push to GitHub Repo `tp364/IS219`

```bash
cd "/home/tirth-patel/Documents/IS219/Docker Project"
git remote set-url origin https://github.com/tp364/IS219.git
git add .
git commit -m "Dockerize QR Code Generator"
git push -u origin main
```

## 6. GitHub Actions

Workflow file:

- `.github/workflows/docker-ci.yml`

Workflow checks:

- Python dependency installation
- Unit tests (`unittest`)
- Docker image build
- Container smoke test

## 7. Submission Checklist

1. GitHub repository link (must include Dockerfile, requirements, app code, workflow)
2. DockerHub image link
3. Screenshot of container logs showing successful run
4. Screenshot of successful GitHub Actions run
5. Completed `reflection.md`
