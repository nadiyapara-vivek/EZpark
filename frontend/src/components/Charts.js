import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#00d4aa', '#6c63ff', '#f59e0b', '#ef4444', '#22c55e'];

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.82rem'
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {prefix}{p.value}
        </div>
      ))}
    </div>
  );
};

/** Monthly spending line chart */
export const SpendingChart = ({ bookings = [] }) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = months.map((month, i) => ({
    month,
    amount: bookings
      .filter(b => new Date(b.createdAt).getMonth() === i && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.finalAmount || b.totalAmount), 0)
  }));

  return (
    <div>
      <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>
        Monthly Spending (₹)
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip prefix="₹" />} />
          <Line type="monotone" dataKey="amount" stroke="#00d4aa" strokeWidth={2} dot={{ fill: '#00d4aa', r: 3 }} name="Spending" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/** Booking status bar chart */
export const BookingStatusChart = ({ bookings = [] }) => {
  const statusCounts = ['pending','confirmed','active','completed','cancelled'].map(s => ({
    status: s.charAt(0).toUpperCase() + s.slice(1),
    count: bookings.filter(b => b.status === s).length
  }));

  const STATUS_COLORS = {
    Pending: '#f59e0b', Confirmed: '#00d4aa', Active: '#22c55e',
    Completed: '#94a3b8', Cancelled: '#ef4444'
  };

  return (
    <div>
      <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>
        Bookings by Status
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={statusCounts}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="status" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Bookings" radius={[4,4,0,0]}>
            {statusCounts.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6c63ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/** Slot type usage pie chart */
export const SlotTypeChart = ({ bookings = [] }) => {
  const typeCounts = {};
  bookings.forEach(b => {
    const t = b.slot?.type || 'unknown';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const data = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>
        Slot Type Usage
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={75} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/** Hours parked per month */
export const HoursChart = ({ bookings = [] }) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data = months.map((month, i) => ({
    month,
    hours: bookings
      .filter(b => new Date(b.createdAt).getMonth() === i)
      .reduce((sum, b) => sum + (b.duration || 0), 0)
  }));

  return (
    <div>
      <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>
        Hours Parked per Month
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" name="Hours" fill="#6c63ff" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};