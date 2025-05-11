/**
 * Web Serial Terminal
 * Copyright (c) 2025 sarusadgac
 *https://github.com/sarusadgac/web-serial-terminal
 * 
 * License: MIT
 * 
 * This code is protected by copyright law.
 * Unauthorized usage, copying, modification or distribution 
 * outside the license terms is prohibited.
 * 
 * Bu kod telif hakkı yasası ile korunmaktadır.
 * Lisans şartları dışında kullanımı, kopyalanması,
 * değiştirilmesi veya dağıtılması yasaktır.
 */

// Basic anti-copy protection
(function() {
    // Add a unique instance ID to identify this copy
    const instanceId = generateUniqueId();
    console.log(`Web Serial Terminal Instance: ${instanceId}`);
    
    // Implement basic protection methods
    function applyProtection() {
        // Block context menu on the terminal area
        document.querySelector('.terminal-container').addEventListener('contextmenu', e => {
            e.preventDefault();
            return false;
        });
        
        // Add a watermark to the terminal
        const watermark = document.createElement('div');
        watermark.style.position = 'absolute';
        watermark.style.bottom = '10px';
        watermark.style.right = '10px';
        watermark.style.fontSize = '10px';
        watermark.style.color = 'rgba(255,255,255,0.1)';
        watermark.style.pointerEvents = 'none';
        watermark.style.zIndex = '100';
        watermark.style.userSelect = 'none';
        watermark.textContent = `#${instanceId.substring(0, 6)} - sarusadgac`;
        document.querySelector('.terminal-content-area').appendChild(watermark);
        
        // Warning on select all
        document.addEventListener('keydown', e => {
            // Ctrl+A, Ctrl+S, Ctrl+U
            if (e.ctrlKey && (e.key === 'a' || e.key === 's' || e.key === 'u')) {
                e.preventDefault();
                alert('This application is protected by copyright laws.');
                return false;
            }
        });
        
        // Monitor for attempts to open devtools - not foolproof but adds a layer
        let devtoolsDetected = false;
        setInterval(() => {
            if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
                if (!devtoolsDetected) {
                    console.warn('Web Serial Terminal Copyright © 2025 sarusadgac');
                    devtoolsDetected = true;
                }
            } else {
                devtoolsDetected = false;
            }
        }, 1000);
    }
    
    // Generate a unique ID for this instance
    function generateUniqueId() {
        return 'st-' + Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    // Apply protection once DOM is loaded
    document.addEventListener('DOMContentLoaded', applyProtection);
})();

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
const terminalHeight = document.getElementById('terminalHeight');
const terminalFontSize = document.getElementById('terminalFontSize');
const terminalContentArea = document.querySelector('.terminal-content-area');

// Search & Filter elements
const searchToggle = document.getElementById('searchToggle');
const filterToggle = document.getElementById('filterToggle');
const exportToggle = document.getElementById('exportToggle');
const statsToggle = document.getElementById('statsToggle');
const searchPanel = document.getElementById('searchPanel');
const filterPanel = document.getElementById('filterPanel');
const exportPanel = document.getElementById('exportPanel');
const statsPanel = document.getElementById('statsPanel');
const searchInput = document.getElementById('searchInput');
const searchPrev = document.getElementById('searchPrev');
const searchNext = document.getElementById('searchNext');
const searchInfo = document.getElementById('searchInfo');
const closeSearch = document.getElementById('closeSearch');
const filterErrors = document.getElementById('filterErrors');
const filterCommands = document.getElementById('filterCommands');
const customFilter = document.getElementById('customFilter');
const applyFilter = document.getElementById('applyFilter');
const resetFilter = document.getElementById('resetFilter');
const closeFilter = document.getElementById('closeFilter');
const exportTxt = document.getElementById('exportTxt');
const closeExport = document.getElementById('closeExport');
const connectionTime = document.getElementById('connectionTime');
const bytesSent = document.getElementById('bytesSent');
const bytesReceived = document.getElementById('bytesReceived');
const commandsSent = document.getElementById('commandsSent');
const transferRate = document.getElementById('transferRate');
const resetStats = document.getElementById('resetStats');
const closeStats = document.getElementById('closeStats');

const terminalModeToggle = document.getElementById('terminalModeToggle');
const traditionalTerminal = document.getElementById('traditionalTerminal');
const terminalOutput = document.querySelector('.traditional-terminal .terminal-output');
const terminalInputArea = document.querySelector('.traditional-terminal .terminal-input-area');
const terminalPrompt = document.querySelector('.traditional-terminal .terminal-prompt');
const terminalCursor = document.querySelector('.traditional-terminal .terminal-cursor');
const modernInputArea = document.getElementById('modernInputArea');

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
let isTraditionalMode = localStorage.getItem('traditionalMode') === 'true';

// Search functionality variables
let searchMatches = [];
let currentMatchIndex = -1;
let isSearchActive = false;

// Filter functionality variables
let isFilterActive = false;
let activeFilters = {
    errors: false,
    commands: false,
    custom: ''
};

// Statistics variables
let stats = {
    connectTime: null,
    totalBytesSent: 0,
    totalBytesReceived: 0,
    totalCommandsSent: 0,
    lastReceiveTime: null,
    bytesPerSecond: 0
};

let statsUpdateInterval = null;

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
terminalContentArea.addEventListener('scroll', function() {
    // If user has scrolled up more than 30px from bottom, disable auto-scroll
    if (terminalContentArea.scrollHeight - terminalContentArea.scrollTop > terminalContentArea.clientHeight + 30) {
        autoScroll = false;
    } 
    // If user has scrolled to near bottom (within 10px), re-enable auto-scroll
    else if (terminalContentArea.scrollHeight - terminalContentArea.scrollTop <= terminalContentArea.clientHeight + 10) {
        autoScroll = true;
    }
});

// Function to scroll to bottom if auto-scroll is enabled
function scrollToBottom() {
    if (autoScroll) {
        terminalContentArea.scrollTop = terminalContentArea.scrollHeight;
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

// Terminal size settings
terminalHeight.addEventListener('change', updateTerminalSize);
terminalFontSize.addEventListener('change', updateTerminalSize);

// Apply saved terminal mode on page load
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
    
    // Apply saved terminal size settings
    const savedHeight = localStorage.getItem('terminalHeight');
    if (savedHeight) {
        terminalHeight.value = savedHeight;
    }
    
    const savedFontSize = localStorage.getItem('terminalFontSize');
    if (savedFontSize) {
        terminalFontSize.value = savedFontSize;
    }
    
    // Apply terminal size settings
    updateTerminalSize();
    
    // Apply saved terminal mode preference
    if (isTraditionalMode) {
        // Apply traditional mode without animation
        terminalContainer.classList.add('traditional-mode');
        modernInputArea.classList.add('hidden');
        terminalModeToggle.classList.add('traditional-active');
        terminalModeToggle.setAttribute('title', 'Switch to modern mode');
    }
    
    // Welcome message for both terminal types
    setTimeout(() => {
        logToTerminal('<span class="output">Welcome to Web Serial Terminal!</span>\n');
        logToTerminal('<span class="output">Connect to a serial port to begin.</span>\n');
        logToTerminal('<span class="prompt">user@webserial:~$</span> ');
        
        appendToTraditionalTerminal('<span class="output">Welcome to Web Serial Terminal!</span>');
        appendToTraditionalTerminal('<span class="output">Connect to a serial port to begin.</span>');
        updateTraditionalPrompt();
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

        // Update both terminals
        logToTerminal('<span class="output">Connected to serial port</span>\n');
        logToTerminal('<span class="prompt">serial@port:~$</span> ');
        
        appendToTraditionalTerminal('<span class="output">Connected to serial port</span>');
        updateTraditionalPrompt();

        // Reset and start statistics tracking
        resetStatistics();
        startStatsTracking();
    } catch (error) {
        console.error('Error connecting to serial port:', error);
        logToTerminal(`<span class="error">Error connecting: ${error.message}</span>\n`);
        appendToTraditionalTerminal(`<span class="error">Error connecting: ${error.message}</span>`);
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
    
    // Update both terminals
    logToTerminal('<span class="output">Disconnected from serial port</span>\n');
    logToTerminal('<span class="prompt">user@webserial:~$</span> ');
    
    appendToTraditionalTerminal('<span class="output">Disconnected from serial port</span>');
    updateTraditionalPrompt();

    // Stop statistics tracking
    stopStatsTracking();
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
                // Update received bytes statistics
                stats.totalBytesReceived += value.length;
                stats.lastReceiveTime = new Date();
                updateStatsDisplay();
                
                // Output to modern terminal
                logToTerminal(`<span class="output">${formatOutputText(value)}</span>`);
                
                // Output to traditional terminal
                appendToTraditionalTerminal(`<span class="output">${formatOutputText(value)}</span>`);
            }
        }
    } catch (error) {
        console.error('Error reading from serial port:', error);
        logToTerminal(`<span class="error">Error reading: ${error.message}</span>\n`);
        appendToTraditionalTerminal(`<span class="error">Error reading: ${error.message}</span>`);
    }
}

// Format terminal output text
function formatOutputText(text) {
    // Escape HTML to prevent XSS
    const escaped = escapeHtml(text);
    
    // Add syntax highlighting and formatting with regex patterns
    return escaped
        // Error and warning messages
        .replace(/error|fail|exception|timeout/gi, '<span class="error">$&</span>')
        .replace(/warning|deprecated/gi, '<span style="color: var(--warning-color)">$&</span>')
        
        // Network information
        .replace(/(IP address|IPv4|IPv6):\s*([0-9a-f.:]+)/gi, '$1: <span style="color: var(--terminal-command)">$2</span>')
        .replace(/MAC:\s*([0-9a-f:-]{17})/gi, 'MAC: <span style="color: var(--primary-color)">$1</span>')
        .replace(/(netmask|gateway|dns):\s*([0-9.]+)/gi, '$1: <span style="color: var(--secondary-color)">$2</span>')
        
        // Success messages
        .replace(/success|connected|online|available/gi, '<span style="color: var(--terminal-prompt)">$&</span>')
        
        // Numeric values
        .replace(/\b(\d+\.\d+|0x[0-9a-f]+)\b/gi, '<span style="color: var(--primary-color)">$&</span>')
        
        // Important keywords
        .replace(/\b(true|false|null|undefined)\b/gi, '<span style="color: var(--primary-color); font-weight: bold;">$&</span>')
        
        // Path and filenames
        .replace(/\b(\/[\w\/.~-]+)\b/g, '<span style="color: #FFD700">$&</span>')
        
        // URLs and web addresses
        .replace(/(https?:\/\/[^\s<>"']+)/gi, '<span style="color: var(--primary-color); text-decoration: underline;">$&</span>')
        
        // JSON keys
        .replace(/"([^"]+)":/g, '<span style="color: var(--terminal-command)">"$1"</span>:')
        
        // Timestamps and dates
        .replace(/\b(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2}(?:\.\d+)?)[Z]?/g, 
                '<span style="color: var(--warning-color)">$1 $2</span>');
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

        // Update sent bytes statistics
        stats.totalBytesSent += dataToSend.length;
        stats.totalCommandsSent++;
        updateStatsDisplay();

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
    
    // Reapply filtering if active
    if (isFilterActive) {
        applyTerminalFilter();
    }
    
    // Reapply search highlighting if active
    if (isSearchActive && searchInput.value.trim()) {
        performSearch();
    }
    
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

// Search panel toggle
searchToggle.addEventListener('click', () => {
    searchPanel.classList.toggle('hidden');
    if (!searchPanel.classList.contains('hidden')) {
        filterPanel.classList.add('hidden'); // Close filter panel if open
        searchInput.focus();
        if (searchInput.value) {
            performSearch();
        }
    } else {
        clearSearchHighlights();
    }
});

// Filter panel toggle
filterToggle.addEventListener('click', () => {
    filterPanel.classList.toggle('hidden');
    if (!filterPanel.classList.contains('hidden')) {
        searchPanel.classList.add('hidden'); // Close search panel if open
    } else if (isFilterActive) {
        resetTerminalFilter();
    }
});

// Close search panel
closeSearch.addEventListener('click', () => {
    searchPanel.classList.add('hidden');
    clearSearchHighlights();
});

// Close filter panel
closeFilter.addEventListener('click', () => {
    filterPanel.classList.add('hidden');
    if (isFilterActive) {
        resetTerminalFilter();
    }
});

// Search input event
searchInput.addEventListener('input', performSearch);
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) {
            navigateSearch('prev');
        } else {
            navigateSearch('next');
        }
    } else if (event.key === 'Escape') {
        searchPanel.classList.add('hidden');
        clearSearchHighlights();
    }
});

// Search navigation buttons
searchPrev.addEventListener('click', () => navigateSearch('prev'));
searchNext.addEventListener('click', () => navigateSearch('next'));

// Filter application
applyFilter.addEventListener('click', applyTerminalFilter);
resetFilter.addEventListener('click', resetTerminalFilter);

// Perform search in terminal content
function performSearch() {
    clearSearchHighlights();
    
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        searchInfo.textContent = '0 matches';
        return;
    }
    
    isSearchActive = true;
    searchMatches = [];
    currentMatchIndex = -1;
    
    // Create a temporary div to work with the terminal content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = terminal.innerHTML;
    
    try {
        // Perform the search using regular expression for case-insensitive search
        const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
        const terminalText = tempDiv.innerHTML;
        
        // Create marked-up content with search highlights
        const markedContent = terminalText.replace(regex, match => 
            `<span class="search-highlight">${match}</span>`
        );
        
        // Update the terminal content with highlighted matches
        terminal.innerHTML = markedContent;
        
        // Collect all the match elements
        searchMatches = Array.from(terminal.querySelectorAll('.search-highlight'));
        
        // Update search info
        searchInfo.textContent = `${searchMatches.length} matches`;
        
        // If matches found, navigate to the first one
        if (searchMatches.length > 0) {
            navigateSearch('next');
        }
    } catch (e) {
        // Handle invalid regex
        console.error('Search error:', e);
        searchInfo.textContent = 'Invalid search';
    }
}

// Navigate between search matches
function navigateSearch(direction) {
    if (searchMatches.length === 0) return;
    
    // Remove current active highlight
    if (currentMatchIndex >= 0 && currentMatchIndex < searchMatches.length) {
        searchMatches[currentMatchIndex].classList.remove('active');
    }
    
    // Update the match index based on direction
    if (direction === 'next') {
        currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
    } else {
        currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    }
    
    // Add active highlight to the current match
    const currentMatch = searchMatches[currentMatchIndex];
    currentMatch.classList.add('active');
    
    // Update search info
    searchInfo.textContent = `${currentMatchIndex + 1}/${searchMatches.length} matches`;
    
    // Scroll to the current match (within the content area)
    const matchRect = currentMatch.getBoundingClientRect();
    const contentRect = terminalContentArea.getBoundingClientRect();
    
    // Check if match is within visible area
    if (
        matchRect.top < contentRect.top || 
        matchRect.bottom > contentRect.bottom
    ) {
        currentMatch.scrollIntoView({ 
            block: 'center', 
            behavior: 'smooth',
            scrollMode: 'if-needed' 
        });
    }
}

// Clear search highlights
function clearSearchHighlights() {
    if (!isSearchActive) return;
    
    // Create a temporary div
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = terminal.innerHTML;
    
    // Find all search highlights and replace them with their content
    const highlights = tempDiv.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const textNode = document.createTextNode(highlight.textContent);
        highlight.parentNode.replaceChild(textNode, highlight);
    });
    
    // Update the terminal content
    terminal.innerHTML = tempDiv.innerHTML;
    
    // Reset search state
    searchMatches = [];
    currentMatchIndex = -1;
    isSearchActive = false;
}

// Apply terminal content filter
function applyTerminalFilter() {
    // Store current filter settings
    activeFilters.errors = filterErrors.checked;
    activeFilters.commands = filterCommands.checked;
    activeFilters.custom = customFilter.value.trim();
    
    isFilterActive = activeFilters.errors || activeFilters.commands || activeFilters.custom;
    
    if (!isFilterActive) {
        resetTerminalFilter();
        return;
    }
    
    // Get all terminal content elements
    const lines = Array.from(terminal.childNodes);
    let anyVisible = false;
    
    lines.forEach(line => {
        let shouldShow = false;
        const content = line.textContent || '';
        
        // Check if the line matches any of the active filters
        if (activeFilters.errors && (line.classList?.contains('error') || content.match(/error|fail/i))) {
            shouldShow = true;
        } else if (activeFilters.commands && line.classList?.contains('command')) {
            shouldShow = true;
        } else if (activeFilters.custom && content.match(new RegExp(escapeRegExp(activeFilters.custom), 'i'))) {
            shouldShow = true;
        } else if (!activeFilters.errors && !activeFilters.commands && !activeFilters.custom) {
            shouldShow = true;
        }
        
        // Apply display property based on filter match
        if (line.nodeType === 1) { // Element node
            if (shouldShow) {
                line.classList.remove('filtered-out');
                anyVisible = true;
            } else {
                line.classList.add('filtered-out');
            }
        }
    });
    
    // If no visible content after filtering, show a message
    if (!anyVisible && isFilterActive) {
        const noMatchElement = document.createElement('div');
        noMatchElement.classList.add('output', 'filter-message');
        noMatchElement.textContent = 'No content matches the current filters';
        terminal.appendChild(noMatchElement);
    }
    
    // Toggle highlight of filter button to indicate active filter
    filterToggle.classList.toggle('active', isFilterActive);
}

// Reset terminal filter
function resetTerminalFilter() {
    // Reset filter UI
    filterErrors.checked = false;
    filterCommands.checked = false;
    customFilter.value = '';
    
    // Reset filter state
    isFilterActive = false;
    activeFilters.errors = false;
    activeFilters.commands = false;
    activeFilters.custom = '';
    
    // Show all content
    const filteredElements = terminal.querySelectorAll('.filtered-out');
    filteredElements.forEach(element => {
        element.classList.remove('filtered-out');
    });
    
    // Remove any filter message
    const filterMessages = terminal.querySelectorAll('.filter-message');
    filterMessages.forEach(message => message.remove());
    
    // Remove highlight from filter button
    filterToggle.classList.remove('active');
}

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export panel toggle
exportToggle.addEventListener('click', () => {
    exportPanel.classList.toggle('hidden');
    if (!exportPanel.classList.contains('hidden')) {
        // Close other panels
        searchPanel.classList.add('hidden');
        filterPanel.classList.add('hidden');
        statsPanel.classList.add('hidden');
    }
});

// Close export panel
closeExport.addEventListener('click', () => {
    exportPanel.classList.add('hidden');
});

// Stats panel toggle
statsToggle.addEventListener('click', () => {
    statsPanel.classList.toggle('hidden');
    if (!statsPanel.classList.contains('hidden')) {
        // Close other panels
        searchPanel.classList.add('hidden');
        filterPanel.classList.add('hidden');
        exportPanel.classList.add('hidden');
        
        // Update stats display
        updateStatsDisplay();
    }
});

// Close stats panel
closeStats.addEventListener('click', () => {
    statsPanel.classList.add('hidden');
});

// Reset statistics
resetStats.addEventListener('click', resetStatistics);

// Export terminal content to text file
exportTxt.addEventListener('click', () => {
    exportTerminalContent('txt');
});

// Function to export terminal content in different formats
function exportTerminalContent(format) {
    // Create a temporary div to extract clean text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = terminal.innerHTML;
    
    let content = '';
    let filename = '';
    
    switch (format) {
        case 'txt':
            // Extract text content, handling elements specially
            content = extractTextFromTerminal(tempDiv);
            filename = `terminal_export_${getTimestamp()}.txt`;
            break;
            
        // Other export formats can be added here
            
        default:
            console.error('Unknown export format:', format);
            return;
    }
    
    // Create a blob with the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a temporary link and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
    
    // Close export panel
    exportPanel.classList.add('hidden');
}

// Helper function to extract text from terminal while preserving structure
function extractTextFromTerminal(container) {
    let result = '';
    
    // Process each node in the container
    Array.from(container.childNodes).forEach(node => {
        // Skip filtered out content
        if (node.classList && node.classList.contains('filtered-out')) {
            return;
        }
        
        // If text node, add its content
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent;
        } 
        // If element node, process it according to its type
        else if (node.nodeType === Node.ELEMENT_NODE) {
            // Handle special elements (spans with classes, etc.)
            if (node.tagName === 'SPAN') {
                // For terminal output formatting, just add the text
                if (node.classList.contains('search-highlight')) {
                    result += node.textContent;
                } else {
                    result += extractTextFromTerminal(node);
                }
            } 
            // For other elements (divs, etc.), extract text and ensure proper line breaks
            else {
                const innerText = extractTextFromTerminal(node);
                
                if (innerText.trim()) {
                    result += innerText;
                    
                    // Add a newline if not already present
                    if (!innerText.endsWith('\n')) {
                        result += '\n';
                    }
                }
            }
        }
    });
    
    return result;
}

// Generate timestamp for filename
function getTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
}

// Function to update terminal size
function updateTerminalSize() {
    // Update height
    const height = terminalHeight.value;
    terminalContainer.style.height = `${height}px`;
    
    // Update font size
    const fontSize = terminalFontSize.value;
    terminal.style.fontSize = `${fontSize}px`;
    
    // Save preferences
    localStorage.setItem('terminalHeight', height);
    localStorage.setItem('terminalFontSize', fontSize);
}

// Statistics functions
function resetStatistics() {
    stats = {
        connectTime: isConnected ? new Date() : null,
        totalBytesSent: 0,
        totalBytesReceived: 0,
        totalCommandsSent: 0,
        lastReceiveTime: null,
        bytesPerSecond: 0
    };
    
    updateStatsDisplay();
}

function startStatsTracking() {
    // Reset first
    resetStatistics();
    
    // Update stats every second
    statsUpdateInterval = setInterval(() => {
        updateStatsDisplay();
    }, 1000);
}

function stopStatsTracking() {
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
        statsUpdateInterval = null;
    }
}

function updateStatsDisplay() {
    // Only update if we're connected
    if (!isConnected) {
        connectionTime.textContent = '00:00:00';
        bytesSent.textContent = '0';
        bytesReceived.textContent = '0';
        commandsSent.textContent = '0';
        transferRate.textContent = '0 B/s';
        return;
    }
    
    // Update connection time
    const elapsedMs = new Date() - stats.connectTime;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(elapsedSec / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((elapsedSec % 3600) / 60).toString().padStart(2, '0');
    const seconds = (elapsedSec % 60).toString().padStart(2, '0');
    connectionTime.textContent = `${hours}:${minutes}:${seconds}`;
    
    // Update transfer statistics
    bytesSent.textContent = formatBytes(stats.totalBytesSent);
    bytesReceived.textContent = formatBytes(stats.totalBytesReceived);
    commandsSent.textContent = stats.totalCommandsSent.toString();
    
    // Calculate and update transfer rate (if we received data in the last 3 seconds)
    if (stats.lastReceiveTime && ((new Date() - stats.lastReceiveTime) / 1000) < 3) {
        // Simple moving average for transfer rate
        stats.bytesPerSecond = stats.bytesPerSecond * 0.7 + (stats.totalBytesReceived / (elapsedSec || 1)) * 0.3;
        transferRate.textContent = `${formatBytes(stats.bytesPerSecond)}/s`;
    } else {
        transferRate.textContent = '0 B/s';
    }
}

// Format bytes to human-readable format
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// Terminal mode toggle
terminalModeToggle.addEventListener('click', toggleTerminalMode);

// Function to toggle between traditional and modern terminal modes
function toggleTerminalMode() {
    isTraditionalMode = !isTraditionalMode;
    
    // Save preference to localStorage
    localStorage.setItem('traditionalMode', isTraditionalMode);
    
    // Update UI
    if (isTraditionalMode) {
        // Switch to traditional mode
        terminalContainer.classList.add('traditional-mode');
        modernInputArea.classList.add('hidden');
        terminalModeToggle.classList.add('traditional-active');
        terminalModeToggle.setAttribute('title', 'Switch to modern mode');
        
        // Set focus to traditional terminal
        traditionalTerminal.click();
        
        // Set prompt
        updateTraditionalPrompt();
    } else {
        // Switch to modern mode
        terminalContainer.classList.remove('traditional-mode');
        modernInputArea.classList.remove('hidden');
        terminalModeToggle.classList.remove('traditional-active');
        terminalModeToggle.setAttribute('title', 'Switch to traditional mode');
        
        // Set focus to modern input
        input.focus();
    }
}

// Traditional terminal functionality
traditionalTerminal.addEventListener('click', function() {
    // Focus the contenteditable area when clicking anywhere in the terminal
    terminalInputArea.focus();
});

// Handle input in traditional terminal
terminalInputArea.addEventListener('keydown', function(event) {
    // Handle Enter key to submit command
    if (event.key === 'Enter') {
        event.preventDefault();
        
        const command = terminalInputArea.textContent.trim();
        if (command) {
            // Clear input area
            terminalInputArea.textContent = '';
            
            // Add command to terminal output
            const commandLine = document.createElement('div');
            commandLine.innerHTML = `<span class="terminal-prompt">${terminalPrompt.textContent}</span><span class="command">${escapeHtml(command)}</span>`;
            terminalOutput.appendChild(commandLine);
            
            // Process the command
            processTraditionalCommand(command);
            
            // Scroll to bottom
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }
});

// Function to process commands from traditional terminal
function processTraditionalCommand(command) {
    if (isConnected) {
        // Send data via serial
        sendSerialData(command);
    } else {
        // Not connected, show error
        appendToTraditionalTerminal(`<span class="error">Not connected to a serial port</span>`);
        updateTraditionalPrompt();
    }
}

// Function to send serial data from traditional terminal
async function sendSerialData(text) {
    try {
        const writer = outputStream.getWriter();
        
        // Prepare the data string with appropriate line endings
        let dataToSend = text;
        if (addCRCheckbox.checked) dataToSend += '\r';
        if (addLFCheckbox.checked) dataToSend += '\n';

        // Update sent bytes statistics
        stats.totalBytesSent += dataToSend.length;
        stats.totalCommandsSent++;
        updateStatsDisplay();

        // Send the data
        await writer.write(dataToSend);
        
        // Release the writer
        writer.releaseLock();
    } catch (error) {
        console.error('Error sending data:', error);
        appendToTraditionalTerminal(`<span class="error">Error sending data: ${error.message}</span>`);
    }
}

// Append text to traditional terminal output
function appendToTraditionalTerminal(html) {
    const element = document.createElement('div');
    element.innerHTML = html;
    terminalOutput.appendChild(element);
    
    // Scroll to bottom if auto-scroll is enabled
    if (autoScroll) {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
}

// Update the prompt in traditional terminal
function updateTraditionalPrompt() {
    if (isConnected) {
        terminalPrompt.textContent = 'serial@port:~$ ';
    } else {
        terminalPrompt.textContent = 'user@webserial:~$ ';
    }
} 