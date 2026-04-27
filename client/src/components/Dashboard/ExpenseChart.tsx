import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ExpenseChartProps {
  data: { category: { name: string; icon: string; color: string }; amount: number }[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(v);

export default function ExpenseChart({ data }: ExpenseChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card chart-card">
        <h3>⭐️ รายจ่ายตามหมวดหมู่</h3>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>ยังไม่มีข้อมูล</h3>
          <p>เพิ่มรายจ่ายเพื่อดูกราฟ</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: `${d.category.icon} ${d.category.name}`,
    value: d.amount,
    color: d.category.color,
  }));

  return (
    <div className="card chart-card">
      <h3>⭐️ รายจ่ายตามหมวดหมู่</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => formatCurrency(Number(value))}
            contentStyle={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#f0f0f5',
            }}
          />
          <Legend
            formatter={(value: string) => <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
