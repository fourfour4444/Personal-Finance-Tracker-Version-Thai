import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Transaction, Category, Pagination, TransactionFilters } from '../types';
import TransactionList from '../components/Transaction/TransactionList';
import TransactionForm from '../components/Transaction/TransactionForm';
import CustomSelect from '../components/UI/CustomSelect';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({ sortBy: 'date', sortOrder: 'desc', page: 1, limit: 15 });
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.data.transactions);
      setPagination(data.data.pagination);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data.categories));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบรายการนี้หรือไม่?')) return;
    try { await api.delete(`/transactions/${id}`); fetchTransactions(); }
    catch (err) { console.error(err); }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const typeOptions = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'INCOME', label: '💚 รายรับ' },
    { value: 'EXPENSE', label: '❤️ รายจ่าย' },
  ];

  const categoryOptions = [
    { value: '', label: 'ทั้งหมด' },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ];

  const sortByOptions = [
    { value: 'date', label: '📅 วันที่' },
    { value: 'amount', label: '💰 จำนวนเงิน' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: '⬇️ ล่าสุดก่อน' },
    { value: 'asc', label: '⬆️ เก่าสุดก่อน' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>💳 Transactions</h2>
        <p>จัดการรายรับ-รายจ่ายของคุณ</p>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>ประเภท</label>
          <CustomSelect options={typeOptions} value={filters.type || ''} onChange={(v) => updateFilter('type', v)} />
        </div>
        <div className="filter-group">
          <label>หมวดหมู่</label>
          <CustomSelect options={categoryOptions} value={filters.categoryId || ''} onChange={(v) => updateFilter('categoryId', v)} />
        </div>
        <div className="filter-group">
          <label>ตั้งแต่วันที่</label>
          <input type="date" className="filter-input" value={filters.startDate || ''} onChange={(e) => updateFilter('startDate', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>ถึงวันที่</label>
          <input type="date" className="filter-input" value={filters.endDate || ''} onChange={(e) => updateFilter('endDate', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>เรียงตาม</label>
          <CustomSelect options={sortByOptions} value={filters.sortBy || 'date'} onChange={(v) => updateFilter('sortBy', v)} />
        </div>
        <div className="filter-group">
          <label>ลำดับ</label>
          <CustomSelect options={sortOrderOptions} value={filters.sortOrder || 'desc'} onChange={(v) => updateFilter('sortOrder', v)} />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="skeleton" style={{ height: 64 }} />))}
        </div>
      ) : (
        <TransactionList transactions={transactions} onEdit={(t) => { setEditTx(t); setShowForm(true); }} onDelete={handleDelete} />
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button disabled={pagination.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}>◀ ก่อนหน้า</button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            หน้า {pagination.page} จาก {pagination.totalPages} ({pagination.total} รายการ)
          </span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}>ถัดไป ▶</button>
        </div>
      )}

      <button className="fab" onClick={() => { setEditTx(null); setShowForm(true); }} title="เพิ่มรายการ">＋</button>

      {showForm && (
        <TransactionForm
          editTransaction={editTx}
          onClose={() => { setShowForm(false); setEditTx(null); }}
          onSuccess={fetchTransactions}
        />
      )}
    </div>
  );
}
