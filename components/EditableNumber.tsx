import React, { useState, useEffect } from 'react';

export const EditableNumber = ({ value, onChange, className, step = "1" }: { value: string | number, onChange: (val: string) => void, className?: string, step?: string }) => {
    const [localValue, setLocalValue] = useState(String(value));

    useEffect(() => {
        // Only update local value if it differs numerically to avoid overriding while typing (e.g. typing "15." or "15,")
        const parsedLocal = parseFloat(localValue.replace(',', '.'));
        const parsedProp = parseFloat(String(value));
        
        if (isNaN(parsedLocal) || isNaN(parsedProp) || parsedLocal !== parsedProp) {
             setLocalValue(String(value));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        val = val.replace(',', '.'); // Allow comma as decimal
        setLocalValue(val);
        
        if (val === '' || !isNaN(parseFloat(val))) {
            onChange(val);
        }
    };

    return (
        <input 
            type="text"
            inputMode="decimal"
            value={localValue}
            onChange={handleChange}
            onBlur={() => {
                const parsedLocal = parseFloat(localValue.replace(',', '.'));
                if (!isNaN(parsedLocal)) {
                    setLocalValue(String(value)); // Reset to formatted on blur
                }
            }}
            className={className}
            step={step}
        />
    );
};
