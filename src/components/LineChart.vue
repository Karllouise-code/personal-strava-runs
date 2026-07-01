<template>
  <div>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Line } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler);

export default {
  components: { Line },
  props: {
    runs: { type: Array, default: () => [] },
  },
  computed: {
    chartData() {
      if (!this.runs.length) return { labels: [], datasets: [] };
      const weeks = {};
      this.runs.forEach((run) => {
        const date = new Date(run.start_date_local);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekKey = weekStart.toLocaleDateString();
        weeks[weekKey] = (weeks[weekKey] || 0) + run.distance / 1000;
      });
      const labels = Object.keys(weeks).reverse();
      const data = Object.values(weeks).reverse();
      return {
        labels,
        datasets: [
          {
            data,
            borderColor: "#2dd4bf",
            backgroundColor: (ctx) => {
              if (!ctx.chart.chartArea) return "transparent";
              const gradient = ctx.chart.ctx.createLinearGradient(0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom);
              gradient.addColorStop(0, "rgba(45, 212, 191, 0.12)");
              gradient.addColorStop(1, "rgba(45, 212, 191, 0)");
              return gradient;
            },
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.35,
            fill: true,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true, backgroundColor: "#1c1c1e", titleColor: "#f5f5f7", bodyColor: "#a1a1aa", borderColor: "#27272a", borderWidth: 1, padding: 10, cornerRadius: 8 } },
        scales: {
          x: { display: false, grid: { display: false } },
          y: { display: false, grid: { display: false }, beginAtZero: true },
        },
        interaction: { intersect: false, mode: "index" },
      };
    },
  },
};
</script>

<style scoped>
div {
  height: 260px;
}
</style>