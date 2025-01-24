<script setup>
/**
 * Defines the props that the component expects:
 *
 * @prop {string} text - The text to be displayed on the button. Defaults to an empty string if not provided.
 * @prop {string} buttonId - A unique identifier for the button. This prop is required.
 * @prop {boolean} [disabled=false] - A Boolean indicating whether the button is disabled. Defaults to `false` if not provided.
 */
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
:root {
    --primary-color: #EF4765;
    --secondary-color: #FF9A5A;
}

.btn {
    justify-self: center;
    width: 150px;
    height: 40px;
    background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color));
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
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}
</style>