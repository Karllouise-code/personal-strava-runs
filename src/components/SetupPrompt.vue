<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div class="bg-card border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
      <h2 class="text-lg font-semibold tracking-tight mb-1">Welcome</h2>
      <p class="text-sm text-zinc-400 mb-6">Set your activity date range to get started. You can always change it later.</p>

      <div class="space-y-5">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs text-zinc-400">From</label>
          <div class="relative dp-wrap">
            <VueDatePicker
              :model-value="toDate(localStart)"
              @update:model-value="onStartChange"
              :max-date="toDate(maxStartDate)"
              dark
              auto-apply
              :formats="{ input: 'MMM dd, yyyy' }"
              placeholder="Select date"
              input-class-name="dp-input"
              :time-config="{ enableTimePicker: false }"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs text-zinc-400">To</label>
          <div class="relative dp-wrap">
            <VueDatePicker
              :model-value="toDate(localEnd)"
              @update:model-value="onEndChange"
              :min-date="toDate(minEndDate)"
              :max-date="toDate(today)"
              dark
              auto-apply
              :formats="{ input: 'MMM dd, yyyy' }"
              placeholder="Select date"
              input-class-name="dp-input"
              :time-config="{ enableTimePicker: false }"
            />
          </div>
        </div>
      </div>

      <p class="text-xs text-zinc-600 mt-4">Maximum 5-month range to keep things fast.</p>

      <div class="flex gap-3 mt-6">
        <button @click="skip" class="flex-1 px-5 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors min-h-[44px]">Skip</button>
        <button @click="confirm" class="flex-1 px-5 py-3 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors min-h-[44px]">Get Started</button>
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
    toDate(str) {
      return str ? new Date(str + "T12:00:00") : null;
    },
    fmt(date) {
      return date ? date.toISOString().split("T")[0] : "";
    },
    onStartChange(val) {
      const str = this.fmt(val);
      this.localStart = str;
      const end = new Date(str);
      end.setMonth(end.getMonth() + 5);
      const maxEnd = end.toISOString().split("T")[0];
      if (this.localEnd > maxEnd) this.localEnd = maxEnd;
    },
    onEndChange(val) {
      this.localEnd = this.fmt(val);
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

<style>
.dp-wrap .dp-input {
  background: transparent !important;
  border-bottom: 1px solid #3f3f46 !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-radius: 0 !important;
  color: #f5f5f7 !important;
  padding: 10px 0 !important;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
  min-height: 40px;
  width: 100%;
  transition: border-color 0.2s ease !important;
}
.dp-wrap .dp-input:focus {
  border-color: #2dd4bf !important;
  box-shadow: none !important;
  outline: none !important;
}
.dp-wrap .dp-input::placeholder {
  color: #52525b !important;
}
.dp-wrap .dp__input_icon {
  color: #52525b !important;
}
.dp-wrap .dp__input_icon_pad {
  padding-left: 0 !important;
}
</style>