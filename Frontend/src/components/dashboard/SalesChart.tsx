import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/Card";

// Definisikan tipe untuk data dari API
interface ApiDataItem {
  date: string;
  revenue: number;
  orders: number;
}

// Definisikan tipe untuk data chart
interface ChartDataItem {
  name: string;
  sales: number;
  orders: number;
}

interface SalesChartProps {
  data?: ApiDataItem[]; // Ganti any[] dengan ApiDataItem[]
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  // Data default dengan tipe yang jelas
  const defaultData: ChartDataItem[] = [
    { name: "Mon", sales: 4000, orders: 24 },
    { name: "Tue", sales: 3000, orders: 18 },
    { name: "Wed", sales: 2000, orders: 12 },
    { name: "Thu", sales: 2780, orders: 16 },
    { name: "Fri", sales: 1890, orders: 11 },
    { name: "Sat", sales: 2390, orders: 14 },
    { name: "Sun", sales: 3490, orders: 20 },
  ];

  // Konversi data dengan tipe yang aman
  const chartData: ChartDataItem[] =
    data && data.length > 0
      ? data.map((item) => ({
          name: new Date(item.date).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          sales: item.revenue,
          orders: item.orders,
        }))
      : defaultData;

  return (
    <Card>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Ringkasan Penjualan (7 Hari Terakhir)
      </h3>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
            />
            <YAxis className="text-gray-600 dark:text-gray-400" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(55 65 81)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
              }}
            />
            <Bar dataKey="sales" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
