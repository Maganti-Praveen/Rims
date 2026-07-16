import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DepartmentChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                </div>
                <p className="text-dark-400 text-sm font-medium">No chart data available</p>
            </div>
        );
    }

    const labels = data.map(d => d.department);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Publications',
                data: data.map(d => d.publications || 0),
                backgroundColor: (context) => {
                    const { chart } = context;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return 'rgba(249,115,22,0.85)';
                    const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    grad.addColorStop(0, 'rgba(249,115,22,1)');
                    grad.addColorStop(1, 'rgba(249,115,22,0.45)');
                    return grad;
                },
                borderRadius: 6,
                borderSkipped: false,
            },
            {
                label: 'Patents',
                data: data.map(d => d.patents || 0),
                backgroundColor: (context) => {
                    const { chart } = context;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return 'rgba(245,158,11,0.85)';
                    const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    grad.addColorStop(0, 'rgba(245,158,11,1)');
                    grad.addColorStop(1, 'rgba(245,158,11,0.45)');
                    return grad;
                },
                borderRadius: 6,
                borderSkipped: false,
            },
            {
                label: 'Workshops',
                data: data.map(d => d.workshops || 0),
                backgroundColor: (context) => {
                    const { chart } = context;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return 'rgba(16,185,129,0.85)';
                    const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    grad.addColorStop(0, 'rgba(16,185,129,1)');
                    grad.addColorStop(1, 'rgba(16,185,129,0.45)');
                    return grad;
                },
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { family: 'Inter', size: 12, weight: '600' },
                    color: '#57534e',
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#1c1917',
                bodyColor: '#78716c',
                borderColor: '#fed7aa',
                borderWidth: 1,
                cornerRadius: 12,
                padding: 12,
                titleFont: { family: 'Inter', weight: '700', size: 13 },
                bodyFont: { family: 'Inter', size: 12 },
                boxShadow: '0 4px 14px rgba(234,88,12,0.15)',
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 11 }, color: '#78716c' },
                border: { color: '#e7e5e4' },
            },
            y: {
                beginAtZero: true,
                grid: { color: '#f5f5f4' },
                ticks: { font: { family: 'Inter', size: 11 }, color: '#78716c', stepSize: 1 },
                border: { dash: [4, 4], color: 'transparent' },
            },
        },
        animation: { duration: 800, easing: 'easeOutQuart' },
    };

    return (
        <div style={{ height: '350px' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default DepartmentChart;
