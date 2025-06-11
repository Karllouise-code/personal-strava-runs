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
  components: {
    Line,
  },
  props: {
    runs: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    chartData() {
      if (!this.runs.length) {
        return {
          labels: [],
          datasets: [],
        };
      }
      return {
        labels: this.runs.map((run) => new Date(run.start_date_local).toLocaleDateString()).reverse(),
        datasets: [
          {
            label: "Distance (km)",
            data: this.runs.map((run) => run.distance / 1000).reverse(),
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            fill: true,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Distance (km)" },
          },
          x: {
            title: { display: true, text: "Date" },
          },
        },
      };
    },
  },
};
</script>

<style scoped>
div {
  height: 300px;
}
</style>
