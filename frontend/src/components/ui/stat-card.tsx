
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, description, icon, trend, ...props }, ref) => {
    return (
      <Card 
        ref={ref}
        className={cn("overflow-hidden transition-all duration-200 hover:shadow-md", className)} 
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="mt-1 flex items-baseline">
                <h3 className="text-2xl font-semibold">{value}</h3>
                {trend && (
                  <span 
                    className={cn(
                      "ml-2 text-xs font-medium",
                      trend.isPositive ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            {icon && (
              <div className="p-2 rounded-full bg-primary/5 text-primary">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export { StatCard };
