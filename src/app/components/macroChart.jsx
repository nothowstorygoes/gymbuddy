// components/PieChart.js
"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useState , useEffect} from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ value1, value2, value3 }) => {
  const [theme, setTheme] = useState('default');
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'default';
        setTheme(savedTheme);
      }, []);
    
      const getThemeColors = (theme) => {
        switch (theme) {
          case 'violet':
            return {"color1": "#edf67d", "color2": "#f896d8", "color3": "#724cf9"};
          case 'green':
            return {"color1": "#b5e48c", "color2": "#34a0a4", "color3": "#168aad"};
          case 'blue':
            return {"color1": "#bee9e8", "color2": "#00798c", "color3": "#006ba6"};
          default:
            return {"color1": "rgba(158, 42, 43, 1)", "color2": "rgba(216, 87, 42, 1)", "color3": "rgba(247, 181, 56, 1)"};
        }
      };
    
      const themeBasedColor = getThemeColors(theme);
  const data = {
    labels: ["carbs", "fats", "proteins"],
    datasets: [
      {
        label: "Values",
        data: [value1, value2, value3],
        backgroundColor: [themeBasedColor.color1, themeBasedColor.color2, themeBasedColor.color3],
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
