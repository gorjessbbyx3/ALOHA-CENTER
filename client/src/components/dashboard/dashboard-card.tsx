import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  iconPosition?: 'left' | 'top';
  valueSize?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export function DashboardCard({
  title,
  value,
  icon,
  className,
  iconPosition = 'left',
  valueSize = 'large',
  onClick
}: DashboardCardProps) {
  const valueSizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  };

  return (
    <div 
      className={cn(
        "rounded-lg p-4 text-white transition-all duration-200 hover:shadow-lg",
        onClick && "cursor-pointer hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <div className={cn(
        "flex",
        iconPosition === 'top' ? 'flex-col items-center text-center' : 'items-center justify-between'
      )}>
        {iconPosition === 'top' && icon && (
          <div className="mb-4">{icon}</div>
        )}
        
        <div className={cn(
          "flex flex-col",
          iconPosition === 'top' && "items-center"
        )}>
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <p className={cn(
            "font-bold",
            valueSizeClasses[valueSize]
          )}>{value}</p>
        </div>
        
        {iconPosition === 'left' && icon && (
          <div className="text-3xl">{icon}</div>
        )}
      </div>
    </div>
  );
}