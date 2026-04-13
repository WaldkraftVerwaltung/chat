import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input ref={ref} className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-slack-blue focus:ring-1 focus:ring-slack-blue/30 ${error ? 'border-red-500' : 'border-slack-input-border'} ${className}`} {...props} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
