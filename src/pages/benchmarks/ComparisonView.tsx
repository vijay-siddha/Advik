import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { benchmarkApi } from '../../services/api';
import { Benchmark } from '../../types';

export function ComparisonView() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',') || [];
  
  const { data: benchmarks, isLoading } = useQuery({
    queryKey: ['comparison', ids],
    queryFn: () => benchmarkApi.compare(ids),
    enabled: ids.length > 0,
  });

  if (isLoading) return <div>Loading comparison...</div>;
  if (!benchmarks || benchmarks.length === 0) return <div>No benchmarks selected for comparison</div>;

  const costData = benchmarks.map((b: Benchmark) => ({
    name: b.productName,
    cost: Number(b.estimatedCost) || 0,
    weight: Number(b.weight) || 0,
  }));

  const radarData = [
    { subject: 'Cost', A: benchmarks[0]?.qualityScore || 0, fullMark: 10 },
    { subject: 'Quality', A: benchmarks[0]?.qualityScore || 0, fullMark: 10 },
    { subject: 'Performance', A: benchmarks[0]?.performanceScore || 0, fullMark: 10 },
    { subject: 'Durability', A: benchmarks[0]?.durabilityScore || 0, fullMark: 10 },
    { subject: 'DFMA', A: benchmarks[0]?.dfmaScore || 0, fullMark: 10 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Competitive Comparison Analysis</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Cost Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#3b82f6" name="Cost (USD)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name={benchmarks[0]?.productName} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strategy</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {benchmarks.map((b: Benchmark) => (
              <tr key={b.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{b.productName}</td>
                <td className="px-6 py-4 text-gray-500">{b.manufacturer}</td>
                <td className="px-6 py-4">${Number(b.estimatedCost).toLocaleString()}</td>
                <td className="px-6 py-4">{Number(b.weight).toFixed(2)} kg</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    (b.qualityScore || 0) >= 8 ? 'bg-green-100 text-green-800' :
                    (b.qualityScore || 0) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {b.qualityScore || 'N/A'}/10
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {b.makeVsBuy || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}