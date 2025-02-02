<script setup>
/** Imports Vue's `onMounted` and `ref` functions for reactive properties and on mounting rendering.*/
import {onMounted, ref} from "vue";

/**
 * Defines the emitted event 'themeColorChange', which notifies the parent component
 * when the theme colors (primary and secondary) are changed.
 */
const emit = defineEmits(['themeColorChange']);

/**
 * Defines the props that the component expects:
 *
 * @property {string} primaryColor - The primary color for the theme. This prop is required.
 * @property {string} secondaryColor - The secondary color for the theme. This prop is required.
 */
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

/**
 * A reactive reference to the button element.
 *
 * @type {Ref<HTMLElement|null>}
 */
const buttonRef = ref();

/**
 * Lifecycle hook that runs when the component is mounted. It applies a linear gradient background to the button
 * based on the provided `primaryColor` and `secondaryColor` props.
 */
onMounted(() => {
    const button = buttonRef.value;
    button.style.setProperty('background', `linear-gradient(to bottom right, ${props.primaryColor}, ${props.secondaryColor})`)
    console.log("Reached")
});

/**
 * Emits the 'themeColorChange' event with the current `primaryColor` and `secondaryColor` values.
 */
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
    border-radius: 10px;
    border: 2px solid var(--secondary-color);
    background-clip: padding-box;
    transition: all 0.3s ease;
    cursor: pointer;
}

.color-theme-button:hover {
    transform: scale(1.1);
    color: white;
}
</style>