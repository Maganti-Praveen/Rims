import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Layers } from 'lucide-react';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Orange-warm colour palette for domains
const COLORS = [
    '#ea580c', '#f97316', '#fb923c', '#d97706', '#f59e0b',
    '#e11d48', '#7c3aed', '#0ea5e9', '#10b981', '#6366f1',
    '#ec4899', '#14b8a6', '#84cc16', '#a855f7', '#22d3ee',
    '#facc15', '#d946ef',
];

const DomainChart = () => {
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/domains/stats')
            .then(({ data: res }) => setData(res.data || []))
            .catch(() => setData([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="card p-6 animate-pulse h-72" />;

    if (data.length === 0) {
        return (
            <div className="card p-6" data-aos="fade-up">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-dark-800">Research Domains</h3>
                </div>
                <p className="text-xs text-dark-400 text-center py-8">
                    No domain data yet. Add research domains to publications to see analytics.
                </p>
            </div>
        );
    }

    const total = data.reduce((s, d) => s + d.count, 0);

    const chartData = {
        labels: data.map(d => d.domain),
        datasets: [{
            data: data.map(d => d.count),
            backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 8,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#1c1917',
                bodyColor: '#78716c',
                borderColor: '#fed7aa',
                borderWidth: 1,
                cornerRadius: 12,
                padding: 10,
                titleFont: { family: 'Inter', weight: '700', size: 12 },
                bodyFont: { family: 'Inter', size: 12 },
                callbacks: {
                    label: (ctx) => ` ${ctx.raw} publication${ctx.raw !== 1 ? 's' : ''}`,
                },
            },
        },
        animation: { animateRotate: true, duration: 900, easing: 'easeOutQuart' },
    };

    return (
        <div className="card p-6" data-aos="fade-up">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-dark-800">Research Domains</h3>
                <span className="ml-auto text-xs text-dark-400 font-medium">{total} total</span>
            </div>

            {/* Doughnut chart */}
            <div className="relative" style={{ height: '220px' }}>
                <Doughnut data={chartData} options={options} />
                {/* Centre text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="font-heading text-2xl font-bold text-dark-900">{total}</p>
                    <p className="text-[10px] text-dark-400 font-medium uppercase tracking-wide">domains</p>
                </div>
            </div>

            {/* Legend chips */}
            <div className="mt-4 flex flex-wrap gap-1.5">
                {data.slice(0, 8).map((d, i) => (
                    <span key={d.domain}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-dark-600 bg-dark-50 px-2.5 py-1 rounded-full border border-dark-100">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        {d.domain}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default DomainChart;
