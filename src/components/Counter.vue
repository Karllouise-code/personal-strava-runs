<template>
  <span>{{ displayValue }}</span>
</template>

<script>
export default {
  props: {
    endVal: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      default: 2000,
    },
    decimals: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      displayValue: 0,
    };
  },
  mounted() {
    this.animateCount();
  },
  watch: {
    endVal(newVal) {
      this.animateCount(newVal);
    },
  },
  methods: {
    animateCount(endVal = this.endVal) {
      const startVal = Number(this.displayValue) || 0;
      const range = Number(endVal) - startVal;
      const startTime = performance.now();
      const duration = this.duration;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = startVal + range * progress;
        this.displayValue = isNaN(value) ? 0 : value.toFixed(this.decimals);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    },
  },
};
</script>
