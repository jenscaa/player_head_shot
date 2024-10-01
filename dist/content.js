chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startSearch') {
        console.log("REACHED-----------------------------------------------------------")
        pressSearchButton()
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

const pressSearchButton = () => {
    pressButtonByClassName('call-to-action');
    setTimeout(() => {
        pressButtonByClassName('ut-navigation-button-control'); // Click the button after 1 seconds
        console.log("Button clicked:");
    }, 1000); // 1000 milliseconds = 5 seconds

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
    // Finally, dispatch the click event
    const clickEvent = new MouseEvent('click', {bubbles: true, cancelable: true});
    button.dispatchEvent(clickEvent);
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
