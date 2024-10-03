<script setup>
import {ref, watch} from "vue";

const props = defineProps({
  logList: {
    type: Array,
    default: () => []
  }
})

</script>

<template>
  <textarea class="log" rows="7" cols="50" readonly>{{ logList.join('\n') }}
  </textarea>
</template>

<style scoped>
.log {
  padding: 0;
  margin: 15px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border-radius: 4px;
}
</style>