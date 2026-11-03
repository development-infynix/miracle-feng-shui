import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'outline' | 'inverted-outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  href,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'rounded-full px-7 py-[13px] text-[15px] font-medium inline-flex items-center justify-center transition-colors text-center';

  const variantStyles = {
    primary:
      'bg-moss text-paper hover:bg-ink disabled:bg-moss/50 disabled:cursor-not-allowed',
    outline:
      'border-[1.5px] border-ink text-ink bg-transparent hover:bg-ink hover:text-paper disabled:border-ink/40 disabled:text-ink/40 disabled:cursor-not-allowed',
    'inverted-outline':
      'border-[1.5px] border-paper text-paper bg-transparent hover:bg-paper hover:text-ink disabled:border-paper/40 disabled:text-paper/40 disabled:cursor-not-allowed',
  };

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
