import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CHART_COLORS } from '../../utils/constants';
import { formatNumber, formatDate } from '../../utils/helpers';

const Analytics = ({ data, type = 'line', title, className = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`card p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [formatNumber(value), name]}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={CHART_COLORS.PRIMARY} 
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.PRIMARY }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={(value, name) => [formatNumber(value), name]} />
              <Bar dataKey="value" fill={CHART_COLORS.PRIMARY} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const COLORS = [
          CHART_COLORS.PRIMARY,
          CHART_COLORS.SECONDARY,
          CHART_COLORS.SUCCESS,
          CHART_COLORS.WARNING,
          CHART_COLORS.DANGER,
          CHART_COLORS.INFO
        ];

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={`card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
};

export default Analytics;