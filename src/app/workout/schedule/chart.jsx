// components/LineChart.js
'use client'
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ sets }) => {
    const [weights, setWeights] = useState([]);

    // Extract weights from sets when sets change
    useEffect(() => {
        console.log('sets:', sets); // Log the sets prop
        if (sets) {
            const newWeights = sets.map(set => set.sets.weight);
            setWeights(newWeights);
            console.log('newWeights:', newWeights); // Log the new weights
        }
    }, [sets]);

    const data = {
        labels: weights.map((_, index) => (index + 1).toString()),
        datasets: [
            {
                label: 'Progress',
                data: weights,
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderColor: 'rgba(255,255,255, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                display: false,
                max: 100,
                grid: { display: false },
                ticks: { display: false }
            },
            x: { grid: { display: false }, ticks: { color: '#fff' } }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#fff' // Set legend label color to white
                }
            }
        }
    };
    
    return <Line data={data} options={options} />;
};

export default LineChart;