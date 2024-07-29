// components/BarChart.js
'use client'
import React from 'react';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, scales } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({proteinIntake, dataProtein}) => {

    const data = {
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [
            {
                label: 'Your protein intake',
                data: dataProtein,
                backgroundColor: '#B2675E',
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        scales:{
            y:{
                display:false,
                max:proteinIntake,
                grid:{display:false},
                ticks: {display: false}
            },
            x:{grid:{display:false}}
        },
        plugins: {
            legend: { display: false } // Hide the dataset label
        }
    };

    return <Bar data={data} options={options} />;
};

export default BarChart;