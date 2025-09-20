<script setup>
/** Imports Vue's `onMounted` lifecycle hook and `ref` for creating reactive properties.*/
import {onMounted, ref} from 'vue'

/**
 * Defines the emitted event 'sliderValueChange', which notifies the parent component
 * whenever the slider value changes.
 */
const emit = defineEmits(['sliderValueChange']);

/**
 * Defines the props that the component expects:
 *
 * @prop {number} rpm - The initial value for the slider representing rounds per minute. This prop is required.
 */
const props = defineProps({
    rpm: {
        type: Number,
        required: true
    }
});


/**
 * A reactive reference to the slider element in the DOM.
 *
 * @type {Ref<HTMLElement|null>}
 */
const sliderRef = ref(null);

/**
 * A reactive value for the current slider value, initialized with the `rpm` prop.
 *
 * @type {Ref<number>}
 */
const sliderValue = ref(props.rpm);

/**
 * Increases the slider value by 1. If the value exceeds 120, it wraps back to 1.
 * Updates the slider's CSS variable and emits the 'sliderValueChange' event.
 */
const increaseNumber = () => {
    sliderValue.value = (sliderValue.value % 120) + 1
    const slider = sliderRef.value;
    slider.style.setProperty('--slider-value', sliderValue.value);
    emit('sliderValueChange', sliderValue.value);
}

/**
 * Decreases the slider value by 1. If the value goes below 1, it wraps back to 120.
 * Updates the slider's CSS variable and emits the 'sliderValueChange' event.
 */
const decreaseNumber = () => {
    sliderValue.value = sliderValue.value === 1 ? 120 : sliderValue.value - 1;
    const slider = sliderRef.value;
    slider.style.setProperty('--slider-value', sliderValue.value);
    emit('sliderValueChange', sliderValue.value);
}

/**
 * Handles input changes directly from the slider. Updates the internal slider value and
 * emits the 'sliderValueChange' event with the updated value.
 *
 * @param {Event} event - The input change event triggered by user interaction.
 */
const onInputChange = (event) => {
    const newValue = event.target.value;
    const slider = sliderRef.value;
    slider.style.setProperty('--slider-value', newValue);
    emit('sliderValueChange', sliderValue.value);
}

/**
 * `onMounted` lifecycle hook. When the component is mounted, the slider's CSS variable is set
 * to the initial `sliderValue` to reflect the current state of the slider.
 */
onMounted(() => {
    const slider = sliderRef.value;
    slider.style.setProperty('--slider-value', sliderValue.value);
})
</script>

<template>
    <div :key="sliderKey" class="slider-container">

        <div class="label-container">
            <p>{{ sliderValue }} searches/min</p>
        </div>

        <div class="slider-wrapper">
            <button @click="decreaseNumber" class="glider-button">-</button>
            <input type="range"
                   v-model="sliderValue"
                   min="1"
                   max="120"
                   class="slider"
                   ref="sliderRef"
                   @input="onInputChange">
            <button @click="increaseNumber" class="glider-button">+</button>
        </div>
    </div>
</template>

<style scoped>
:root {
  --primary-color: #3091ae;
  --secondary-color: #5b51ae;
}

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
    -webkit-appearance: none;
    display: flex;
    justify-self: center;
    align-self: center;
    appearance: none;
    width: 200px;
    height: 10px;
    background: transparent;
    outline: none;
    transition: background 0.3s ease;
    cursor: pointer;
}

.slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 10px;
    background: linear-gradient(to right, var(--primary-color) 0%, var(--secondary-color) calc(var(--slider-value) / 120 * 100%), #ffffff calc(var(--slider-value) / 120 * 100%));
    border-radius: 5px;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color)); /* Gradient color matching buttons */
    border-radius: 50%;
    cursor: pointer;
    border: none;
    margin-top: -5px;
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
    display: flex;
    justify-content: center;
    justify-self: center;
    align-items: center;
    width: 30px;
    height: 30px;
    background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color));
    border-radius: 50%;
    border: none;
    padding: 0;
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
