<script setup>
import { ref } from 'vue'

const emit = defineEmits(['sliderValueChange'])

// Define a reactive value for the slider
const sliderRef = ref(null);
const sliderValue = ref(60)

const increaseNumber = () => {
  sliderValue.value = (sliderValue.value % 120) + 1
  const slider = sliderRef.value;
  slider.style.setProperty('--slider-value', sliderValue.value);
  emit('sliderValueChange', sliderValue.value);
}

// Function to decrease the number, looping back to 120 when it goes below 1
const decreaseNumber = () => {
  sliderValue.value = sliderValue.value === 1 ? 120 : sliderValue.value - 1;
  const slider = sliderRef.value;
  slider.style.setProperty('--slider-value', sliderValue.value);
  emit('sliderValueChange', sliderValue.value);
}

const onInputChange = (event) => {
  const newValue = event.target.value;
  const slider = sliderRef.value;
  slider.style.setProperty('--slider-value', newValue);
  emit('sliderValueChange', sliderValue.value);
}
</script>

<template>
  <div class="slider-container">

    <div class="label-container">
      <!-- Display the current slider value -->
      <p>{{ sliderValue }} searches/min</p>
    </div>

    <div class="slider-wrapper">
      <!-- Left Button to decrease the number -->
      <button @click="decreaseNumber" class="glider-button">-</button>

      <!-- Range slider input with v-model binding to sliderValue -->
      <input type="range"
             v-model="sliderValue"
             min="1"
             max="120"
             class="slider"
             ref="sliderRef"
             @input="onInputChange">

      <!-- Right Button to increase the number -->
      <button @click="increaseNumber" class="glider-button">+</button>
    </div>
  </div>
</template>

<style scoped>
.slider-container {
  display: grid;
  grid-template-rows: auto;
  align-items: center;
  justify-content: center;
}

.slider-wrapper {
  display: grid;
  grid-template-columns: 0.6fr 1fr 0.6fr;
}

.label-container {
  display: grid;
  grid-template-rows: auto;
}

.slider {
  margin: 10px 0 0;
  --slider-value: 60;
  -webkit-appearance: none; /* Remove default appearance */
  display: flex;
  justify-self: center; /* Horizontally center the content */
  align-self: center; /* Vertically center the content */
  appearance: none; /* Remove default appearance */
  width: 200px; /* Adjust the width as needed */
  height: 10px;
  background: transparent; /* Ensure the main input background is transparent */
  outline: none;
  transition: background 0.3s ease;
}

.slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 10px;
  background: linear-gradient(to right, #EF4765 0%, #FF9A5A calc(var(--slider-value) / 120 * 100%), #ffffff calc(var(--slider-value) / 120 * 100%)); /* Adjusted gradient */
  border-radius: 5px; /* Rounded track */
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(to bottom right, #EF4765, #FF9A5A); /* Gradient color matching buttons */
  border-radius: 50%; /* Round thumb */
  cursor: pointer;
  border: none;
  margin-top: -5px; /* Adjust to center the thumb over the track */
  position: relative;
  z-index: 2;
  transition: transform 150ms ease-in-out;
}

.slider::-webkit-slider-thumb:hover {
  -webkit-appearance: none;
  transform: scale(1.20);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.slider:focus::-webkit-slider-thumb {
  outline: 1px solid #FFFFFF;
}

p {
  margin: 10px 0 0;
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-align: center;
}

.glider-button {
  font-size: 24px;
  display: flex; /* Use flex to center the content */
  justify-content: center; /* Horizontally center the content */
  justify-self: center;
  align-items: center; /* Vertically center the content */
  width: 30px; /* Adjusted width to match height */
  height: 30px; /* Ensure the height and width are the same */
  background: linear-gradient(to bottom right, #EF4765, #FF9A5A);
  border-radius: 50%; /* Make it a perfect circle */
  border: none;
  padding: 0; /* Remove padding */
  margin: 0 0;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: transform 150ms ease-in-out;
}


.glider-button:hover {
  transform: scale(1.20);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>
