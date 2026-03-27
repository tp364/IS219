FROM python:3.12-slim-bullseye

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

RUN useradd -m myuser && mkdir -p logs qr_codes && chown myuser:myuser logs qr_codes

COPY --chown=myuser:myuser . .

USER myuser

ENTRYPOINT ["python", "main.py"]
CMD ["--url", "http://github.com/kaw393939"]
