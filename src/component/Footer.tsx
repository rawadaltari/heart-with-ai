import { Heart, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
              <span className="text-xl font-bold text-white">HeartCare</span>
            </div>
            <p className="text-sm leading-relaxed">
              Dedicated to providing comprehensive information and resources about heart health and cardiovascular diseases.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-red-500 transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#articles" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  Articles
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  Prevention Tips
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  Treatment Options
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  Healthy Recipes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  Exercise Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors duration-200 text-sm">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">123 Heart Ave, Health City, HC 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm">info@heartcare.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} HeartCare. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}
