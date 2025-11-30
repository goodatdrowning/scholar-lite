
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Publication {
  data: {
    year: number;
    [key: string]: any;
  };
}

interface Props {
  publications: Publication[];
}

export default function PublicationChart({ publications }: Props) {
  const yearCounts = publications.reduce((acc, pub) => {
    const year = pub.data.year;
    if (year) {
      acc[year] = (acc[year] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const years = Object.keys(yearCounts).sort();
  const data = years.map(year => yearCounts[parseInt(year)]);

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Publications',
        data: data,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Publication Growth',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="w-full h-64 sm:h-80">
      <Bar options={options} data={chartData} />
    </div>
  );
}
