<script setup>
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

li {
  border-bottom: 1px solid #FF9A5A;
}

li:hover {
  color: white;
  background: linear-gradient(to bottom right, #EF4765, #FF9A5A);
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