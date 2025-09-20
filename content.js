/**
 * @author jenscaa
 * @version 1.1
 *
 * Content script for the SniperHeadShot Chrome extension that manages the search process and interacts with the UI elements
 * the EA web application. This script handles various actions like starting and stopping searches, selecting players,
 * changing input values. It communicates with other the other part of the Chrome extension through
 * messages and manages asynchronous tasks using promises.
 */

// Global variables
/**
 * @type {boolean} running - Flag to control whether the search process is currently running.
 * @type {string} currentPlayer - Stores the name of the current player being searched.
 * @type {number} purchased - Counts how many times a card have been purchased.
 * @type {number} rpm - The rate per minute (RPM) that controls the speed of search iterations.
 * @type {number} searchResultDelayWait - Delay in milliseconds for registration of search results.
 * @type {number} confirmDialogDelayWait - Delay in milliseconds for registration of confirm dialog.
 * @type {number} confirmPurchaseDelayWait - Delay in milliseconds for registration confirm purchase actions.
 */
let running = false;
let currentPlayer = '';
let purchased = 0
let rpm = 60
let searchResultDelayWait = 250
let confirmDialogDelayWait = 80
let confirmPurchaseDelayWait = 800

// Event listener for Chrome runtime messages
/**
 * Listens for messages sent from the other part of the Chrome extension (the popup)
 * and performs actions accordingly. Supported actions include starting/stopping searches, selecting players,
 * changing input values, and adjusting delays.
 *
 * @param {Object} request - The message request object containing action details and optional parameters.
 * @param {Object} sender - The sender of the message, automatically passed by Chrome runtime.
 * @param {Function} sendResponse - A callback function to send a response back to the sender.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    /**
     * Handles the 'startSearch' action which initiates the search process with specified parameters.
     * It sets the 'running' flag to true and continuously runs the search based on user-specified limits
     * or indefinitely if no limit is provided.
     */
    if (request.action === 'startSearch') {

        running = true;
        console.log("Running: ", running);

        // Sets the current player to search on
        const SearchPlayerInput = document.querySelector('input.ut-text-input-control');
        currentPlayer = SearchPlayerInput.value

        // Sets delay variables
        rpm = request.rpm || 60
        searchResultDelayWait = request.searchResultDelay || 250;
        confirmDialogDelayWait = request.confirmDialogDelay || 80;
        confirmPurchaseDelayWait = request.confirmPurchaseDelay || 800;

        let i = 0;
        let promiseChain = Promise.resolve();  // Start with a resolved promise for chaining async tasks

        // Loop indefinitely if no search limit is provided
        if (request.searchLimit === undefined || request.searchLimit === '') {
            function loop() {

                if (!running) {
                    // Notify that the search has finished
                    chrome.runtime.sendMessage({action: 'finishedSearch'}, (response) => {
                        console.log("Response from popup:", response);
                    });
                    return; // Exit the loop if running is set to false
                }

                // Stop loop if the purchase limit is exceeded
                else if (request.purchaseLimit !== undefined || request.purchaseLimit !== '') {
                    if (purchased >= request.purchaseLimit) {
                        purchased = 0
                        chrome.runtime.sendMessage({action: 'reachedPurchaseLimit'}, (response) => {
                            console.log("Response from popup:", response);
                        });
                        return;
                    }
                }

                // Chain search operations with promises
                promiseChain = promiseChain.then(() => {
                    console.log("Starting search iteration");
                    return search(convertRpmToMilliseconds(rpm), i, request.checked, request.minList, request.maxList);
                }).then(() => {
                    i++
                    loop(); // Chain the next iteration (Continue the loop)
                });
            }

            loop();  // Start the loop

            // Run the search loop until the search limit is reached
        } else {
            function loop() {

                if (!running) {
                    // Notify that the search has finished
                    chrome.runtime.sendMessage({action: 'finishedSearch'}, (response) => {
                        console.log("Response from popup:", response);
                    });
                    return;

                    // Notify that the search has finished by search limit
                } else if (i >= request.searchLimit) {
                    chrome.runtime.sendMessage({action: 'reachedSearchLimit'}, (response) => {
                        console.log("Response from popup:", response);
                    });
                    return;
                }

                // Stop loop if the purchase limit is exceeded
                else if (request.purchaseLimit !== undefined || request.purchaseLimit !== '') {
                    if (purchased >= request.purchaseLimit) {
                        purchased = 0
                        chrome.runtime.sendMessage({action: 'reachedPurchaseLimit'}, (response) => {
                            console.log("Response from popup:", response);
                        });
                        return;
                    }
                }

                promiseChain = promiseChain.then(() => {
                    console.log("Starting search iteration");
                    return search(convertRpmToMilliseconds(rpm), i, request.checked, request.minList, request.maxList);  // Return the promise from the search function
                }).then(() => {
                    i++;
                    loop();  // Chain the next iteration (Continue the loop)
                });
            }

            loop();  // Start the loop
        }
    }

    /**
     * Handles the 'stopSearch' action which stops the ongoing search process by setting the 'running' flag to false.
     */
    else if (request.action === 'stopSearch') {
        running = false;
        console.log("Running: ", running);
    }

    /**
     * Handles the 'playerSelected' action which selects a player by simulating an input change event and triggers a button click.
     */
    else if (request.action === 'playerSelected') {

        // Retrieves the search player search element on the EA web app
        const SearchPlayerInput = document.querySelector('input.ut-text-input-control');
        SearchPlayerInput.value = request.value

        // Simulate an input event for the EA Web to registration the new value
        const inputEvent = new Event('input', {bubbles: true});
        SearchPlayerInput.dispatchEvent(inputEvent);

        // Waits 1.5 seconds (1500 milliseconds) in order to register the incoming list of players
        setTimeout(() => {

            // Retrieves the all the elements representing the listed players, and simulate pressing the first player element
            const SearchPlayerResults = document.getElementsByClassName('ut-button-group playerResultsList');
            const children = SearchPlayerResults[0]?.children;
            const button = children[0];
            pressButton(button);
        }, 1500) // Wait 1500 milliseconds for web app to display list
    }

    /**
     * Handles the 'inputChange' action which simulates a change in input and sends a list of updated player names back to the popup.
     */
    else if (request.action === 'inputChange') {

        // Retrieves the search player search element on the EA web app.
        const SearchPlayerInput = document.querySelector('input.ut-text-input-control');
        SearchPlayerInput.value = request.value

        // Simulate an input event for the EA Web to registration the new value
        const inputEvent = new Event('input', {bubbles: true});
        SearchPlayerInput.dispatchEvent(inputEvent);

        // Waits 1 second (1 millisecond) in order to register the incoming list of players and send it to the popup
        setTimeout(() => {
            const list = getListOfNames()
            chrome.runtime.sendMessage({action: 'updateNames', list: list}, (response) => {
                console.log("Response from popup:", response);
            });
        }, 1000); // Wait 1000 milliseconds for web app to display list
    }

    /**
     * Handles the 'minBuyNowChange' action which simulates a change in the Min Buy Now input.
     */
    else if (request.action === 'minBuyNowChange') {

        // Retrieve the price input elements (There are 4 of them: Min Bid Price, Max Bid Price, Min Buy Now Price, and Max Buy Now Price)
        const inputDivs = document.querySelectorAll('div.ut-numeric-input-spinner-control');

        // Retrieving the 3rd div element with this class name
        const inputDiv = inputDivs[2];

        // Retrieve the Min Buy Now input
        const minBuyNowInput = inputDiv.querySelector('input.ut-number-input-control')

        if (minBuyNowInput) {
            // Set the value of the input
            minBuyNowInput.value = request.value;

            // Trigger input and change events for the web app to register input change
            const inputEvent = new Event('input', {bubbles: true});
            const changeEvent = new Event('change', {bubbles: true});
            minBuyNowInput.dispatchEvent(inputEvent); // Trigger input event
            minBuyNowInput.dispatchEvent(changeEvent); // Trigger change event as fallback
        } else {
            console.error("Input element at index [2] not found");
        }
    }

    /**
     * Handles the 'maxBuyNowChange' action which simulates a change in the Max Buy Now input.
     */
    else if (request.action === 'maxBuyNowChange') {

        // Retrieve the price input elements (There are 4 of them: Min Bid Price, Max Bid Price, Min Buy Now Price, and Max Buy Now Price)
        // const priceInputs = document.querySelectorAll('input.ut-number-input-control');

        // Update 09.11.2024. EA has changed their Website. Now there are 6 UI inputs with same name 'input.ut-number-input-control'
        const inputDivs = document.querySelectorAll('div.ut-numeric-input-spinner-control');

        // Retrieving the 4th div element with this class name
        const inputDiv = inputDivs[3];

        // Retrieve the Max Buy Now input
        const maxBuyNowInput = inputDiv.querySelector('input.ut-number-input-control')

        if (maxBuyNowInput) {
            // Set the value of the input
            maxBuyNowInput.value = request.value;

            // Trigger input and change events for the web app to register input change
            const inputEvent = new Event('input', {bubbles: true});
            const changeEvent = new Event('change', {bubbles: true});
            maxBuyNowInput.dispatchEvent(inputEvent); // Trigger input event
            maxBuyNowInput.dispatchEvent(changeEvent); // Trigger change event as fallback
        } else {
            console.error("Input element at index [3] not found");
        }
    }

    /**
     * Handles the 'rpmChange' action which sets the rpm variable to a new value.
     * This is done in order to tweak search speed while searching.
     */
    else if (request.action === 'rpmChange') {
        rpm = request.value;
    }

    /**
     * Handles the 'searchResultDelay' action which sets the searchResultDelayWait variable to a new value.
     */
    else if (request.action === 'searchResultDelay') {
        searchResultDelayWait = request.value;
    }

    /**
     * Handles the 'confirmDialogDelay' action which sets the confirmPurchaseDelayWait variable to a new value.
     */
    else if (request.action === 'confirmDialogDelay') {
        confirmPurchaseDelayWait = request.value;
    }

    /**
     * Handles the 'confirmPurchaseDelay' action which sets the confirmPurchaseDelayWait variable to a new value.
     */
    else if (request.action === 'confirmPurchaseDelay') {
        confirmPurchaseDelayWait = request.value;
    }

        // Honestly, I don't know why I haven't deleted this one
    /**
     * Handles the 'logElements' action which logs all the elements it finds on the EA web page.
     */
    else if (request.action === 'logElements') {
        // Query all elements on the page
        const allElements = document.querySelectorAll('*');

        // Log each element in the console of the active webpage
        allElements.forEach(element => {
            console.log(element);
        });

        // Optional: send a response back
        sendResponse({status: 'Elements logged successfully!'});
    }
});

/**
 * Utility function that returns a promise to simulate a delay or waiting period.
 * This is done to make code more 'readable'.
 *
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>} - A promise that resolves after the specified delay.
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Performs a search actions on the web interface, handling search results and attempting to purchase items.
 *
 * @param {number} milliseconds - The delay between search attempts.
 * @param {number} index - The current index in the search loop.
 * @param {boolean} checked - Whether to list the card if it is bought.
 * @param {number} minList - The minimum listing price when selling.
 * @param {number} maxList - The maximum listing price when selling.
 * @returns {Promise<void>} - A promise that resolves after the search is completed.
 */
async function search(milliseconds, index, checked, minList, maxList) {

    // Updates min bid price input for refreshing search results
    updateMinBidPrice(index);

    // Simulates pressing the search button
    pressButtonByClassName('btn-standard primary');

    // Wait for search results to appear
    await wait(searchResultDelayWait);

    // Retrieving the 'first' search result from the current search (If there are any results)
    const parentDiv = document.querySelector('div.paginated-item-list.ut-pinned-list');
    const ulElement = parentDiv?.querySelector('ul')
    const liElement = ulElement?.querySelector('li.listFUTItem.has-auction-data.selected');

    // If there exists a result, then press it
    if (liElement) {

        // Retrieves the buy player button
        const buyButton = document.querySelector('button.btn-standard.buyButton.currency-coins');

        // Check if the button is not disabled (This means that you can afford the player)
        if (buyButton && !buyButton.disabled) {

            // Perform the buy action
            await handlePurchase(buyButton, checked, minList, maxList);
        } else {
            console.log('The buy button is disabled - Can not afford card.');
        }
    }

    // Navigating back to the search results screen
    await performNextSearchStep(milliseconds);
}

/**
 * Handles the purchase of an item, confirms the purchase, and optionally lists the card for sale.
 *
 * @param {HTMLButtonElement} buyButton - The buy button element to trigger the purchase.
 * @param {boolean} checked - Whether to list the card if it is bought.
 * @param {number} minList - The minimum listing price when selling.
 * @param {number} maxList - The maximum listing price when selling.
 * @returns {Promise<void>} - A promise that resolves after the purchase process is completed.
 */
async function handlePurchase(buyButton, checked, minList, maxList) {
    // Press buy button
    pressButton(buyButton);

    // Wait for the confirm dialog to appear
    await wait(confirmDialogDelayWait);

    // Retrieving elements and extracting price value
    const confirmDiv = document.querySelector('div.ea-dialog-view--body');
    const pElement = confirmDiv.querySelector('p.ea-dialog-view--msg');
    const string = pElement?.textContent || '';
    const value = extractValue(string);

    // Retrieving the confirm button and press it (old version)
    // const confirmButton = confirmDiv.querySelectorAll('div.ut-button-group button');

    // EA have now changed some UI element names, so we will have to retrieve all buttons in the confirmDiv
    const buttons = confirmDiv.querySelectorAll('button')

    if (buttons.length > 0) {
        const confirmButton = buttons[0]
        pressButton(confirmButton);
    } else {
        console.error("Could not find confirm purchase button.");
    }

    // Wait to see if the player was actually bought
    await wait(confirmPurchaseDelayWait);

    // Retrieve the element displaying only if player was bought
    const boughtLi = document.querySelector('li.listFUTItem.has-auction-data.selected.won');

    // Check if the player was bought
    if (boughtLi) {
        chrome.runtime.sendMessage({action: 'bought', name: currentPlayer, price: value});
        purchased++

        // List the card for sale if 'checked' is true.
        if (checked) {
            await listCard(minList, maxList);
            chrome.runtime.sendMessage({action: 'listed', name: currentPlayer, minList, maxList});
        }
    } else {
        chrome.runtime.sendMessage({action: 'failed', name: currentPlayer, price: value});
    }
}

/**
 * Performs the next step in the search process, navigating back to the search input screen.
 *
 * @param {number} milliseconds - The delay before continuing the search.
 * @returns {Promise<void>} - A promise that resolves after the next step is completed.
 */
async function performNextSearchStep(milliseconds) {
    // Must wait for EA web app to display go-back button (In other words: avoid getting stuck)
    await wait(300);

    // Retrieve the 'go back to search input screen'-button

    const button = document.querySelector('.ut-navigation-button-control')

    // Press the button to return to the search input screen
    if (button) {
        pressButton(button);
    }

    // Send message back to popup to confirm search. This is used for counting searches
    chrome.runtime.sendMessage({action: 'searched'});

    // Wait for the specified milliseconds before resolving the search promise
    await wait(milliseconds);
}

/**
 * Converts rate per minute (RPM) into milliseconds for timing the search process.
 *
 * @param {number} rpm - The number of rounds per minute.
 * @returns {number} - The equivalent number of milliseconds per round.
 */
const convertRpmToMilliseconds = (rpm) => {
    return (60 / rpm) * 1000;
}

/**
 * Extracts a numerical value from a string.
 *
 * @param {string} string - The string containing the numerical value.
 * @returns {string} - The extracted value as a string.
 */
const extractValue = (string) => {
    const match = string.match(/(\d{1,3}(,\d{3})*)/);
    return match[0]
}

/**
 * Updates the minimum bid price in the search interface. This either sets a default value or
 * increments the value periodically based on the search index.
 *
 * @param {number} index - The current search iteration index.
 */
const updateMinBidPrice = (index) => {

    // Check if index is dividable on 10.
    if (index % 10 === 0) {

        // Retrieve the Min Bid Price input and simulate inserting 150 into it
        // Update 09.11.2024. EA has changed their Website. Now there are 6 UI inputs with same name 'input.ut-number-input-control'

        const inputDivs = document.querySelectorAll('div.ut-numeric-input-spinner-control');
        // We are only interested in the first element
        const inputDiv = inputDivs[0];
        // Retrieving the minBidPrice
        const minBidPrice = inputDiv.querySelector('input.ut-number-input-control');

        if (minBidPrice) {
            minBidPrice.value = 150
            const inputEvent = new Event('input', {bubbles: true});
            const changeEvent = new Event('change', {bubbles: true});
            minBidPrice.dispatchEvent(inputEvent); // Trigger input event
            minBidPrice.dispatchEvent(changeEvent); // Trigger change event as fallback
        }
    } else {

        // Retrieve the increase Min Bid Price button and simulate clicking it
        const incrementButtons = document.getElementsByClassName('btn-standard increment-value');
        if (incrementButtons[0]) {
            const incrementButton = incrementButtons[0];
            pressButton(incrementButton);
        }
    }
}

/**
 * Lists a card for sale by updating the min and max listing price fields and submitting the form.
 *
 * @param {number} minList - The minimum listing price.
 * @param {number} maxList - The maximum listing price.
 */
const listCard = (minList, maxList) => {

    // Retrieving the Min List- and Max List inputs and simulate value insertions on them.
    const listDiv = document.querySelector('div.ut-quick-list-panel-view');
    pressButton(listDiv)
    const listInputs = listDiv.querySelectorAll('input.ut-number-input-control.filled');
    const minListInput = listInputs[0];
    const maxListInput = listInputs[1];
    const listButton = listDiv.querySelector('button.btn-standard.primary');
    const inputEvent = new Event('input', {bubbles: true});
    const changeEvent = new Event('change', {bubbles: true});
    minListInput.value = minList;
    minListInput.dispatchEvent(inputEvent);
    minListInput.dispatchEvent(changeEvent);
    maxListInput.value = maxList;
    maxListInput.dispatchEvent(inputEvent);
    maxListInput.dispatchEvent(changeEvent);

    // Simulates pressing the list button.
    pressButton(listButton);
}

/**
 * Retrieves the list of player names and ratings from the search results.
 *
 * @returns {Array<Object>} - An array of player objects with name and rating properties.
 */
const getListOfNames = () => {
    const list = [];
    const SearchPlayerResults = document.getElementsByClassName('ut-button-group playerResultsList');
    if (SearchPlayerResults) {
        const children = SearchPlayerResults[0]?.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const name = child.querySelector('.btn-text');
            const rating = child.querySelector('.btn-subtext');
            list.push({
                name: name.textContent,
                rating: rating.textContent
            })
        }
    }
    return list;
}

/**
 * Simulates pressing a button by its class name.
 *
 * @param {string} className - The class name of the button to press.
 */
const pressButtonByClassName = (className) => {
    const searchButton = document.getElementsByClassName(className);
    if (searchButton.length > 0) {
        const button = searchButton[0];
        pressButton(button)
    } else {
        console.error("No buttons found with the specified class.");
    }
}

/**
 * Simulates a button click by dispatching mousedown and mouseup events.
 *
 * @param {HTMLElement} button
 */
const pressButton = (button) => {

    // Create and dispatch mousedown event
    const mouseDownEvent = new MouseEvent('mousedown', {bubbles: true, cancelable: true});
    button.dispatchEvent(mouseDownEvent);

    // Create and dispatch mouseup event
    const mouseUpEvent = new MouseEvent('mouseup', {bubbles: true, cancelable: true});
    button.dispatchEvent(mouseUpEvent);
}