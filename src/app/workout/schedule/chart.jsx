// components/BarChart.js
'use client'
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ sets }) => {
    const [weights, setWeights] = useState([]);

    // Extract weights from sets when sets change
    useEffect(() => {
        console.log('sets:', sets); // Log the sets prop
        if (sets) {
            const newWeights = sets.map(set => set.weight);
            setWeights(newWeights);
            console.log('newWeights:', newWeights); // Log the new weights
        }
    }, [sets]);

    useEffect(() => {
        console.log('weights state updated:', weights); // Log the weights state whenever it updates
    }, [weights]);

    const data = {
        labels: weights.map((_, index) => (index + 1).toString()),
        datasets: [
            {
                label: 'Progress',
                data: weights,
                backgroundColor: 'rgba(178, 103, 94, 0.5)',
                borderWidth: 0,
                borderRadius: 10,
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
            legend: { display: false } // Hide the dataset label
        }
    };

    return <Bar data={data} options={options} />;
};

export default BarChart;