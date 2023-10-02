FROM python:3.11

WORKDIR /app

COPY . .
RUN pip install -r requirements.txt

ENTRYPOINT [ "python", "main.py" ]
EXPOSE 8000
