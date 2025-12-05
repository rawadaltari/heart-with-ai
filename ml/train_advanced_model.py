import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import shap
import warnings
from datetime import datetime
import os

warnings.filterwarnings('ignore')

class HeartDiseasePredictor:
    def __init__(self):
        self.models = {}
        self.best_model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
            'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
        ]
        self.feature_names_ar = {
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

    def create_enhanced_synthetic_data(self, n_samples=2000):
        """إنشاء بيانات تصنيعية محسنة ومتوازنة"""
        np.random.seed(42)
        
        print("إنشاء بيانات تدريب محسنة...")
        
        # إنشاء البيانات بناءً على التوزيعات الطبيعية
        data = {}
        
        # العمر: توزيع طبيعي مع تركيز على الأعمار المتوسطة والكبيرة
        data['age'] = np.random.gamma(2, 25).clip(29, 79).astype(int)
        
        # الجنس: توزيع متوازن مع تحيز طفيف للذكور (أكثر عرضة لأمراض القلب)
        data['sex'] = np.random.choice([0, 1], n_samples, p=[0.45, 0.55])
        
        # نوع ألم الصدر: توزيع واقعي
        data['cp'] = np.random.choice([0, 1, 2, 3], n_samples, p=[0.4, 0.3, 0.2, 0.1])
        
        # ضغط الدم: توزيع طبيعي مع تحيز للقيم المرتفعة
        data['trestbps'] = np.random.normal(130, 20).clip(90, 200).astype(int)
        
        # الكولسترول: توزيع طبيعي
        data['chol'] = np.random.normal(240, 60).clip(120, 450).astype(int)
        
        # سكر الدم الصائم
        data['fbs'] = np.random.choice([0, 1], n_samples, p=[0.85, 0.15])
        
        # نتائج تخطيط القلب
        data['restecg'] = np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.3, 0.1])
        
        # معدل ضربات القلب القصوى
        age_factor = (80 - data['age']) / 50  # يقل مع العمر
        data['thalach'] = (140 + age_factor * 30 + np.random.normal(0, 15)).clip(80, 200).astype(int)
        
        # ذبحة صدرية مع التمرين
        data['exang'] = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
        
        # انخفاض ST
        data['oldpeak'] = np.random.exponential(0.8).clip(0, 6.2)
        
        # ميل قطعة ST
        data['slope'] = np.random.choice([0, 1, 2], n_samples, p=[0.3, 0.5, 0.2])
        
        # عدد الأوعية الملونة
        data['ca'] = np.random.choice([0, 1, 2, 3, 4], n_samples, p=[0.6, 0.2, 0.1, 0.07, 0.03])
        
        # نوع الثلاسيميا
        data['thal'] = np.random.choice([1, 2, 3], n_samples, p=[0.6, 0.2, 0.2])
        
        df = pd.DataFrame(data)
        
        # إنشاء المتغير التابع بناءً على قواعد طبية معقدة
        target = np.zeros(n_samples)
        
        for i in range(n_samples):
            risk_score = 0
            
            # العمر (عامل مهم جداً)
            age = df.loc[i, 'age']
            if age > 70: risk_score += 4
            elif age > 60: risk_score += 3
            elif age > 50: risk_score += 2
            elif age > 40: risk_score += 1
            
            # الجنس
            if df.loc[i, 'sex'] == 1: risk_score += 2
            
            # نوع ألم الصدر (مؤشر قوي)
            cp = df.loc[i, 'cp']
            if cp == 1: risk_score += 4  # ألم ذبحة نموذجي
            elif cp == 2: risk_score += 3  # ألم ذبحة غير نموذجي
            elif cp == 0: risk_score += 1  # لا ألم (قد يكون صامت)
            
            # ضغط الدم
            bp = df.loc[i, 'trestbps']
            if bp > 160: risk_score += 3
            elif bp > 140: risk_score += 2
            elif bp > 120: risk_score += 1
            
            # الكولسترول
            chol = df.loc[i, 'chol']
            if chol > 300: risk_score += 3
            elif chol > 240: risk_score += 2
            elif chol > 200: risk_score += 1
            
            # سكر الدم
            if df.loc[i, 'fbs'] == 1: risk_score += 1.5
            
            # تخطيط القلب
            if df.loc[i, 'restecg'] == 2: risk_score += 2
            elif df.loc[i, 'restecg'] == 1: risk_score += 1
            
            # معدل ضربات القلب القصوى
            hr = df.loc[i, 'thalach']
            if hr < 100: risk_score += 3
            elif hr < 120: risk_score += 2
            elif hr < 140: risk_score += 1
            
            # ذبحة صدرية مع التمرين
            if df.loc[i, 'exang'] == 1: risk_score += 2.5
            
            # انخفاض ST
            oldpeak = df.loc[i, 'oldpeak']
            if oldpeak > 4: risk_score += 3
            elif oldpeak > 2: risk_score += 2
            elif oldpeak > 1: risk_score += 1
            
            # ميل قطعة ST
            if df.loc[i, 'slope'] == 2: risk_score += 2
            elif df.loc[i, 'slope'] == 1: risk_score += 1
            
            # عدد الأوعية الملونة (مؤشر قوي جداً)
            ca = df.loc[i, 'ca']
            risk_score += ca * 1.5
            
            # نوع الثلاسيميا
            if df.loc[i, 'thal'] == 2: risk_score += 2.5
            elif df.loc[i, 'thal'] == 3: risk_score += 1
            
            # تطبيق دالة تحويل غير خطية للواقعية
            probability = 1 / (1 + np.exp(-(risk_score - 8) / 3))
            
            # إضافة عشوائية طفيفة
            probability += np.random.normal(0, 0.1)
            probability = np.clip(probability, 0, 1)
            
            target[i] = 1 if probability > 0.5 else 0
        
        df['target'] = target.astype(int)
        
        print(f"تم إنشاء {len(df)} عينة")
        print(f"توزيع الفئات: {df['target'].value_counts().to_dict()}")
        print(f"نسبة التوازن: {df['target'].mean():.3f}")
        
        return df

    def prepare_data(self, df):
        """تحضير وتنظيف البيانات"""
        print("تحضير البيانات للتدريب...")
        
        # فصل المتغيرات المستقلة والتابعة
        X = df[self.feature_names].copy()
        y = df['target'].copy()
        
        # التحقق من البيانات المفقودة
        if X.isnull().sum().sum() > 0:
            print("تم العثور على بيانات مفقودة، سيتم ملؤها...")
            X = X.fillna(X.median())
        
        # تقسيم البيانات
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # تطبيع البيانات
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print(f"حجم بيانات التدريب: {len(X_train)}")
        print(f"حجم بيانات الاختبار: {len(X_test)}")
        
        return X_train_scaled, X_test_scaled, y_train, y_test, X_train, X_test

    def define_models(self):
        """تعريف النماذج المختلفة للمقارنة"""
        self.models = {
            'RandomForest': RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                class_weight='balanced'
            ),
            'XGBoost': XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                eval_metric='logloss',
                scale_pos_weight=1
            ),
            'GradientBoosting': GradientBoostingClassifier(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                subsample=0.8,
                random_state=42
            ),
            'LogisticRegression': LogisticRegression(
                random_state=42,
                max_iter=1000,
                class_weight='balanced'
            ),
            'SVM': SVC(
                kernel='rbf',
                probability=True,
                random_state=42,
                class_weight='balanced'
            )
        }

    def train_and_evaluate_models(self, X_train, X_test, y_train, y_test):
        """تدريب وتقييم جميع النماذج"""
        print("\n" + "="*70)
        print("بدء تدريب وتقييم النماذج")
        print("="*70)
        
        model_results = {}
        
        for name, model in self.models.items():
            print(f"\n{'='*50}")
            print(f"تدريب نموذج: {name}")
            print('='*50)
            
            # التدريب
            model.fit(X_train, y_train)
            
            # التنبؤ
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)[:, 1]
            
            # التقييم
            auc = roc_auc_score(y_test, y_pred_proba)
            
            # Cross-validation
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
            
            print(f"AUC Score: {auc:.4f}")
            print(f"CV AUC Score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
            print(f"Train Accuracy: {model.score(X_train, y_train):.4f}")
            print(f"Test Accuracy: {model.score(X_test, y_test):.4f}")
            print("\nClassification Report:")
            print(classification_report(y_test, y_pred))
            
            model_results[name] = {
                'model': model,
                'auc': auc,
                'cv_auc': cv_scores.mean(),
                'cv_std': cv_scores.std(),
                'y_pred': y_pred,
                'y_pred_proba': y_pred_proba,
                'train_acc': model.score(X_train, y_train),
                'test_acc': model.score(X_test, y_test)
            }
        
        # اختيار أفضل نموذج بناءً على AUC
        best_model_name = max(model_results.keys(), key=lambda x: model_results[x]['auc'])
        self.best_model = model_results[best_model_name]['model']
        
        print(f"\n{'='*70}")
        print(f"أفضل نموذج: {best_model_name}")
        print(f"AUC Score: {model_results[best_model_name]['auc']:.4f}")
        print(f"CV AUC Score: {model_results[best_model_name]['cv_auc']:.4f}")
        print('='*70)
        
        return model_results, best_model_name

    def plot_model_comparison(self, model_results):
        """رسم مقارنة بين النماذج"""
        plt.style.use('seaborn-v0_8')
        
        # مقارنة AUC scores
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        # AUC Comparison
        names = list(model_results.keys())
        auc_scores = [model_results[name]['auc'] for name in names]
        cv_scores = [model_results[name]['cv_auc'] for name in names]
        
        axes[0, 0].bar(names, auc_scores, alpha=0.7, color='lightblue', label='Test AUC')
        axes[0, 0].bar(names, cv_scores, alpha=0.7, color='lightcoral', label='CV AUC')
        axes[0, 0].set_title('مقارنة AUC Scores', fontsize=14, fontweight='bold')
        axes[0, 0].set_ylabel('AUC Score')
        axes[0, 0].legend()
        axes[0, 0].tick_params(axis='x', rotation=45)
        
        # Accuracy Comparison
        train_acc = [model_results[name]['train_acc'] for name in names]
        test_acc = [model_results[name]['test_acc'] for name in names]
        
        x = np.arange(len(names))
        width = 0.35
        
        axes[0, 1].bar(x - width/2, train_acc, width, alpha=0.7, color='lightgreen', label='Train Accuracy')
        axes[0, 1].bar(x + width/2, test_acc, width, alpha=0.7, color='lightsalmon', label='Test Accuracy')
        axes[0, 1].set_title('مقارنة دقة النماذج', fontsize=14, fontweight='bold')
        axes[0, 1].set_ylabel('Accuracy')
        axes[0, 1].set_xticks(x)
        axes[0, 1].set_xticklabels(names, rotation=45)
        axes[0, 1].legend()
        
        # Feature Importance (للنموذج الأفضل)
        if hasattr(self.best_model, 'feature_importances_'):
            importance = self.best_model.feature_importances_
            indices = np.argsort(importance)[::-1]
            
            axes[1, 0].bar(range(len(importance)), importance[indices])
            axes[1, 0].set_title('أهمية الميزات (أفضل نموذج)', fontsize=14, fontweight='bold')
            axes[1, 0].set_xlabel('الميزات')
            axes[1, 0].set_ylabel('الأهمية')
            axes[1, 0].set_xticks(range(len(importance)))
            axes[1, 0].set_xticklabels([self.feature_names[i] for i in indices], rotation=45)
        
        # ROC Curve للنموذج الأفضل
        # (سيتم رسمها في دالة منفصلة)
        axes[1, 1].text(0.5, 0.5, 'ROC Curve\n(سيتم رسمها منفصلة)', 
                       ha='center', va='center', fontsize=12,
                       bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgray"))
        axes[1, 1].set_xlim(0, 1)
        axes[1, 1].set_ylim(0, 1)
        
        plt.tight_layout()
        plt.savefig('plots/model_comparison.png', dpi=300, bbox_inches='tight')
        plt.show()

    def plot_confusion_matrix(self, y_test, y_pred, model_name):
        """رسم مصفوفة الخلط"""
        plt.figure(figsize=(8, 6))
        cm = confusion_matrix(y_test, y_pred)
        
        # تحسين الألوان والتسميات
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                    xticklabels=['سليم', 'مريض'], 
                    yticklabels=['سليم', 'مريض'],
                    cbar_kws={'label': 'عدد الحالات'})
        
        plt.title(f'مصفوفة الخلط - {model_name}', fontsize=16, fontweight='bold')
        plt.xlabel('التنبؤ', fontsize=12)
        plt.ylabel('الحقيقة', fontsize=12)
        
        # إضافة إحصائيات
        tn, fp, fn, tp = cm.ravel()
        sensitivity = tp / (tp + fn)
        specificity = tn / (tn + fp)
        precision = tp / (tp + fp)
        
        stats_text = f'الحساسية: {sensitivity:.3f}\nالنوعية: {specificity:.3f}\nالدقة: {precision:.3f}'
        plt.text(cm.shape[1] + 0.1, cm.shape[0] / 2, stats_text, 
                verticalalignment='center', bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgray"))
        
        plt.tight_layout()
        plt.savefig('plots/confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()

    def plot_roc_curve(self, y_test, model_results):
        """رسم منحنى ROC لجميع النماذج"""
        plt.figure(figsize=(10, 8))
        
        colors = ['blue', 'red', 'green', 'orange', 'purple']
        
        for i, (name, results) in enumerate(model_results.items()):
            fpr, tpr, _ = roc_curve(y_test, results['y_pred_proba'])
            auc = results['auc']
            
            plt.plot(fpr, tpr, color=colors[i % len(colors)], lw=2, 
                    label=f'{name} (AUC = {auc:.3f})')
        
        plt.plot([0, 1], [0, 1], color='gray', lw=2, linestyle='--', alpha=0.5)
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('معدل الإيجابية الكاذبة (False Positive Rate)', fontsize=12)
        plt.ylabel('معدل الإيجابية الحقيقية (True Positive Rate)', fontsize=12)
        plt.title('منحنيات ROC للنماذج المختلفة', fontsize=16, fontweight='bold')
        plt.legend(loc="lower right")
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('plots/roc_curves.png', dpi=300, bbox_inches='tight')
        plt.show()

    def create_shap_analysis(self, X_train, X_test):
        """إنشاء تحليل SHAP المتقدم"""
        try:
            print("\nإنشاء تحليل SHAP...")
            
            # إنشاء SHAP explainer
            explainer = shap.Explainer(self.best_model, X_train[:200])
            shap_values = explainer(X_test[:100])
            
            # Summary plot
            plt.figure(figsize=(12, 8))
            shap.summary_plot(shap_values, X_test[:100], 
                            feature_names=[self.feature_names_ar[f] for f in self.feature_names],
                            show=False)
            plt.title('تحليل SHAP - أهمية وتأثير الميزات', fontsize=16, fontweight='bold')
            plt.tight_layout()
            plt.savefig('plots/shap_summary.png', dpi=300, bbox_inches='tight')
            plt.show()
            
            # Feature importance plot
            plt.figure(figsize=(10, 6))
            shap.summary_plot(shap_values, X_test[:100], plot_type="bar",
                            feature_names=[self.feature_names_ar[f] for f in self.feature_names],
                            show=False)
            plt.title('ترتيب أهمية الميزات - SHAP', fontsize=16, fontweight='bold')
            plt.tight_layout()
            plt.savefig('plots/shap_importance.png', dpi=300, bbox_inches='tight')
            plt.show()
            
            return explainer
            
        except Exception as e:
            print(f"خطأ في تحليل SHAP: {e}")
            return None

    def save_model(self, model_results, best_model_name):
        """حفظ أفضل نموذج ومعلوماته"""
        print("\nحفظ النموذج...")
        
        # إنشاء مجلدات الحفظ
        os.makedirs('models', exist_ok=True)
        os.makedirs('data', exist_ok=True)
        
        # حفظ النموذج والمعايرة
        joblib.dump(self.best_model, 'models/heart_disease_model.pkl')
        joblib.dump(self.scaler, 'models/scaler.pkl')
        
        # حفظ معلومات النموذج
        model_info = {
            'best_model': best_model_name,
            'performance': model_results[best_model_name],
            'feature_names': self.feature_names,
            'feature_names_ar': self.feature_names_ar,
            'training_date': datetime.now().isoformat(),
            'model_type': str(type(self.best_model).__name__)
        }
        
        # حفظ المعلومات
        import json
        with open('models/model_info.json', 'w', encoding='utf-8') as f:
            json.dump(model_info, f, ensure_ascii=False, indent=2)
        
        print(f"تم حفظ النموذج: {best_model_name}")
        print(f"AUC Score: {model_results[best_model_name]['auc']:.4f}")
        print(f"مكان النموذج: models/heart_disease_model.pkl")
        print(f"مكان المعايرة: models/scaler.pkl")

def main():
    """الدالة الرئيسية للتدريب المتقدم"""
    print("="*80)
    print("نظام التدريب المتقدم لنموذج التنبؤ بأمراض القلب")
    print("="*80)
    
    # إنشاء كائن المتنبئ
    predictor = HeartDiseasePredictor()
    
    # إنشاء مجلدات الحفظ
    os.makedirs('models', exist_ok=True)
    os.makedirs('plots', exist_ok=True)
    os.makedirs('data', exist_ok=True)
    
    # إنشاء البيانات
    df = predictor.create_enhanced_synthetic_data(n_samples=2000)
    
    # تحضير البيانات
    X_train_scaled, X_test_scaled, y_train, y_test, X_train, X_test = predictor.prepare_data(df)
    
    # تعريف النماذج
    predictor.define_models()
    
    # تدريب وتقييم النماذج
    model_results, best_model_name = predictor.train_and_evaluate_models(
        X_train_scaled, X_test_scaled, y_train, y_test
    )
    
    # رسم المقارنات
    predictor.plot_model_comparison(model_results)
    predictor.plot_confusion_matrix(y_test, model_results[best_model_name]['y_pred'], best_model_name)
    predictor.plot_roc_curve(y_test, model_results)
    
    # تحليل SHAP
    predictor.create_shap_analysis(X_train_scaled, X_test_scaled)
    
    # حفظ النموذج
    predictor.save_model(model_results, best_model_name)
    
    print("\n" + "="*80)
    print("اكتمل التدريب بنجاح!")
    print("="*80)

if __name__ == "__main__":
    main()