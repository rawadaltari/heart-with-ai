import { Heart, Target, Eye, Award } from "lucide-react";
import LiquidEther from '../compon/LiquidEther';
export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description:
        "We care deeply about heart health and the well-being of every individual.",
    },
    {
      icon: Target,
      title: "Accuracy",
      description:
        "Providing reliable, evidence-based information you can trust.",
    },
    {
      icon: Eye,
      title: "Transparency",
      description:
        "Clear, honest communication about heart diseases and treatments.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "Committed to the highest standards in cardiovascular health education.",
    },
  ];

  return (
    <div id="about" className="pt-16 ">
      {/* Hero Section */}
      <section className=" bg-gradient-to-br from-[#3c405d] via-[#193656] to-[#000000]">
        <div style={{ width: "100%", height: 600, position: "relative" }}>
          <LiquidEther
          
          colors={["#E63946", "#FFB3C1", "#457B9D"]}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute inset-0 flex items-center justify-center ">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              About HeartCare
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              We are dedicated to educating and empowering individuals with
              comprehensive knowledge about heart diseases, prevention, and
              treatment options.
            </p>
          </div>
        </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
                Our Mission
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Empowering Heart Health Awareness
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to provide accessible, accurate, and actionable
                information about cardiovascular diseases. We believe that
                knowledge is power, and by educating individuals about heart
                health, we can help reduce the impact of heart disease
                worldwide.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Through comprehensive resources, expert insights, and a
                supportive community, we strive to make heart health information
                available to everyone, everywhere.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                Our Vision
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                A World with Healthy Hearts
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We envision a future where heart disease is no longer the
                leading cause of death globally. A world where every person has
                access to the knowledge and resources they need to maintain
                optimal cardiovascular health.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By fostering awareness, promoting prevention, and supporting
                those affected by heart disease, we aim to create a healthier,
                more informed society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600">
              Principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-gradient-to-br from-blue-500 to-red-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Expertise Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Expertise
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Information provided by qualified cardiovascular health
              professionals and backed by the latest medical research.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-red-600 rounded-2xl p-8 md:p-12 text-white text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Join Our Community
            </h3>
            <p className="text-lg mb-8 text-blue-100">
              Be part of a growing community dedicated to heart health awareness
              and education.
            </p>
            <button className="bg-white text-red-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold">
              Get Involved
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
