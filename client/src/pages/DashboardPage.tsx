import { useState, useEffect } from 'react';
import api from '../services/api';
import { TransactionSummary } from '../types';
import SummaryCard from '../components/Dashboard/SummaryCard';
import ExpenseChart from '../components/Dashboard/ExpenseChart';
import IncomeExpenseBar from '../components/Dashboard/IncomeExpenseBar';
import TransactionList from '../components/Transaction/TransactionList';
import TransactionForm from '../components/Transaction/TransactionForm';

export default function DashboardPage() {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editTx, setEditTx] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/transactions/summary');
      setSummary(data.data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบรายการนี้หรือไม่?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchSummary();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="page-header"><h2>📊 Dashboard</h2><p>ภาพรวมการเงินของคุณ</p></div>
        <div className="summary-cards">
          {[1, 2, 3].map((i) => (<div key={i} className="card skeleton" style={{ height: 140 }} />))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <p>ภาพรวมการเงินของคุณ</p>
      </div>

      <div className="summary-cards">
        <SummaryCard type="income" label="รายรับทั้งหมด" amount={summary?.totalIncome || 0} />
        <SummaryCard type="expense" label="รายจ่ายทั้งหมด" amount={summary?.totalExpense || 0} />
        <SummaryCard type="balance" label="ยอดคงเหลือ" amount={summary?.balance || 0} />
      </div>

      <div className="charts-grid">
        <ExpenseChart data={summary?.expenseByCategory || []} />
        <IncomeExpenseBar data={summary?.monthlyComparison || []} />
      </div>

      <div className="card" style={{ animation: 'fadeIn 0.7s ease' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🕐 รายการล่าสุด
        </h3>
        <TransactionList
          transactions={summary?.recentTransactions || []}
          onEdit={(t) => { setEditTx(t); setShowForm(true); }}
          onDelete={handleDelete}
        />
      </div>

      {showForm && (
        <TransactionForm
          editTransaction={editTx}
          onClose={() => { setShowForm(false); setEditTx(null); }}
          onSuccess={fetchSummary}
        />
      )}
    </div>
  );
}
