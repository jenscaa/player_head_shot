<script setup>
import { ref } from 'vue'

// Define a reactive value for the slider
const sliderValue = ref(60)

const increaseNumber = () => {
  sliderValue.value = (sliderValue.value % 120) + 1
}

// Function to decrease the number, looping back to 120 when it goes below 1
const decreaseNumber = () => {
  sliderValue.value = sliderValue.value === 1 ? 120 : sliderValue.value - 1
}
</script>

<template>
  <div class="slider-container">

    <!-- Left Button to decrease the number -->
    <button @click="decreaseNumber" class="glider-button">Left</button>

    <!-- Range slider input with v-model binding to sliderValue -->
    <input type="range" v-model="sliderValue" min="1" max="120" class="slider">
    <!-- Display the current slider value -->
    <p>Value: {{ sliderValue }}</p>

    <!-- Right Button to increase the number -->
    <button @click="increaseNumber" class="glider-button">Right</button>
  </div>
</template>

<style scoped>
.slider-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.slider {
  width: 300px;
  margin: 20px 0;
}

p {
  font-size: 18px;
  font-weight: bold;
}

.glider-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.glider-button:hover {
  background-color: #45a049;
}

.glider-button:active {
  transform: scale(0.95);
}
</style>
