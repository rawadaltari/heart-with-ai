#!/bin/bash

echo "🚀 إعداد مشروع نظام التنبؤ بأمراض القلب"
echo "============================================="

# إنشاء المجلدات المطلوبة
echo "📁 إنشاء المجلدات..."
mkdir -p {ml/{models,data,plots},backend,scripts,logs,docs}

# نسخ ملف البيئة
echo "⚙️ إعداد متغيرات البيئة..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ تم إنشاء ملف .env"
else
    echo "⚠️ ملف .env موجود بالفعل"
fi

# تثبيت متطلبات Python
echo "🐍 تثبيت متطلبات Python..."
pip install -r requirements.txt

# تثبيت متطلبات Node.js
echo "📦 تثبيت متطلبات Node.js..."
npm install

# تدريب النموذج
echo "🤖 تدريب نموذج الذكاء الاصطناعي..."
if [ ! -f ml/models/heart_disease_model.pkl ]; then
    cd ml && python train_advanced_model.py && cd ..
    echo "✅ تم تدريب النموذج بنجاح"
else
    echo "⚠️ النموذج مدرب بالفعل"
fi

echo ""
echo "🎉 تم إكمال الإعداد بنجاح!"
echo ""
echo "للتشغيل:"
echo "  التطوير: npm run dev"
echo "  الإنتاج: docker-compose up"
echo ""