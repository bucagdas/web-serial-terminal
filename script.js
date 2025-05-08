// DOM Elements
const baudRateSelect = document.getElementById('baudRate');
const dataBitsSelect = document.getElementById('dataBits');
const paritySelect = document.getElementById('parity');
const stopBitsSelect = document.getElementById('stopBits');
const flowControlSelect = document.getElementById('flowControl');
const connectButton = document.getElementById('connectButton');
const connectionStatus = document.getElementById('connectionStatus');
const terminal = document.getElementById('terminal');
const input = document.getElementById('input');
const sendButton = document.getElementById('sendButton');
const clearButton = document.getElementById('clearButton');
const addCRCheckbox = document.getElementById('addCR');
const addLFCheckbox = document.getElementById('addLF');
const echoCheckbox = document.getElementById('echoOn');
const serialNotSupported = document.getElementById('serialNotSupported');
const tabButtons = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const commandButtons = document.querySelectorAll('.command-button');
const themeToggle = document.getElementById('themeToggle');
const controlClose = document.querySelector('.control-close');
const controlMinimize = document.querySelector('.control-minimize');
const controlMaximize = document.querySelector('.control-maximize');
const autoScrollToggle = document.getElementById('autoScrollToggle');
const terminalContainer = document.querySelector('.terminal-container');
const settingsToggle = document.getElementById('settingsToggle');
const commandsToggle = document.getElementById('commandsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const commandsPanel = document.getElementById('commandsPanel');
const panelToggles = document.querySelectorAll('.panel-toggle');

// Check if Web Serial API is supported
if (!('serial' in navigator)) {
    serialNotSupported.style.display = 'block';
    connectButton.disabled = true;
}

// Variables
let port = null;
let reader = null;
let inputDone = null;
let outputDone = null;
let inputStream = null;
let outputStream = null;
let isConnected = false;
let currentTheme = localStorage.getItem('theme') || 'light';
let isTerminalMaximized = false;
let isTerminalMinimized = false;
let isSettingsPanelHidden = localStorage.getItem('settingsPanelHidden') === 'true';
let isCommandsPanelHidden = localStorage.getItem('commandsPanelHidden') === 'true';
let autoScroll = true; // Auto-scroll enabled by default

// Control sequence mappings
const controlSequences = {
    '^C': '\x03', // Ctrl+C (SIGINT - Break)
    '^Z': '\x1A', // Ctrl+Z (EOF - End Config)
    '^R': '\x12', // Ctrl+R (Redisplay)
    '^U': '\x15', // Ctrl+U (Clear Line)
    '^A': '\x01', // Ctrl+A (Begin of Line)
    '^E': '\x05', // Ctrl+E (End of Line)
    '^T': '\x14', // Ctrl+T (TELNET)
    '^D': '\x04'  // Ctrl+D (EOF)
};

// Event listeners
connectButton.addEventListener('click', toggleConnection);
sendButton.addEventListener('click', sendData);
clearButton.addEventListener('click', clearTerminal);
input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendData();
    }
});

// Panel toggle buttons
settingsToggle.addEventListener('click', () => {
    togglePanel('settingsPanel');
    settingsToggle.classList.toggle('active');
});

commandsToggle.addEventListener('click', () => {
    togglePanel('commandsPanel');
    commandsToggle.classList.toggle('active');
});

// Panel header toggle buttons
panelToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const panelId = toggle.getAttribute('data-target');
        togglePanel(panelId);
        
        // Also toggle the corresponding button in the header
        if (panelId === 'settingsPanel') {
            settingsToggle.classList.toggle('active');
        } else if (panelId === 'commandsPanel') {
            commandsToggle.classList.toggle('active');
        }
    });
});

// Auto-scroll toggle
autoScrollToggle.addEventListener('click', () => {
    autoScroll = !autoScroll;
    autoScrollToggle.classList.toggle('disabled', !autoScroll);
    
    if (autoScroll) {
        // If re-enabling auto-scroll, scroll to bottom immediately
        scrollToBottom();
    }
    
    // Save preference to localStorage
    localStorage.setItem('autoScroll', autoScroll);
});

// Add event listener for manual scrolling
terminalContainer.addEventListener('scroll', function() {
    // If user has scrolled up more than 30px from bottom, disable auto-scroll
    if (terminalContainer.scrollHeight - terminalContainer.scrollTop > terminalContainer.clientHeight + 30) {
        autoScroll = false;
    } 
    // If user has scrolled to near bottom (within 10px), re-enable auto-scroll
    else if (terminalContainer.scrollHeight - terminalContainer.scrollTop <= terminalContainer.clientHeight + 10) {
        autoScroll = true;
    }
});

// Function to scroll to bottom if auto-scroll is enabled
function scrollToBottom() {
    if (autoScroll) {
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
    }
}

// Function to toggle panel visibility
function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    
    if (panel) {
        panel.classList.toggle('hidden');
        
        // Save state to localStorage
        if (panelId === 'settingsPanel') {
            isSettingsPanelHidden = panel.classList.contains('hidden');
            localStorage.setItem('settingsPanelHidden', isSettingsPanelHidden);
        } else if (panelId === 'commandsPanel') {
            isCommandsPanelHidden = panel.classList.contains('hidden');
            localStorage.setItem('commandsPanelHidden', isCommandsPanelHidden);
        }
    }
}

// Terminal control actions
controlClose.addEventListener('click', () => {
    clearTerminal();
    logToTerminal('<span class="output">Terminal session closed.</span>\n');
});

controlMinimize.addEventListener('click', () => {
    if (isTerminalMaximized) {
        // If maximized, restore to normal first
        toggleMaximize();
    }
    
    if (!isTerminalMinimized) {
        // Minimize
        terminalContainer.classList.add('minimized');
        isTerminalMinimized = true;
    } else {
        // Restore
        terminalContainer.classList.remove('minimized');
        isTerminalMinimized = false;
    }
});

controlMaximize.addEventListener('click', toggleMaximize);

function toggleMaximize() {
    if (!isTerminalMaximized) {
        // Maximize
        terminalContainer.classList.add('maximized');
        isTerminalMaximized = true;
    } else {
        // Restore
        terminalContainer.classList.remove('maximized');
        isTerminalMaximized = false;
    }
}

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Apply saved theme and panel states on page load
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
    
    // Apply saved panel states
    if (isSettingsPanelHidden) {
        togglePanel('settingsPanel');
        settingsToggle.classList.add('active');
    }
    
    if (isCommandsPanelHidden) {
        togglePanel('commandsPanel');
        commandsToggle.classList.add('active');
    }
    
    // Apply saved auto-scroll state
    const savedAutoScroll = localStorage.getItem('autoScroll');
    if (savedAutoScroll !== null) {
        autoScroll = savedAutoScroll !== 'false';
        autoScrollToggle.classList.toggle('disabled', !autoScroll);
    }
    
    // Welcome message
    setTimeout(() => {
        logToTerminal('<span class="output">Welcome to Web Serial Terminal!</span>\n');
        logToTerminal('<span class="output">Connect to a serial port to begin.</span>\n');
        logToTerminal('<span class="prompt">user@webserial:~$</span> ');
    }, 300);
});

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabName) {
                content.classList.add('active');
            }
        });
    });
});

// Command buttons
commandButtons.forEach(button => {
    button.addEventListener('click', () => {
        const command = button.getAttribute('data-command');
        
        // If it's a control sequence, map it to its ASCII value
        if (command.startsWith('^') && controlSequences[command]) {
            sendControlSequence(command);
        } else {
            // Otherwise, set the input value and send it
            input.value = command;
            sendData();
        }
    });
});

// Functions
async function toggleConnection() {
    if (isConnected) {
        await disconnect();
    } else {
        await connect();
    }
}

// Connect to the serial port
async function connect() {
    try {
        // Request a serial port
        port = await navigator.serial.requestPort();

        // Open the serial port with selected options
        const options = {
            baudRate: parseInt(baudRateSelect.value),
            dataBits: parseInt(dataBitsSelect.value),
            stopBits: parseInt(stopBitsSelect.value),
            parity: paritySelect.value,
            flowControl: flowControlSelect.value
        };

        await port.open(options);

        // Set up the input stream with a text decoder
        const decoder = new TextDecoderStream();
        inputDone = port.readable.pipeTo(decoder.writable);
        inputStream = decoder.readable;

        // Set up the output stream with a text encoder
        const encoder = new TextEncoderStream();
        outputDone = encoder.readable.pipeTo(port.writable);
        outputStream = encoder.writable;

        // Start reading data from the input stream
        reader = inputStream.getReader();
        readLoop();

        // Update UI to reflect connected state
        isConnected = true;
        updateConnectionStatus();
        connectButton.innerHTML = '<i class="fas fa-plug"></i> Disconnect';
        input.focus();

        logToTerminal('<span class="output">Connected to serial port</span>\n');
        logToTerminal('<span class="prompt">serial@port:~$</span> ');
    } catch (error) {
        console.error('Error connecting to serial port:', error);
        logToTerminal(`<span class="error">Error connecting: ${error.message}</span>\n`);
    }
}

// Disconnect from the serial port
async function disconnect() {
    if (reader) {
        // Cancel the reader to break out of the read loop
        await reader.cancel();
        await inputDone.catch(() => {});
        reader = null;
        inputDone = null;
    }

    if (outputStream) {
        // Close the output stream
        await outputStream.getWriter().close();
        await outputDone;
        outputStream = null;
        outputDone = null;
    }

    // Close the port
    if (port) {
        await port.close();
        port = null;
    }

    // Update UI to reflect disconnected state
    isConnected = false;
    updateConnectionStatus();
    connectButton.innerHTML = '<i class="fas fa-plug"></i> Connect';
    logToTerminal('<span class="output">Disconnected from serial port</span>\n');
    logToTerminal('<span class="prompt">user@webserial:~$</span> ');
}

// Read data continuously from the input stream
async function readLoop() {
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                // Allow the serial port to be closed
                reader.releaseLock();
                break;
            }

            if (value) {
                logToTerminal(`<span class="output">${formatOutputText(value)}</span>`);
            }
        }
    } catch (error) {
        console.error('Error reading from serial port:', error);
        logToTerminal(`<span class="error">Error reading: ${error.message}</span>\n`);
    }
}

// Format terminal output text
function formatOutputText(text) {
    // Escape HTML to prevent XSS
    const escaped = escapeHtml(text);
    
    // Add syntax highlighting if needed
    // This is a simple example - you can expand this to highlight more patterns
    const highlighted = escaped
        .replace(/error|fail/gi, '<span class="error">$&</span>')
        .replace(/success|connected/gi, '<span style="color: var(--terminal-prompt)">$&</span>')
        .replace(/(IP address:)\s*([0-9\.]+)/gi, '$1 <span style="color: var(--terminal-command)">$2</span>');
    
    return highlighted;
}

// Escape HTML characters to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Send data to the serial port
async function sendData() {
    if (!isConnected || !outputStream) {
        logToTerminal('<span class="error">Not connected to a serial port</span>\n');
        return;
    }

    const text = input.value;
    if (!text) return;

    try {
        const writer = outputStream.getWriter();
        
        // Prepare the data string with appropriate line endings
        let dataToSend = text;
        if (addCRCheckbox.checked) dataToSend += '\r';
        if (addLFCheckbox.checked) dataToSend += '\n';

        // Send the data
        await writer.write(dataToSend);
        
        // Echo to terminal if enabled
        if (echoCheckbox.checked) {
            logToTerminal(`<span class="command">${escapeHtml(text)}</span>\n`);
        }
        
        // Clear the input field
        input.value = '';
        
        // Release the writer
        writer.releaseLock();
    } catch (error) {
        console.error('Error sending data:', error);
        logToTerminal(`<span class="error">Error sending data: ${error.message}</span>\n`);
    }
}

// Send control sequence
async function sendControlSequence(sequence) {
    if (!isConnected || !outputStream) {
        logToTerminal('<span class="error">Not connected to a serial port</span>\n');
        return;
    }

    try {
        const writer = outputStream.getWriter();
        
        // Get the ASCII control character
        const controlChar = controlSequences[sequence];
        
        // Send the control character
        await writer.write(controlChar);
        
        // Echo to terminal if enabled
        if (echoCheckbox.checked) {
            logToTerminal(`<span class="command">${sequence}</span>\n`);
        }
        
        // Release the writer
        writer.releaseLock();
    } catch (error) {
        console.error('Error sending control sequence:', error);
        logToTerminal(`<span class="error">Error sending control sequence: ${error.message}</span>\n`);
    }
}

// Utility functions
function updateConnectionStatus() {
    connectionStatus.textContent = isConnected ? 'Connected' : 'Disconnected';
    connectionStatus.className = isConnected 
        ? 'connection-status status-connected' 
        : 'connection-status status-disconnected';
    
    // Enable/disable input and send button
    input.disabled = !isConnected;
    sendButton.disabled = !isConnected;
    
    // Enable/disable command buttons
    commandButtons.forEach(button => {
        button.disabled = !isConnected;
    });
}

function logToTerminal(text) {
    terminal.innerHTML += text;
    scrollToBottom();
}

function clearTerminal() {
    terminal.innerHTML = '';
}

// Toggle between light and dark themes
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
}

// Apply the specified theme to the document
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update the theme toggle icon
    const themeIcon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Listen for connect and disconnect events
navigator.serial.addEventListener('connect', (event) => {
    console.log('Serial device connected:', event.target);
});

navigator.serial.addEventListener('disconnect', (event) => {
    console.log('Serial device disconnected:', event.target);
    
    // If the disconnected device is our current port, disconnect
    if (port && port === event.target) {
        disconnect();
    }
}); 