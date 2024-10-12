<script setup>
/**
 * Defines the emitted event 'inputChangeEvent', which is triggered when the input value changes
 * to notify the parent component with the new input value.
 */
const emit = defineEmits(['inputChangeEvent']);

/**
 * Defines the props that the component expects:
 *
 * @prop {string} label - The label text for the input field. Defaults to an empty string if not provided.
 * @prop {string} type - The type of the input field (e.g., "text", "number"). Defaults to "number".
 * @prop {string} placeholder - The placeholder text for the input field. Defaults to an empty string if not provided.
 * @prop {string} inputId - A unique identifier for the input field. This prop is required.
 * @prop {number} [max] - The maximum allowable value for the input field. Optional.
 * @prop {number} [min] - The minimum allowable value for the input field. Optional.
 * @prop {*} modelValue - The current value of the input field, used for two-way binding.
 * @prop {boolean} [required=false] - A Boolean indicating whether the input is required. Defaults to `false` if not provided.
 * @prop {boolean} disabled - A Boolean indicating whether the input field is disabled. This prop is required.
 */
const props = defineProps({
  label: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "number"
  },
  placeholder: {
    type: String,
    default: ""
  },
  inputId: {
    type: String,
    required: true
  },
  max: {
    type: Number,
    required: false
  },
  min: {
    type: Number,
    required: false
  },
  modelValue: {},
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    required: true
  }
});

/**
 * Handles the input event. When the input value changes, this function emits the 'inputChangeEvent'
 * with the updated input value to notify the parent component.
 *
 * @param {Event} event - The input change event triggered by user interaction.
 */
const onInputEvent = (event) => {
  emit('inputChangeEvent', event.target.value)
}
</script>

<template>
  <div class="input-label-container">
    <label :for="inputId">{{ label }}</label>
    <div class="input-container">
      <input :id="inputId"
             class="custom-input"
             @input="onInputEvent"
             :type="type"
             :placeholder="placeholder"
             :required="required"
             :disabled="disabled"
             :max="max"
             :min="min"
             :value="modelValue"
      />
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #EF4765;
  --secondary-color: #FF9A5A;
}

label {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.input-label-container {
  display: grid;
  grid-template-rows: auto;
  gap: 5px;
  width: 80%;
}

.input-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-container .custom-input {
  position: relative;
  border-radius: 10px;
  border: 4px solid transparent;
  background: rgba(255, 255, 255, .9);
  padding: 10px;
  font-size: 14px;
  color: black;
  background-clip: padding-box;
  box-sizing: border-box;
  width: 100%;
  transition: background-color 150ms ease-in-out;
}

.input-container .custom-input:hover {
  position: relative;
  border-radius: 10px;
  border: 4px solid transparent;
  background: rgba(255, 255, 255, 1);
  padding: 10px;
  font-size: 14px;
  color: black;
  background-clip: padding-box;
  box-sizing: border-box;
  width: 100%;
}

.input-container .custom-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.input-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 10px;
  padding: 3px;
  background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color));
}

.input-container .custom-input:focus {
  outline: none;
}
</style>