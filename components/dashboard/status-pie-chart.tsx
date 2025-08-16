"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

// Mock data for transaction statuses
const mockData = {
  labels: ["Completed", "Pending", "Failed", "Cancelled"],
  datasets: [
    {
      data: [7234, 234, 89, 45],
      backgroundColor: ["#2ECC71", "#C1A65C", "#E74C3C", "#6B7280"],
      borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
      borderWidth: 2,
    },
  ],
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#1c1c1e",
      bodyColor: "#1c1c1e",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      callbacks: {
        label: (context: any) => {
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((context.parsed / total) * 100).toFixed(1)
          return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`
        },
      },
    },
  },
  cutout: "60%",
}

export function StatusPieChart() {
  const total = mockData.datasets[0].data.reduce((a, b) => a + b, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Status</CardTitle>
        <p className="text-sm text-muted-foreground">Distribution of transaction statuses</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] relative">
          <Doughnut data={mockData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{total.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
