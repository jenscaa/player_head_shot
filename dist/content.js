let running = false;
let currentPlayer = '';
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startSearch') {
        running = true;
        const eafcPlayerInput = document.querySelector('input.ut-text-input-control');
        currentPlayer = eafcPlayerInput.value

        let i = 0;
        let promiseChain = Promise.resolve();  // Start with a resolved promise
        // Unlimited loop if request.value is undefined
        if (request.value === undefined || request.value === '') {
            function loop() {
                if (!running) return;  // Exit the loop if running is set to false
                promiseChain = promiseChain.then(() => {
                    console.log(`Starting search iteration`);
                    return search(convertRpmToMilliseconds(request.rpm), i);  // Return the promise from the search function
                }).then(() => {
                    i++
                    loop();
                });  // Chain the next iteration
            }
            loop();  // Start the loop
        } else {
            console.log("REACHED HERE MAN-----------------------------------------------------------");

            function loop() {
                if (!running || i >= request.value) {
                    chrome.runtime.sendMessage({ action: 'finishedSearch' }, (response) => {
                        console.log("Response from popup:", response);
                    });
                    return;
                }  // Exit if running is false or i exceeds the limit
                promiseChain = promiseChain.then(() => {
                    console.log(`Starting search iteration`);
                    return search(convertRpmToMilliseconds(request.rpm),i);  // Return the promise from the search function
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
        console.log("REACHED_____________________________________________________________________________________________________________________")
        const eafcPlayerResults = document.getElementsByClassName('ut-button-group playerResultsList');
        // Todo update this name error. I just dont care now
        const children = eafcPlayerResults[0]?.children;
        const button = children[0];
        setTimeout(() => {
            pressButton(button)
        }, 1000);
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


const search = (milliseconds, index) => {
    return new Promise((resolve) => {
        // Simulate pressing the first button
        updateMinBidPrice(index);
        pressButtonByClassName('call-to-action');
        setTimeout(() => {
            const parentDiv = document.querySelector('div.paginated-item-list.ut-pinned-list');
            const liElement = parentDiv.querySelector('li.listFUTItem.has-auction-data.selected')
            console.log("JENS HER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            console.log(parentDiv)
            console.log(liElement)

            if (liElement) {
                const buyButton = document.querySelector('button.btn-standard.buyButton.currency-coins');
                console.log(buyButton)
                if (buyButton && !buyButton.disabled) {
                    console.log("The button is not disabled XD.");
                    pressButton(buyButton);
                    setTimeout(() => {
                        const confirmDiv = document.querySelector('div.ea-dialog-view--body');
                        const pElement = confirmDiv.querySelector('p.ea-dialog-view--msg');
                        const string = pElement.textContent;
                        const value = extractValue(string);
                        setTimeout(() => {
                            const buttons = confirmDiv.querySelectorAll('div.ut-button-group button');
                            const confirmButton = buttons[0];
                            pressButton(confirmButton);
                            setTimeout(() => {
                                const boughtLi = document.querySelector('li.listFUTItem.has-auction-data.selected.won')
                                console.log(boughtLi)
                                if (boughtLi) {
                                    chrome.runtime.sendMessage({ action: 'bought', name: currentPlayer, price: value }, (response) => {
                                        console.log("Response from popup:", response);
                                    });
                                } else {
                                    chrome.runtime.sendMessage({ action: 'failed', name: currentPlayer, price: value }, (response) => {
                                        console.log("Response from popup:", response);
                                    });
                                }

                                setTimeout(() => {
                                    // Simulate finding the h1 element with text "Search Results"
                                    const h1Element = Array.from(document.querySelectorAll('h1.title')).find(h1 => h1.textContent.trim() === 'Search Results');
                                    // Get the button within the same div-container
                                    const button = h1Element?.closest('div.ut-navigation-bar-view.navbar-style-landscape.currency-purchase').querySelector('button.ut-navigation-button-control');

                                    // Simulate pressing the found button
                                    if (button) {
                                        pressButton(button); // Click the button
                                        console.log("Button clicked");
                                    }
                                    chrome.runtime.sendMessage({ action: 'searched' }, (response) => {
                                        console.log("Response from popup:", response);
                                    });

                                    // Wait for another 1000 milliseconds before resolving the promise
                                    setTimeout(() => {
                                        console.log("Waited for 1000ms after clicking the button");
                                        resolve();  // Signal that the search is done and can move to the next iteration
                                    }, milliseconds);
                                    console.log("1")
                                }, 300); // After waiting 100 milliseconds, wait another 300 to see the go-back button

                            }, 500)
                        }, 50)
                    }, 50)
                } else {
                    console.log("The button is disabled. XD");
                    setTimeout(() => {
                        // Simulate finding the h1 element with text "Search Results"
                        const h1Element = Array.from(document.querySelectorAll('h1.title')).find(h1 => h1.textContent.trim() === 'Search Results');
                        // Get the button within the same div-container
                        const button = h1Element?.closest('div.ut-navigation-bar-view.navbar-style-landscape.currency-purchase').querySelector('button.ut-navigation-button-control');

                        // Simulate pressing the found button
                        if (button) {
                            pressButton(button); // Click the button
                            console.log("Button clicked");
                        }


                        // Wait for another 1000 milliseconds before resolving the promise
                        setTimeout(() => {
                            console.log("Waited for 1000ms after clicking the button");
                            resolve();  // Signal that the search is done and can move to the next iteration
                        }, milliseconds);
                        console.log("1")
                    }, 300); // After waiting 100 milliseconds, wait another 300 to see the go-back button
                }
            } else {
                setTimeout(() => {
                    // Simulate finding the h1 element with text "Search Results"
                    const h1Element = Array.from(document.querySelectorAll('h1.title')).find(h1 => h1.textContent.trim() === 'Search Results');
                    // Get the button within the same div-container
                    const button = h1Element?.closest('div.ut-navigation-bar-view.navbar-style-landscape.currency-purchase').querySelector('button.ut-navigation-button-control');

                    // Simulate pressing the found button
                    if (button) {
                        pressButton(button); // Click the button
                        console.log("Button clicked");
                    }
                    chrome.runtime.sendMessage({ action: 'searched' }, (response) => {
                        console.log("Response from popup:", response);
                    });

                    // Wait for another 1000 milliseconds before resolving the promise
                    setTimeout(() => {
                        console.log("Waited for 1000ms after clicking the button");
                        resolve();  // Signal that the search is done and can move to the next iteration
                    }, milliseconds);
                    console.log("1")
                }, 300); // After waiting 100 milliseconds, wait another 300 to see the go-back button
            }
        }, 80) // Wait 80 milliseconds in order to see result
    });
}

// Utility function to simulate waiting (use in place of setTimeout)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function search2(milliseconds, index) {
    // Press the initial button
    pressButtonByClassName('call-to-action');

    // Wait 80 milliseconds for result to show
    await wait(80);

    const parentDiv = document.querySelector('div.paginated-item-list.ut-pinned-list');
    const liElement = parentDiv.querySelector('li.listFUTItem.has-auction-data.selected');
    console.log(parentDiv, liElement);

    if (liElement) {
        const buyButton = document.querySelector('button.btn-standard.buyButton.currency-coins');
        console.log(buyButton);

        if (buyButton && !buyButton.disabled) {
            console.log("The buy button is not disabled.");
            pressButton(buyButton);

            await wait(100);

            const confirmDiv = document.querySelector('div.ea-dialog-view--body');
            const pElement = confirmDiv.querySelector('p.ea-dialog-view--msg');
            const string = pElement.textContent;
            const value = extractValue(string);

            // Confirm the purchase
            const confirmButton = confirmDiv.querySelector('div.ut-button-group button');
            pressButton(confirmButton);

            await wait(100);

            const boughtLi = parentDiv.querySelector('li.listFUTItem.has-auction-data.selected.won');
            if (boughtLi) {
                chrome.runtime.sendMessage({ action: 'bought', name: currentPlayer, price: value });
            } else {
                chrome.runtime.sendMessage({ action: 'failed', name: currentPlayer, price: value });
            }
        } else {
            console.log("The buy button is disabled.");
        }
    }

    // Perform the next search step (after the action is complete)
    await performNextSearchStep(milliseconds);
}

async function performNextSearchStep(milliseconds) {
    // Simulate finding the h1 element with text "Search Results"
    const h1Element = Array.from(document.querySelectorAll('h1.title')).find(h1 => h1.textContent.trim() === 'Search Results');
    const button = h1Element?.closest('div.ut-navigation-bar-view.navbar-style-landscape.currency-purchase').querySelector('button.ut-navigation-button-control');

    // Simulate pressing the found button
    if (button) {
        pressButton(button);
        console.log("Button clicked");
    }

    chrome.runtime.sendMessage({ action: 'searched' });

    await wait(milliseconds);
    console.log("Waited for 1000ms after clicking the button.");
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
            minBidPrice.value = 150;
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