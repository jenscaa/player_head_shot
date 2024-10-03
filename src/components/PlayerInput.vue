<script setup>
import { ref, computed } from 'vue';
import CustomLi from "./CustomLi.vue";
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
  disabled: {
    type: Boolean,
    required: true
  },
  playerList: {
    type: Array,
    default: () => []
  }

});

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
  } else {
    selectSuggestion(props.modelValue)
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
            :disabled="disabled"
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
      <CustomLi v-for="(item, index) in playerList"
                :key="index"
                :class="{ 'highlighted': index === highlightedIndex }"
                @click="selectSuggestion(item.name)"
                :name="item.name"
                :rating="item.rating"
      >
      </CustomLi>
    </ul>
  </div>
</template>

<style scoped>

label {
  color: white;
  font-size: 16px;
  font-weight: bold;
}

.input-label-container {
  display: grid;
  grid-template-rows: auto;
  gap: 5px;
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
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  font-size: 14px;
  color: black;
  background-clip: padding-box; /* Ensures that the background doesn't overlap the border */
  box-sizing: border-box; /* Ensures padding and border are included in the element’s size */
  width: 100%; /* This makes the input expand to the parent's full width */
  transition: background-color 150ms ease-in-out;
}

.input-container .player-input:hover {
  position: relative;
  border-radius: 10px; /* Adjust this if you want a different radius */
  border: 4px solid transparent; /* Transparent border */
  background: rgba(255, 255, 255, 1);
  padding: 10px;
  font-size: 14px;
  color: black;
  background-clip: padding-box; /* Ensures that the background doesn't overlap the border */
  box-sizing: border-box; /* Ensures padding and border are included in the element’s size */
  width: 100%; /* This makes the input expand to the parent's full width */
}

.input-container .player-input:disabled {
  opacity: 0.7; /* Make the button semi-transparent */
  cursor: not-allowed; /* Show a "not-allowed" cursor */
  box-shadow: none; /* Remove the hover box-shadow effect */
  transform: none; /* Prevent hover scaling */
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
  position: relative; /* Important: Ensures suggestions list is positioned correctly */
  justify-content: center;
  align-items: center;
  width: 80%;
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ff9a5a;
  border-radius: 5px;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  position: absolute;
  width: 100%;
  z-index: 1000; /* Ensure this is above other elements */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Optional: Add shadow for better visibility */
}

.suggestions-list li {
  padding: 8px;
  cursor: pointer;
}

.suggestions-list li.highlighted {
  background: linear-gradient(to bottom right, #EF4765, #FF9A5A);
  color: white;
}
</style>
