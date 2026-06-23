<template>
  <div class="relative">
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
            borderColor: "#00e5ff",
            backgroundColor: (ctx) => {
              if (!ctx.chart.chartArea) return "transparent";
              const gradient = ctx.chart.ctx.createLinearGradient(0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom);
              gradient.addColorStop(0, "rgba(0, 229, 255, 0.25)");
              gradient.addColorStop(1, "rgba(0, 229, 255, 0)");
              return gradient;
            },
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.4,
            fill: true,
          },
          {
            data,
            borderColor: "rgba(0, 229, 255, 0.3)",
            borderWidth: 6,
            pointRadius: 0,
            tension: 0.4,
            fill: false,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
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
  height: 200px;
}
</style>
