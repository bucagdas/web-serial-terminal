import { connect, disconnect, isConnected, sendData, setDisconnectCallback } from './serial.js';
import { setupUI, updateConnectionStatusUI } from './ui.js';
import { logToTerminal, appendToTraditionalTerminal, updateTraditionalPrompt, setTerminalUpdateCallback, clearTerminal } from './terminal.js';
import { escapeHtml } from './utils.js';
import { setupFeatures, trackBytesSent, isFilterActive, applyTerminalFilter, performSearch } from './features.js';

document.addEventListener('DOMContentLoaded', () => {
    setupUI();
    setupFeatures();

    setTerminalUpdateCallback(() => {
        if (isFilterActive) applyTerminalFilter();
        if (document.getElementById('searchInput').value.trim()) performSearch();
    });

    // Welcome message for both terminal types
    setTimeout(() => {
        logToTerminal('<span class="output">Welcome to Web Serial Terminal!</span>\n');
        logToTerminal('<span class="output">Connect to a serial port to begin.</span>\n');
        logToTerminal('<span class="prompt">user@webserial:~$</span> ');
        
        appendToTraditionalTerminal('<span class="output">Welcome to Web Serial Terminal!</span>');
        appendToTraditionalTerminal('<span class="output">Connect to a serial port to begin.</span>');
        updateTraditionalPrompt(false);
    }, 300);

    const connectButton = document.getElementById('connectButton');
    const sendButton = document.getElementById('sendButton');
    const input = document.getElementById('input');
    const clearButton = document.getElementById('clearButton');
    const terminal = document.getElementById('terminal');

    if (!('serial' in navigator)) {
        document.getElementById('serialNotSupported').style.display = 'block';
        if(connectButton) connectButton.disabled = true;
    }

    setDisconnectCallback(() => {
        updateConnectionStatusUI(false);
    });

    if(connectButton) {
        connectButton.addEventListener('click', async () => {
            if (isConnected) {
                await disconnect();
            } else {
                const options = {
                    baudRate: parseInt(document.getElementById('baudRate').value || 9600, 10),
                    dataBits: parseInt(document.getElementById('dataBits').value || 8, 10),
                    stopBits: parseInt(document.getElementById('stopBits')?.value || 1, 10),
                    parity: document.getElementById('parity').value || 'none',
                    flowControl: document.getElementById('flowControl')?.value || 'none',
                };
                await connect(options);
            }
            updateConnectionStatusUI(isConnected);
        });
    }

    function sendFromInput() {
        const rawCommand = input.value;
        if (!rawCommand) return;

        let dataToSend = rawCommand;
        if (document.getElementById('addCR').checked) dataToSend += '\r';
        if (document.getElementById('addLF').checked) dataToSend += '\n';

        // Local echo: show the typed command in the terminal before sending.
        if (document.getElementById('echoOn')?.checked) {
            logToTerminal(`<span class="command">${escapeHtml(rawCommand)}</span>\n`);
            appendToTraditionalTerminal(`<span class="command">${escapeHtml(rawCommand)}</span>`);
        }

        trackBytesSent(dataToSend.length);
        sendData(dataToSend);
        input.value = '';
    }

    if(sendButton && input) {
        sendButton.addEventListener('click', sendFromInput);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendFromInput();
        });
    }

    if(clearButton) {
        clearButton.addEventListener('click', () => {
            if(terminal) clearTerminal();
            const terminalOutput = document.querySelector('.traditional-terminal .terminal-output');
            if(terminalOutput) terminalOutput.innerHTML = '';
        });
    }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('ServiceWorker registration successful with scope: ', registration.scope))
            .catch(err => console.log('ServiceWorker registration failed: ', err));
    });
}
