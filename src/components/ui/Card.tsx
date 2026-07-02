import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverGlow = true,
  ...props
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-dark-800/80 bg-dark-900/60 p-6 backdrop-blur-xl transition-all duration-300 ${
        hoverGlow
          ? 'hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)]'
          : ''
      } ${className}`}
      {...props}
    >
      {/* Decorative top-right color accent on hover */}
      {hoverGlow && (
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`mb-4 flex flex-col space-y-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3
    className={`font-display text-xl font-bold tracking-tight text-white ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-sm text-dark-400 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => <div className={`relative z-10 ${className}`} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`mt-6 flex items-center ${className}`} {...props}>
    {children}
  </div>
);
