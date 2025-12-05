#!/bin/bash

echo "🚀 تشغيل بيئة التطوير"
echo "====================="

# التحقق من الملفات المطلوبة
if [ ! -f ml/models/heart_disease_model.pkl ]; then
    echo "⚠️ النموذج غير موجود، سيتم تدريبه..."
    ./scripts/train_model.sh
fi

# تشغيل Backend في الخلفية
echo "🔧 تشغيل Backend..."
cd backend && python app.py &
BACKEND_PID=$!

# انتظار تحميل Backend
sleep 5

# تشغيل Frontend
echo "💻 تشغيل Frontend..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ تم تشغيل التطبيق!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:5000"
echo ""
echo "اضغط Ctrl+C للإيقاف"

# انتظار إشارة الإيقاف
trap 'kill $BACKEND_PID $FRONTEND_PID' SIGINT SIGTERM
wait