// Heroicons SVG Icons
const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9z" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.514-4.25-5.25-4.25-3.254 0-5.88 3.007-6.75 6.75-.87-3.743-3.496-6.75-6.75-6.75C2.514 4 0 5.765 0 8.25c0 5.118 5.25 9.75 10.5 13.5L12 23l1.5-1.25C18.75 18 24 13.37 24 8.25" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9zm0 0c2.485 0 4.5-4.03 4.5-9A9 9 0 008.716 4.747M12 3c-2.485 0-4.5 4.03-4.5 9a9.004 9.004 0 008.716 6.747" />
  </svg>
);

const UserIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// Navbar Component
const Navbar = () => (
  <nav className="fixed top-4 left-4 right-4 z-50">
    <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-organic shadow-organic">
      <div className="flex items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <LeafIcon />
          </div>
          <span className="font-heading font-semibold text-xl text-text">Terratrace</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">Features</a>
          <a href="#testimonials" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">Stories</a>
          <a href="#cta" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">About</a>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-secondary transition-colors duration-200 cursor-pointer flex items-center gap-2">
          Start Planning
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  </nav>
);

// Hero Section
const HeroSection = () => (
  <section className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4 relative overflow-hidden">
    {/* Background decorative elements */}
    <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
    <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-secondary/20 rounded-full blur-3xl"></div>

    <div className="max-w-4xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-organic">
        <div className="w-8 h-8 bg-cta rounded-full flex items-center justify-center">
          <LeafIcon />
        </div>
        <span className="text-sm font-medium text-text">Sustainable Travel Made Simple</span>
      </div>

      <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-text mb-6 leading-tight">
        Explore the World,
        <span className="text-primary block mt-2">Leave Only Footprints.</span>
      </h1>

      <p className="text-lg md:text-xl text-text/70 max-w-2xl mx-auto mb-10 leading-relaxed">
        Plan eco-friendly journeys, track your carbon footprint, and discover destinations that share your commitment to sustainability. Every trip counts.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button className="bg-cta text-text px-8 py-4 rounded-organic font-heading font-semibold text-lg hover:bg-cta/90 transition-colors duration-200 cursor-pointer shadow-organic-lg flex items-center gap-3 group">
          Start Your Eco Journey
          <ArrowRightIcon />
        </button>
        <button className="bg-white/80 backdrop-blur-sm text-text px-8 py-4 rounded-organic font-heading font-medium hover:bg-white transition-colors duration-200 cursor-pointer shadow-organic">
          Learn More
        </button>
      </div>

      {/* Stats preview */}
      <div className="grid grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-organic text-center">
          <div className="font-heading font-bold text-2xl md:text-3xl text-primary">2.5M+</div>
          <div className="text-sm text-text/60 mt-1">CO2 kg Saved</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-organic text-center">
          <div className="font-heading font-bold text-2xl md:text-3xl text-primary">50K+</div>
          <div className="text-sm text-text/60 mt-1">Eco Trips Planned</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-organic text-center">
          <div className="font-heading font-bold text-2xl md:text-3xl text-primary">120+</div>
          <div className="text-sm text-text/60 mt-1">Green Destinations</div>
        </div>
      </div>
    </div>
  </section>
);

// Problem Section
const ProblemSection = () => (
  <section className="py-20 px-4 bg-white/50">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-text mb-4">
          Why Sustainable Travel Matters
        </h2>
        <p className="text-text/70 max-w-2xl mx-auto">
          Tourism contributes 8% of global carbon emissions. Every choice we make impacts our planet.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="bg-gradient-to-br from-text/5 to-primary/10 rounded-organic-lg p-8 md:p-12">
          <div className="font-heading font-bold text-5xl md:text-6xl text-primary mb-4">72%</div>
          <p className="text-lg text-text/80">
            of travelers want to reduce their environmental impact but don&apos;t know where to start.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic cursor-pointer hover:shadow-organic-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <ChartIcon />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text mb-1">Carbon Footprint</h3>
              <p className="text-sm text-text/70">Traditional travel planning ignores environmental costs</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic cursor-pointer hover:shadow-organic-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <MapPinIcon />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text mb-1">Hidden Impact</h3>
              <p className="text-sm text-text/70">Popular destinations often suffer from over-tourism</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic cursor-pointer hover:shadow-organic-lg transition-shadow duration-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
              <HeartIcon />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-text mb-1">No Guidance</h3>
              <p className="text-sm text-text/70">Lack of tools to make informed eco-conscious choices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Features Section
const FeaturesSection = () => (
  <section id="features" className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-text mb-4">
          Plan with Purpose
        </h2>
        <p className="text-text/70 max-w-2xl mx-auto">
          Terratrace gives you the tools to travel responsibly without compromising on experience.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-organic-lg p-8 shadow-organic hover:shadow-organic-lg transition-shadow duration-200 cursor-pointer group">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-xl text-text mb-3">Carbon Calculator</h3>
          <p className="text-text/70 leading-relaxed">
            Real-time tracking of your trip&apos;s environmental impact. Compare transport options and see exactly how much CO2 you save.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-organic-lg p-8 shadow-organic hover:shadow-organic-lg transition-shadow duration-200 cursor-pointer group">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-primary to-cyan-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c1.128-.449 2.018-1.273 2.018-2.365 0-1.092-.89-1.916-2.018-2.365l-4.875-2.437M4.503 8.25l4.875 2.437c1.128.449 2.018 1.273 2.018 2.365 0 1.092-.89 1.916-2.018 2.365l-4.875 2.437M12 12.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-xl text-text mb-3">Eco Route Planner</h3>
          <p className="text-text/70 leading-relaxed">
            Smart routing that prioritizes low-impact travel. Find trains over flights, local experiences over tourist traps.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-organic-lg p-8 shadow-organic hover:shadow-organic-lg transition-shadow duration-200 cursor-pointer group">
          <div className="w-16 h-16 bg-gradient-to-br from-cta to-cta/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h3 className="font-heading font-semibold text-xl text-text mb-3">Green Destinations</h3>
          <p className="text-text/70 leading-relaxed">
            Curated eco-certified hotels, restaurants, and activities. Support local communities while protecting nature.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// Testimonials Section
const TestimonialsSection = () => (
  <section id="testimonials" className="py-20 px-4 bg-gradient-to-b from-white/50 to-background">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-text mb-4">
          Stories from Eco Explorers
        </h2>
        <p className="text-text/70 max-w-2xl mx-auto">
          Real travelers making real impact. Join thousands who&apos;ve changed how they explore.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-organic-lg p-8 shadow-organic hover:shadow-organic-lg transition-shadow duration-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-text">Sarah Chen</h4>
              <p className="text-sm text-text/60">Digital Nomad</p>
            </div>
          </div>
          <p className="text-text/80 leading-relaxed italic">
            &quot;Terratrace helped me reduce my travel emissions by 40% last year. The train vs flight comparisons are eye-opening!&quot;
          </p>
          <div className="mt-4 pt-4 border-t border-text/10">
            <span className="text-sm font-medium text-primary">320 kg CO2 saved</span>
          </div>
        </div>

        <div className="bg-white rounded-organic-lg p-8 shadow-organic hover:shadow-organic-lg transition-shadow duration-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-primary to-cyan-secondary rounded-full flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-text">Marcus Weber</h4>
              <p className="text-sm text-text/60">Adventure Photographer</p>
            </div>
          </div>
          <p className="text-text/80 leading-relaxed italic">
            &quot;I discovered hidden eco-lodges that regular travel sites never show. My clients love the sustainable angle.&quot;
          </p>
          <div className="mt-4 pt-4 border-t border-text/10">
            <span className="text-sm font-medium text-primary">580 kg CO2 saved</span>
          </div>
        </div>

        <div className="bg-white rounded-organic-lg p-8 shadow-organic hover:shadow-organic-lg transition-shadow duration-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-cta to-cta/70 rounded-full flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-text">Emma Rodriguez</h4>
              <p className="text-sm text-text/60">Family Traveler</p>
            </div>
          </div>
          <p className="text-text/80 leading-relaxed italic">
            &quot;Planning our family vacation through Terratrace taught my kids about sustainability. Educational and practical!&quot;
          </p>
          <div className="mt-4 pt-4 border-t border-text/10">
            <span className="text-sm font-medium text-primary">450 kg CO2 saved</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// CTA Section
const CTASection = () => (
  <section id="cta" className="py-20 px-4">
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-primary to-secondary rounded-organic-lg p-12 md:p-16 text-center shadow-organic-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/20 rounded-organic mx-auto mb-8 flex items-center justify-center">
            <GlobeIcon />
          </div>

          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
            Ready to Travel Responsibly?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
            Join our community of eco-conscious travelers. Start planning your first green adventure today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-auto px-6 py-4 rounded-organic bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:border-white focus:outline-none transition-colors duration-200 min-w-[280px]"
            />
            <button className="w-full sm:w-auto bg-cta text-text px-8 py-4 rounded-organic font-heading font-semibold hover:bg-cta/90 transition-colors duration-200 cursor-pointer shadow-lg flex items-center justify-center gap-2 group">
              Get Started Free
              <ArrowRightIcon />
            </button>
          </div>

          <p className="text-white/60 text-sm mt-4">
            No credit card required. Start planning in minutes.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="py-12 px-4 bg-text/5">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <LeafIcon />
            </div>
            <span className="font-heading font-semibold text-xl text-text">Terratrace</span>
          </div>
          <p className="text-text/70 max-w-md leading-relaxed">
            Making sustainable travel accessible to everyone. Every journey matters, every choice counts.
          </p>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-text mb-4">Explore</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Destinations</a></li>
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Eco Guides</a></li>
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Carbon Calculator</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-text mb-4">Company</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">About Us</a></li>
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Our Mission</a></li>
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-text/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text/60">
          © 2024 Terratrace. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-text/60 hover:text-primary transition-colors duration-200 cursor-pointer">Privacy</a>
          <a href="#" className="text-sm text-text/60 hover:text-primary transition-colors duration-200 cursor-pointer">Terms</a>
          <a href="#" className="text-sm text-text/60 hover:text-primary transition-colors duration-200 cursor-pointer">Sustainability Report</a>
        </div>
      </div>
    </div>
  </footer>
);

// Main Page Component
export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}