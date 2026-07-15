import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Warning, Info, CheckCircle, CaretRight, Bell } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const ReminderBanner = () => {
    const [reminders, setReminders] = useState([]);
    const [dismissed, setDismissed] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('dismissedReminders') || '[]'); }
        catch { return []; }
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await API.get('/reminders');
                setReminders(data.data || []);
            } catch {
                setReminders([]);
            }
        };
        fetch();
    }, []);

    const visibleReminders = reminders.filter(r => !dismissed.includes(r.type));
    if (visibleReminders.length === 0) return null;

    const severityConfig = {
        warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: Warning, iconColor: 'text-amber-500' },
        info:    { bg: 'bg-primary-50', border: 'border-primary-200', text: 'text-primary-800', icon: Bell, iconColor: 'text-primary-500' },
        success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: CheckCircle, iconColor: 'text-emerald-500' },
    };

    return (
        <div className="space-y-2 mb-6">
            {visibleReminders.map((r) => {
                const config = severityConfig[r.severity] || severityConfig.info;
                const Icon = config.icon;
                return (
                    <div
                        key={r.type}
                        className={`${config.bg} ${config.border} border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-all`}
                        onClick={() => r.link && navigate(r.link)}
                    >
                        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${config.text}`}>{r.title}</p>
                            <p className={`text-xs ${config.text} opacity-75 truncate`}>{r.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {r.link && <CaretRight className={`w-4 h-4 ${config.iconColor}`} />}
                            <button
                                onClick={(e) => {
                                e.stopPropagation();
                                const next = [...dismissed, r.type];
                                setDismissed(next);
                                sessionStorage.setItem('dismissedReminders', JSON.stringify(next));
                            }}
                                className="text-xs text-dark-400 hover:text-dark-600 px-1"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReminderBanner;
