'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ImpactCard from '@/app/component/analytics/ImpactCard';
import { calculateCarbonSaved } from '@/utils/carbonCalculator';
import { useEffect, useState, useRef } from 'react';

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.965 9.965 0 012.157 9.667M12 12v.01" />
  </svg>
);

const CarbonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l15.868 12.112c.235.184.374.479.374.785V21a2.25 2.25 0 01-2.25 2.25H2.25A2.25 2.25 0 010 21V4.118c0-.3.102-.584.307-.816L10.896 3.607c.658-.813 1.922-.813 2.580 0l9.362 11.241c.205.232.307.516.307.816v16.766c0 1.243-1.007 2.25-2.25 2.25H21a2.25 2.25 0 01-2.25-2.25v-.572c0-.334-.148-.65-.405-.864L3.612 11.428c-.235-.184-.374-.479-.374-.785V4.118c0-.3.102-.584.307-.816z" />
  </svg>
);

const TripIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const TreeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v14m-6-3h12M7 19h10" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

function useAnimatedBar(targetPercent: number, elementRef: React.RefObject<HTMLDivElement | null>, delay: number = 0) {
  const [width, setWidth] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          setTimeout(() => {
            const startTime = performance.now()
            const duration = 800
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)
              const easeOut = 1 - Math.pow(1 - progress, 3)
              setWidth(targetPercent * easeOut)
              if (progress < 1) {
                requestAnimationFrame(animate)
              }
            }
            requestAnimationFrame(animate)
          }, delay)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [targetPercent, delay])

  return `${width}%`
}

interface TransportBarProps {
  method: string
  saved: number
  percentage: number
  color: string
  delay: number
}

function TransportBar({ method, saved, percentage, color, delay }: TransportBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const animatedWidth = useAnimatedBar(percentage, barRef, delay)
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-text">{method}</span>
        <span className="text-sm font-semibold text-primary">{saved} kg CO2</span>
      </div>
      <div className="h-3 bg-text/10 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className={`h-full bg-gradient-to-r ${color} to-secondary rounded-full transition-all duration-500`}
          style={{ width: animatedWidth }}
        ></div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  // Trip data
  const trips = [
    { id: 1, destination: "Kuala Lumpur", distance: 15, type: "train" as const, date: "2026-05-01" },
    { id: 2, destination: "Subang Jaya", distance: 10, type: "bicycle" as const, date: "2026-05-02" },
    { id: 3, destination: "Cyberjaya", distance: 30, type: "bus" as const, date: "2026-05-03" },
  ];

  // Calculate the total saved across all trips
  const totalSaved = trips.reduce((acc, trip) => {
    return acc + parseFloat(calculateCarbonSaved(trip.distance, trip.type));
  }, 0);

  // 1 kg CO2 saved is roughly 0.048 trees' worth of monthly absorption
  const treeEquivalent = (totalSaved * 0.048).toFixed(1);

  // Goal Setting Data
  const annualCarbonBudget = 500; // kg CO2 per year
  const currentMonthCarbon = totalSaved;
  const carbonPercentage = (currentMonthCarbon / annualCarbonBudget) * 100;
  const remainingBudget = (annualCarbonBudget - currentMonthCarbon).toFixed(1);

  const generatePDF = (type: 'monthly' | 'annual') => {
    const doc = new jsPDF();

    const today = new Date().toLocaleDateString();

    // =========================
    // ANNUAL SUMMARY
    // =========================
    if (type === 'annual') {
      doc.setFillColor(5, 150, 105);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('TerraTrace', 14, 18);

      doc.setFontSize(12);
      doc.text('Eco-Friendly Travel Planner', 14, 26);

      doc.setFontSize(14);
      doc.text('Annual Sustainability Summary', 125, 20);

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Generated Date: ${today}`, 14, 50);

      doc.setTextColor(0, 77, 64);
      doc.setFontSize(18);
      doc.text('Yearly Performance Overview', 14, 70);

      autoTable(doc, {
        startY: 80,
        head: [['Metric', 'Value']],
        body: [
          ['Trips Completed', trips.length.toString()],
          ['Carbon Saved', `${totalSaved.toFixed(1)} kg CO2`],
          ['Tree Equivalent', `${treeEquivalent} Trees`],
          ['Annual Carbon Budget', `${annualCarbonBudget} kg`],
          ['Remaining Budget', `${remainingBudget} kg`],
          ['Achievement Status', 'On Track'],
        ],
        headStyles: {
          fillColor: [5, 150, 105],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 252, 249],
        },
        styles: {
          fontSize: 10,
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY;

      doc.setTextColor(0, 77, 64);
      doc.setFontSize(15);
      doc.text('Sustainability Assessment', 14, finalY + 20);

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(11);

      doc.text(
        'The user has consistently selected environmentally friendly',
        14,
        finalY + 35
      );

      doc.text(
        'transportation methods and successfully reduced travel emissions.',
        14,
        finalY + 45
      );

      doc.text(
        'Recommendation: Continue prioritising trains, buses and cycling.',
        14,
        finalY + 60
      );

      doc.setDrawColor(220, 220, 220);
      doc.line(14, 280, 196, 280);

      doc.setTextColor(120, 120, 120);
      doc.setFontSize(9);
      doc.text('Generated by TerraTrace Analytics & Reporting Module', 14, 287);

      doc.save('TerraTrace_Annual_Summary.pdf');
      return;
    }

    // =========================
    // MONTHLY REPORT
    // =========================

    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('TerraTrace', 14, 18);

    doc.setFontSize(11);
    doc.text('Eco-Friendly Travel Planner', 14, 25);

    doc.setFontSize(14);
    doc.text('Monthly Sustainability Report', 125, 20);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Generated Date: ${today}`, 14, 45);
    doc.text('Prepared for: Eco Traveler', 14, 52);

    doc.setTextColor(0, 77, 64);
    doc.setFontSize(15);
    doc.text('Personal Impact Summary', 14, 68);

    const cards = [
      ['Carbon Saved', `${totalSaved.toFixed(1)} kg CO2`],
      ['Trips Logged', `${trips.length}`],
      ['Tree Equivalent', `${treeEquivalent} Trees`],
      ['Remaining Budget', `${remainingBudget} kg`],
    ];

    let x = 14;

    cards.forEach((card) => {
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(x, 78, 42, 25, 3, 3, 'F');

      doc.setTextColor(90, 90, 90);
      doc.setFontSize(8);
      doc.text(card[0], x + 4, 88);

      doc.setTextColor(5, 150, 105);
      doc.setFontSize(12);
      doc.text(card[1], x + 4, 97);

      x += 47;
    });

    doc.setTextColor(0, 77, 64);
    doc.setFontSize(15);
    doc.text('Detailed Trip Log', 14, 120);

    autoTable(doc, {
      startY: 128,
      head: [['Date', 'Destination', 'Method', 'Distance', 'CO2 Saved']],
      body: trips.map((trip) => [
        trip.date,
        trip.destination,
        trip.type.toUpperCase(),
        `${trip.distance} km`,
        `${calculateCarbonSaved(trip.distance, trip.type)} kg`,
      ]),
      headStyles: {
        fillColor: [5, 150, 105],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 252, 249],
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 160;

    doc.setTextColor(0, 77, 64);
    doc.setFontSize(15);
    doc.text('Recommendation', 14, finalY + 18);

    doc.setTextColor(70, 70, 70);
    doc.setFontSize(10);

    doc.text(
      'Continue choosing low-carbon transport methods such as trains, buses, and bicycles.',
      14,
      finalY + 28
    );

    doc.text(
      'These choices help reduce your personal travel emissions and support sustainable tourism.',
      14,
      finalY + 36
    );

    doc.setDrawColor(220, 220, 220);
    doc.line(14, 280, 196, 280);

    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.text('Generated by TerraTrace Analytics & Reporting Module', 14, 287);

    doc.save('TerraTrace_Monthly_Report.pdf');
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-white to-cyan-secondary/10">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-sans font-bold text-3xl text-text">Analytics</h1>
          <p className="font-sans text-text/60 mt-2">Track Your Impact</p>
        </div>
        {/* Personal Impact Dashboard Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-text mb-2">Personal Impact Dashboard</h2>
            <p className="text-text/60">A visual summary of your carbon savings compared to traditional travel</p>
          </div>

          {/* Impact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ImpactCard
              title="Carbon Saved"
              value={totalSaved.toFixed(1)}
              unit="kg CO2"
              icon={<CarbonIcon />}
              trend={{ value: 15, isPositive: true }}
            />
            <ImpactCard
              title="Trips Logged"
              value={trips.length.toString()}
              unit="Trips"
              icon={<TripIcon />}
              trend={{ value: 8, isPositive: true }}
            />
            <ImpactCard
              title="Tree Equivalent"
              value={treeEquivalent}
              unit="Trees"
              icon={<TreeIcon />}
              trend={{ value: 12, isPositive: true }}
            />
          </div>

          {/* Comparison Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-organic border border-white/20 shadow-organic p-8">
            <h3 className="text-lg font-heading font-semibold text-text mb-6">Transport Method Comparison</h3>
            <div className="space-y-6">
              {[
                { method: "Train", saved: 8.5, percentage: 68, color: "from-primary", delay: 0 },
                { method: "Bicycle", saved: 2.1, percentage: 17, color: "from-secondary", delay: 150 },
                { method: "Bus", saved: 4.2, percentage: 34, color: "from-cyan-primary", delay: 300 },
              ].map((item) => (
                <TransportBar key={item.method} method={item.method} saved={item.saved} percentage={item.percentage} color={item.color} delay={item.delay} />
              ))}
            </div>
          </div>
        </section>

        {/* Sustainability Reports Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-text mb-2">Sustainability Reports</h2>
            <p className="text-text/60">Generate downloadable PDF summaries of your environmental footprint</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {([
              {
                title: "Monthly Report",
                description: "Detailed breakdown of your travels this month",
                icon: <CalendarIcon />,
                action: "Generate Report",
                type: "monthly"
              },
              {
                title: "Annual Summary",
                description: "Year-to-date sustainability overview",
                icon: <ChartIcon />,
                action: "Download PDF",
                type: "annual"
              },
            ] as const).map((report) => (
              <div key={report.title} className="bg-white/80 backdrop-blur-sm rounded-organic border border-white/20 shadow-organic p-8 hover:shadow-organic-lg transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white">{report.icon}</div>
                  <DocumentIcon />
                </div>
                <h3 className="text-xl font-heading font-semibold text-text mb-2">{report.title}</h3>
                <p className="text-text/60 mb-6">{report.description}</p>
               <button
                  onClick={() => generatePDF(report.type)}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-organic font-heading font-semibold hover:shadow-organic-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <DownloadIcon />
                  {report.action}
                </button>
              </div>
            ))}
          </div>

          {/* Trip Details Table */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-organic border border-white/20 shadow-organic overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <h3 className="font-heading font-semibold text-lg text-text">Detailed Trip Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-primary/10 to-secondary/10 text-text/70">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Destination</th>
                    <th className="px-6 py-4 text-left font-semibold">Method</th>
                    <th className="px-6 py-4 text-left font-semibold">Distance</th>
                    <th className="px-6 py-4 text-right font-semibold">CO2 Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-primary/5 transition-colors duration-200">
                      <td className="px-6 py-4 text-text/80">{trip.date}</td>
                      <td className="px-6 py-4 font-medium text-text">{trip.destination}</td>
                      <td className="px-6 py-4 capitalize text-text/70">{trip.type}</td>
                      <td className="px-6 py-4 text-text/80">{trip.distance} km</td>
                      <td className="px-6 py-4 text-right font-heading font-semibold text-secondary">
                        +{calculateCarbonSaved(trip.distance, trip.type)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Goal Setting Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-text mb-2">Carbon Budget Goals</h2>
            <p className="text-text/60">Set annual carbon budgets and get alerts as you approach your limits</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Goal Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-organic border border-primary/20 shadow-organic p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-organic flex items-center justify-center">
                  <TargetIcon />
                </div>
                <h3 className="font-heading font-semibold text-text">Annual Carbon Budget</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text/70 mb-1">Total Budget</p>
                  <p className="text-3xl font-heading font-bold text-primary">{annualCarbonBudget} kg</p>
                </div>
                <div className="pt-4 border-t border-primary/20">
                  <p className="text-sm text-text/70 mb-1">Used This Month</p>
                  <p className="text-2xl font-heading font-bold text-secondary">{currentMonthCarbon.toFixed(1)} kg</p>
                </div>
                <div className="pt-4 border-t border-primary/20">
                  <p className="text-sm text-text/70 mb-1">Remaining</p>
                  <p className="text-2xl font-heading font-bold text-text">{remainingBudget} kg</p>
                </div>
              </div>
            </div>

            {/* Progress and Status */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-organic border border-white/20 shadow-organic p-8">
              <h3 className="font-heading font-semibold text-lg text-text mb-6">Budget Usage</h3>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-text/70 font-medium">Monthly Usage</span>
                  <span className="text-lg font-heading font-bold text-primary">{carbonPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-text/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${carbonPercentage > 80 ? 'from-red-500 to-red-600' : 'from-primary to-secondary'} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(carbonPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Alert */}
              {carbonPercentage < 50 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-organic p-4 flex items-start gap-3">
                  <div className="text-emerald-600 mt-0.5">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-emerald-900">On Track!</p>
                    <p className="text-sm text-emerald-800">You&apos;re using less than 50% of your monthly budget.</p>
                  </div>
                </div>
              )}
              {carbonPercentage >= 50 && carbonPercentage < 80 && (
                <div className="bg-amber-50 border border-amber-200 rounded-organic p-4 flex items-start gap-3">
                  <div className="text-amber-600 mt-0.5">
                    <WarningIcon />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-amber-900">Monitor Usage</p>
                    <p className="text-sm text-amber-800">You&apos;re at {carbonPercentage.toFixed(0)}% of your monthly budget.</p>
                  </div>
                </div>
              )}
              {carbonPercentage >= 80 && (
                <div className="bg-red-50 border border-red-200 rounded-organic p-4 flex items-start gap-3">
                  <div className="text-red-600 mt-0.5">
                    <AlertIcon />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-red-900">Budget Alert</p>
                    <p className="text-sm text-red-800">You&apos;re approaching your monthly carbon budget limit.</p>
                  </div>
                </div>
              )}

              {/* Quick Tips */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <h4 className="font-heading font-semibold text-text mb-4">Reduce Your Carbon Footprint</h4>
                <ul className="space-y-2 text-sm text-text/70">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Prefer trains and bicycles over personal vehicles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Combine trips to reduce travel frequency</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Choose eco-friendly accommodations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}