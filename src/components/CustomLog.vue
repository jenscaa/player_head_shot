<script setup>
import {ref, watch} from "vue";

const props = defineProps({
  logList: {
    type: Array,
    default: () => []
  }
})

const textAreaLog = ref(null);

// Watch for changes in logList and auto-scroll to the bottom
watch(() => props.logList, () => {
  if (textAreaLog.value) {
    // Update the scrollTop to ensure it scrolls to the bottom
    textAreaLog.value.scrollTop = textAreaLog.value.scrollHeight;
  }
}, { deep: true });

</script>

<template>
  <textarea ref="textAreaLog" class="log" rows="7" cols="50" readonly>{{ logList.join('\n') }}
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