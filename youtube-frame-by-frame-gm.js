// ==UserScript==
// @name YouTube Frame Advance Button
// @namespace http://tampermonkey.net/
// @version 0.2
// @description Adds native-style frame advance/rewind buttons to YouTube player.
// @match https://www.youtube.com/watch?v=*
// @updateURL   https://raw.githubusercontent.com/kurtchirhart/youtube-frame-by-frame/master/youtube-frame-by-frame-gm.js
// @downloadURL https://raw.githubusercontent.com/kurtchirhart/youtube-frame-by-frame/master/youtube-frame-by-frame-gm.js
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    // *** TIMING & SPEED CONFIGURATION ***
    const CONFIG = {
        minBpm: 200, // Starting repeat rate (BPM)
        maxBpm: 400, // Max repeat rate cap (BPM)
        initialDelayMs: 300, // Hold duration before repeating starts
        accelerationDurationMs: 600, // Time to transition from minBpm to maxBpm
        visualFeedback: true, // Flash button on every tick (manual or auto)
    };

    const DEBUG = false;
    let holdTimer = null;
    let activeOverlay = null;

    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        window.trustedTypes.createPolicy('default', {
            createHTML: (string) => string,
            createScriptURL: (string) => string,
            createScript: (string) => string,
        });
    }

    const SVG_BACKWARD = '<svg height="100%" viewBox="0 0 36 36" width="100%"><path fill="#fff" d="M21.5 12l-6 6 6 6-1.4 1.4-7.4-7.4 7.4-7.4z"/></svg>';
    const SVG_FORWARD = '<svg height="100%" viewBox="0 0 36 36" width="100%"><path fill="#fff" d="M14.5 12l6 6-6 6 1.4 1.4 7.4-7.4-7.4-7.4z"/></svg>';

    function applyDebugStyle(element) {
        if (!DEBUG) return;
        element.style.outline = '2px solid #ff00ff';
        element.style.backgroundColor = 'rgba(255, 0, 255, 0.3)';
        element.style.boxSizing = 'border-box';
    }

    function flashButton(button) {
        if (!CONFIG.visualFeedback) return;
        button.style.opacity = '0.3';
        setTimeout(() => {
            button.style.opacity = '1.0';
        }, 50);
    }

    function createDebugOverlay(button) {
        if (!DEBUG) return null;
        let overlay = button.querySelector('.ytp-bpm-debug');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'ytp-bpm-debug';
            overlay.style.position = 'absolute';
            overlay.style.top = '2px';
            overlay.style.fontSize = '10px';
            overlay.style.fontWeight = 'bold';
            overlay.style.color = '#00ffff';
            overlay.style.textShadow = '0 0 2px #000';
            overlay.style.pointerEvents = 'none';
            button.appendChild(overlay);
        }
        return overlay;
    }

    function removeDebugOverlay(button) {
        const overlay = button.querySelector('.ytp-bpm-debug');
        if (overlay) {
            overlay.remove();
        }
    }

    function dispatchFrameKey(key, code, keyCode, button, currentBpm = null) {
        const videoElement = document.querySelector('video');
        if (!videoElement) return;

        if (!videoElement.paused) {
            videoElement.pause();
        }

        const keyboardEvent = new KeyboardEvent('keydown', {
            key: key,
            code: code,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
        });
        document.dispatchEvent(keyboardEvent);

        flashButton(button);

        if (DEBUG && activeOverlay && currentBpm !== null) {
            activeOverlay.textContent = `${Math.round(currentBpm)}`;
        }
    }

    function stopHold(button) {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        if (button) {
            removeDebugOverlay(button);
        }
        activeOverlay = null;
    }

    function getCurrentBpm(elapsedMs) {
        if (elapsedMs <= 0) return CONFIG.minBpm;
        if (elapsedMs >= CONFIG.accelerationDurationMs) return CONFIG.maxBpm;

        const progress = elapsedMs / CONFIG.accelerationDurationMs;
        return CONFIG.minBpm + (progress * (CONFIG.maxBpm - CONFIG.minBpm));
    }

    function startStepHold(button, key, code, keyCode) {
        stopHold(button);

        activeOverlay = createDebugOverlay(button);

        // First click (manual trigger)
        dispatchFrameKey(key, code, keyCode, button, CONFIG.minBpm);

        holdTimer = setTimeout(() => {
            const repeatStartTime = Date.now();

            function step() {
                const elapsedMs = Date.now() - repeatStartTime;
                const currentBpm = getCurrentBpm(elapsedMs);

                dispatchFrameKey(key, code, keyCode, button, currentBpm);

                const nextIntervalMs = 60000 / currentBpm;
                holdTimer = setTimeout(step, nextIntervalMs);
            }

            step();
        }, CONFIG.initialDelayMs);
    }

    function attachHoldEvents(button, key, code, keyCode) {
        button.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            startStepHold(button, key, code, keyCode);
        });

        button.addEventListener('mouseup', () => stopHold(button));
        button.addEventListener('mouseleave', () => stopHold(button));
    }

    function createStyledButton(id, svgContent, title) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.className = 'ytp-button';
        btn.title = title;
        btn.innerHTML = svgContent;

        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.position = 'relative';
        btn.style.transition = 'opacity 0.05s ease';

        applyDebugStyle(btn);
        return btn;
    }

    function addFrameButtons() {
        const playerControls = document.querySelector('.ytp-right-controls');
        if (!playerControls || document.getElementById('ytp-frame-backward-button')) {
            return;
        }

        const frameBackwardButton = createStyledButton('ytp-frame-backward-button', SVG_BACKWARD, 'Previous Frame');
        attachHoldEvents(frameBackwardButton, ',', 'Comma', 188);

        const frameForwardButton = createStyledButton('ytp-frame-forward-button', SVG_FORWARD, 'Next Frame');
        attachHoldEvents(frameForwardButton, '.', 'Period', 190);

        playerControls.insertBefore(frameForwardButton, playerControls.firstChild);
        playerControls.insertBefore(frameBackwardButton, playerControls.firstChild);
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector('.ytp-right-controls')) {
            addFrameButtons();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
