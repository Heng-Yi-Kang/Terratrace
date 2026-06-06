"use client";

import * as icons from '../component/icons';   
import {CarbonResult} from '../constant/types'


export const CarbonOffset = ({ result }: { result: CarbonResult | null }) => {

  if (!result) return null;

  const trees = Math.round(result.total / 22);
  const estimatedCost = (result.total * 0.013 * 4.70).toFixed(2); // simple estimate

  let tips: string[] = [];

  const getHighestSource = (result: CarbonResult) => {
  const sources = [
    { name: "Flight", value: result.flightEmissions },
    { name: "Car", value: result.carEmissions },
    { name: "Hotel", value: result.hotelEmissions },
    { name: "Rail", value: result.railEmissions },
    { name: "Bus", value: result.busEmissions },
    { name: "Taxi", value: result.taxiEmissions },
  ];

  return sources.reduce((max, curr) =>
    curr.value > max.value ? curr : max
  );
};

  if (getHighestSource(result).name === "Flight") {
    tips = [
      "Consider taking a train or bus for shorter distances.",
      "Choose airlines with better sustainability practices.",
      "Choose economy class instead of business or first  class."
    ];
  } else if (getHighestSource(result).name === "Car") {
    tips = [
      "Try carpooling or using public transportation.",
      "Walk or bike for short trips instead of driving.",
      "Consider switching to an electric or hybrid vehicle."
    ];
  } else if (getHighestSource(result).name === "Hotel") {
    tips = [
      "Look for eco-friendly hotels with sustainability practices.",
      "Minimize energy use by switching off lights and AC when not in use.",
      "Consider staying at accommodations that support local communities."
    ];
  }
  else if (getHighestSource(result).name === "Rail") {
    tips = [
      "Choose trains over flights for shorter distances.",
      "Select coaches with better sustainability practices.",
      "Consider traveling during off-peak hours to reduce energy consumption."
    ];
  }
  else if (getHighestSource(result).name === "Bus") {
    tips = [
      "Opt for buses instead of cars for longer trips.",
      "Choose buses with better fuel efficiency or alternative fuel sources.",
      "Consider carpooling or ride-sharing to reduce the number of vehicles on the road."
    ];
  }
  else if (getHighestSource(result).name === "Taxi") {
    tips = [
      "Choose rideshare options over individual taxi rides.",
      "Opt for electric or hybrid taxis when available.",
      "Consider using public transportation or walking for short trips."
    ];
  }

  return (
    <section className=" relative overflow-hidden ">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-text mb-2">Offset Your Emissions</h2>
            <p className="text-text/60">Take action to reduce or offset your {result.total.toFixed(2)} kg CO₂</p>
          </div>
        <div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-white p-6 rounded-organic shadow-organic text-center border border-grey/40 h-auto">
              <icons.TreeIcon />
              <h3 className="font-semibold text-lg mt-3">Plant Your Own Trees</h3>
              <p className="text-sm text-text/100 ">
                Plant {trees} trees to offset your emissions
              </p>

              <ul className=" text-sm text-text/100 mt-4 space-y-1">
                <li className=" m-2 flex items-start">
                  <span className="text-primary mr-2">•</span> Contribute directly by joining local tree-planting initiatives or community gardens.
                </li>
                <li className=" m-2 flex items-start">
                  <span className="text-primary mr-2">•</span> Plant your own trees at home or in your community to create a lasting impact and connect with nature.
                </li>
                <li className=" m-2 flex items-start">
                  <span className="text-primary mr-2">•</span> Donate to organizations that plant trees on your behalf, such as One Tree Planted or Trees for the Future.
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-organic shadow-organic text-center border border-grey/40 h-auto">
              <icons.BulbIcon />
              <h3 className="font-semibold text-lg mt-3">Reduce Future Emissions</h3>
              <p className="text-sm text-text/100 ">
                Travel smarter by choosing greener options
              </p>

              <ul className=" text-sm text-text/100 mt-4 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className=" m-2 flex items-start">
                    <span className="text-primary mr-2">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-organic shadow-organic text-center border border-grey/40 h-auto">
              <icons.LeafIcon />
              <h3 className="font-semibold text-lg mt-3">Buy Carbon Credits</h3>
              {/*<p className="text-sm text-text/100 mt-2 mb-4">
                Offset your emissions for ~RM {estimatedCost}
              </p>*/}
              <p className="text-sm text-text/100 mb-6">
                Here are some of the reputable organizations where you can purchase carbon credits.
              </p>

              <div className="flex flex-col gap-2 mb-4">
                <a
                  href="https://climateimpactx.com/carbon-credits/?=undefined&utm_source=792707340217&utm_medium=g&utm_campaign=23458475432&utm_content=c&creative=792707340217&keyword=carbon%20trading%20exchange&matchtype=p&network=g&device=c&utm_term=carbon%20trading%20exchange&gad_source=1&gad_campaignid=23458475432&gbraid=0AAAAAqCQ4M14qnFhk8z2mlwUGoC7IaDQd&gclid=Cj0KCQjwh-HPBhCIARIsAC0p3cfJExIMsxbEG1oy5v15HwrttMSjCWsmc13uIISqE_YhnLsoA08kJGYaArCDEALw_wcB"
                  target="_blank"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors duration-200"
                >
                  Climate Impact X
                </a>

                <a
                  href="https://www.goldstandard.org/donate-to-gold-standard"
                  target="_blank"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors duration-200"
                >
                  Gold Standard
                </a>

                <a
                  href="https://www.cooleffect.org/travel-offset"
                  target="_blank"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors duration-200"
                >
                  Cool Effect
                </a>

              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};