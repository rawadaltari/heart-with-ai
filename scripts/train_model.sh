#!/bin/bash

echo "🤖 بدء تدريب نموذج الذكاء الاصطناعي"
echo "====================================="

# التحقق من وجود Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 غير مثبت"
    exit 1
fi

# التحقق من المتطلبات
echo "📋 التحقق من المتطلبات..."
pip install -r requirements.txt

# إنشاء المجلدات
mkdir -p ml/{models,data,plots}

# تشغيل التدريب
echo "🚀 تشغيل تدريب النموذج..."
cd ml
python train_advanced_model.py

# التحقق من نجاح التدريب
if [ -f models/heart_disease_model.pkl ]; then
    echo "✅ تم تدريب النموذج بنجاح!"
    echo "📊 النموذج محفوظ في: ml/models/heart_disease_model.pkl"
    echo "🔧 المعايرة محفوظة في: ml/models/scaler.pkl"
else
    echo "❌ فشل تدريب النموذج"
    exit 1
fi

cd ..
echo "🎉 اكتمل تدريب النموذج!"