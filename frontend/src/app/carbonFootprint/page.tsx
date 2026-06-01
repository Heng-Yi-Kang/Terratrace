"use client";

import { useEffect, useState } from 'react';
import * as icons from './component/icons';   
import {CarbonResult, Trip} from './constant/types'
import { ImpactInsights } from './sections/ImpactInsights';
import { CarbonOffset } from './sections/CarbonOffset';
import {CarbonCalculator} from './sections/CarbonCalculator'

const Navbar = () => (
  <nav className="fixed top-4 left-4 right-4 z-50">
    <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-organic shadow-organic">
      <div className="flex items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <icons.LeafIcon />
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
          <icons.ArrowRightIcon />
        </button>
      </div>
    </div>
  </nav>
);


const Header = () => {
  return (
    <section className="h-50 flex-col items-center justify-center pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-secondary/20 rounded-full blur-3xl"></div>

      <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-text mt-8 mb-6 leading-tight text-center">
        Carbon Footprint
        <span className="text-primary block mt-2">Calculator</span>
      </h1>

      <p className="text-lg md:text-xl text-center max-w-2xl mx-auto leading-relaxed text-text/70">
        Understand the environmental impact of your journey and explore ways to reduce it.
      </p>

    </section>
  )
}



const Footer = () => (
  <footer className="py-12 px-4 bg-text/5">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <icons.LeafIcon />
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


const defaultTrip : Trip = {

  id: '1',
  type: 'flight',
  distanceKm: 0,
  flightClass: 'economy',
  duration: 'short',
  passengers: 1,
  isReturn: false
};

export default function CarbonFootprint() {

  const [trips, setTrips] = useState<Trip[]>([defaultTrip]);
  const [result, setResult] = useState<CarbonResult | null>(null);
 
  useEffect(() => {
    if (result) {
      document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  return (
    <>
      <Navbar />
      <Header />
      <CarbonCalculator
        trips={trips}
        setTrips={setTrips}
        setResult={setResult}
      />
      <ImpactInsights result={result} />
      <CarbonOffset result={result} />
      <Footer />
    </>
  )
}