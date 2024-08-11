// components/PieChart.js
"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ value1, value2, value3 }) => {
  const data = {
    labels: ["carbs", "fats", "proteins"],
    datasets: [
      {
        label: "Values",
        data: [value1, value2, value3],
        backgroundColor: [
          "rgba(158, 42, 43, 1)",
          "rgba(216, 87, 42, 1)",
          
          "rgba(247, 181, 56, 1)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default PieChart;
