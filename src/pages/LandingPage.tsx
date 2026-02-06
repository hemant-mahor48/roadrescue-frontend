import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  MapPin, 
  Shield, 
  Zap, 
  Star, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Car,
  Bike,
  Truck
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Real-Time GPS Tracking',
      description: 'Know exactly where your mechanic is with live location updates'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Matching',
      description: 'Get matched with verified mechanics within seconds'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Mechanics',
      description: 'All mechanics are police verified and highly rated'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Availability',
      description: 'Assistance anytime, anywhere, day or night'
    },
  ];

  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '2K+', label: 'Verified Mechanics' },
    { value: '15 Min', label: 'Avg Response Time' },
    { value: '4.8/5', label: 'Average Rating' },
  ];

  const services = [
    {
      icon: <Car className="w-12 h-12" />,
      title: 'Cars',
      description: 'All major car brands supported'
    },
    {
      icon: <Bike className="w-12 h-12" />,
      title: 'Bikes',
      description: 'Two-wheelers & scooters'
    },
    {
      icon: <Truck className="w-12 h-12" />,
      title: 'Trucks',
      description: 'Commercial vehicles'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Wrench className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                RoadRescue
              </span>
            </motion.div>

            <motion.div 
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <a href="#features" className="text-dark-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-dark-300 hover:text-white transition-colors">How It Works</a>
              <a href="#services" className="text-dark-300 hover:text-white transition-colors">Services</a>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600/10 rounded-full filter blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-semibold mb-6">
                🚗 Help on Wheels, Anytime, Anywhere
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Stranded on the Road?<br />
              <span className="gradient-text">Help is Here!</span>
            </h1>

            <p className="text-xl text-dark-300 max-w-3xl mx-auto leading-relaxed">
              Connect with verified mechanics instantly. Real-time tracking, transparent pricing, and 
              professional service when you need it most.
            </p>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2">
                <span>Request Help Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/become-mechanic" className="btn-secondary text-lg px-8 py-4">
                Become a Mechanic
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-dark-400 mt-2">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Why Choose <span className="gradient-text">RoadRescue</span>?
            </h2>
            <p className="text-dark-300 text-lg">Experience roadside assistance like never before</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card-hover group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-primary-500 mb-4 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-dark-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              We Support All <span className="gradient-text">Vehicles</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="glass-card p-8 text-center group hover:scale-105 transition-transform"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-primary-500 mb-4 flex justify-center transform group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                <p className="text-dark-400">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Get Help in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Request Help', description: 'Tap the help button and describe your issue' },
              { step: '02', title: 'Get Matched', description: 'We find the nearest verified mechanic for you' },
              { step: '03', title: 'Get Fixed', description: 'Track your mechanic in real-time and get back on the road' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-7xl font-bold text-primary-500/10 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-dark-400">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/4 -right-6 text-primary-500/30">
                    <ArrowRight className="w-12 h-12" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="glass-card p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Ready to Get Started?
              </h2>
              <p className="text-xl text-dark-300 mb-8">
                Join thousands of satisfied customers who trust RoadRescue
              </p>
              <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center space-x-2">
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  RoadRescue
                </span>
              </div>
              <p className="text-dark-400">
                Help on Wheels, Anytime, Anywhere.<br />
                Making roadside assistance reliable and accessible.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-dark-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-dark-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-800 mt-12 pt-8 text-center text-dark-400">
            <p>&copy; 2026 RoadRescue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
