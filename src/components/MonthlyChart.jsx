import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MONTH_NAMES } from '../utils/constants';
import { aggregateMonthlyInvestments, formatDateDisplay } from '../utils/dateUtils';

/**
 * Custom Tooltip for the Monthly Line Chart
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__date">{formatDateDisplay(data.date)}</p>
        <p className="chart-tooltip__hours">
          <span className="dot dot--red"></span>
          <strong>{data.hours}</strong> {data.hours === 1 ? 'hour' : 'hours'} invested
        </p>
        {data.entriesCount > 1 && (
          <p className="chart-tooltip__sub">Aggregated across {data.entriesCount} entries</p>
        )}
      </div>
    );
  }
  return null;
}

const BASE_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = 2024; y <= BASE_YEAR + 2; y++) {
  YEAR_OPTIONS.push(y);
}

/**
 * Monthly Learning Investment Graph
 */
export default function MonthlyChart({ investments = [] }) {
  const [selectedYear, setSelectedYear] = useState(BASE_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);

  // Generate complete aggregated calendar series for the chosen month
  const chartData = useMemo(() => {
    return aggregateMonthlyInvestments(investments, selectedYear, selectedMonth);
  }, [investments, selectedYear, selectedMonth]);

  // Monthly stats
  const monthlyStats = useMemo(() => {
    let total = 0;
    let activeDays = 0;
    let maxDayHours = 0;

    for (const d of chartData) {
      if (d.hours > 0) {
        total += d.hours;
        activeDays += 1;
        if (d.hours > maxDayHours) {
          maxDayHours = d.hours;
        }
      }
    }

    const roundedTotal = Math.round(total * 100) / 100;
    const avgPerActiveDay = activeDays > 0 ? (total / activeDays).toFixed(1) : 0;

    return {
      total: roundedTotal,
      activeDays,
      daysInMonth: chartData.length,
      avgPerActiveDay,
      maxDayHours: Math.round(maxDayHours * 100) / 100
    };
  }, [chartData]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div className="chart-card__title-box">
          <h3 className="chart-card__title">📈 Monthly Learning Investment Graph</h3>
          <p className="chart-card__subtitle">
            Daily investment trend with connected markers for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="chart-controls">
          <button
            type="button"
            className="btn-icon"
            onClick={handlePrevMonth}
            title="Previous Month"
            aria-label="Previous Month"
          >
            ◀
          </button>

          <select
            className="chart-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            aria-label="Select Month"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            className="chart-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label="Select Year"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-icon"
            onClick={handleNextMonth}
            title="Next Month"
            aria-label="Next Month"
          >
            ▶
          </button>

          <button
            type="button"
            className="btn btn--xs btn--outline"
            onClick={handleSetCurrentMonth}
            title="Jump to current month"
          >
            Today
          </button>
        </div>
      </div>

      {/* Monthly Metric Pill Bar */}
      <div className="chart-metrics-bar">
        <div className="chart-metric-item">
          <span className="chart-metric-label">Month Total:</span>
          <span className="chart-metric-value">{monthlyStats.total} hrs</span>
        </div>
        <div className="chart-metric-item">
          <span className="chart-metric-label">Active Days:</span>
          <span className="chart-metric-value">
            {monthlyStats.activeDays} / {monthlyStats.daysInMonth} days
          </span>
        </div>
        <div className="chart-metric-item">
          <span className="chart-metric-label">Avg / Active Day:</span>
          <span className="chart-metric-value">{monthlyStats.avgPerActiveDay} hrs</span>
        </div>
        <div className="chart-metric-item">
          <span className="chart-metric-label">Peak Day:</span>
          <span className="chart-metric-value">{monthlyStats.maxDayHours} hrs</span>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="chart-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#7a9cc7"
              tick={{ fill: '#7a9cc7', fontSize: 11 }}
              tickLine={{ stroke: '#1e3a5f' }}
              axisLine={{ stroke: '#1e3a5f' }}
              label={{
                value: 'Calendar Day of Month',
                position: 'insideBottom',
                offset: -12,
                fill: '#7a9cc7',
                fontSize: 12
              }}
            />
            <YAxis
              stroke="#7a9cc7"
              tick={{ fill: '#7a9cc7', fontSize: 11 }}
              tickLine={{ stroke: '#1e3a5f' }}
              axisLine={{ stroke: '#1e3a5f' }}
              domain={[0, 'auto']}
              label={{
                value: 'Hours',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                fill: '#7a9cc7',
                fontSize: 12
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Connected Red Line with Circular Markers as required */}
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#ef5350"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#ef5350', stroke: '#ffffff', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: '#ff7961', stroke: '#ffffff', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
