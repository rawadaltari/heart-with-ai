import { useState, useEffect } from 'react';
import Navbar from './component/Navbar';
import Hero from './component/Hero';
import Footer from './component/Footer';
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Articles from './pages/Articles';
import Contact from './pages/Contact';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Handle hash changes for navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setActiveSection(hash);
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return <About />;
      case 'how-it-works':
        return <HowItWorks />;
      case 'articles':
        return <Articles />;
      case 'contact':
        return <Contact />;
      case 'home':
      default:
        return (
          <>
            <Hero />
            <Home />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>{renderContent()}</main>
      <Footer />
    </div>
  );
}

export default App;
