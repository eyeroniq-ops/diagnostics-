import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  score: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  // New color scheme: Dark Purple -> Bright Pink -> White/Cyan
  const getColor = (s: number) => {
    if (s < 40) return '#7c3aed'; // Violet-600 (Low)
    if (s < 70) return '#c026d3'; // Fuchsia-600 (Mid)
    if (s < 90) return '#e879f9'; // Fuchsia-400 (High)
    return '#fae8ff'; // Fuchsia-100 (Excellent)
  };

  const activeColor = getColor(score);
  const emptyColor = '#18181b'; // zinc-900

  return (
    <div className="relative w-full h-48 flex justify-center items-end">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="cell-score" fill={activeColor} />
            <Cell key="cell-remaining" fill={emptyColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 flex flex-col items-center mb-2">
        <span className="text-5xl font-bold text-white">{score}</span>
        <span className="text-xs text-zinc-500 uppercase tracking-widest">Health Score</span>
      </div>
    </div>
  );
};

export default GaugeChart;