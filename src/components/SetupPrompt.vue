<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div class="bg-[#1c1c1e] border border-white/[0.08] rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
      <h2 class="text-2xl font-bold tracking-tight mb-2">Welcome! 👋</h2>
      <p class="text-sm text-[#86868b] mb-6">Set your activity date range to get started. You can always change it later.</p>

      <div class="space-y-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium uppercase tracking-wider text-[#86868b]">From</label>
          <input type="date" :value="localStart" @input="onStartChange" :max="maxStartDate" class="bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/50 transition-colors w-full" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium uppercase tracking-wider text-[#86868b]">To</label>
          <input type="date" :value="localEnd" :min="minEndDate" :max="today" @input="onEndChange" class="bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#fc4c02]/50 transition-colors w-full" />
        </div>
      </div>

      <p class="text-xs text-[#86868b] mt-3">Maximum 5-month range to keep things fast.</p>

      <div class="flex gap-3 mt-6">
        <button @click="skip" class="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-[#86868b] hover:text-[#f5f5f7] border border-white/[0.08] hover:border-white/[0.15] transition-colors">Skip</button>
        <button @click="confirm" class="flex-1 px-5 py-3 rounded-xl text-sm font-medium bg-[#fc4c02] text-white hover:bg-[#e04302] transition-colors">Get Started</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["setup"],
  data() {
    const now = new Date();
    const endStr = now.toISOString().split("T")[0];
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    const startStr = start.toISOString().split("T")[0];
    return {
      localStart: startStr,
      localEnd: endStr,
    };
  },
  computed: {
    today() {
      return new Date().toISOString().split("T")[0];
    },
    maxStartDate() {
      const d = new Date(this.localEnd);
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().split("T")[0];
    },
    minEndDate() {
      if (!this.localStart) return null;
      const d = new Date(this.localStart);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    },
  },
  methods: {
    onStartChange(e) {
      const val = e.target.value;
      this.localStart = val;
      const end = new Date(val);
      end.setMonth(end.getMonth() + 5);
      const maxEnd = end.toISOString().split("T")[0];
      if (this.localEnd > maxEnd) this.localEnd = maxEnd;
    },
    onEndChange(e) {
      this.localEnd = e.target.value;
    },
    confirm() {
      this.$emit("setup", { startDate: this.localStart, endDate: this.localEnd });
    },
    skip() {
      this.$emit("setup", null);
    },
  },
};
</script>
