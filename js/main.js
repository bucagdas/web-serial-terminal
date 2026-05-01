import { connect, disconnect, isConnected, sendData, setDisconnectCallback } from './serial.js';
import { setupUI, updateConnectionStatusUI } from './ui.js';
import { logToTerminal, appendToTraditionalTerminal, updateTraditionalPrompt, setTerminalUpdateCallback } from './terminal.js';
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
                    baudRate: parseInt(document.getElementById('baudRate').value || 9600),
                    dataBits: parseInt(document.getElementById('dataBits').value || 8),
                    stopBits: parseInt(document.getElementById('stopBits')?.value || 1),
                    parity: document.getElementById('parity').value || 'none',
                };
                await connect(options);
            }
            updateConnectionStatusUI(isConnected);
        });
    }

    if(sendButton && input) {
        sendButton.addEventListener('click', () => {
            let dataToSend = input.value;
            if (document.getElementById('addCR').checked) dataToSend += '\r';
            if (document.getElementById('addLF').checked) dataToSend += '\n';
            
            trackBytesSent(dataToSend.length);
            sendData(dataToSend);
            input.value = '';
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                let dataToSend = input.value;
                if (document.getElementById('addCR').checked) dataToSend += '\r';
                if (document.getElementById('addLF').checked) dataToSend += '\n';
                
                trackBytesSent(dataToSend.length);
                sendData(dataToSend);
                input.value = '';
            }
        });
    }

    if(clearButton) {
        clearButton.addEventListener('click', () => {
            if(terminal) logToTerminal("");
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
function applyProtection() {
    const terminalContainer = document.querySelector('.terminal-container');
    if(terminalContainer) {
        terminalContainer.addEventListener('contextmenu', e => {
            e.preventDefault();
            return false;
        });
        
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.bottom = '10px';
        watermark.style.right = '10px';
        watermark.style.opacity = '0.1';
        watermark.style.pointerEvents = 'none';
        watermark.style.fontSize = '12px';
        watermark.style.fontWeight = 'bold';
        watermark.style.zIndex = '100';
        watermark.textContent = 'Web Serial Terminal';
        
        terminalContainer.style.position = 'relative';
        terminalContainer.appendChild(watermark);
    }
}
document.addEventListener('DOMContentLoaded', applyProtection);
