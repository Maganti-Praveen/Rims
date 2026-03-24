import { useNavigate } from 'react-router-dom';

const GRADIENTS = {
    orange:  'from-primary-500 to-primary-600',
    amber:   'from-accent-500  to-accent-600',
    emerald: 'from-emerald-500 to-emerald-600',
    rose:    'from-rose-500    to-rose-600',
    violet:  'from-violet-500  to-violet-600',
    sky:     'from-sky-500     to-sky-600',
};

const StatCard = ({ title, value, icon: Icon, color = 'orange', trend, linkTo, delay = 0 }) => {
    const navigate = useNavigate();
    const grad = GRADIENTS[color] || GRADIENTS.orange;

    return (
        <div
            onClick={() => linkTo && navigate(linkTo)}
            data-aos="fade-up"
            data-aos-delay={delay}
            className={`group bg-white rounded-2xl border border-dark-100 shadow-sm p-5 transition-all duration-300
                ${linkTo ? 'cursor-pointer hover:shadow-orange-md hover:-translate-y-1 hover:border-primary-200' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-dark-400 text-xs font-semibold uppercase tracking-widest mb-2">{title}</p>
                    <p className="text-3xl font-heading font-bold text-dark-900">{value}</p>
                    {trend && (
                        <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {trend}
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm
                    group-hover:scale-110 transition-transform duration-300`}>
                    {Icon && <Icon className="w-5 h-5 text-white" />}
                </div>
            </div>
            {/* Bottom accent bar */}
            <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${grad} opacity-30 group-hover:opacity-70 transition-opacity`} />
        </div>
    );
};

export default StatCard;
