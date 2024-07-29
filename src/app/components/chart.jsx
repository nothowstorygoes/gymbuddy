// components/BarChart.js
'use client'
import React from 'react';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, scales } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({proteinIntake, dataProtein, chosenM}) => {
    let proteinGoal=proteinIntake;
    if(chosenM ==="imperial") {proteinGoal=Math.floor(proteinIntake/453.6)}
    const data = {
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [
            {
                label: 'Your protein intake',
                data: dataProtein,
                backgroundColor: 'rgba(178, 103, 94, 0.5)',
                borderWidth: 0,
                borderRadius: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        scales:{
            y:{
                display:false,
                max:proteinGoal,
                grid:{display:false},
                ticks: {display: false}
            },
            x:{grid:{display:false}, ticks: {color :'#fff'}}
        },
        plugins: {
            legend: { display: false } // Hide the dataset label
        }
    };

    return <Bar data={data} options={options} />;
};

export default BarChart;