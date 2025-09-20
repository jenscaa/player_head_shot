<script setup>
/**
 * Imports `ref` and from Vue to manage reactive data and properties.
 */
import {ref} from 'vue';
import CustomLi from "./CustomLi.vue";

/**
 * Defines emitted events:
 * - `inputChangeEvent`: Triggered when the input field value changes.
 * - `selectedPlayerEvent`: Triggered when a player is selected from the suggestions.
 */
const emit = defineEmits(['inputChangeEvent', 'selectedPlayerEvent']);

/**
 * Defines the props that the component expects:
 *
 * @prop {string} label - The label text for the input field. Defaults to an empty string if not provided.
 * @prop {string} placeholder - The placeholder text for the input field. Defaults to an empty string.
 * @prop {string} inputId - A unique identifier for the input field. This prop is required.
 * @prop {*} modelValue - The current value of the input field, used for two-way binding.
 * @prop {boolean} [required=false] - A flag indicating whether the input is required. Defaults to `false`.
 * @prop {boolean} disabled - A flag indicating whether the input field is disabled. This prop is required.
 * @prop {Array<Object>} playerList - A list of players used to populate the suggestions. Defaults to an empty array.
 */
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

/**
 * A reactive reference for the index of the currently highlighted suggestion during keyboard navigation.
 * Initially set to -1 (no suggestion highlighted).
 *
 * @type {Ref<number>}
 */
const highlightedIndex = ref(-1);

/**
 * A reactive reference controlling the visibility of the suggestions list.
 * Initially set to `false` (suggestions list is hidden).
 *
 * @type {Ref<boolean>}
 */
const showSuggestions = ref(false);

/**
 * Handles navigation through the suggestion list using the down arrow key.
 * Moves the highlight to the next suggestion, looping back to the first if at the end.
 */
const onArrowDown = () => {
    if (highlightedIndex.value < props.playerList.length - 1) {
        highlightedIndex.value++;
    } else {
        highlightedIndex.value = 0; // Loop back to the first suggestion
    }
};

/**
 * Handles navigation through the suggestion list using the up arrow key.
 * Moves the highlight to the previous suggestion, looping back to the last if at the beginning.
 */
const onArrowUp = () => {
    if (highlightedIndex.value > 0) {
        highlightedIndex.value--;
    } else {
        highlightedIndex.value = props.playerList.length - 1; // Loop back to the last suggestion
    }
};

/**
 * Handles the selection of a suggestion when the Enter key is pressed.
 * If a suggestion is highlighted, it is selected. If not, the current input value is used.
 */
const onEnter = () => {
    if (highlightedIndex.value >= 0) {
        selectSuggestion(props.playerList[highlightedIndex.value].name);
    } else {
        selectSuggestion(props.modelValue)
    }
};

/**
 * Handles the selection of a suggestion. This can be triggered by a mouse click or pressing Enter.
 * The selected suggestion is emitted through the 'selectedPlayerEvent', and the suggestions list is hidden.
 *
 * @param {string} suggestion - The name of the selected player.
 */
const selectSuggestion = (suggestion) => {
    console.log("Suggestion ", suggestion);
    emit('selectedPlayerEvent', suggestion)
    hideSuggestions(); // Hide the suggestions list after selection
};

/**
 * Hides the suggestions list by setting `showSuggestions` to `false`.
 */
const hideSuggestions = () => {
    showSuggestions.value = false; // Hide the suggestions list
};

/**
 * Handles the input change event. When the user types, the highlighted suggestion is reset,
 * the suggestions list is shown, and the new input value is emitted via 'inputChangeEvent'.
 *
 * @param {Event} event - The input event triggered by typing in the input field.
 */
const onInputEvent = (event) => {
    highlightedIndex.value = -1; // Reset highlighted index when typing
    showSuggestions.value = true; // Show the suggestions list
    emit('inputChangeEvent', event.target.value); // Emit the new input value
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
:root {
  --primary-color: #3091ae;
  --secondary-color: #5b51ae;
}

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
    position: relative;
    display: inline-block;
    width: 100%;
}

.input-container .player-input {
    position: relative;
    z-index: 1;
    border-radius: 10px;
    border: 4px solid transparent;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px;
    font-size: 14px;
    color: black;
    background-clip: padding-box;
    box-sizing: border-box;
    width: 100%;
    transition: background-color 150ms ease-in-out;
}

.input-container .player-input:hover {
    position: relative;
    border-radius: 10px;
    border: 4px solid transparent;
    background: rgba(255, 255, 255, 1);
    padding: 10px;
    font-size: 14px;
    color: black;
    background-clip: padding-box;
    box-sizing: border-box;
    width: 100%;
}

.input-container .player-input:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

.input-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 10px;
    padding: 3px;
    background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color));
    z-index: 0;
}

.input-container .player-input:focus {
    outline: none;
}

.search-container {
    position: relative;
    justify-self: center;
    justify-content: center;
    align-items: center;
    width: 80%;
}

.suggestions-list {
    list-style: none;
    padding: 0;
    margin: 0;
    border: 1px solid var(--secondary-color);
    border-radius: 5px;
    max-height: 200px;
    overflow-y: auto;
    background-color: white;
    position: absolute;
    width: 100%;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.suggestions-list li {
    padding: 8px;
    cursor: pointer;
}

.suggestions-list li.highlighted {
    background: linear-gradient(to bottom right, var(--primary-color), var(--secondary-color));
    color: white;
}
</style>
