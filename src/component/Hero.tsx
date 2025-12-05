import { ArrowRight } from "lucide-react";
import BlurText from "../compon/motion";

const handleAnimationComplete = () => {
  console.log("Animation completed!");
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-red-900/80 z-10"></div>
        <img
          src="https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Heart health"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fadeIn">
          <BlurText
            text="Your Heart Our Priority"
            delay={150}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="text-6xl mb-8 text-gray-200"
          />
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover comprehensive information about heart diseases, prevention
            strategies, and cutting-edge treatments to keep your heart healthy
            and strong.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group bg-red-500 text-white px-8 py-4 rounded-full hover:bg-red-600 transition-all duration-300 shadow-2xl hover:shadow-red-500/50 transform hover:-translate-y-1 flex items-center space-x-2 text-lg font-semibold">
              <span>Learn More</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full hover:bg-white/20 transition-all duration-300 border-2 border-white/30 text-lg font-semibold transform hover:-translate-y-1">
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
