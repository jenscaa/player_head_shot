<script setup>
import { ref, computed } from 'vue';
const emit = defineEmits(['inputChangeEvent', 'selectedPlayerEvent']);
const props = defineProps({
  label: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: ""
  },
  inputId: {
    type: String,
    required: true
  },
  modelValue: {},
  required: {
    type: Boolean,
    default: false
  },
  playerList: {
    type: Array,
    default: () => []
  }

});

// Sample list of suggestions
const suggestions = ref([
  'Lionel Messi',
  'Cristiano Ronaldo',
  'Kylian Mbappé',
  'Neymar Jr',
  'Kevin De Bruyne',
  'Robert Lewandowski',
  'Mohamed Salah'
]);

// State for search query, highlighted index, and showSuggestions flag
const highlightedIndex = ref(-1); // No suggestion highlighted initially
const showSuggestions = ref(false); // Initially, the suggestions list is hidden


// Handle keyboard navigation (Arrow Down)
const onArrowDown = () => {
  if (highlightedIndex.value < props.playerList.length - 1) {
    highlightedIndex.value++;
  } else {
    highlightedIndex.value = 0; // Loop back to the first suggestion
  }
};

// Handle keyboard navigation (Arrow Up)
const onArrowUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
  } else {
    highlightedIndex.value = props.playerList.length - 1; // Loop back to the last suggestion
  }
};

// Select suggestion when Enter key is pressed
const onEnter = () => {
  if (highlightedIndex.value >= 0) {
    selectSuggestion(props.playerList[highlightedIndex.value].name);
  }
};

// Select suggestion (can be triggered by mouse click or Enter key)
const selectSuggestion = (suggestion) => {
  console.log("Suggestion ", suggestion);
  emit('selectedPlayerEvent', suggestion)
  hideSuggestions(); // Hide the suggestions list after selection
};

// Hide suggestions
const hideSuggestions = () => {
  showSuggestions.value = false; // Hide the suggestions list
};

const onInputEvent = (event) => {
  highlightedIndex.value = -1; // Reset highlighted index when typing
  showSuggestions.value = true; // Show the suggestions list
  emit('inputChangeEvent', event.target.value)
}
</script>

<template>
  <div class="search-container">

    <div class="input-label-container">
      <label :for="inputId">{{ label }}</label>
      <div class="input-container">
        <input
            :id="inputId"
            type="text"
            :value="modelValue"
            :placeholder="placeholder"
            :required="required"
            class="player-input"
            @input="onInputEvent"
            @keydown.down.prevent="onArrowDown"
            @keydown.up.prevent="onArrowUp"
            @keydown.enter.prevent="onEnter"
            @keydown.esc="hideSuggestions"
        />
      </div>
    </div>

    <!-- Suggestions List -->
    <ul v-if="showSuggestions && playerList.length" class="suggestions-list">
      <li
          v-for="(item, index) in playerList"
          :key="index"
          :class="{ 'highlighted': index === highlightedIndex }"
          @click="selectSuggestion(item.name)"
      >
        <div class="li-container">
          <p>{{ item.name }}</p>
          <p>{{ item.rating }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>

.input-label-container {
  display: grid;
  grid-template-rows: auto;
}

.input-container {
  position: relative; /* Allows the pseudo-element to be positioned relative to the input */
  display: inline-block;
  width: 100%; /* This makes the input expand to the parent's full width */
}

.input-container .player-input {
  position: relative;
  z-index: 1; /* Ensures the input element is above the gradient border */
  border-radius: 10px; /* Adjust this if you want a different radius */
  border: 4px solid transparent; /* Transparent border */
  background: white; /* Background color of the input field */
  padding: 10px;
  font-size: 16px;
  color: black;
  background-clip: padding-box; /* Ensures that the background doesn't overlap the border */
  box-sizing: border-box; /* Ensures padding and border are included in the element’s size */
  width: 100%; /* This makes the input expand to the parent's full width */
}

.input-container::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 10px; /* Same border radius as input */
  padding: 3px; /* Matches the border width */
  background: linear-gradient(to bottom right, #EF4765, #FF9A5A); /* Gradient border */
  z-index: 0; /* Ensures the gradient border is behind the input */
}

.input-container .player-input:focus {
  outline: none; /* Optional: Remove default focus outline */
}


.search-container {
  position: relative;
  width: 300px;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  position: absolute;
  width: 100%;
}

.suggestions-list li {
  padding: 8px;
  cursor: pointer;
}

.suggestions-list li.highlighted {
  background-color: #007BFF;
  color: white;
}
</style>