import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface IncomeExpenseBarProps {
  data: { month: string; income: number; expense: number }[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(v);

export default function IncomeExpenseBar({ data }: IncomeExpenseBarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card chart-card">
        <h3>📊 รายรับ-รายจ่ายรายเดือน</h3>
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h3>ยังไม่มีข้อมูล</h3>
          <p>เพิ่มรายการเพื่อดูกราฟ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card chart-card">
      <h3>📊 รายรับ-รายจ่ายรายเดือน</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value: any, name: any) => [formatCurrency(Number(value)), name === 'income' ? 'รายรับ' : 'รายจ่าย']}
            contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f0f0f5' }}
          />
          <Legend formatter={(v: string) => (v === 'income' ? '💚 รายรับ' : '❤️ รายจ่าย')} />
          <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
