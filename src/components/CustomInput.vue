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
  }
});

const onInputEvent = (event) => {
  emit('inputChangeEvent', event.target.value)
}
</script>

<template>
  <div class="input-container">
    <label :for="inputId">{{ label }}</label>
    <input :id="inputId"
           @input="onInputEvent"
           :type="type"
           :placeholder="placeholder"
           :required="required"
           :max="max"
           :min="min"
           :value="modelValue"
    />
  </div>
</template>

<style scoped>
.input-container {
  display: grid;
  grid-template-rows: auto;
}
</style>