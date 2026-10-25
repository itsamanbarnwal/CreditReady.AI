import { mockTransactions, mockChartData } from '../data/transactions';
import { useState } from 'react';
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function TransactionInsights() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filteredTransactions = mockTransactions.filter((trx) => {
    const matchesSearch =
      trx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.ref.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'All' || trx.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#16324F]">
            Transaction Insights
          </h2>
          <p className="text-[#64748B] mt-1">
            Detailed view of financial movements and categorization.
          </p>
        </div>

        <button
          onClick={() => {
            const headers = [
              'Date',
              'Description',
              'Reference',
              'Type',
              'Category',
              'Amount',
              'Balance',
              'Status',
            ];

            const rows = filteredTransactions.map((trx) => [
              trx.date,
              trx.description,
              trx.ref,
              trx.type,
              trx.category,
              trx.amount,
              trx.balance,
              trx.status,
            ]);

            const csv = [headers, ...rows]
              .map((row) =>
                row
                  .map(
                    (value) =>
                      `"${String(value).replace(/"/g, '""')}"`
                  )
                  .join(',')
              )
              .join('\n');

            const blob = new Blob([csv], {
              type: 'text/csv;charset=utf-8;',
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = 'transactions.csv';
            link.click();

            URL.revokeObjectURL(url);
          }}
          className="flex items-center space-x-2 bg-[#2563A6] hover:bg-[#1c4b82] text-white px-4 py-2 rounded-lg"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#DCE3EA]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#64748B] font-medium">
              Total Credits (MTD)
            </h3>
            <ArrowUpRight className="text-[#168568]" size={20} />
          </div>

          <p className="text-3xl font-bold text-[#16324F]">
            ₹ {mockTransactions
              .filter((trx) => trx.type === 'Credit')
              .reduce((sum, trx) => sum + trx.amount, 0)
              .toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#DCE3EA]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#64748B] font-medium">
              Total Debits (MTD)
            </h3>
            <ArrowDownRight className="text-[#C24141]" size={20} />
          </div>

          <p className="text-3xl font-bold text-[#16324F]">
            ₹ {mockTransactions
              .filter((trx) => trx.type === 'Debit')
              .reduce((sum, trx) => sum + trx.amount, 0)
              .toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#DCE3EA]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#64748B] font-medium">
              Net Cash Flow
            </h3>
            <TrendingUp className="text-[#2563A6]" size={20} />
          </div>

          <p className="text-3xl font-bold text-[#16324F]">
            ₹ {(mockTransactions
              .filter((trx) => trx.type === 'Credit')
              .reduce((sum, trx) => sum + trx.amount, 0) -
              mockTransactions
                .filter((trx) => trx.type === 'Debit')
                .reduce((sum, trx) => sum + trx.amount, 0)
            ).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#DCE3EA]">
        <h3 className="text-lg font-semibold text-[#16324F] mb-6">
          Income vs Spending (6 Months)
        </h3>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#DCE3EA"
              />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="Income"
                fill="#2563A6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Expenses"
                fill="#5B84B1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#DCE3EA] overflow-hidden">
        <div className="p-6 border-b border-[#DCE3EA] flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-semibold text-[#16324F]">
            Transaction History
          </h3>

          <div className="flex space-x-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                size={16}
              />
              <input
                type="text"
                placeholder="Search descriptions..."
                className="w-full pl-9 pr-4 py-2 border border-[#DCE3EA] rounded-lg text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border border-[#DCE3EA] rounded-lg px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Credit">Credits Only</option>
              <option value="Debit">Debits Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F6F8] text-[#64748B] text-sm border-b border-[#DCE3EA]">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Ref</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Balance</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredTransactions.map((trx) => (
                <tr
                  key={trx.id}
                  className="border-b border-[#DCE3EA] hover:bg-[#F4F6F8]/50"
                >
                  <td className="px-6 py-4">{trx.date}</td>
                  <td className="px-6 py-4 font-medium">
                    {trx.description}
                  </td>
                  <td className="px-6 py-4 text-xs text-[#64748B]">
                    {trx.ref}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-[#F4F6F8] px-2 py-1 rounded-md text-xs">
                      {trx.category}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-medium ${
                      trx.type === 'Credit'
                        ? 'text-[#168568]'
                        : 'text-[#16324F]'
                    }`}
                  >
                    {trx.type === 'Credit' ? '+' : '-'}₹{' '}
                    {trx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right text-[#64748B]">
                    ₹ {trx.balance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-[#64748B]"
                  >
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}