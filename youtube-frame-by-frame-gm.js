// ==UserScript==
// @name YouTube Frame Advance Button
// @namespace http://tampermonkey.net/
// @version 0.1
// @description Adds a button to YouTube's player to trigger frame advance.
// @match https://www.youtube.com/watch?v=*
// @grant none
// @updateURL   https://raw.githubusercontent.com/kurtchirhart/youtube-frame-by-frame/master/youtube-frame-by-frame-gm.js
// @downloadURL https://raw.githubusercontent.com/kurtchirhart/youtube-frame-by-frame/master/youtube-frame-by-frame-gm.js
// ==/UserScript==

(function() {
    'use strict';

    // *** FIX FOR TRUSTED TYPES IN CHROME ***
    // This creates a policy that allows assignment of any string as HTML, effectively
    // disabling Trusted Types for your script. Use with caution.
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        window.trustedTypes.createPolicy('default', {
            createHTML: (string) => string,
            createScriptURL: (string) => string, // You might need this for scripts if you add them later
            createScript: (string) => string, // You might need this for scripts if you add them later
        });
    }
    // *** END FIX ***
    function addFrameButtons() {
        console.log("xxxxxxxxxxxxxxxxxxxxxx")
        const playerControls = document.querySelector('.ytp-right-controls'); // Find the controls area
        if (!playerControls) {
            return; // If controls not found, try again later
        }

        const frameBackwardButton = document.createElement('button');
        frameBackwardButton.id = 'ytp-frame-advance-button';
        frameBackwardButton.className = 'ytp-button'; // Use YouTube's button styling
        frameBackwardButton.innerHTML = '<'; // You can use an icon or different text

        const frameForwardButton = document.createElement('button');
        frameForwardButton.id = 'ytp-frame-advance-button';
        frameForwardButton.className = 'ytp-button'; // Use YouTube's button styling
        frameForwardButton.innerHTML = '>'; // You can use an icon or different text


        // Add styling for the button
        //GM_addStyle(`
        //    #ytp-frame-advance-button {
        //        /* Add your custom styling here */
        //    }
        //`);

         frameBackwardButton.addEventListener('click', function() {
            // Check if the video is paused before attempting frame advance
            const videoElement = document.querySelector('video');
            if (videoElement && videoElement.paused) {
                const keyboardEvent = new KeyboardEvent('keydown', {
                    key: ',', // Simulate the period key for frame forward
                    code: 'Comma',
                    keyCode: 188, // Key code for period
                    which: 188,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(keyboardEvent);
            } else if (videoElement && !videoElement.paused) {
                videoElement.pause(); // Pause the video if it's playing
                // Then dispatch the frame advance event after a slight delay
                setTimeout(() => {
                    const keyboardEvent = new KeyboardEvent('keydown', {
                        key: ',',
                        code: 'Comma',
                        keyCode: 188,
                        which: 188,
                        bubbles: true,
                        cancelable: true
                    });
                    document.dispatchEvent(keyboardEvent);
                }, 50); // Small delay to ensure pause is registered
            }
        });


        frameForwardButton.addEventListener('click', function() {
            // Check if the video is paused before attempting frame advance
            const videoElement = document.querySelector('video');
            if (videoElement && videoElement.paused) {
                const keyboardEvent = new KeyboardEvent('keydown', {
                    key: '.', // Simulate the period key for frame forward
                    code: 'Period',
                    keyCode: 190, // Key code for period
                    which: 190,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(keyboardEvent);
            } else if (videoElement && !videoElement.paused) {
                videoElement.pause(); // Pause the video if it's playing
                // Then dispatch the frame advance event after a slight delay
                setTimeout(() => {
                    const keyboardEvent = new KeyboardEvent('keydown', {
                        key: '.',
                        code: 'Period',
                        keyCode: 190,
                        which: 190,
                        bubbles: true,
                        cancelable: true
                    });
                    document.dispatchEvent(keyboardEvent);
                }, 50); // Small delay to ensure pause is registered
            }
        });

        playerControls.insertBefore(frameForwardButton, playerControls.firstChild); // Insert the button
        playerControls.insertBefore(frameBackwardButton, playerControls.firstChild); // Insert the button
    }

    // Wait for the YouTube player controls to be available
    const observer = new MutationObserver(function(mutationsList, observer) {
        if (document.querySelector('.ytp-right-controls')) {
            observer.disconnect(); // Stop observing once the button is added
            addFrameButtons();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
