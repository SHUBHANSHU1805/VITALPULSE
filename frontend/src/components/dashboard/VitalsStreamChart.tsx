import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { VitalRecord } from '../../types';
import { Activity, Heart, Thermometer, Gauge } from 'lucide-react';

interface VitalsStreamChartProps {
  vitals: VitalRecord[];
}

export const VitalsStreamChart: React.FC<VitalsStreamChartProps> = ({ vitals }) => {
  const [selectedMetric, setSelectedMetric] = useState<'heartRate' | 'spo2' | 'bpSystolic' | 'temperature'>('heartRate');

  const metricConfig = {
    heartRate:  { label: 'Heart Rate (bpm)',              color: '#F43F5E', threshold: 100,  thresholdLabel: 'Tachycardia > 100', icon: Heart },
    spo2:       { label: 'SpO2 Oxygen Saturation (%)',    color: '#3B82F6', threshold: 90,   thresholdLabel: 'Hypoxia < 90%',     icon: Activity },
    bpSystolic: { label: 'Systolic Blood Pressure (mmHg)', color: '#F59E0B', threshold: 140,  thresholdLabel: 'Hypertension > 140', icon: Gauge },
    temperature:{ label: 'Body Temperature (°C)',         color: '#6366F1', threshold: 38.0, thresholdLabel: 'Fever > 38°C',      icon: Thermometer },
  };

  const chartData = vitals.slice(-25).map((v) => ({
    time: new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    heartRate:   v.heartRate,
    spo2:        v.spo2,
    bpSystolic:  v.bpSystolic,
    bpDiastolic: v.bpDiastolic,
    temperature: v.temperature,
  }));

  const currentConfig = metricConfig[selectedMetric];

  return (
    <div className="p-6 rounded-2xl glass-panel border border-[rgba(59,130,246,0.12)] space-y-4 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span>Live Telemetry Stream</span>
            {/* Blue live dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          </h3>
          <p className="text-xs text-slate-400">Real-time WebSocket physiological monitoring</p>
        </div>

        {/* Metric selector — reference style pill tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[rgba(15,23,42,0.80)] rounded-xl border border-[rgba(59,130,246,0.10)]">
          {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => {
            const cfg = metricConfig[key];
            const Icon = cfg.icon;
            const active = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[rgba(59,130,246,0.15)] text-white border border-[rgba(59,130,246,0.30)] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                <span>{key.replace('bpSystolic', 'BP').replace('heartRate', 'HR')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={currentConfig.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.07)" />
            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
            <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: 'rgba(59,130,246,0.25)',
                borderRadius: '0.75rem',
                color: '#F8FAFC',
                fontSize: '12px',
              }}
            />
            <ReferenceLine
              y={currentConfig.threshold}
              stroke="#F43F5E"
              strokeDasharray="4 4"
              label={{ value: currentConfig.thresholdLabel, fill: '#F43F5E', fontSize: 10, position: 'top' }}
            />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={currentConfig.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#gradient-${selectedMetric})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
