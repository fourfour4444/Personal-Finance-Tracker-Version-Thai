import { Transaction } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });

const formatTime = (date: string) => {
  const time = new Date(date).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${time} น.`;
};

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>ยังไม่มีรายการ</h3>
        <p>กดปุ่ม + เพื่อเพิ่มรายการแรกของคุณ</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((t, i) => (
        <div
          key={t.id}
          className="transaction-item"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div
            className="transaction-icon"
            style={{ background: `${t.category.color}20` }}
          >
            {t.category.icon}
          </div>
          <div className="transaction-info">
            <div className="transaction-desc">{t.description}</div>
            <div className="transaction-meta">
              <span>
                {t.category.icon} {t.category.name}
              </span>
              <span>•</span>
              <span>{formatDate(t.date)}</span>
              <span>•</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {formatTime(t.date)}
              </span>
            </div>
          </div>
          <div className={`transaction-amount ${t.type.toLowerCase()}`}>
            {t.type === 'INCOME' ? '+' : '-'}
            {formatCurrency(t.amount)}
          </div>
          <div className="transaction-actions">
            <button
              className="btn btn-icon btn-secondary"
              onClick={() => onEdit(t)}
              title="แก้ไข"
            >
              ✏️
            </button>
            <button
              className="btn btn-icon btn-danger"
              onClick={() => onDelete(t.id)}
              title="ลบ"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
