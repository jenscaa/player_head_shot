let running = false;
let currentPlayer = '';
let searchResultDelayWait = 150
let confirmDialogDelayWait = 50
let confirmPurchaseDelayWait = 500

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startSearch') {
        running = true;
        const eafcPlayerInput = document.querySelector('input.ut-text-input-control');
        currentPlayer = eafcPlayerInput.value
        searchResultDelayWait = request.searchResultDelay || 150;
        confirmDialogDelayWait = request.confirmDialogDelay || 50;
        confirmPurchaseDelayWait = request.confirmPurchaseDelay || 500;

        let i = 0;
        let promiseChain = Promise.resolve();  // Start with a resolved promise
        // Unlimited loop if request.value is undefined
        if (request.searchLimit === undefined || request.searchLimit === '') {
            function loop() {
                if (!running) {
                    chrome.runtime.sendMessage({ action: 'finishedSearch' }, (response) => {
                        console.log("Response from popup:", response);
                    });
                    return;
                }  // Exit the loop if running is set to false
                promiseChain = promiseChain.then(() => {
                    console.log(`Starting search iteration`);
                    return search2(convertRpmToMilliseconds(request.rpm), i, request.checked, request.minList, request.maxList);  // Return the promise from the search function
                }).then(() => {
                    i++
                    loop();
                });  // Chain the next iteration
            }
            loop();  // Start the loop
        } else {
            console.log("REACHED HERE MAN-----------------------------------------------------------");

            function loop() {
                if (!running) {
                    chrome.runtime.sendMessage({ action: 'finishedSearch' }, (response) => {
                        console.log("Response from popup:", response);
                    });
                    return;
                } else if (i >= request.searchLimit) {
                    chrome.runtime.sendMessage({ action: 'reachedSearchLimit' }, (response) => {
                        console.log("Response from popup:", response);
                    });
                    return;
                }
                promiseChain = promiseChain.then(() => {
                    console.log(`Starting search iteration`);
                    return search2(convertRpmToMilliseconds(request.rpm), i, request.checked, request.minList, request.maxList);  // Return the promise from the search function
                }).then(() => {
                    i++;
                    loop();  // Chain the next iteration
                });
            }
            loop();  // Start the loop
        }
    }

    else if (request.action === 'stopSearch') {
        running = false;
        console.log("Running: ", running);
    }

    else if (request.action === 'playerSelected') {
        const eafcPlayerInput = document.querySelector('input.ut-text-input-control');
        eafcPlayerInput.value = request.value
        var inputEvent = new Event('input', { bubbles: true });
        eafcPlayerInput.dispatchEvent(inputEvent);
        setTimeout(() => {
            const eafcPlayerResults = document.getElementsByClassName('ut-button-group playerResultsList');
            const children = eafcPlayerResults[0]?.children;
            const button = children[0];
            pressButton(button);
        }, 1500) // Wait 1500 milliseconds for delay
    }

    else if (request.action === 'inputChange') {
        const eafcPlayerInput = document.querySelector('input.ut-text-input-control');
        eafcPlayerInput.value = request.value
        var inputEvent = new Event('input', { bubbles: true });
        eafcPlayerInput.dispatchEvent(inputEvent);
        setTimeout(() => {
            const list = getListOfNames()
            chrome.runtime.sendMessage({ action: 'updateNames', list: list }, (response) => {
                console.log("Response from popup:", response);
            });
        }, 1000);
    }

    else if (request.action === 'maxBuyNowChange') {
        const priceInputs = document.getElementsByClassName('ut-number-input-control');
        console.log("Price Inputs Found:", priceInputs);
        console.log("Length of priceInputs:", priceInputs.length);

        // Make sure you're targeting the right input
        if (priceInputs[3]) {
            const maxBuyNowInput = priceInputs[3];

            // Log the value you are trying to set
            console.log("Setting value:", request.value);

            // Set the value of the input
            maxBuyNowInput.value = request.value;

            // Log the element to see its current state
            console.log("Updated input element:", maxBuyNowInput);

            // Trigger input and change events
            var inputEvent = new Event('input', { bubbles: true });
            var changeEvent = new Event('change', { bubbles: true });

            maxBuyNowInput.dispatchEvent(inputEvent); // Trigger input event
            maxBuyNowInput.dispatchEvent(changeEvent); // Trigger change event as fallback
        } else {
            console.log("Input element at index [3] not found");
        }
    }


    else if (request.action === 'logElements') {
        // Query all elements on the page
        const allElements = document.querySelectorAll('*');

        // Log each element in the console of the active webpage
        allElements.forEach(element => {
            console.log(element);
        });

        // Optional: send a response back
        sendResponse({ status: 'Elements logged successfully!' });
    }
});

// Utility function to simulate waiting (use in place of setTimeout)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function search2(milliseconds, index, checked, minList, maxList) {
    // Updates bid price for refreshing search
    updateMinBidPrice(index);

    // Press the initial search button
    pressButtonByClassName('call-to-action');

    // Wait for results to show
    await wait(searchResultDelayWait);

    const parentDiv = document.querySelector('div.paginated-item-list.ut-pinned-list');
    const liElement = parentDiv?.querySelector('li.listFUTItem.has-auction-data.selected');

    if (liElement) {
        const buyButton = document.querySelector('button.btn-standard.buyButton.currency-coins');
        console.log(buyButton);

        if (buyButton && !buyButton.disabled) {
            // Perform the buy action
            await handlePurchase(buyButton, checked, minList, maxList);
        } else {
            console.log("The buy button is disabled.");
        }
    } else {
        console.log("No search results found.");
    }

    // Proceed to the next step of the search after action
    await performNextSearchStep(milliseconds);
}

async function handlePurchase(buyButton, checked, minList, maxList) {
    // Press buy button
    pressButton(buyButton);
    await wait(confirmDialogDelayWait); // Wait for the confirm dialog to appear

    const confirmDiv = document.querySelector('div.ea-dialog-view--body');
    const pElement = confirmDiv.querySelector('p.ea-dialog-view--msg');
    const string = pElement?.textContent || '';
    const value = extractValue(string);

    // Confirm the purchase
    const confirmButton = confirmDiv.querySelector('div.ut-button-group button');
    pressButton(confirmButton);

    await wait(confirmPurchaseDelayWait); // Wait to see if the player was actually bought

    const boughtLi = document.querySelector('li.listFUTItem.has-auction-data.selected.won');
    if (boughtLi) {
        chrome.runtime.sendMessage({ action: 'bought', name: currentPlayer, price: value });

        // List the card if `checked` is true
        if (checked) {
            await listCard(minList, maxList);
            chrome.runtime.sendMessage({ action: 'listed', name: currentPlayer, minList, maxList });
        }
    } else {
        chrome.runtime.sendMessage({ action: 'failed', name: currentPlayer, price: value });
    }
}

async function performNextSearchStep(milliseconds) {
    await wait(300); // Must wait in order to avoid getting stuck
    // Find the "Search Results" element and its associated button
    const h1Element = Array.from(document.querySelectorAll('h1.title')).find(h1 => h1.textContent.trim() === 'Search Results');
    const button = h1Element?.closest('div.ut-navigation-bar-view.navbar-style-landscape.currency-purchase')
        ?.querySelector('button.ut-navigation-button-control');



    // Press the button to return to the search results
    if (button) {
        pressButton(button);
        console.log("Button clicked to go back to search results.");
    }

    chrome.runtime.sendMessage({ action: 'searched' });

    // Wait for the specified milliseconds before resolving the search promise
    await wait(milliseconds);
    console.log(`Waited for ${milliseconds}ms before proceeding.`);
}


const convertRpmToMilliseconds = (rpm) => {
    return (60/rpm) * 1000;
}

const extractValue = (string) => {
    const match = string.match(/(\d{1,3}(,\d{3})*)/);
    return match[0]
}


const updateMinBidPrice = (index) => {
    if (index % 10 === 0) {
        const priceInputs = document.getElementsByClassName('ut-number-input-control');
        // Make sure you're targeting the right input
        if (priceInputs[0]) {
            const minBidPrice = priceInputs[0];
            minBidPrice.value = 150
            const inputEvent = new Event('input', { bubbles: true });
            const changeEvent = new Event('change', { bubbles: true });
            minBidPrice.dispatchEvent(inputEvent); // Trigger input event
            minBidPrice.dispatchEvent(changeEvent); // Trigger change event as fallback
        }
    } else {
        const incrementButtons = document.getElementsByClassName('btn-standard increment-value');

        if (incrementButtons[0]) {
            const incrementButton = incrementButtons[0];
            pressButton(incrementButton);
        }
    }
}

const listCard = (minList, maxList) => {
    const listDiv = document.querySelector('div.ut-quick-list-panel-view');
    const listInputs = listDiv.querySelectorAll('input.ut-number-input-control.filled');
    const minListInput = listInputs[0];
    const maxListInput = listInputs[1];
    const listButton = listDiv.querySelector('button.btn-standard.call-to-action');
    const inputEvent = new Event('input', { bubbles: true });
    const changeEvent = new Event('change', { bubbles: true });
    minListInput.value = minList;
    minListInput.dispatchEvent(inputEvent);
    minListInput.dispatchEvent(changeEvent);
    maxListInput.value = maxList;
    maxListInput.dispatchEvent(inputEvent);
    maxListInput.dispatchEvent(changeEvent);
    pressButton(listButton);
}

const getListOfNames = () => {
    const list = [];
    const eafcPlayerResults = document.getElementsByClassName('ut-button-group playerResultsList');
    if (eafcPlayerResults) {
        const children = eafcPlayerResults[0]?.children;
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

const pressSearchButton = (timeout) => {
    setTimeout(() => {
        pressButtonByClassName('call-to-action');
        setTimeout(() => {
            pressButtonByClassName('ut-navigation-button-control'); // Click the button after 1 seconds
            console.log("Button clicked:");
        }, timeout); // 1000 milliseconds = 5 seconds
    }, 500)

}

const pressButtonByClassName = (className) => {
    const searchButton = document.getElementsByClassName(className);
    if (searchButton.length > 0) {
        const button = searchButton[0];
        pressButton(button)
    } else {
        console.log("No buttons found with the specified class.");
    }
}

const pressButton = (button) => {
    // Click the first button in the collection
    const mouseDownEvent = new MouseEvent('mousedown', {bubbles: true, cancelable: true});
    button.dispatchEvent(mouseDownEvent);
    // Create and dispatch mouseup event
    const mouseUpEvent = new MouseEvent('mouseup', {bubbles: true, cancelable: true});
    button.dispatchEvent(mouseUpEvent);
    console.log("Button clicked!");
    console.log(button); // Log the button element
}