<script setup>
/**
 * Defines the props that the component expects:
 *
 * @prop {string} name - The name of the player. This prop is required.
 * @prop {string} rating - The rating of the player. This prop is required.
 */
const props = defineProps({
    name: {
        type: String,
        required: true
    },
    rating: {
        type: String,
        required: true
    }
})
</script>

<template>
    <li>
        <div class="li-container">
            <p class="name">{{ name }}</p>
            <p class="rating">{{ rating }}</p>
        </div>
    </li>
</template>

<style scoped>
:root {
  --primary-color: #3091ae;
  --secondary-color: #5b51ae;
}

li {
    border-bottom: 1px solid var(--secondary-color);
}

li:hover {
    color: white;
    background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color));
}

.li-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

p {
    margin: 0;
    padding: 0;
}

.name {
    text-align: left;
}

.rating {
    text-align: right;
}
</style>