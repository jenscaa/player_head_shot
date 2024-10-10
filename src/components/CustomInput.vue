<script setup>
const emit = defineEmits(['inputChangeEvent']);
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
  position: relative; /* Allows the pseudo-element to be positioned relative to the input */
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
  border-radius: 10px; /* Adjust this if you want a different radius */
  border: 4px solid transparent; /* Transparent border */
  background: rgba(255, 255, 255, .9);; /* Background color of the input field */
  padding: 10px;
  font-size: 14px;
  color: black;
  background-clip: padding-box; /* Ensures that the background doesn't overlap the border */
  box-sizing: border-box; /* Ensures padding and border are included in the element’s size */
  width: 100%; /* This makes the input expand to the parent's full width */
  transition: background-color 150ms ease-in-out;
}

.input-container .custom-input:hover {
  position: relative;
  border-radius: 10px; /* Adjust this if you want a different radius */
  border: 4px solid transparent; /* Transparent border */
  background: rgba(255, 255, 255, 1);
  padding: 10px;
  font-size: 14px;
  color: black;
  background-clip: padding-box; /* Ensures that the background doesn't overlap the border */
  box-sizing: border-box; /* Ensures padding and border are included in the element’s size */
  width: 100%; /* This makes the input expand to the parent's full width */
}

.input-container .custom-input:disabled {
  opacity: 0.7; /* Make the button semi-transparent */
  cursor: not-allowed; /* Show a "not-allowed" cursor */
  box-shadow: none; /* Remove the hover box-shadow effect */
  transform: none; /* Prevent hover scaling */
}

.input-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 10px; /* Same border radius as input */
  padding: 3px; /* Matches the border width */
  background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color)); /* Default value */
  /* Gradient border */
  /*ALT  background: linear-gradient(to bottom right, #3bff72, #81eee0); */
}

.input-container .custom-input:focus {
  outline: none; /* Optional: Remove default focus outline */
}

</style>