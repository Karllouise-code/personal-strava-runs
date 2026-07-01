<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  components: { Bar },
  props: {
    runs: { type: Array, default: () => [] },
  },
  computed: {
    chartData() {
      if (!this.runs.length) return { labels: [], datasets: [] };
      const weeks = {};
      const now = new Date();
      this.runs.forEach((run) => {
        const date = new Date(run.start_date_local);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toLocaleDateString();
        if (!weeks[weekKey]) weeks[weekKey] = { time: 0, dist: 0 };
        weeks[weekKey].time += Number(run.moving_time || 0);
        weeks[weekKey].dist += Number(run.distance || 0);
      });
      const labels = Object.keys(weeks).reverse().slice(0, 12);
      const data = labels.map((k) => {
        const w = weeks[k];
        if (!w.dist) return null;
        return w.time / 60 / (w.dist / 1000);
      }).reverse();
      return {
        labels: labels.reverse(),
        datasets: [
          {
            label: "Avg Pace (min/km)",
            data,
            backgroundColor: "#2dd4bf",
            borderColor: "#2dd4bf",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: "#1c1c1e",
            titleColor: "#f5f5f7",
            bodyColor: "#a1a1aa",
            borderColor: "#27272a",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y;
                if (!v) return "—";
                const m = Math.floor(v);
                const s = Math.round((v - m) * 60);
                return `${m}:${s.toString().padStart(2, "0")} min/km`;
              },
            },
          },
        },
        scales: {
          x: { display: false, grid: { display: false } },
          y: {
            display: false,
            grid: { display: false },
            reverse: true,
          },
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
