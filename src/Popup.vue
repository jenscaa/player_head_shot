<script setup>
import { ref } from 'vue';
import CustomInput from "./components/CustomInput.vue";
import CustomButton from "./components/CustomButton.vue";
import CustomSlider from "./components/CustomSlider.vue";
import PlayerInput from "./components/PlayerInput.vue";
import AutoListCheckBox from "./components/AutoListCheckBox.vue";
import SnipingResults from "./components/SnipingResults.vue";
import CustomLog from "./components/CustomLog.vue";

const playerName = ref('');
const nameList = ref([]);
const searchLimit = ref();
const maxBuyNow = ref();
const autoListChecked = ref(false);
const searches = ref(0);
const buys = ref(0);
const fails = ref(0);
const logList = ref([]);

const onInputChange = async (newValue) => {
  playerName.value = newValue
  let [tab] = await chrome.tabs.query({
    active: true, currentWindow: true
  });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'inputChange', value: playerName.value });
  } else {
    console.log("No active tab found. ")
  }
}

const onPlayerSelected = async (newValue) => {
  playerName.value = newValue
  let [tab] = await chrome.tabs.query({
    active: true, currentWindow: true
  });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'playerSelected', value: playerName.value });
  } else {
    console.log("No active tab found. ")
  }
}

const onCheckedChanged = (newValue) => {
  autoListChecked.value = newValue
}

const startSearch = async () => {
  let [tab] = await chrome.tabs.query({
    active: true, currentWindow: true
  });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'startSearch', value: searchLimit });
  } else {
    console.log("No actiive tab found. ")
  }
}

// TODO remove this one
const logAllElements = async () => {
  // Current active tab
  let [tab] = await chrome.tabs.query({
    active: true, currentWindow: true
  });

  console.log(tab.url)

  // Send a message to the content script to access elements
  if (tab) {
    chrome.tabs.sendMessage(tab.id, { action: 'logElements' });
  } else {
    console.log("No active tab found.");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateNames') {
    console.log("Names received from content script:", request.list);

    // You can update your popup UI here with the received names
    nameList.value = request.list; // This will be the array of names

    console.log(request.list);
    console.log("____________________________________________________")
    console.log(nameList.value)

    nameList.value.forEach(item => {
      console.log(item.name, item.rating)
    });
    sendResponse({ success: true, message: 'successful'})
  }
});

const deleteThisFunction = () =>{
  logList.value.push("Hello there");
  console.log(logList.value)
}

</script>

<template>
  <div class="popup-wrapper">
    <div class="popup-container">
      <h1 class="title">PlayerHeadShot</h1>
      <div class="input-container">
        <PlayerInput input-id="player-input"
                     label="Player Name"
                     v-model="playerName"
                     placeholder="Search for a player"
                     :playerList="nameList"
                     @inputChangeEvent="onInputChange"
                     @selectedPlayerEvent="onPlayerSelected"
        >
        </PlayerInput>
        <div class="custom-button-container">
          <CustomInput input-id="search-limit-input"
                       label="Search Limit"
                       v-model="searchLimit"
                       placeholder="No limit"> <!-- Dont use max if you dont want to get banned -->
          </CustomInput>
          <CustomInput input-id="max-buy-now-input"
                       label="Max Buy Now"
                       v-model="maxBuyNow"
                       max="15000000"
                       placeholder="max buy now"> <!-- Dont use max if you dont want to get banned -->
          </CustomInput>
        </div>
        <AutoListCheckBox @checkChangedEvent="onCheckedChanged"></AutoListCheckBox>
        <div v-if="autoListChecked" class="custom-button-container">
          <CustomInput input-id="min-list-price-input"
                       label="Min list price"
                       max="15000000"
                       placeholder="max buy now"> <!-- Dont use max if you dont want to get banned -->
          </CustomInput>
          <CustomInput input-id="max-buy-now-input"
                       label="Max Buy Now"
                       v-model="maxBuyNow"
                       max="15000000"
                       placeholder="max buy now"> <!-- Dont use max if you dont want to get banned -->
          </CustomInput>
        </div>
        <CustomSlider></CustomSlider>
      </div>
      <div class="button-container">
        <CustomButton button-id="stop-button" text="Stop"></CustomButton>
        <CustomButton button-id="Search-button" text="Search"></CustomButton>
      </div>
      <SnipingResults :fails="fails" :buys="buys" :searches="searches"></SnipingResults>
      <CustomLog :logList="logList"></CustomLog>
      <button @click="deleteThisFunction">Press me</button>
      <button @click="logAllElements">Log All</button>
      <button @click="startSearch">Start</button>
    </div>
  </div>
</template>

<style scoped>

.title {
  text-align: center;
  align-self: center;
  justify-content: center;
  color: white;
  margin: 0;
  padding: 20px;
}

.popup-wrapper {
  font-family: Arial, sans-serif;
  background: rgba(0, 0, 0, 0.3);
}

.popup-container {
  display: grid;
  align-items: center;
}

.input-container {
  display: flex; /* Ensure items are laid out in a row or column */
  flex-direction: column; /* Stack elements vertically */
  gap: 15px; /* Increase gap between input components */
  align-items: center;
}

.custom-button-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-items: center;
  padding: 0 18px;
}

.button-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
</style>
