
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

  const getColor = (s: number) => {
    if (s < 50) return '#ef4444'; // Red-500
    if (s < 75) return '#f59e0b'; // Amber-500
    if (s < 90) return '#a855f7'; // Purple-500
    return '#10b981'; // Emerald-500
  };

  const activeColor = getColor(score);
  const emptyColor = '#27272a'; // Zinc-800

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
        <span className="text-5xl font-bold text-white tracking-tighter">{score}</span>
      </div>
    </div>
  );
};

export default GaugeChart;
