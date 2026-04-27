interface SummaryCardProps {
  type: 'income' | 'expense' | 'balance';
  label: string;
  amount: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const icons = { income: '📈', expense: '📉', balance: '💎' };

export default function SummaryCard({ type, label, amount }: SummaryCardProps) {
  return (
    <div className={`card summary-card card-${type}`}>
      <div className="card-accent" />
      <div className="card-icon">{icons[type]}</div>
      <div className="card-label">{label}</div>
      <div className="card-value">{formatCurrency(amount)}</div>
    </div>
  );
}
