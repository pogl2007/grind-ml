import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface PlanCardProps {
  name: string;
  price: string;
  items: string[];
  highlighted?: boolean;
  action: ReactNode;
}

export function PlanCard({ name, price, items, highlighted, action }: PlanCardProps) {
  return (
    <Card className={`p-6 ${highlighted ? 'border-accent' : ''}`}>
      <h3 className="text-lg font-medium text-text-primary">{name}</h3>
      <p className="font-mono-nums mt-1 text-2xl text-text-primary">{price}</p>
      <ul className="mt-5 flex flex-col gap-2 text-sm text-text-secondary">
        {items.map((item) => (
          <li key={item}>✓ {item}</li>
        ))}
      </ul>
      <div className="mt-6">{action}</div>
    </Card>
  );
}
