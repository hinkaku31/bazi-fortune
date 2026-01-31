import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ label, value, options, onChange, placeholder = '選択してください' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block">{label}</label>
            <div
                className="w-full bg-white border-b border-gray-100 py-3 flex items-center justify-between cursor-pointer hover:border-gray-800 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-lg ${value ? 'text-gray-800' : 'text-gray-300'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${value === option.value ? 'bg-gray-50 font-bold text-jp-gold' : 'text-gray-600'}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
