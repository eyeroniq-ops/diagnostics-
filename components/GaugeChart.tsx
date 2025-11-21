
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

  // Colors for report (professional / print friendly)
  const getColor = (s: number) => {
    if (s < 50) return '#ef4444'; // Red
    if (s < 75) return '#f59e0b'; // Amber
    if (s < 90) return '#8b5cf6'; // Violet
    return '#10b981'; // Emerald
  };

  const activeColor = getColor(score);
  // Light gray for the empty part to look good on white paper
  const emptyColor = '#e4e4e7'; // zinc-200

  return (
    <div className="relative w-full h-full flex justify-center items-end">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="75%"
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
      <div className="absolute bottom-0 flex flex-col items-center mb-1">
        <span className="text-4xl font-bold text-zinc-900">{score}</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Score</span>
      </div>
    </div>
  );
};

export default GaugeChart;
