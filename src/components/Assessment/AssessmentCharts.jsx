import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AssessmentCharts = ({ evaluation }) => {
  // Calculate percentages for the doughnut chart
  const mcqScore = parseInt(evaluation.mcq_evaluation.score.split('/')[0]);
  const mcqTotal = parseInt(evaluation.mcq_evaluation.score.split('/')[1]);
  const mcqPercentage = (mcqScore / mcqTotal) * 100;

  const deliverableScore = parseInt(evaluation.rubric_evaluation[0].score.split('/')[0]);
  const deliverableTotal = parseInt(evaluation.rubric_evaluation[0].score.split('/')[1]);
  const deliverablePercentage = (deliverableScore / deliverableTotal) * 100;

  // Format data for the doughnut chart (Overall Score Distribution)
  const scoreDistributionData = {
    labels: ['MCQs', 'Deliverables'],
    datasets: [
      {
        data: [mcqPercentage, deliverablePercentage],
        backgroundColor: [
          'rgba(52, 152, 219, 0.8)',  // Beautiful blue
          'rgba(46, 204, 113, 0.8)'   // Beautiful green
        ],
        borderColor: [
          'rgba(52, 152, 219, 1)',
          'rgba(46, 204, 113, 1)'
        ],
        borderWidth: 2,
      }
    ]
  };

  // Format data for the bar chart (Criteria Performance)
  const criteriaData = {
    labels: evaluation.rubric_evaluation.map(item => item.criteria),
    datasets: [
      {
        label: 'Score',
        data: evaluation.rubric_evaluation.map(item => 
          parseInt(item.score.split('/')[0])
        ),
        backgroundColor: 'rgba(155, 89, 182, 0.8)',  // Beautiful purple
        borderColor: 'rgba(155, 89, 182, 1)',
        borderWidth: 1,
        borderRadius: 5,
      }
    ]
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Score Distribution (%)',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${Math.round(context.raw)}%`;
          }
        }
      }
    },
    cutout: '60%'
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Performance by Criteria',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: 20
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
          font: {
            size: 12
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="charts-container">
      <div className="chart-row">
        <div className="chart-card">
          <Doughnut data={scoreDistributionData} options={doughnutOptions} />
        </div>
        <div className="chart-card">
          <Bar data={criteriaData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default AssessmentCharts;
