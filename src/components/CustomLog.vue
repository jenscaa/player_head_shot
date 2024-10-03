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

// Function to generate the current date in the format DD.MM.YYYY
const getFormattedDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
};

const downloadLog = () => {
  // Convert logList array to a string with each element on a new line
  const logContent = props.logList.join("\n");
  // Create a Blob object representing the data as a text file
  const blob = new Blob([logContent], { type: "text/plain" });
  // Generate the filename with the current date
  const date = getFormattedDate();
  const filename = `log_${date}.txt`;
  // Create a temporary anchor element to download the file
  const link = document.createElement("a");
  // Create a URL for the Blob and set it as the href for the anchor element
  link.href = URL.createObjectURL(blob);
  // Set the download attribute with the dynamically generated filename
  link.download = filename;
  // Append the anchor to the document body (it's necessary to append before clicking in some browsers)
  document.body.appendChild(link);
  // Programmatically click the link to trigger the download
  link.click();
  // Remove the link after the download
  document.body.removeChild(link);
};

</script>

<template>
  <div class="log-container">
    <textarea ref="textAreaLog" class="log" rows="7" cols="50" readonly>{{ logList.join('\n') }}</textarea>
    <label @click="downloadLog">{{'Download log \u2B73'}}</label>
  </div>
</template>

<style scoped>

.log-container {
  display: grid;
  grid-template-rows: auto;
}

.log {
  padding: 0;
  margin: 15px 15px 5px 15px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border-radius: 4px;
}

label {
  justify-self: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
}
</style>