<script setup>
const emit = defineEmits(['checkChangedEvent'])
const onCheckedChange = (event) => {
  const newValue = event.target.checked;
  emit('checkChangedEvent', newValue);
}


</script>

<template>
  <div class="auto-list-container">
    <label class="label">List after buy</label>
    <div>
      <input id="checkbox" type="checkbox" class="custom-checkbox" @change="onCheckedChange">
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
  align-items: center; /* Align label and checkbox vertically */
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
  display: none; /* Hide the original checkbox */
  margin: 0;
}

.auto-list-container .checkbox-label::before {
  content: "";
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: white; /* Apply the solid color */
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
  background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color));; /* Same color when checked */
  cursor: pointer;
}

</style>