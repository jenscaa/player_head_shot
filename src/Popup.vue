<script setup>
import {onMounted, ref} from 'vue';
import CustomInput from "./components/CustomInput.vue";
import CustomButton from "./components/CustomButton.vue";
import CustomSlider from "./components/CustomSlider.vue";
import PlayerInput from "./components/PlayerInput.vue";
import AutoListCheckBox from "./components/AutoListCheckBox.vue";
import SnipingResults from "./components/SnipingResults.vue";
import CustomLog from "./components/CustomLog.vue";
import ThemeColorButton from "./components/ThemeColorButton.vue";

const running = ref(false);
const advancedSettings = ref(false);
const playerName = ref('');
const nameList = ref([]);
const searchLimit = ref();
const maxBuyNow = ref();
const minListPrice = ref();
const maxListPrice = ref();
const searchResultDelay = ref();
const confirmDialogDelay = ref();
const confirmPurchaseDelay = ref();
const rpm = ref(60);
const autoListChecked = ref(false);
const searches = ref(0);
const buys = ref(0);
const fails = ref(0);
const logList = ref([]);

const extensionRef = ref();
const profitRef = ref();

console.log("Current URL:", window.location.href); // Full URL of the current page
console.log("Current Pathname:", window.location.pathname); // Pathname (after the domain)


const sniperHeadShotAudio = new Audio('../assets/SniperHeadShot.MP3')
const sniperMissAudio = new Audio('../assets/SniperMiss.MP3')


const onPlayerInputChange = async (newValue) => {
  playerName.value = newValue
  let [tab] = await chrome.tabs.query({
    active: true, currentWindow: true
  });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {action: 'inputChange', value: playerName.value});
  } else {
    console.log("No active tab found. ")
  }
}

const onSearchLimitChange = (newValue) => {
  searchLimit.value = newValue
}

const onMaxBuyNowChange = async (newValue) => {
  maxBuyNow.value = newValue
  let [tab] = await chrome.tabs.query({
    active: true, currentWindow: true
  });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {action: 'maxBuyNowChange', value: maxBuyNow.value});
  } else {
    console.log("No active tab found. ")
  }
  if (maxBuyNow.value && maxListPrice.value) {
    const profitParagraph =  profitRef.value
    const profit = eaAfterTax(maxBuyNow.value, maxListPrice.value);
    if (profit > 0) {
      profitParagraph.style.setProperty('color', 'green');
    } else if (profit < 0) {
      profitParagraph.style.setProperty('color', 'red');
    } else {
      profitParagraph.style.setProperty('color', 'white');
    }
  }
}

const onPlayerSelected = async (newValue) => {
  playerName.value = newValue
  let [tab] = await chrome.tabs.query({
    active: true, currentWindow: true
  });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {action: 'playerSelected', value: playerName.value});
  } else {
    console.log("No active tab found. ")
  }
}

const onAdvancedSettingsPressed = () => {
  advancedSettings.value = !advancedSettings.value;
}

const onCheckedChanged = (newValue) => {
  autoListChecked.value = newValue
}

const onMinListPriceChange = (newValue) => {
  minListPrice.value = newValue;
}

const onMaxListPriceChange = (newValue) => {
  maxListPrice.value = newValue;
  setTimeout(() => {
    if (maxBuyNow.value && maxListPrice.value) {
      const profitParagraph =  profitRef.value
      const profit = eaAfterTax(maxBuyNow.value, maxListPrice.value);
      if (profit > 0) {
        profitParagraph.style.setProperty('color', 'chartreuse');
        console.log(1)
      } else if (profit < 0) {
        profitParagraph.style.setProperty('color', '#ef4765');
        console.log(2)
      } else {
        profitParagraph.style.setProperty('color', 'white');
        console.log(3)
      }
    }
  }, 50)
}

const onSliderValueChange = (newValue) => {
  rpm.value = newValue;
}

const onSearchResultDelayChange = (newValue) => {
  searchResultDelay.value = newValue;
}

const onConfirmDialogDelayChange = (newValue) => {
  confirmDialogDelay.value = newValue;
}

const onCheckPurchaseDelayChange = (newValue) => {
  confirmPurchaseDelay.value = newValue;
}

const eaAfterTax = (buyPrice, listPrice) => {
  const profit = listPrice * 0.95 - buyPrice;
  return Math.round(profit);
};


const startSearch = async () => {
  running.value = true;
  console.log(searchLimit.value)
  let [tab] = await chrome.tabs.query({
    active: true, currentWindow: true
  });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'startSearch',
      searchLimit: searchLimit.value,
      rpm: rpm.value,
      checked: autoListChecked.value,
      minList: minListPrice.value,
      maxList: maxListPrice.value,
      searchResultDelay: searchResultDelay.value,
      confirmDialogDelay: confirmDialogDelay.value,
      confirmPurchaseDelay: confirmPurchaseDelay.value
    });
    logList.value.push(`[${new Date().toLocaleString()}] Bot started`);
  } else {
    console.log("No actiive tab found. ")
  }
}

const stopSearch = async () => {
  running.value = false;
  let [tab] = await chrome.tabs.query({
    active: true, currentWindow: true
  });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {action: 'stopSearch'});
  } else {
    console.log("No actiive tab found. ")
  }
}
/*ALT  background: linear-gradient(to bottom right, #3bff72, #81eee0); */
const changeThemeColors = (primaryColor, secondaryColor) => {
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.documentElement.style.setProperty('--secondary-color', secondaryColor);
};

onMounted(() => {
  changeThemeColors('#e875d1', '#004aff');
});

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
    sendResponse({success: true, message: 'successful'})
  } else if (request.action === 'finishedSearch') {
    running.value = false
    logList.value.push(`[${new Date().toLocaleString()}] Bot stopped`);
    sendResponse({success: true, message: 'successful'})
  } else if (request.action === 'reachedSearchLimit') {
    running.value = false
    logList.value.push(`[${new Date().toLocaleString()}] Bot stopped by search limit ${searchLimit.value}`);
    sendResponse({success: true, message: 'successful'})
  } else if (request.action === 'searched') {
    searches.value++;
    sendResponse({success: true, message: 'successful'})
  } else if (request.action === 'bought') {
    buys.value++;
    logList.value.push(`[${new Date().toLocaleString()}] Bought ${request.name} for ${request.price} coins`);
    sniperHeadShotAudio.play();
    sendResponse({success: true, message: 'successful'})
  } else if (request.action === 'listed') {
    logList.value.push(`[${new Date().toLocaleString()}] Listed ${request.name} for min ${request.minList} and max ${request.maxList} coins`);
  } else if (request.action === 'failed') {
    fails.value++;
    logList.value.push(`[${new Date().toLocaleString()}] Failed to buy ${request.name} for ${request.price} coins`);
    sniperMissAudio.play();
    sendResponse({success: true, message: 'successful'})
  }
});

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
                     :disabled="running"
                     @inputChangeEvent="onPlayerInputChange"
                     @selectedPlayerEvent="onPlayerSelected"
        >
        </PlayerInput>
        <div class="custom-button-container">
          <CustomInput input-id="search-limit-input"
                       label="Search Limit"
                       v-model="searchLimit"
                       :disabled="running"
                       :max="15000000"
                       :min="0"
                       @inputChangeEvent="onSearchLimitChange"
                       placeholder="No limit"> <!-- Dont use max if you dont want to get banned -->
          </CustomInput>
          <CustomInput input-id="max-buy-now-input"
                       label="Max Buy Now"
                       v-model="maxBuyNow"
                       :disabled="running"
                       :max="15000000"
                       :min="0"
                       @inputChangeEvent="onMaxBuyNowChange"
                       placeholder="Max buy now"> <!-- Dont use max if you dont want to get banned -->
          </CustomInput>
        </div>
        <AutoListCheckBox @checkChangedEvent="onCheckedChanged"></AutoListCheckBox>
        <div v-if="autoListChecked" class="custom-button-container">
          <CustomInput input-id="min-list-price-input"
                       label="Min list price"
                       :disabled="running"
                       v-model="minListPrice"
                       @inputChangeEvent="onMinListPriceChange"
                       :max="15000000"
                       :min="0"
                       placeholder="Min list price">
          </CustomInput>
          <CustomInput input-id="max-list-price-input"
                       label="Max list price"
                       :disabled="running"
                       v-model="maxListPrice"
                       @inputChangeEvent="onMaxListPriceChange"
                       :max="15000000"
                       :min="0"
                       placeholder="Max list price">
          </CustomInput>
        </div>
        <label v-if="maxBuyNow && maxListPrice" class="net-label">
          Profit: <p ref="profitRef" class="profit-p">{{ eaAfterTax(maxBuyNow, maxListPrice) }}</p>
        </label>
        <label @click="onAdvancedSettingsPressed" class="advanced-settings-label">{{ "Advanced settings \u2699" }}</label>
        <div v-if="advancedSettings" class="advanced-settings-container">
          <h2>Delay</h2>
          <hr>
          <div class="advanced-label-container">
            <label class="advanced-label description">If you are experiencing that the bot fails to purchase some times,
              or gets stuck, try to increase these delay metrics: </label>
          </div>
          <div class="advanced">
            <CustomInput input-id="wait-search-results-input"
                         :disabled="!advancedSettings"
                         v-model="searchResultDelay"
                         @inputChangeEvent="onSearchResultDelayChange"
                         :max="1000"
                         :min="0"
                         placeholder="Default 150 ms"
            ></CustomInput>
            <label class="advanced-label">Delay time for search results (milliseconds)</label>
          </div>
          <div class="advanced">
            <CustomInput input-id="wait-confirm-dialog-input"
                         :disabled="!advancedSettings"
                         v-model="confirmDialogDelay"
                         @inputChangeEvent="onConfirmDialogDelayChange"
                         :max="1000"
                         :min="0"
                         placeholder="Default 50 ms"
            ></CustomInput>
            <label class="advanced-label">Delay time for confirm dialog (milliseconds)</label>
          </div>
          <div class="advanced">
            <CustomInput input-id="wait-confirm-purchase-input"
                         :disabled="!advancedSettings"
                         v-model="confirmPurchaseDelay"
                         @inputChangeEvent="onCheckPurchaseDelayChange"
                         :max="1000"
                         :min="0"
                         placeholder="Default 500 ms"
            ></CustomInput>
            <label class="advanced-label">Delay time for purchase confirmation (milliseconds)</label>
          </div>
          <h2>Theme Color</h2>
          <hr>
          <div class="theme-color-container">
            <ThemeColorButton primary-color="#EF4765" secondary-color="#FF9A5A" @themeColorChange="changeThemeColors"/>
            <ThemeColorButton primary-color="#3bff72" secondary-color="#81eee0" @themeColorChange="changeThemeColors"/>
            <ThemeColorButton primary-color="#1628e5" secondary-color="#30ffe2" @themeColorChange="changeThemeColors"/>
            <ThemeColorButton primary-color="#e875d1" secondary-color="#004aff" @themeColorChange="changeThemeColors"/>
            <ThemeColorButton primary-color="#f82b2b" secondary-color="#d338f6" @themeColorChange="changeThemeColors"/>
            <ThemeColorButton primary-color="#ffc01e" secondary-color="#f59393" @themeColorChange="changeThemeColors"/>
            <ThemeColorButton primary-color="#8f3bcb" secondary-color="#42d73e" @themeColorChange="changeThemeColors"/>
            <ThemeColorButton primary-color="#e00f3e" secondary-color="#efeb3a" @themeColorChange="changeThemeColors"/>
          </div>
        </div>
        <CustomSlider @sliderValueChange="onSliderValueChange"></CustomSlider>
      </div>
      <div class="button-container">
        <CustomButton button-id="stop-button"
                      text="Stop"
                      @click="stopSearch"
                      :disabled="!running"
        >
        </CustomButton>
        <CustomButton button-id="Search-button"
                      text="Search"
                      @click="startSearch"
                      :disabled="running"
        >
        </CustomButton>
      </div>
      <SnipingResults :fails="fails" :buys="buys" :searches="searches"></SnipingResults>
      <CustomLog :logList="logList"></CustomLog>
      <label class="credit-label">Made by:
        <a href="https://github.com/jenscaa" target="_blank">jenscaa</a>
      </label>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #EF4765;
  --secondary-color: #FF9A5A;
}

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

.input-container, .advanced-settings-container {
  display: grid;
  grid-template-rows: auto;
  gap: 15px;
  align-items: center;
}

.advanced-settings-label {
  justify-self: center;
  justify-content: center;
  text-align: center;
  color: white;
  font-weight: bold;
  padding: 5px;
  cursor: pointer;
  transition: transform 150ms ease-in-out;
}

.advanced-settings-label:hover {
  transform: scale(1.05);
}

.advanced-label-container {
  justify-content: center;
  align-content: center;
  padding: 0 36px;
}

.advanced {
  justify-self: center;
  display: grid;
  grid-template-columns: 1fr 1fr; /* Changed from .5fr */
  justify-items: center;
  padding: 0 18px;
}

.advanced-label {
  color: white;
  align-self: center;
  font-weight: bold;
  text-align: start;
}

.advanced-settings-container h2 {
  margin: 0;
  padding-top: 5px;
  padding-left: 10%;
  color: white;
}

.advanced-settings-container hr {
  justify-self: center;
  margin: 0;
  padding: 0;
  width: 80%;
}

.theme-color-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 5px;
  padding: 0 10%;
}

.net-label {
  color: white;
  font-weight: bold;
  text-align: center;
}

.profit-p {
  color: white;
  display: inline;
  margin: 0;
  padding: 0;
  width: fit-content;
  height: fit-content;
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

.credit-label {
  color: white;
  justify-self: center;
  justify-content: center;
  text-align: center;
  margin: 15px 0 5px 0;
  font-weight: bold;
}

.credit-label a {
  color: var(--secondary-color);
}
</style>
