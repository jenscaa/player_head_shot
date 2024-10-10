<script setup>
import {onMounted, ref} from "vue";

const emit = defineEmits(['themeColorChange'])
const props = defineProps({
  primaryColor: {
    type: String,
    required: true
  },
  secondaryColor: {
    type: String,
    required: true
  }
})

const buttonRef = ref();

onMounted(() => {
  const button = buttonRef.value;
  button.style.setProperty('background',`linear-gradient(to bottom right, ${props.primaryColor}, ${props.secondaryColor})`)
  console.log("Reached")
});

const changeThemeColor = () => {
  emit('themeColorChange', props.primaryColor, props.secondaryColor)
}
</script>

<template>
  <button ref="buttonRef" class="color-theme-button" @click="changeThemeColor"></button>
</template>

<style scoped>
:root {
  --primary-color: #EF4765;
  --secondary-color: #FF9A5A;
}

.color-theme-button {
  min-width: max-content;
  min-height: max-content;
  position: relative;
  z-index: 1;
  background: linear-gradient(to bottom right, #EF4765, #FF9A5A);
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 10px; /* Round the corners of the button */
  border: 2px solid var(--secondary-color); /* Transparent border to keep the space for the gradient */
  background-clip: padding-box; /* Ensure background does not overlap with the border */
  transition: all 0.3s ease;
  cursor: pointer;
}

/* Hover effect: fills the button with the gradient */
.color-theme-button:hover {
  transform: scale(1.1);
  color: white;
}
</style>