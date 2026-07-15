import { CaretDown } from '@phosphor-icons/react';
import { useState } from 'react';

const Accordion = ({ title, count, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`card overflow-hidden ${isOpen ? 'border-l-[3px] border-l-accent-500' : ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-dark-50 transition-colors duration-200"
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className={`w-5 h-5 ${isOpen ? 'text-accent-500' : 'text-accent-400'}`} />}
                    <h3 className="font-semibold text-primary-800 text-sm">{title}</h3>
                    {count !== undefined && (
                        <span className="badge-primary">{count}</span>
                    )}
                </div>
                <CaretDown
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent-500' : 'text-dark-400'}`}
                />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 border-t border-dark-100">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Accordion;
