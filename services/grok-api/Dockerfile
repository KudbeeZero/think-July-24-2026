FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

EXPOSE 6969

CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "6969"]
