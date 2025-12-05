import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';

export default function Articles() {
  const articles = [
    {
      id: 1,
      title: 'Understanding Coronary Artery Disease: Signs and Prevention',
      excerpt: 'Learn about the most common type of heart disease and how to prevent it through lifestyle changes and medical intervention.',
      image: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Prevention',
      date: 'Mar 15, 2024',
      readTime: '5 min read',
      author: 'Dr. Sarah Johnson',
    },
    {
      id: 2,
      title: 'Heart-Healthy Diet: Foods That Protect Your Cardiovascular System',
      excerpt: 'Discover the best foods to include in your diet to maintain a healthy heart and reduce the risk of cardiovascular diseases.',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Nutrition',
      date: 'Mar 12, 2024',
      readTime: '7 min read',
      author: 'Dr. Michael Chen',
    },
    {
      id: 3,
      title: 'Exercise and Heart Health: Creating an Effective Workout Routine',
      excerpt: 'Find out how regular physical activity strengthens your heart and what exercises are most beneficial for cardiovascular health.',
      image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Fitness',
      date: 'Mar 10, 2024',
      readTime: '6 min read',
      author: 'Dr. Emily Roberts',
    },
    {
      id: 4,
      title: 'Recognizing Heart Attack Symptoms: When to Seek Emergency Care',
      excerpt: 'Time is critical during a heart attack. Learn the warning signs and what actions to take immediately.',
      image: 'https://images.pexels.com/photos/7659571/pexels-photo-7659571.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Emergency',
      date: 'Mar 8, 2024',
      readTime: '4 min read',
      author: 'Dr. James Wilson',
    },
    {
      id: 5,
      title: 'Managing Stress for Better Heart Health',
      excerpt: 'Chronic stress can impact your heart. Explore effective stress management techniques for cardiovascular wellness.',
      image: 'https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Wellness',
      date: 'Mar 5, 2024',
      readTime: '5 min read',
      author: 'Dr. Lisa Anderson',
    },
    {
      id: 6,
      title: 'Understanding Blood Pressure: Numbers That Matter',
      excerpt: 'High blood pressure is a silent killer. Learn what your numbers mean and how to maintain healthy blood pressure levels.',
      image: 'https://images.pexels.com/photos/7659579/pexels-photo-7659579.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Prevention',
      date: 'Mar 3, 2024',
      readTime: '6 min read',
      author: 'Dr. David Martinez',
    },
  ];

  const categories = ['All', 'Prevention', 'Nutrition', 'Fitness', 'Emergency', 'Wellness'];

  return (
    <div id="articles" className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Heart Health Articles
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert insights, research-backed information, and practical advice
            to help you maintain a healthy heart.
          </p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full transition-all duration-200 ${
                  category === 'All'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-500 transition-colors duration-200">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{article.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-700">{article.author}</span>
                    <button className="text-red-500 hover:text-red-600 flex items-center space-x-1 font-semibold group/btn">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Tag className="w-12 h-12 text-white mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stay Updated with Heart Health News
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Subscribe to our newsletter and get the latest articles delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-red-600 px-8 py-3 rounded-full hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
