# QR Code Generator Docker Assignment

This repository contains a Dockerized Python QR Code Generator that:

- Accepts a URL via CLI argument or environment variable
- Generates a PNG QR code in `qr_codes/`
- Writes logs to `logs/`
- Runs as a non-root user inside Docker

## 1. Windows Setup (WSL2 + Ubuntu + Docker Desktop)

Run the following in **PowerShell as Administrator**:

```powershell
wsl --install -d Ubuntu-24.04
wsl --set-default-version 2
```

Restart Windows when prompted, then verify:

```powershell
wsl --status
```

Install Docker Desktop from:

- https://www.docker.com/products/docker-desktop/

In Docker Desktop:

1. Open `Settings -> General` and ensure `Use the WSL 2 based engine` is enabled.
2. Open `Settings -> Resources -> WSL Integration` and enable integration for `Ubuntu-24.04`.

Verify Docker in Ubuntu terminal:

```bash
docker --version
docker run hello-world
```

## 2. Local Run

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

Remove test container:

```bash
docker rm qr-generator
```

## 3. Docker Compose

```bash
docker compose up --build
```

This runs `qr-generator` and generates a QR code for `https://www.njit.edu`.

## 4. DockerHub Push

Login:

```bash
docker login
```

Tag and push:

```bash
docker tag qr-code-generator-app <your-dockerhub-username>/qr-code-generator-app:latest
docker push <your-dockerhub-username>/qr-code-generator-app:latest
```

## 5. GitHub Actions

Workflow file:

- `.github/workflows/docker-ci.yml`

It performs:

- Python dependency install
- Unit tests (`unittest`)
- Docker image build
- Container smoke test

## 6. Expected Submission Artifacts

1. GitHub repository link with source, Dockerfile, requirements, and GitHub Actions workflow
2. DockerHub image link
3. Screenshot of container logs showing successful run
4. Screenshot of successful GitHub Actions workflow run
5. Reflection document (create `reflection.md` from the template below)

## 7. Reflection Template

Use the following prompts in your `reflection.md`:

1. What worked well while Dockerizing the app?
2. What challenges did you hit (build errors, permissions, path issues, WSL setup)?
3. How did you verify security (non-root user, minimal base image)?
4. What would you improve next?
