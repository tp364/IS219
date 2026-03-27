# QR Code Generator Docker Assignment

This project Dockerizes a Python QR Code Generator that:

- accepts a URL from CLI args or environment variables
- writes PNG output to `qr_codes/`
- writes logs to `logs/`
- runs as a non-root user (`myuser`) in the container

## Required Files

- `Dockerfile`
- `main.py`
- `requirements.txt`
- `.github/workflows/docker-ci.yml`
- `reflection.md`

## 1. Prerequisites (Ubuntu, Native Linux)

Install Docker:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

Allow Docker without `sudo`:

```bash
sudo usermod -aG docker "$USER"
newgrp docker
```

Verify:

```bash
docker --version
docker run hello-world
```

## 2. Build and Run the App

Open the project folder:

```bash
cd "/home/tirth-patel/Documents/IS219/Docker Project"
```

Build image:

```bash
docker build -t qr-code-generator-app .
```

Clean any old container:

```bash
docker rm -f qr-generator 2>/dev/null || true
```

Run container with mounted output folders:

```bash
mkdir -p "$PWD/qr_codes" "$PWD/logs"
docker run --name qr-generator \
  -v "$PWD/qr_codes:/app/qr_codes" \
  -v "$PWD/logs:/app/logs" \
  qr-code-generator-app \
  --url "https://www.njit.edu"
```

Check logs and generated files:

```bash
docker logs qr-generator
ls -la "$PWD/qr_codes" "$PWD/logs"
```

Expected log line:

```text
Generated QR code at qr_codes/<filename>.png
```

Stop and remove:

```bash
docker stop qr-generator
docker rm -f qr-generator
```

## 3. Run With Docker Compose (Optional)

```bash
docker compose up --build
```

## 4. Push Image to DockerHub

Login:

```bash
docker login
```

Push `latest`:

```bash
docker tag qr-code-generator-app tirthpatel117/qr-code-generator-app:latest
docker push tirthpatel117/qr-code-generator-app:latest
```

Optional dated tag:

```bash
docker tag qr-code-generator-app tirthpatel117/qr-code-generator-app:2026-03-27
docker push tirthpatel117/qr-code-generator-app:2026-03-27
```

DockerHub link:

```text
https://hub.docker.com/r/tirthpatel117/qr-code-generator-app
```

## 5. Push Code to GitHub

If this folder is your Git repo root:

```bash
cd "/home/tirth-patel/Documents/IS219/Docker Project"
git add .
git commit -m "Dockerize QR Code Generator"
git push -u origin main
```

If this project is a subfolder inside `IS219`, run from `IS219` repo root:

```bash
cd "/home/tirth-patel/Documents/IS219"
git add "Docker Project"
git commit -m "Update Docker Project"
git push -u origin main
```

## 6. GitHub Actions

Workflow file:

- `.github/workflows/docker-ci.yml`

It runs:

- Python dependency install
- unit tests
- Docker image build
- container smoke test

To view successful run:

1. open `https://github.com/tp364/IS219/actions`
2. click `Docker CI`
3. open the latest run on `main`
4. confirm green check with `Success`

## 7. Screenshots to Submit

1. Container logs screenshot showing:
   `Generated QR code at qr_codes/<filename>.png`
2. GitHub Actions screenshot showing:
   `Docker CI` run with green check (`Success`)

## 8. Submission Checklist

1. GitHub repo link with required files
2. DockerHub image link
3. container logs screenshot
4. successful GitHub Actions screenshot
5. completed `reflection.md`

## 9. Troubleshooting

- `docker: invalid reference format`:
  your path likely has spaces; keep volume paths quoted exactly as shown.
- `No such container: qr-generator`:
  rerun `docker run ...` first, then `docker logs qr-generator`.
- `fatal: could not read Username for 'https://github.com'`:
  authenticate git with a PAT or SSH key before pushing.
- Actions error `failed to read dockerfile`:
  ensure workflow runs from the correct folder (`Docker Project`) or move Docker files to repo root.
