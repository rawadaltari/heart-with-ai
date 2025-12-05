# Multi-stage build للـ Frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

# نسخ ملفات package للـ frontend
COPY package*.json ./
RUN npm ci --only=production

# نسخ ملفات المصدر وبناء التطبيق
COPY . .
RUN npm run build

# بناء الـ Backend
FROM python:3.11-slim as backend

WORKDIR /app

# تثبيت متطلبات النظام
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# نسخ وتثبيت متطلبات Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# نسخ ملفات الـ Backend
COPY backend/ .

# إنشاء مجلدات العمل
RUN mkdir -p models data plots logs

# نسخ النماذج المدربة إذا كانت موجودة
COPY ml/models/ models/ 2>/dev/null || true
COPY ml/data/ data/ 2>/dev/null || true

# إعداد متغيرات البيئة
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# فتح البورت
EXPOSE 5000

# تشغيل الخادم
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]