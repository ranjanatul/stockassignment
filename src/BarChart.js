import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { CHART } from './stock.const';

export default function BarChart({
  theme,
  xdata,
  yHighdata,
  yLowdata,
  stockName,
  functionName,
  chartType,
}) {
  const tooltipsLabel = [...xdata];

  // create data set for x-axis and y-axis
  const state = {
    // labels: [...xdata],
    labels: [
      ...xdata.map((item, i) => {
        if (i % 2 === 0) return item;
        // hide alternate item on the x-axis
        else return '';
      }),
    ],
    datasets: [
      {
        label: `Low`,
        fill: true,
        backgroundColor: theme.color,
        borderColor: theme.color,
        data: [...yLowdata],
        borderWidth: 0.5,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointStyle: 'line',
      },
      {
        label: `High`,
        fill: true,
        backgroundColor: 'red',
        borderColor: 'red',
        data: [...yHighdata],
        borderWidth: 0.5,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointStyle: 'line',
      },
    ],
  };
  // pass the different params to modify and labels of x-axis and y-axis
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Stocks for ${stockName} - details for ${functionName}`,
        color: theme.color,
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme.color,
          // usePointStyle: false,
        },
      },
      // elements: {
      //   pointStyle: 'line',
      // },
      tooltips: {
        mode: 'index',
        intersect: true,
        callbacks: {
          title: function (tooltipItem) {
            console.log(tooltipItem);
            return tooltipsLabel[tooltipItem[0].index];
          },
        },
      },
    },
    scales: {
      y: {
        alignToPixels: true,
        ticks: {
          color: theme.color,
        },
      },
      x: {
        // weight: 4,
        reverse: true, // to show older data first and newer last.
        ticks: {
          color: theme.color,
        },
      },
    },
  };

  // user has the option to view two chart type.
  if (chartType === CHART.LINE) {
    return <Line data={state} options={options} />;
  }
  return <Bar data={state} options={options} />;
}
