import { useState, FormEvent, useEffect } from 'react';
import { Category, Transaction } from '../../types';
import api from '../../services/api';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editTransaction?: Transaction | null;
}

export default function TransactionForm({ onClose, onSuccess, editTransaction }: TransactionFormProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(editTransaction?.type || 'EXPENSE');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [categoryId, setCategoryId] = useState(editTransaction?.categoryId || '');
  const [date, setDate] = useState(editTransaction ? new Date(editTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    if (editTransaction) {
      const d = new Date(editTransaction.date);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(data.data.categories);
      if (!editTransaction && data.data.categories.length > 0) {
        const filtered = data.data.categories.filter((c: Category) => c.type === type || c.type === 'BOTH');
        if (filtered.length > 0 && !categoryId) setCategoryId(filtered[0].id);
      }
    });
  }, []);

  useEffect(() => {
    const filtered = categories.filter((c) => c.type === type || c.type === 'BOTH');
    if (filtered.length > 0 && !filtered.find(c => c.id === categoryId)) {
      setCategoryId(filtered[0].id);
    }
  }, [type, categories]);

  const filteredCategories = categories.filter((c) => c.type === type || c.type === 'BOTH');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = { type, amount: parseFloat(amount), description, date: `${date}T${time}:00`, categoryId };
      if (editTransaction) {
        await api.put(`/transactions/${editTransaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editTransaction ? '✏️ แก้ไขรายการ' : '➕ เพิ่มรายการ'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ประเภท</label>
            <div className="type-toggle">
              <button type="button" className={type === 'INCOME' ? 'active-income' : ''} onClick={() => setType('INCOME')}>💚 รายรับ</button>
              <button type="button" className={type === 'EXPENSE' ? 'active-expense' : ''} onClick={() => setType('EXPENSE')}>❤️ รายจ่าย</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tx-amount">จำนวนเงิน (฿)</label>
            <input id="tx-amount" type="number" className="form-input" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" step="any" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tx-desc">รายละเอียด</label>
            <input id="tx-desc" type="text" className="form-input" placeholder="เช่น ค่าอาหารกลางวัน" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tx-category">หมวดหมู่</label>
            <select id="tx-category" className="form-input form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tx-date">วันที่และเวลา</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input id="tx-date" type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} required style={{ flex: 2 }} />
              <input id="tx-time" type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} required style={{ flex: 1 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
              {isLoading ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
