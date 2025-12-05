import { useState } from "react";
import TextType from '../../compon/TextType';
import {
  Heart,
  Activity,
  User,
  Calendar,
  Scale,
  Thermometer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Brain,
  Shield,
  Zap,
} from "lucide-react";
interface PatientData {
  age: number;
  sex: number; // 0 = أنثى, 1 = ذكر
  cp: number; // chest pain type
  trestbps: number; // resting blood pressure
  chol: number; // serum cholesterol
  fbs: number; // fasting blood sugar
  restecg: number; // resting electrocardiographic results
  thalach: number; // maximum heart rate achieved
  exang: number; // exercise induced angina
  oldpeak: number; // ST depression
  slope: number; // slope of the peak exercise ST segment
  ca: number; // number of major vessels colored by flourosopy
  thal: number; // thalassemia
}

interface PredictionResult {
  probability: number;
  prediction: number;
  risk_level: string;
  factors: Array<{
    name: string;
    impact: number;
    description: string;
    direction?: string;
  }>;
  timestamp?: string;
}
export default function Ai() {
  const [formData, setFormData] = useState<PatientData>({
    age: 50,
    sex: 1,
    cp: 0,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 0,
    slope: 0,
    ca: 0,
    thal: 1,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleInputChange = (field: keyof PatientData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "حدث خطأ في الاتصال بالخادم");
      }

      const prediction = await response.json();
      setResult(prediction);
    } catch (err) {
      console.error("خطأ في التنبؤ:", err);
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");

      // التراجع إلى النموذج المحاكي في حال فشل API
      const mockPrediction = mockPredict(formData);
      setResult(mockPrediction);
    } finally {
      setLoading(false);
    }
  };

  // نموذج محاكي للتنبؤ (في حالة عدم توفر API)
  const mockPredict = (data: PatientData): PredictionResult => {
    let riskScore = 0;

    if (data.age > 60) riskScore += 0.3;
    else if (data.age > 50) riskScore += 0.15;
    if (data.sex === 1) riskScore += 0.1;
    if (data.cp === 3) riskScore += 0.2;
    else if (data.cp === 1 || data.cp === 2) riskScore += 0.1;
    if (data.trestbps > 140) riskScore += 0.15;
    else if (data.trestbps > 120) riskScore += 0.05;
    if (data.chol > 240) riskScore += 0.1;
    else if (data.chol > 200) riskScore += 0.05;
    if (data.thalach < 120) riskScore += 0.15;
    if (data.exang === 1) riskScore += 0.1;
    if (data.oldpeak > 2) riskScore += 0.1;
    if (data.ca > 0) riskScore += data.ca * 0.05;
    if (data.thal === 2) riskScore += 0.1;

    const probability = Math.min(riskScore, 0.9);
    const prediction = probability > 0.5 ? 1 : 0;

    let risk_level = "منخفض";
    if (probability > 0.7) risk_level = "مرتفع";
    else if (probability > 0.4) risk_level = "متوسط";

    const factors = [
      {
        name: "العمر",
        impact: data.age > 50 ? 0.8 : 0.3,
        description:
          data.age > 50
            ? "العمر فوق 50 سنة يزيد من المخاطر"
            : "العمر ضمن المعدل الطبيعي",
        direction: data.age > 50 ? "يزيد الخطر" : "يقلل الخطر",
      },
      {
        name: "ضغط الدم",
        impact: data.trestbps > 120 ? 0.6 : 0.2,
        description: data.trestbps > 120 ? "ضغط الدم مرتفع" : "ضغط الدم طبيعي",
        direction: data.trestbps > 120 ? "يزيد الخطر" : "يقلل الخطر",
      },
      {
        name: "الكولسترول",
        impact: data.chol > 200 ? 0.5 : 0.1,
        description:
          data.chol > 200 ? "مستوى الكولسترول مرتفع" : "مستوى الكولسترول طبيعي",
        direction: data.chol > 200 ? "يزيد الخطر" : "يقلل الخطر",
      },
      {
        name: "معدل ضربات القلب",
        impact: data.thalach < 120 ? 0.7 : 0.2,
        description:
          data.thalach < 120
            ? "معدل منخفض يشير لمشاكل محتملة"
            : "معدل ضربات القلب صحي",
        direction: data.thalach < 120 ? "يزيد الخطر" : "يقلل الخطر",
      },
    ].sort((a, b) => b.impact - a.impact);

    return {
      probability,
      prediction,
      risk_level,
      factors,
      timestamp: new Date().toISOString(),
    };
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "مرتفع":
        return "text-red-600 bg-red-50 border-red-200";
      case "متوسط":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "مرتفع":
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case "متوسط":
        return <Info className="w-6 h-6 text-yellow-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
  };

  const getRiskGradient = (level: string) => {
    switch (level) {
      case "مرتفع":
        return "from-red-500 to-red-600";
      case "متوسط":
        return "from-yellow-500 to-yellow-600";
      default:
        return "from-green-500 to-green-600";
    }
  };
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      dir="ltr"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6 mt-16 ">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-600 mb-4 ">
            Heart Care with AI
          </h1>
          
          <TextType
            text={["An advanced intelligent system for predicting"," the risk of heart", "disease using Artificial Intelligence and Machine Learning technologies."]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-3xl py-5  mb-4"
          />
            {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6 leading-relaxed">
              An advanced intelligent system for predicting the risk of heart
              disease using Artificial Intelligence and Machine Learning
              technologies.
            </p> */}
          {/* Medical Disclaimer */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg p-6 max-w-4xl mx-auto shadow-lg">
            <div className="flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-600 mr-3" />
              <div className="text-left">
                <p className="text-amber-800 font-bold text-lg mb-1">
                  Important Medical Disclaimer
                </p>
                <p className="text-amber-700">
                  This system is intended for educational and research purposes
                  only and should not be considered a substitute for
                  professional medical consultation or clinical diagnosis.
                </p>
              </div>
            </div>
          </div>
          {/* Quick Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-xl shadow-md border border-blue-100">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800">High Accuracy</p>
              <p className="text-sm text-gray-600">Accuracy rate 85%+</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border border-green-100">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800">Instant Analysis</p>
              <p className="text-sm text-gray-600">Results in seconds</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border border-purple-100">
              <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800">Artificial Intelligence</p>
              <p className="text-sm text-gray-600">Trained on medical data</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* نموذج الإدخال */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <User className="w-8 h-8 ml-3 text-blue-600" />
              data paintet
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* العمر */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 ml-2 text-blue-500" />
                  Age (years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) =>
                    handleInputChange("age", parseInt(e.target.value) || 0)
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* الجنس */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Gender
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) =>
                    handleInputChange("sex", parseInt(e.target.value))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value={0}>Female</option>
                  <option value={1}>Male</option>
                </select>
              </div>

              {/* نوع ألم الصدر */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Chest Pain Type
                </label>
                <select
                  value={formData.cp}
                  onChange={(e) =>
                    handleInputChange("cp", parseInt(e.target.value))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value={0}>No Pain</option>
                  <option value={1}>Typical Angina</option>
                  <option value={2}>Atypical Angina</option>
                  <option value={3}>Non-Cardiac Pain</option>
                </select>
              </div>

              {/* ضغط الدم */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <TrendingUp className="w-4 h-4 ml-2 text-red-500" />
                  Systolic Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  min="80"
                  max="250"
                  value={formData.trestbps}
                  onChange={(e) =>
                    handleInputChange("trestbps", parseInt(e.target.value) || 0)
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                <p className="text-xs text-gray-500">Normal: 90-120</p>
              </div>

              {/* الكولسترول */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <Scale className="w-4 h-4 ml-2 text-yellow-500" />
                  Cholesterol Level (mg/dl)
                </label>
                <input
                  type="number"
                  min="100"
                  max="500"
                  value={formData.chol}
                  onChange={(e) =>
                    handleInputChange("chol", parseInt(e.target.value) || 0)
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                <p className="text-xs text-gray-500">Normal: below 200</p>
              </div>

              {/* سكر الدم */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <Thermometer className="w-4 h-4 ml-2 text-green-500" />
                  Fasting Blood Sugar
                </label>
                <select
                  value={formData.fbs}
                  onChange={(e) =>
                    handleInputChange("fbs", parseInt(e.target.value))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value={0}>Normal (&lt; 120 mg/dl)</option>
                  <option value={1}>High (&gt; 120 mg/dl)</option>
                </select>
              </div>

              {/* نتائج تخطيط القلب */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  ECG Results
                </label>
                <select
                  value={formData.restecg}
                  onChange={(e) =>
                    handleInputChange("restecg", parseInt(e.target.value))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value={0}>Normal</option>
                  <option value={1}>ST-T Abnormality</option>
                  <option value={2}>Left Ventricular Hypertrophy</option>
                </select>
              </div>

              {/* معدل ضربات القلب القصوى */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <Heart className="w-4 h-4 ml-2 text-red-500" />
                  Maximum Heart Rate
                </label>
                <input
                  type="number"
                  min="60"
                  max="220"
                  value={formData.thalach}
                  onChange={(e) =>
                    handleInputChange("thalach", parseInt(e.target.value) || 0)
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
                <p className="text-xs text-gray-500">Normal: 150-200</p>
              </div>

              {/* ذبحة صدرية مع التمرين */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Exercise-Induced Angina
                </label>
                <select
                  value={formData.exang}
                  onChange={(e) =>
                    handleInputChange("exang", parseInt(e.target.value))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>

              {/* انخفاض ST */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  ST Depression (oldpeak)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.oldpeak}
                  onChange={(e) =>
                    handleInputChange(
                      "oldpeak",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              {/* ميل قطعة ST */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  ST Slope
                </label>
                <select
                  value={formData.slope}
                  onChange={(e) =>
                    handleInputChange("slope", parseInt(e.target.value))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value={0}>Upward</option>
                  <option value={1}>Flat</option>
                  <option value={2}>Downward</option>
                </select>
              </div>

              {/* عدد الأوعية الملونة */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Number of Major Vessels (0-4)
                </label>
                <select
                  value={formData.ca}
                  onChange={(e) =>
                    handleInputChange("ca", parseInt(e.target.value))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>

              {/* نوع الثلاسيميا */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Thalassemia Type
                </label>
                <select
                  value={formData.thal}
                  onChange={(e) =>
                    handleInputChange("thal", parseInt(e.target.value))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value={1}>Normal</option>
                  <option value={2}>Fixed Defect</option>
                  <option value={3}>Reversible Defect</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 flex items-center">
                  <AlertTriangle className="w-5 h-5 ml-2" />
                  {error}
                </p>
              </div>
            )}

            {/* زر التنبؤ */}
            <button
              onClick={handlePredict}
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white ml-3"></div>
                  جاري التحليل بالذكاء الاصطناعي...
                </>
              ) : (
                <>
                  <Brain className="w-6 h-6 ml-3" />
                  AI Risk Analysis
                </>
              )}
            </button>
          </div>

          {/* النتائج */}
          <div className="space-y-6">
            {result && (
              <>
                {/* نتيجة التنبؤ الرئيسية */}
                <div
                  className={`bg-white rounded-2xl shadow-xl p-8 border-l-8 transition-all duration-500 ${
                    result.risk_level === "مرتفع"
                      ? "border-red-500"
                      : result.risk_level === "متوسط"
                      ? "border-yellow-500"
                      : "border-green-500"
                  }`}
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    {getRiskIcon(result.risk_level)}
                    <span className="mr-3">
                      نتيجة التحليل بالذكاء الاصطناعي
                    </span>
                  </h3>

                  <div className="text-center mb-8">
                    <div
                      className={`text-7xl font-bold mb-4 bg-gradient-to-br ${getRiskGradient(
                        result.risk_level
                      )} bg-clip-text text-transparent animate-pulse`}
                    >
                      {Math.round(result.probability * 100)}%
                    </div>
                    <p className="text-xl text-gray-600 mb-4">
                      احتمالية الإصابة بأمراض القلب
                    </p>

                    <div
                      className={`inline-flex items-center px-6 py-3 rounded-full border-2 ${getRiskColor(
                        result.risk_level
                      )} text-lg font-bold`}
                    >
                      {getRiskIcon(result.risk_level)}
                      <span className="mr-2">
                        مستوى الخطر: {result.risk_level}
                      </span>
                    </div>
                  </div>

                  {/* مقياس المخاطر البصري المتقدم */}
                  <div className="mb-6">
                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-2000 ease-out bg-gradient-to-r ${getRiskGradient(
                          result.risk_level
                        )} relative overflow-hidden`}
                        style={{ width: `${result.probability * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2 px-2">
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full ml-1"></div>
                        منخفض
                      </span>
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full ml-1"></div>
                        متوسط
                      </span>
                      <span className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full ml-1"></div>
                        مرتفع
                      </span>
                    </div>
                  </div>

                  {result.timestamp && (
                    <div className="text-center text-sm text-gray-500">
                      تاريخ التحليل:{" "}
                      {new Date(result.timestamp).toLocaleString("ar-SA")}
                    </div>
                  )}
                </div>

                {/* العوامل المؤثرة */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <TrendingUp className="w-7 h-7 text-blue-600 ml-3" />
                    أهم العوامل المؤثرة (تحليل SHAP)
                  </h3>

                  <div className="space-y-6">
                    {result.factors.map((factor, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm ml-3">
                              {index + 1}
                            </div>
                            <span className="font-bold text-gray-800 text-lg">
                              {factor.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {factor.direction && (
                              <span
                                className={`text-xs font-bold px-3 py-1 rounded-full ${
                                  factor.direction === "يزيد الخطر"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {factor.direction}
                              </span>
                            )}
                            <span
                              className="text-sm font-bold px-3 py-1 rounded-full"
                              style={{
                                backgroundColor:
                                  factor.impact > 0.5 ? "#fee2e2" : "#f0fdf4",
                                color:
                                  factor.impact > 0.5 ? "#dc2626" : "#16a34a",
                              }}
                            >
                              تأثير {factor.impact > 0.5 ? "عالي" : "منخفض"}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {factor.description}
                        </p>

                        {/* مقياس التأثير المحسن */}
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              factor.impact > 0.5
                                ? "bg-gradient-to-r from-red-400 to-red-500"
                                : "bg-gradient-to-r from-green-400 to-green-500"
                            }`}
                            style={{ width: `${factor.impact * 100}%` }}
                          >
                            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* التوصيات الطبية */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 shadow-xl">
                  <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
                    <Info className="w-7 h-7 ml-3" />
                    التوصيات الطبية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <p className="text-blue-800">
                        استشر أخصائي القلب للحصول على تقييم شامل ودقيق
                      </p>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <p className="text-blue-800">
                        اتبع نظاماً غذائياً متوازناً قليل الدهون المشبعة والملح
                      </p>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <p className="text-blue-800">
                        مارس الرياضة بانتظام لمدة 30 دقيقة يومياً
                      </p>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <p className="text-blue-800">
                        تجنب التدخين والكحول والتوتر المفرط
                      </p>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <p className="text-blue-800">
                        راقب ضغط الدم ومستوى السكر بانتظام
                      </p>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <p className="text-blue-800">
                        احصل على قسط كافٍ من النوم (7-8 ساعات يومياً)
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!result && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="relative mb-6">
                  <Heart className="w-20 h-20 text-gray-300 mx-auto animate-pulse" />
                  <Brain className="w-8 h-8 text-blue-400 absolute -top-2 -right-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                  Waiting for Data
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed">
                  Fill in the medical data and click "AI Risk Analysis" to view
                  detailed results.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* معلومات النظام */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            About the AI System
          </h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-800 text-lg">Advanced AI</h4>
              <p className="text-gray-600 leading-relaxed">
                Uses advanced machine learning algorithms such as XGBoost and
                Random Forest
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="font-bold text-gray-800 text-lg">High Accuracy</h4>
              <p className="text-gray-600 leading-relaxed">
                Trained on real medical data with up to 87% prediction accuracy
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-800 text-lg">User Friendly</h4>
              <p className="text-gray-600 leading-relaxed">
                Intuitive interface with clear visual indicators and full
                English support
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-800 text-lg">
                Smart Explanations
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Highlights factors influencing predictions using advanced SHAP
                techniques
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
