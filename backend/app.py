from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import logging
import os
from datetime import datetime
import shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import warnings

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# إعداد نظام السجلات
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# متغيرات عامة للنموذج
model = None
scaler = None
explainer = None
feature_names_ar = {
    'age': 'العمر',
    'sex': 'الجنس',
    'cp': 'نوع ألم الصدر',
    'trestbps': 'ضغط الدم الانقباضي',
    'chol': 'مستوى الكولسترول',
    'fbs': 'سكر الدم الصائم',
    'restecg': 'نتائج تخطيط القلب',
    'thalach': 'معدل ضربات القلب القصوى',
    'exang': 'ذبحة صدرية مع التمرين',
    'oldpeak': 'انخفاض ST',
    'slope': 'ميل قطعة ST',
    'ca': 'عدد الأوعية الملونة',
    'thal': 'نوع الثلاسيميا'
}

feature_names = list(feature_names_ar.keys())

def create_synthetic_data():
    """إنشاء بيانات تصنيعية للتدريب إذا لم تكن متوفرة"""
    np.random.seed(42)
    n_samples = 1000
    
    # إنشاء البيانات
    data = {
        'age': np.random.randint(29, 80, n_samples),
        'sex': np.random.randint(0, 2, n_samples),
        'cp': np.random.randint(0, 4, n_samples),
        'trestbps': np.random.normal(130, 15, n_samples).clip(90, 200).astype(int),
        'chol': np.random.normal(240, 50, n_samples).clip(150, 400).astype(int),
        'fbs': np.random.randint(0, 2, n_samples),
        'restecg': np.random.randint(0, 3, n_samples),
        'thalach': np.random.normal(150, 20, n_samples).clip(100, 200).astype(int),
        'exang': np.random.randint(0, 2, n_samples),
        'oldpeak': np.random.exponential(1, n_samples).clip(0, 6),
        'slope': np.random.randint(0, 3, n_samples),
        'ca': np.random.randint(0, 5, n_samples),
        'thal': np.random.randint(1, 4, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # إنشاء المتغير التابع بناءً على القواعد الطبية
    target = np.zeros(n_samples)
    for i in range(n_samples):
        risk_score = 0
        
        # العمر
        if df.loc[i, 'age'] > 65: risk_score += 3
        elif df.loc[i, 'age'] > 55: risk_score += 2
        elif df.loc[i, 'age'] > 45: risk_score += 1
        
        # الجنس (الرجال أكثر عرضة)
        if df.loc[i, 'sex'] == 1: risk_score += 1
        
        # نوع ألم الصدر
        if df.loc[i, 'cp'] == 1: risk_score += 3  # ألم ذبحة نموذجي
        elif df.loc[i, 'cp'] == 2: risk_score += 2  # ألم ذبحة غير نموذجي
        elif df.loc[i, 'cp'] == 0: risk_score += 1  # لا ألم
        
        # ضغط الدم
        if df.loc[i, 'trestbps'] > 160: risk_score += 3
        elif df.loc[i, 'trestbps'] > 140: risk_score += 2
        elif df.loc[i, 'trestbps'] > 120: risk_score += 1
        
        # الكولسترول
        if df.loc[i, 'chol'] > 280: risk_score += 2
        elif df.loc[i, 'chol'] > 240: risk_score += 1
        
        # سكر الدم
        if df.loc[i, 'fbs'] == 1: risk_score += 1
        
        # معدل ضربات القلب القصوى
        if df.loc[i, 'thalach'] < 120: risk_score += 2
        elif df.loc[i, 'thalach'] < 140: risk_score += 1
        
        # العوامل الأخرى
        if df.loc[i, 'exang'] == 1: risk_score += 2
        if df.loc[i, 'oldpeak'] > 3: risk_score += 2
        elif df.loc[i, 'oldpeak'] > 1: risk_score += 1
        
        risk_score += df.loc[i, 'ca']  # عدد الأوعية
        
        if df.loc[i, 'thal'] == 2: risk_score += 2
        
        # إضافة عشوائية للواقعية
        final_score = risk_score + np.random.normal(0, 1.5)
        target[i] = 1 if final_score > 6 else 0
    
    df['target'] = target.astype(int)
    logger.info(f"تم إنشاء {len(df)} عينة")
    logger.info(f"توزيع الفئات: {df['target'].value_counts().to_dict()}")
    
    return df

def train_model():
    """تدريب النموذج"""
    global model, scaler, explainer
    
    try:
        # محاولة تحميل النموذج المحفوظ
        if os.path.exists('models/heart_disease_model.pkl') and os.path.exists('models/scaler.pkl'):
            model = joblib.load('models/heart_disease_model.pkl')
            scaler = joblib.load('models/scaler.pkl')
            logger.info("تم تحميل النموذج المحفوظ بنجاح")
            return True
    except Exception as e:
        logger.warning(f"فشل في تحميل النموذج المحفوظ: {e}")
    
    try:
        logger.info("بدء تدريب نموذج جديد...")
        
        # إنشاء البيانات
        df = create_synthetic_data()
        
        # تحضير البيانات
        X = df[feature_names]
        y = df['target']
        
        # تقسيم البيانات
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # تطبيع البيانات
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # تدريب النموذج
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        model.fit(X_train_scaled, y_train)
        
        # تقييم النموذج
        train_score = model.score(X_train_scaled, y_train)
        test_score = model.score(X_test_scaled, y_test)
        
        logger.info(f"دقة التدريب: {train_score:.3f}")
        logger.info(f"دقة الاختبار: {test_score:.3f}")
        
        # إنشاء مجلد النماذج إذا لم يكن موجوداً
        os.makedirs('models', exist_ok=True)
        
        # حفظ النموذج
        joblib.dump(model, 'models/heart_disease_model.pkl')
        joblib.dump(scaler, 'models/scaler.pkl')
        
        # تحضير SHAP explainer
        try:
            explainer = shap.Explainer(model, X_train_scaled[:100])
            logger.info("تم تحضير SHAP explainer بنجاح")
        except Exception as e:
            logger.warning(f"فشل في تحضير SHAP explainer: {e}")
            explainer = None
        
        logger.info("تم تدريب النموذج بنجاح")
        return True
        
    except Exception as e:
        logger.error(f"خطأ في تدريب النموذج: {e}")
        return False

def validate_input(data):
    """التحقق من صحة البيانات المدخلة"""
    required_fields = feature_names
    
    for field in required_fields:
        if field not in data:
            return False, f"الحقل المطلوب '{field}' مفقود"
    
    # التحقق من النطاقات
    validations = {
        'age': (1, 120),
        'sex': (0, 1),
        'cp': (0, 3),
        'trestbps': (80, 250),
        'chol': (100, 600),
        'fbs': (0, 1),
        'restecg': (0, 2),
        'thalach': (60, 220),
        'exang': (0, 1),
        'oldpeak': (0, 10),
        'slope': (0, 2),
        'ca': (0, 4),
        'thal': (1, 3)
    }
    
    for field, (min_val, max_val) in validations.items():
        value = data[field]
        if not (min_val <= value <= max_val):
            return False, f"قيمة {feature_names_ar.get(field, field)} يجب أن تكون بين {min_val} و {max_val}"
    
    return True, "البيانات صحيحة"

def get_risk_level(probability):
    """تحديد مستوى الخطر بناءً على الاحتمالية"""
    if probability < 0.3:
        return "منخفض"
    elif probability < 0.7:
        return "متوسط"
    else:
        return "مرتفع"

def get_feature_description(feature, value, increases_risk):
    """وصف تأثير كل ميزة"""
    descriptions = {
        'age': {
            True: f"العمر {int(value)} سنة يزيد من مخاطر أمراض القلب مع التقدم في السن",
            False: f"العمر {int(value)} سنة ضمن النطاق الآمن نسبياً"
        },
        'sex': {
            True: "الجنس الذكري يرتبط بمخاطر أعلى لأمراض القلب",
            False: "الجنس الأنثوي يرتبط بمخاطر أقل نسبياً"
        },
        'cp': {
            True: f"نوع ألم الصدر ({int(value)}) يشير لمخاطر قلبية",
            False: f"نوع ألم الصدر ({int(value)}) أقل ارتباطاً بمشاكل القلب"
        },
        'trestbps': {
            True: f"ضغط الدم {int(value)} مرتفع ويزيد المخاطر القلبية",
            False: f"ضغط الدم {int(value)} ضمن المعدل الطبيعي"
        },
        'chol': {
            True: f"مستوى الكولسترول {int(value)} مرتفع ويؤثر على صحة القلب",
            False: f"مستوى الكولسترول {int(value)} ضمن المعدل المقبول"
        },
        'thalach': {
            True: f"معدل ضربات القلب القصوى {int(value)} منخفض قد يشير لمشاكل",
            False: f"معدل ضربات القلب القصوى {int(value)} صحي"
        },
        'exang': {
            True: "الإصابة بذبحة صدرية أثناء التمرين تزيد المخاطر",
            False: "عدم الإصابة بذبحة صدرية أثناء التمرين علامة إيجابية"
        }
    }
    
    default_desc = {
        True: f"العامل {feature_names_ar.get(feature, feature)} يزيد من المخاطر",
        False: f"العامل {feature_names_ar.get(feature, feature)} يقلل من المخاطر"
    }
    
    return descriptions.get(feature, default_desc).get(increases_risk, f"قيمة {feature}: {value}")

def explain_prediction(model_input):
    """تفسير التنبؤ باستخدام feature importance أو SHAP"""
    factors = []
    
    try:
        if explainer is not None:
            # استخدام SHAP للتفسير
            shap_values = explainer(model_input.reshape(1, -1))
            feature_importance = list(zip(feature_names, shap_values.values[0]))
        else:
            # استخدام feature importance من النموذج
            if hasattr(model, 'feature_importances_'):
                # حساب تأثير كل ميزة بناءً على قيمتها وأهميتها
                importances = model.feature_importances_
                feature_importance = []
                
                for i, feature in enumerate(feature_names):
                    # تقدير التأثير بناءً على القيمة والأهمية
                    value = model_input[i]
                    base_importance = importances[i]
                    
                    # تعديل التأثير بناءً على القيمة
                    if feature == 'age':
                        impact = base_importance * (value / 80)  # تأثير يزداد مع العمر
                    elif feature == 'trestbps':
                        impact = base_importance * max(0, (value - 120) / 80)  # يزداد مع ارتفاع الضغط
                    elif feature == 'chol':
                        impact = base_importance * max(0, (value - 200) / 200)  # يزداد مع الكولسترول
                    elif feature == 'thalach':
                        impact = base_importance * max(0, (160 - value) / 160)  # يزداد مع انخفاض النبض
                    else:
                        impact = base_importance * value if value > 0 else 0
                    
                    feature_importance.append((feature, impact))
            else:
                return factors
        
        # ترتيب حسب الأهمية
        feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)
        
        # أخذ أهم 5 عوامل
        for i, (feature, importance) in enumerate(feature_importance[:5]):
            increases_risk = importance > 0
            factors.append({
                'name': feature_names_ar.get(feature, feature),
                'impact': abs(importance),
                'direction': 'يزيد الخطر' if increases_risk else 'يقلل الخطر',
                'description': get_feature_description(
                    feature, 
                    model_input[feature_names.index(feature)], 
                    increases_risk
                )
            })
        
        return factors
        
    except Exception as e:
        logger.error(f"خطأ في تفسير التنبؤ: {e}")
        
        # إرجاع تفسير أساسي في حالة الخطأ
        basic_factors = [
            {
                'name': 'العمر',
                'impact': 0.3,
                'direction': 'يزيد الخطر' if model_input[0] > 50 else 'يقلل الخطر',
                'description': f"العمر {int(model_input[0])} سنة"
            }
        ]
        return basic_factors

@app.route('/health', methods=['GET'])
def health_check():
    """فحص حالة الخدمة"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'explainer_loaded': explainer is not None,
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """endpoint للتنبؤ بخطر أمراض القلب"""
    try:
        # التحقق من وجود النموذج
        if model is None:
            logger.error("النموذج غير محمّل")
            return jsonify({'error': 'النموذج غير متوفر، يرجى المحاولة لاحقاً'}), 500
        
        # الحصول على البيانات
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'لم يتم إرسال بيانات'}), 400
        
        logger.info(f"تم استلام طلب تنبؤ: {data}")
        
        # التحقق من صحة البيانات
        is_valid, message = validate_input(data)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # تحضير البيانات للتنبؤ
        features = np.array([[data[feature] for feature in feature_names]])
        
        # تطبيق التطبيع
        if scaler is not None:
            features_scaled = scaler.transform(features)
        else:
            features_scaled = features
        
        # التنبؤ
        prediction_proba = model.predict_proba(features_scaled)[0][1]
        prediction = 1 if prediction_proba > 0.5 else 0
        risk_level = get_risk_level(prediction_proba)
        
        # تفسير التنبؤ
        factors = explain_prediction(features[0])
        
        # إنشاء النتيجة
        result = {
            'probability': float(prediction_proba),
            'prediction': int(prediction),
            'risk_level': risk_level,
            'factors': factors,
            'timestamp': datetime.now().isoformat()
        }
        
        # تسجيل النتيجة
        logger.info(f"تنبؤ مكتمل: احتمالية = {prediction_proba:.3f}, مستوى الخطر = {risk_level}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"خطأ في التنبؤ: {e}")
        return jsonify({'error': 'حدث خطأ في معالجة الطلب'}), 500

@app.route('/api/model_info', methods=['GET'])
def model_info():
    """معلومات عن النموذج"""
    if model is None:
        return jsonify({'error': 'النموذج غير متوفر'}), 500
    
    try:
        info = {
            'model_type': str(type(model).__name__),
            'features': feature_names,
            'features_ar': feature_names_ar,
            'n_features': len(feature_names),
            'trained': True,
            'version': '1.0.0'
        }
        
        # إضافة معلومات إضافية إذا كانت متوفرة
        if hasattr(model, 'n_estimators'):
            info['n_estimators'] = model.n_estimators
        if hasattr(model, 'max_depth'):
            info['max_depth'] = model.max_depth
            
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"خطأ في جلب معلومات النموذج: {e}")
        return jsonify({'error': 'حدث خطأ في جلب المعلومات'}), 500

# تهيئة النموذج عند بدء التطبيق
@app.before_first_request
def initialize():
    """تهيئة النموذج قبل أول طلب"""
    logger.info("تهيئة النموذج...")
    success = train_model()
    if success:
        logger.info("تم تهيئة النموذج بنجاح")
    else:
        logger.error("فشل في تهيئة النموذج")

if __name__ == '__main__':
    # تحميل النموذج عند بدء التطبيق
    logger.info("بدء تطبيق Flask...")
    train_model()
    
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )