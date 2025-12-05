import { Activity, Shield, Users, TrendingUp } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Activity,
      title: 'Early Detection',
      description: 'Learn about symptoms and warning signs to catch heart issues early.',
    },
    {
      icon: Shield,
      title: 'Prevention First',
      description: 'Discover lifestyle changes and habits to protect your heart health.',
    },
    {
      icon: Users,
      title: 'Expert Guidance',
      description: 'Access information curated by cardiovascular health professionals.',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your heart health journey with our comprehensive resources.',
    },
  ];

  const stats = [
    { number: '50M+', label: 'People Helped' },
    { number: '1000+', label: 'Articles Published' },
    { number: '24/7', label: 'Support Available' },
    { number: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="pt-16">
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose HeartCare?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive heart disease information and resources to help you live a healthier life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl bg-gradient-to-br from-blue-50 to-red-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-white w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-500 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-red-500 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Take Control of Your Heart Health Today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of people who are taking proactive steps towards a healthier heart.
          </p>
          <button className="bg-red-500 text-white px-8 py-4 rounded-full hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg font-semibold">
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}
