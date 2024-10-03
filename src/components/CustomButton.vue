<script setup>
const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  buttonId: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    required: false
  }
})
</script>

<template>
  <button :id="buttonId" class="btn" :disabled="disabled">
    {{ text }}
  </button>
</template>

<style scoped>

.btn {
  justify-self: center;
  width: 150px;
  height: 40px;
  background: linear-gradient(to bottom right, #EF4765, #FF9A5A);
  border-radius: 20px;
  border: none;
  padding: 10px;
  margin: 20px 0;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: white;
  transition: transform 150ms ease-in-out;
}

.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.btn:disabled {
  opacity: 0.5; /* Make the button semi-transparent */
  cursor: not-allowed; /* Show a "not-allowed" cursor */
  box-shadow: none; /* Remove the hover box-shadow effect */
  transform: none; /* Prevent hover scaling */
}
</style>