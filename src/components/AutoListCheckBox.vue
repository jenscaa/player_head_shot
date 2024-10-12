<script setup>
/**
 * Defines the emitted event 'checkChangedEvent', which notifies the parent component
 * when the checkbox state changes.
 */
const emit = defineEmits(['checkChangedEvent']);

/**
 * Defines the props that the component expects:
 *
 * @prop {boolean} checked - The current checked state of the checkbox.
 */
const props = defineProps({
  checked: {
    type: Boolean,
    required: true
  }
});

/**
 * Handles the checkbox state change event. When the checkbox is checked or unchecked,
 * it emits the 'checkChangedEvent' to notify the parent component of the new state.
 *
 * @param {Event} event - The checkbox change event triggered by user interaction.
 */
const onCheckedChange = (event) => {
  const newValue = event.target.checked;
  emit('checkChangedEvent', newValue);
}
</script>

<template>
  <div class="auto-list-container">
    <label class="label">List after buy</label>
    <div>
      <input id="checkbox" type="checkbox" class="custom-checkbox" :checked="checked" @change="onCheckedChange">
      <label class="checkbox-label" for="checkbox"></label>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #EF4765;
  --secondary-color: #FF9A5A;
}

.auto-list-container {
  justify-self: center;
  display: flex;
  align-items: center;
  height: 24px;
  gap: 7px;
}

.label {
  align-self: center;
  color: white;
  text-align: center;
  font-weight: bold;
}

.custom-checkbox {
  display: none;
  margin: 0;
}

.auto-list-container .checkbox-label::before {
  content: "";
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: white;
  box-shadow: inset 0 0 0 1px #000;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.custom-checkbox:checked + .checkbox-label::before {
  content: "✔";
  color: white;
  font-size: 14px;
  text-align: center;
  line-height: 20px;
  background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color));
  cursor: pointer;
}
</style>