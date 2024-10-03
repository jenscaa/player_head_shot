<script setup>
const props = defineProps({
  searches: {
    type: Number,
    required: true
  },
  buys: {
    type: Number,
    required: true
  },
  fails: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="result-container">
    <label class="stats">STATS</label>
    <hr>
    <div class="stats-container">
      <div class="stat">
        <label>Searches: </label>
        <label class="search-label">{{ searches }}</label>
      </div>
      <div class="stat">
        <label>Buys: </label>
        <label class="buy-label">{{ buys }}</label>
      </div>
      <div class="stat">
        <label>Fails: </label>
        <label class="fail-label">{{ fails }}</label>
      </div>
    </div>
    <hr>
  </div>
</template>

<style scoped>
label {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

hr {
  width: 90%;
}

.buy-label {
  color: chartreuse;
}

.fail-label {
  color: #ef4765;
}

.stats {
  font-size: 16px;
  text-align: center;
  width: 100%;
}

.result-container {
  display: grid;
  grid-template-rows: auto;
  gap: 5px;
  width: 100%;
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
}

.stat {
  display: flex;
  justify-content: center;
  gap: 4px;
}
</style>