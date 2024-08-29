// components/LineChart.js
'use client'
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeightChart = ({ datas }) => {
    console.table(datas); // Log the weights prop
    if (!datas || datas.length === 0) {
        return null;
    }
    const weights = datas.map(data => data.weight);
    const data = {
        labels: datas.map((_, index) => index + 1), // Assuming you want to label the x-axis with the index
        datasets: [
            {
                label: 'Weight Progress',
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
                display: true,
                max: 150,
                grid: { display: false , color: '#fff' },
                ticks: { display: true , color: '#fff' }
            },
            x: { grid: { display: false , color: '#fff' }, ticks: { color: '#fff' } }
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

export default WeightChart;