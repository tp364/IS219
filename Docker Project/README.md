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

Build image:

```bash
docker build -t qr-code-generator-app .
```

Run with default URL:

```bash
docker run --name qr-generator qr-code-generator-app
```

Run with custom URL and mounted output folders:

```bash
docker run --name qr-generator -v ${PWD}/qr_codes:/app/qr_codes -v ${PWD}/logs:/app/logs qr-code-generator-app --url https://www.njit.edu
```

Check logs:

```bash
docker logs qr-generator
```

Expected log/console output includes:

```text
Generated QR code at qr_codes/<file>.png
```

Remove test container:

```bash
docker rm qr-generator
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

Tag and push:

```bash
docker tag qr-code-generator-app <your-dockerhub-username>/qr-code-generator-app:latest
docker push <your-dockerhub-username>/qr-code-generator-app:latest
```

DockerHub link format:

```text
https://hub.docker.com/r/<your-dockerhub-username>/qr-code-generator-app
```

## 5. GitHub Actions

Workflow file:

- `.github/workflows/docker-ci.yml`

Workflow checks:

- Python dependency installation
- Unit tests (`unittest`)
- Docker image build
- Container smoke test

## 6. Submission Checklist

1. GitHub repository link (must include Dockerfile, requirements, app code, workflow)
2. DockerHub image link
3. Screenshot of container logs showing successful run
4. Screenshot of successful GitHub Actions run
5. Completed `reflection.md`
