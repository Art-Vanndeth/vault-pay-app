"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Mock data for the last 7 days
const mockData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Transaction Volume",
      data: [125000, 189000, 156000, 234000, 198000, 167000, 203000],
      borderColor: "#004481",
      backgroundColor: "rgba(0, 68, 129, 0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#004481",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointRadius: 4,
    },
  ],
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#1c1c1e",
      bodyColor: "#1c1c1e",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      callbacks: {
        label: (context: any) => `Volume: $${context.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      border: {
        display: false,
      },
      ticks: {
        callback: (value: any) => `$${value / 1000}K`,
      },
    },
  },
}

export function VolumeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
        <p className="text-sm text-muted-foreground">Daily transaction volume over the last 7 days</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line data={mockData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
