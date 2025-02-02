<script setup>
/** Imports Vue's `ref` and `watch` functions for reactive properties and side effect handling.*/
import {ref, watch} from "vue";

/**
 * Defines the props that the component expects:
 *
 * @prop {Array} logList - An array containing log messages. Defaults to an empty array if not provided.
 */
const props = defineProps({
    logList: {
        type: Array,
        default: () => []
    }
});

/**
 * A reactive reference for the textarea element that displays the logs.
 *
 * @type {Ref<null|HTMLElement>}
 */
const textAreaLog = ref(null);

/**
 * Watches for changes in the 'logList' prop. When the log list is updated,
 * it automatically scrolls the 'textAreaLog' to the bottom to ensure the most recent log is visible.
 *
 * @watch logList - Deep watches the log list for changes.
 */
watch(() => props.logList, () => {
    if (textAreaLog.value) {
        // Update the scrollTop to ensure it scrolls to the bottom
        textAreaLog.value.scrollTop = textAreaLog.value.scrollHeight;
    }
}, {deep: true});

/**
 * Generates the current date in the format DD.MM.YYYY.
 *
 * @returns {string} - The formatted current date as a string.
 */
const getFormattedDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
};

/**
 * Initiates the download of the 'logList' as a text file. The file is named based on the current date,
 * and the content is the 'logList' array joined into a single string with new lines separating each entry.
 *
 * Steps:
 * - Convert 'logList' into a string with each log entry on a new line.
 * - Create a Blob from the log content, generate a download link, and programmatically click the link to trigger the download.
 */
const downloadLog = () => {
    const logContent = props.logList.join("\n");  // Convert logList array to a string
    const blob = new Blob([logContent], {type: "text/plain"});  // Create a Blob object representing the data as a text file
    const date = getFormattedDate();  // Get the current date
    const filename = `log_${date}.txt`;  // Generate the filename with the current date
    const link = document.createElement("a");  // Create a temporary anchor element to download the file
    link.href = URL.createObjectURL(blob);  // Create a URL for the Blob and set it as the href for the anchor element
    link.download = filename;  // Set the download attribute with the dynamically generated filename
    document.body.appendChild(link);  // Append the anchor to the document body
    link.click();  // Programmatically click the link to trigger the download
    document.body.removeChild(link);  // Remove the link after the download
};

</script>

<template>
    <div class="log-container">
        <textarea ref="textAreaLog" class="log" rows="7" cols="50" readonly>{{ logList.join('\n') }}</textarea>
        <label @click="downloadLog">{{ 'Download log \u2B73' }}</label>
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