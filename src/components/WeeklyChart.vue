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
      this.runs.forEach((run) => {
        const date = new Date(run.start_date_local);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekKey = weekStart.toLocaleDateString();
        weeks[weekKey] = (weeks[weekKey] || 0) + run.distance / 1000;
      });
      return {
        labels: Object.keys(weeks).reverse(),
        datasets: [
          {
            label: "Weekly Distance (km)",
            data: Object.values(weeks).reverse(),
            backgroundColor: "#fc4c02", // Strava orange
            borderColor: "#fc4c02",
            borderWidth: 1,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Distance (km)" } },
          x: { title: { display: true, text: "Week" } },
        },
      };
    },
  },
};
</script>

<style scoped>
div {
  height: 300px;
  background-color: #1f2937; /* Tailwind gray-800 */
  border-radius: 0.75rem;
  padding: 1rem;
}
</style>
