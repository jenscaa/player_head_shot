let running = false;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startSearch') {
        running = true;
        console.log("REACHED-----------------------------------------------------------");
        console.log(request.value);

        let promiseChain = Promise.resolve();  // Start with a resolved promise

        // Unlimited loop if request.value is undefined
        if (request.value === undefined || request.value === '') {
            function loop() {
                if (!running) return;  // Exit the loop if running is set to false
                promiseChain = promiseChain.then(() => {
                    console.log(`Starting search iteration`);
                    return search();  // Return the promise from the search function
                }).then(loop);  // Chain the next iteration
            }
            loop();  // Start the loop
        } else {
            let i = 0;
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
                    return search();  // Return the promise from the search function
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
        console.log("REACHEDGJKLAGDLSHGD____________________________________________________________________________")
        const priceInputs = document.getElementsByClassName('ut-number-input-control');
        console.log(priceInputs)
        const maxBuyNowInput = priceInputs[3];
        maxBuyNowInput.value = request.value
        console.log(maxBuyNowInput)
        var inputEvent = new Event('input', { bubbles: true });
        maxBuyNowInput.dispatchEvent(inputEvent);
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility to sleep (delay) for a specific amount of time
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Example of pressing a button
function search() {
    return new Promise((resolve) => {
        // Simulate pressing the first button
        pressButtonByClassName('call-to-action');

        // Wait for 500 milliseconds before proceeding
        setTimeout(() => {
            // Simulate finding the h1 element with text "Search Results"
            const h1Element = Array.from(document.querySelectorAll('h1.title')).find(h1 => h1.textContent.trim() === 'Search Results');
            console.log("WE ARE HERE NOW");
            console.log(h1Element);

            // Get the button within the same div-container
            const button = h1Element?.closest('div.ut-navigation-bar-view.navbar-style-landscape.currency-purchase').querySelector('button.ut-navigation-button-control');
            console.log(button);

            // Simulate pressing the found button
            if (button) {
                pressButton(button); // Click the button
                console.log("Button clicked");
            }

            // Wait for another 1000 milliseconds before resolving the promise
            setTimeout(() => {
                console.log("Waited for 1000ms after clicking the button");
                resolve();  // Signal that the search is done and can move to the next iteration
            }, 1000);

        }, 500); // First wait for 500 milliseconds
    });
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

/*
const init = function () {
    const injectElement = document.createElement('div');
    injectElement.className = 'Hello-There'
    injectElement.innerHTML = 'Hello There General Kenobi'
    document.body.append(injectElement);
}
init()
 */
