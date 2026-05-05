"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
    flight: number;
    car: number;
    hotel: number;
    rail: number;
    bus: number;
    taxi: number;
}

export default function Chart({ flight, car, hotel, rail, bus, taxi }: Props) {
    const data = {
        labels: ['Flight', 'Car', 'Hotel', 'Rail', 'Bus', 'Taxi'],

        datasets: [
            {
                label: "Emission Percentage (%)",
                data: [flight, car, hotel, rail, bus, taxi],
                backgroundColor: [
                    "#BFDBFE",
                    "#FECACA",
                    "#BBF7D0",
                    "#F3E8FF",
                    "#E0E7FF",
                    "#FFE4B5",
                ],
                borderColor: [
                    "#93C5FD", 
                    "#FCA5A5",
                    "#86EFAC",
                    "#E9D5FF",
                    "#C7D2FE",
                    "#FFDAB9",
                ],
                borderWidth: 1,

            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {

                    font: {
                        size: 14,
                        bold: true
                    }
                }
            }
        }
    };

    return (
        <div className="w-80 h-80 m-auto ">
            <Doughnut data={data} options={options} />
        </div>
    )
}