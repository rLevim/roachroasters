'use client';

interface ButtonProps {
  title: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'coral' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-purple-mid text-white hover:bg-purple-dark',
  secondary: 'bg-purple-dark text-white hover:bg-purple-deep',
  coral: 'bg-coral text-white hover:bg-coral-dark',
  outline: 'border-2 border-purple-mid text-purple-mid bg-transparent hover:bg-purple-mid/10',
  ghost: 'bg-transparent text-purple-mid hover:bg-purple-mid/10',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  title,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-xl font-bold text-center transition-all cursor-pointer
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        title
      )}
    </button>
  );
}
