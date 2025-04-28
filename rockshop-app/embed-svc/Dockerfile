FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
       libjpeg-turbo-progs && \
    pip install --no-cache-dir torch torchvision fastapi uvicorn pillow python-multipart

WORKDIR /app
COPY app.py /app/

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]