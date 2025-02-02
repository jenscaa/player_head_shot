<script setup>
/** Imports Vue's `onMounted` lifecycle hook and `ref` for reactive data. */
import {onMounted, ref} from 'vue';

/** Import custom components used in the template for UI elements. */
import CustomInput from "./components/CustomInput.vue";
import CustomButton from "./components/CustomButton.vue";
import CustomSlider from "./components/CustomSlider.vue";
import PlayerInput from "./components/PlayerInput.vue";
import AutoListCheckBox from "./components/AutoListCheckBox.vue";
import SnipingResults from "./components/SnipingResults.vue";
import CustomLog from "./components/CustomLog.vue";
import ThemeColorButton from "./components/ThemeColorButton.vue";

/**
 * @type {boolean} running - Flag to control whether the bot is currently running.
 * @type {boolean} advancedSettings - Flag to toggle the visibility of advanced settings.
 * @type {string} playerName - The name of the current player being searched.
 * @type {Array<Object>} nameList - List of player names and their ratings.
 * @type {number|undefined} searchLimit - The maximum number of searches allowed.
 * @type {number|undefined} maxBuyNow - The maximum 'Buy Now' price for purchasing.
 * @type {number|undefined} minListPrice - The minimum listing price when selling players.
 * @type {number|undefined} maxListPrice - The maximum listing price when selling players.
 * @type {number|undefined} searchResultDelay - The delay in milliseconds for search results to appear.
 * @type {number|undefined} confirmDialogDelay - The delay in milliseconds for confirming dialogs.
 * @type {number|undefined} confirmPurchaseDelay - The delay in milliseconds before confirming purchases.
 * @type {number} rpm - The number of rounds per minute for search iterations.
 * @type {boolean} autoListChecked - Flag to determine if auto-listing is enabled.
 * @type {number} searches - Counter for the number of search iterations.
 * @type {number} buys - Counter for successful purchases.
 * @type {number} fails - Counter for failed purchase attempts.
 * @type {Array<string>} logList - List of log entries tracking actions and events.
 * @type {number|undefined} profitRef - Reference to display calculated profit from sales.
 * @type {number} sliderKey - Key used to track the state of the custom slider for RPM.
 */
const running = ref(false);
const advancedSettings = ref(false);
const playerName = ref('');
const nameList = ref([]);
const searchLimit = ref();
const purchaseLimit = ref();
const minBuyNow = ref();
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
const profitRef = ref();
const sliderKey = ref(0);

// Log current URL and pathname in the console for debugging purposes
console.log("Current URL:", window.location.href); // Full URL of the current page
console.log("Current Pathname:", window.location.pathname); // Pathname (after the domain)

// Audio elements for success and failure actions
const sniperHeadShotAudio = new Audio('../assets/SniperHeadShot.MP3')
const sniperMissAudio = new Audio('../assets/SniperMiss.MP3')

/**
 * Updates the player name and sends a message to the content script when the player input changes.
 *
 * @param {string} newValue - The new value of the player name.
 */
const onPlayerInputChange = async (newValue) => {
    playerName.value = newValue
    await chrome.storage.local.set({name: newValue}, function () {
    });
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'inputChange', value: playerName.value});
    } else {
        console.error("No active tab found. ")
    }
}

/**
 * Updates the search limit and stores the value in Chrome local storage.
 *
 * @param {number} newValue - The new search limit.
 */
const onSearchLimitChange = (newValue) => {
    searchLimit.value = newValue
    chrome.storage.local.set({searchLimit: newValue}, function () {
    });
}

/**
 * Updates the search purchase limit and stores the value in Chrome local storage.
 *
 * @param {number} newValue - The new search limit.
 */
const onPurchaseLimitChange = (newValue) => {
    purchaseLimit.value = newValue;
    chrome.storage.local.set({purchaseLimit: newValue}, function () {
    });
}

/**
 * Updates the min buy now price, stores it, and sends the updated value to the content script.
 *
 * @param {number} newValue - The new max buy now price.
 */
const onMinBuyNowChange = async (newValue) => {
    minBuyNow.value = newValue;
    chrome.storage.local.set({minBuyNow: newValue}, function () {
    });
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'minBuyNowChange', value: minBuyNow.value});
    } else {
        console.error("No active tab found. ")
    }
}

/**
 * Updates the max buy now price, stores it, and sends the updated value to the content script.
 *
 * @param {number} newValue - The new max buy now price.
 */
const onMaxBuyNowChange = async (newValue) => {
    maxBuyNow.value = newValue;
    chrome.storage.local.set({maxBuyNow: newValue}, function () {
    });
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'maxBuyNowChange', value: maxBuyNow.value});
    } else {
        console.error("No active tab found. ")
    }

    // Updates the profit display based on the calculated profit
    if (maxBuyNow.value && maxListPrice.value) {
        const profitParagraph = profitRef.value
        const profit = eaAfterTax(maxBuyNow.value, maxListPrice.value);
        profitParagraph.style.setProperty('color', profit > 0 ? 'chartreuse' : profit < 0 ? '#ef4765' : 'white');
    }
}

/**
 * Handles player selection, updates the player name, and sends a message to the content script.
 *
 * @param {string} newValue - The new selected player name.
 */
const onPlayerSelected = async (newValue) => {
    playerName.value = newValue
    await chrome.storage.local.set({name: newValue}, function () {
    });
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'playerSelected', value: playerName.value});
    } else {
        console.error("No active tab found. ")
    }
}

/**
 * Toggles the visibility of advanced settings.
 */
const onAdvancedSettingsPressed = () => {
    advancedSettings.value = !advancedSettings.value;
}

/**
 * Updates the auto-listing checkbox value and stores it in Chrome local storage.
 *
 * @param {boolean} newValue - The new value for the auto-list checkbox.
 */
const onCheckedChanged = (newValue) => {
    autoListChecked.value = newValue
    chrome.storage.local.set({autoListChecked: newValue}, function () {
    });
    setTimeout(() => {
        if (maxBuyNow.value && maxListPrice.value) {
            const profitParagraph = profitRef.value
            const profit = eaAfterTax(maxBuyNow.value, maxListPrice.value);
            profitParagraph.style.setProperty('color', profit > 0 ? 'chartreuse' : profit < 0 ? '#ef4765' : 'white');
        }
    }, 50)
}

/**
 * Updates the minimum listing price and stores it in Chrome local storage.
 *
 * @param {number} newValue - The new minimum listing price.
 */
const onMinListPriceChange = (newValue) => {
    minListPrice.value = newValue;
    chrome.storage.local.set({minListPrice: newValue}, function () {
    });
}

/**
 * Updates the maximum listing price, recalculates profit, and updates the profit display.
 *
 * @param {number} newValue - The new maximum listing price.
 */
const onMaxListPriceChange = (newValue) => {
    maxListPrice.value = newValue;
    chrome.storage.local.set({maxListPrice: newValue}, function () {
    });
    setTimeout(() => {
        if (maxBuyNow.value && maxListPrice.value) {
            const profitParagraph = profitRef.value
            const profit = eaAfterTax(maxBuyNow.value, maxListPrice.value);
            profitParagraph.style.setProperty('color', profit > 0 ? 'chartreuse' : profit < 0 ? '#ef4765' : 'white');
        }
    }, 50)
}

/**
 * Clears all input fields and resets default values.
 */
const onClearAllClicked = async () => {
    playerName.value = null;
    searchLimit.value = null;
    purchaseLimit.value = null;
    minBuyNow.value = null;
    maxBuyNow.value = null;
    autoListChecked.value = false;
    minListPrice.value = null;
    maxListPrice.value = null;
    rpm.value = 60;
    sliderKey.value++;

    // Resets chrome local storage
    await chrome.storage.local.set({
        name: null,
        searchLimit: '',
        purchaseLimit: '',
        minBuyNow: null,
        maxBuyNow: null,
        autoListChecked: false,
        minListPrice: null,
        maxListPrice: null,
        rpm: 60
    }, function () {
        console.log('All values have been reset to local storage.');
    });
}

/**
 * Updates the RPM value and sends a message to the content script.
 *
 * @param {number} newValue - The new RPM value.
 */
const onSliderValueChange = async (newValue) => {
    rpm.value = newValue;
    chrome.storage.local.set({rpm: newValue}, function () {
    });
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'rpmChange', value: rpm.value});
    } else {
        console.error("No active tab found. ")
    }
}

/**
 * Updates the search result delay and sends a message to the content script.
 *
 * @param {number} newValue - The new search result delay in milliseconds.
 */
const onSearchResultDelayChange = async (newValue) => {
    searchResultDelay.value = newValue;
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'searchResultDelay', value: searchResultDelay.value});
    } else {
        console.error("No active tab found. ")
    }
}

/**
 * Updates the confirm dialog delay and sends a message to the content script.
 *
 * @param {number} newValue - The new confirm dialog delay in milliseconds.
 */
const onConfirmDialogDelayChange = async (newValue) => {
    confirmDialogDelay.value = newValue;
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'confirmDialogDelay', value: confirmDialogDelay.value});
    } else {
        console.error("No active tab found. ")
    }
}

/**
 * Updates the confirm purchase delay and sends the updated value to the content script.
 *
 * @param {number} newValue - The new confirm purchase delay in milliseconds.
 */
const onCheckPurchaseDelayChange = async (newValue) => {
    confirmPurchaseDelay.value = newValue;
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'confirmPurchaseDelay', value: confirmDialogDelay.value});
    } else {
        console.error("No active tab found. ")
    }
}

/**
 * Calculates profit after EA tax (5% deduction on sales).
 *
 * @param {number} buyPrice - The purchase price of the item.
 * @param {number} listPrice - The selling price of the item.
 * @returns {number} - The profit after the 5% EA tax is deducted.
 */
const eaAfterTax = (buyPrice, listPrice) => {
    const profit = listPrice * 0.95 - buyPrice;
    return Math.round(profit);
};

/**
 * Starts the search process by sending a message to the content script.
 */
const startSearch = async () => {
    running.value = true;
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {
            action: 'startSearch',
            searchLimit: searchLimit.value,
            purchaseLimit: purchaseLimit.value,
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
        console.error("No active tab found. ")
    }
}

/**
 * Stops the search process by sending a 'stopSearch' message to the content script.
 */
const stopSearch = async () => {
    running.value = false;
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });
    if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'stopSearch'});
    } else {
        console.error("No active tab found. ")
    }
}

/**
 * Changes the theme colors by updating the CSS variables and saving the selected theme to Chrome storage.
 *
 * @param {string} primaryColor - The primary theme color.
 * @param {string} secondaryColor - The secondary theme color.
 */
const changeThemeColors = (primaryColor, secondaryColor) => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    const colorTheme = {primaryColor: primaryColor, secondaryColor: secondaryColor}
    chrome.storage.local.set({theme: colorTheme}, function () {
        console.log('Theme colors is saved to local storage.');
    });
};

/**
 * Fetches theme and search-related settings from Chrome storage and applies them to the UI.
 * This function is triggered when the component is mounted.
 */
onMounted(async () => {
    // Retrieve the 'theme' object from Chrome storage
    chrome.storage.local.get(['theme'], function (result) {
        if (result.theme) {
            const {primaryColor, secondaryColor} = result.theme;
            // Apply the theme colors to CSS variables
            document.documentElement.style.setProperty('--primary-color', primaryColor);
            document.documentElement.style.setProperty('--secondary-color', secondaryColor);
            console.log('Theme loaded and applied:', primaryColor, secondaryColor);
        } else {
            console.error('No theme found in storage.');
        }
    });

    // Retrieve various settings from Chrome storage and insert them to the global variables
    await chrome.storage.local.get(['name', 'searchLimit', 'purchaseLimit', 'minBuyNow', 'maxBuyNow', 'autoListChecked', 'minListPrice', 'maxListPrice', 'rpm'], function (result) {
        playerName.value = result.name || undefined;
        if (result.name) onPlayerSelected(result.name);
        searchLimit.value = result.searchLimit || undefined;
        purchaseLimit.value = result.purchaseLimit || undefined;
        minBuyNow.value = result.minBuyNow || undefined;
        maxBuyNow.value = result.maxBuyNow || undefined;
        onMaxBuyNowChange(result.maxBuyNow)
        autoListChecked.value = result.autoListChecked !== undefined ? result.autoListChecked : false;
        minListPrice.value = result.minListPrice || undefined;
        maxListPrice.value = result.maxListPrice || undefined;
        rpm.value = result.rpm || 60;
        sliderKey.value++;
    });
});

/**
 * Listens for incoming messages from the content script and handles various actions.
 *
 * @param {Object} request - The message payload.
 * @param {Object} sender - The message sender information.
 * @param {Function} sendResponse - Callback to send a response to the sender.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    /**
     * Handles the 'updateNames' action which updates the UI with the list of player names
     * received from the content script.
     */
    if (request.action === 'updateNames') {

        // Sets the name list array from content script
        nameList.value = request.list;
        sendResponse({success: true, message: 'successful'})
    }

    /**
     * Handles the 'finishedSearch' action which stops the search process by setting the 'running' flag to false
     * and logs the event in the logList.
     */
    else if (request.action === 'finishedSearch') {
        running.value = false
        logList.value.push(`[${new Date().toLocaleString()}] Bot stopped`);
        sendResponse({success: true, message: 'successful'})

    }

    /**
     * Handles the 'reachedSearchLimit' action which stops the search process when the defined search limit is reached.
     * It updates the 'running' flag to false and logs the event in the logList along with the search limit reached.
     */
    else if (request.action === 'reachedSearchLimit') {
        running.value = false
        logList.value.push(`[${new Date().toLocaleString()}] Bot stopped by search limit ${searchLimit.value}`);
        sendResponse({success: true, message: 'successful'})

    }

    /**
     * Handles the 'reachedPurchaseLimit' action which stops the search process when the defined search limit is reached.
     * It updates the 'running' flag to false and logs the event in the logList along with the search limit reached.
     */
    else if (request.action === 'reachedPurchaseLimit') {
        running.value = false
        logList.value.push(`[${new Date().toLocaleString()}] Bot stopped by purchased limit ${purchaseLimit.value}`);
        sendResponse({success: true, message: 'successful'})

    }

    /**
     * Handles the 'searched' action which increments the 'searches' counter whenever a search iteration is completed.
     */
    else if (request.action === 'searched') {
        searches.value++;
        sendResponse({success: true, message: 'successful'})

    }

    /**
     * Handles the 'bought' action which increments the 'buys' counter when a player is successfully purchased,
     * logs the purchase details in the logList, and plays the 'sniperHeadShotAudio' sound.
     */
    else if (request.action === 'bought') {
        buys.value++;
        logList.value.push(`[${new Date().toLocaleString()}] Bought ${request.name} for ${request.price} coins`);
        sniperHeadShotAudio.play();
        sendResponse({success: true, message: 'successful'})

    }

    /**
     * Handles the 'listed' action which logs the details of the listed player (min/max price) in the logList.
     */
    else if (request.action === 'listed') {
        logList.value.push(`[${new Date().toLocaleString()}] Listed ${request.name} for min ${request.minList} and max ${request.maxList} coins`);

    }

    /**
     * Handles the 'failed' action which increments the 'fails' counter when an attempt to purchase a player fails,
     * logs the failure details in the logList, and plays the 'sniperMissAudio' sound.
     */
    else if (request.action === 'failed') {
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
                                 placeholder="No limit">
                    </CustomInput>
                    <CustomInput input-id="purchase-limit-input"
                                 label="Purchase limit"
                                 v-model="purchaseLimit"
                                 :disabled="running"
                                 :max="100"
                                 :min="0"
                                 @inputChangeEvent="onPurchaseLimitChange"
                                 placeholder="No limit"
                    ></CustomInput>
                </div>
                <div class="custom-button-container">
                    <CustomInput id="min-buy-now-input"
                                 input-id="min-buy-now-input"
                                 label="Min Buy Now"
                                 v-model="minBuyNow"
                                 :disabled="running"
                                 :max="15000000"
                                 :min="0"
                                 @inputChangeEvent="onMinBuyNowChange"
                                 placeholder="Any">
                    </CustomInput>
                    <CustomInput id="max-buy-now-input"
                                 input-id="max-buy-now-input"
                                 label="Max Buy Now"
                                 v-model="maxBuyNow"
                                 :disabled="running"
                                 :max="15000000"
                                 :min="0"
                                 @inputChangeEvent="onMaxBuyNowChange"
                                 placeholder="Any">
                    </CustomInput>
                </div>
                <AutoListCheckBox @checkChangedEvent="onCheckedChanged" :checked="autoListChecked"></AutoListCheckBox>
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
                <label v-if="autoListChecked && maxBuyNow && maxListPrice" class="net-label">
                    Profit: <p ref="profitRef" class="profit-p">{{ eaAfterTax(maxBuyNow, maxListPrice) }}</p>
                </label>
                <CustomButton button-id="clear-all"
                              class="clear-all-button"
                              text="Clear All"
                              :disabled="running"
                              @click="onClearAllClicked"
                ></CustomButton>
                <label @click="onAdvancedSettingsPressed" class="advanced-settings-label">{{
                        "Advanced settings \u2699"
                    }}</label>
                <div v-if="advancedSettings" class="advanced-settings-container">
                    <h2>Delay</h2>
                    <hr>
                    <div class="advanced-label-container">
                        <label class="advanced-label description">If you are experiencing that the bot fails to purchase
                            sometimes,
                            or gets stuck, try to increase these delay metrics: </label>
                    </div>
                    <div class="advanced">
                        <CustomInput input-id="wait-search-results-input"
                                     :disabled="!advancedSettings"
                                     v-model="searchResultDelay"
                                     @inputChangeEvent="onSearchResultDelayChange"
                                     :max="1000"
                                     :min="0"
                                     placeholder="Default 250 ms"
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
                                     placeholder="Default 80 ms"
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
                                     placeholder="Default 800 ms"
                        ></CustomInput>
                        <label class="advanced-label">Delay time for purchase confirmation (milliseconds)</label>
                    </div>
                    <h2>Theme Color</h2>
                    <hr>
                    <div class="theme-color-container">
                        <ThemeColorButton primary-color="#EF4765" secondary-color="#FF9A5A"
                                          @themeColorChange="changeThemeColors"/>
                        <ThemeColorButton primary-color="#3bff72" secondary-color="#81eee0"
                                          @themeColorChange="changeThemeColors"/>
                        <ThemeColorButton primary-color="#1628e5" secondary-color="#30ffe2"
                                          @themeColorChange="changeThemeColors"/>
                        <ThemeColorButton primary-color="#e875d1" secondary-color="#004aff"
                                          @themeColorChange="changeThemeColors"/>
                        <ThemeColorButton primary-color="#f82b2b" secondary-color="#d338f6"
                                          @themeColorChange="changeThemeColors"/>
                        <ThemeColorButton primary-color="#ffc01e" secondary-color="#f59393"
                                          @themeColorChange="changeThemeColors"/>
                        <ThemeColorButton primary-color="#8f3bcb" secondary-color="#42d73e"
                                          @themeColorChange="changeThemeColors"/>
                        <ThemeColorButton primary-color="#e00f3e" secondary-color="#efeb3a"
                                          @themeColorChange="changeThemeColors"/>
                    </div>
                </div>
                <CustomSlider :key="sliderKey" @sliderValueChange="onSliderValueChange" :rpm="rpm"></CustomSlider>
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
    grid-template-columns: 1fr 1fr;
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

.clear-all-button {
    margin: 0;
    padding: 0;
    width: 30%;
    height: 32px;
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