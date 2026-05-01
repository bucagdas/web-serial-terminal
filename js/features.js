import { terminal, terminalContentArea, setAutoScroll, scrollToBottom, traditionalTerminal, logToTerminal, formatOutputText } from './terminal.js';
import { isConnected, sendData as sendSerialDataText, outputStream } from './serial.js';
import { escapeHtml } from './utils.js';

// --- DOM Elements ---
const terminalModeToggle = document.getElementById('terminalModeToggle');
const statsToggle = document.getElementById('statsToggle');
const exportToggle = document.getElementById('exportToggle');
const searchToggle = document.getElementById('searchToggle');
const filterToggle = document.getElementById('filterToggle');

const searchPanel = document.getElementById('searchPanel');
const filterPanel = document.getElementById('filterPanel');
const exportPanel = document.getElementById('exportPanel');
const statsPanel = document.getElementById('statsPanel');

// Shared utility arrays/objects
const panels = [searchPanel, filterPanel, exportPanel, statsPanel];
const toggles = [searchToggle, filterToggle, exportToggle, statsToggle];

// --- Panel Toggles ---
function togglePanel(panel, button) {
    const isHidden = panel.classList.contains('hidden');
    panels.forEach(p => p.classList.add('hidden'));
    toggles.forEach(b => b.classList.remove('active'));

    if (isHidden) {
        panel.classList.remove('hidden');
        button.classList.add('active');
    }
}

export function setupFeatures() {
    // Top bar utility toggles
    searchToggle.addEventListener('click', () => togglePanel(searchPanel, searchToggle));
    filterToggle.addEventListener('click', () => togglePanel(filterPanel, filterToggle));
    exportToggle.addEventListener('click', () => togglePanel(exportPanel, exportToggle));
    statsToggle.addEventListener('click', () => {
        togglePanel(statsPanel, statsToggle);
        updateStatsDisplay();
    });

    // Close buttons inside panels
    document.getElementById('closeSearch').addEventListener('click', () => togglePanel(searchPanel, searchToggle));
    document.getElementById('closeFilter').addEventListener('click', () => togglePanel(filterPanel, filterToggle));
    document.getElementById('closeExport').addEventListener('click', () => togglePanel(exportPanel, exportToggle));
    document.getElementById('closeStats').addEventListener('click', () => togglePanel(statsPanel, statsToggle));

    setupSearch();
    setupFilter();
    setupExport();
    setupStats();
    setupMacros();
    setupTerminalMode();
    setupUIExtras();
}

// --- Macros (Control Sequences) ---
const controlSequences = {
    '^C': '\x03', '^Z': '\x1A', '^R': '\x12', '^U': '\x15', 
    '^A': '\x01', '^E': '\x05', '^T': '\x14', '^D': '\x04'
};
function setupMacros() {
    const commandButtons = document.querySelectorAll('.command-button');
    const echoCheckbox = document.getElementById('echoOn');

    commandButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const command = button.getAttribute('data-command');
            if (command.startsWith('^') && controlSequences[command]) {
                if (!isConnected || !outputStream) {
                    logToTerminal('<span class="error">Not connected to a serial port</span>\n');
                    return;
                }
                try {
                    const writer = outputStream.getWriter();
                    const controlChar = controlSequences[command];
                    
                    stats.totalBytesSent += 1;
                    stats.totalCommandsSent++;
                    updateStatsDisplay();
                    
                    await writer.write(controlChar);
                    if (echoCheckbox.checked) {
                        logToTerminal(`<span class="command">${command}</span>\n`);
                    }
                    writer.releaseLock();
                } catch (error) {
                    logToTerminal(`<span class="error">Error sending control sequence: ${error.message}</span>\n`);
                }
            } else {
                const input = document.getElementById('input');
                input.value = command;
            }
        });
    });
}

// --- Statistics ---
export let stats = {
    connectTime: null,
    totalBytesSent: 0,
    totalBytesReceived: 0,
    totalCommandsSent: 0,
    lastReceiveTime: null,
    bytesPerSecond: 0
};
let statsUpdateInterval = null;

function setupStats() {
    document.getElementById('resetStats').addEventListener('click', resetStatistics);
}

export function resetStatistics() {
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

export function startStatsTracking() {
    resetStatistics();
    statsUpdateInterval = setInterval(updateStatsDisplay, 1000);
}

export function stopStatsTracking() {
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
        statsUpdateInterval = null;
    }
}

export function trackBytesReceived(length) {
    stats.totalBytesReceived += length;
    stats.lastReceiveTime = new Date();
}

export function trackBytesSent(length) {
    stats.totalBytesSent += length;
    stats.totalCommandsSent++;
}

function updateStatsDisplay() {
    const connectionTime = document.getElementById('connectionTime');
    const bytesSent = document.getElementById('bytesSent');
    const bytesReceived = document.getElementById('bytesReceived');
    const commandsSent = document.getElementById('commandsSent');
    const transferRate = document.getElementById('transferRate');

    if (!isConnected) {
        connectionTime.textContent = '00:00:00';
        bytesSent.textContent = '0 B';
        bytesReceived.textContent = '0 B';
        commandsSent.textContent = '0';
        transferRate.textContent = '0 B/s';
        return;
    }
    
    const elapsedMs = new Date() - stats.connectTime;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(elapsedSec / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((elapsedSec % 3600) / 60).toString().padStart(2, '0');
    const seconds = (elapsedSec % 60).toString().padStart(2, '0');
    connectionTime.textContent = `${hours}:${minutes}:${seconds}`;
    
    bytesSent.textContent = formatBytes(stats.totalBytesSent);
    bytesReceived.textContent = formatBytes(stats.totalBytesReceived);
    commandsSent.textContent = stats.totalCommandsSent.toString();
    
    if (stats.lastReceiveTime && ((new Date() - stats.lastReceiveTime) / 1000) < 3) {
        stats.bytesPerSecond = stats.bytesPerSecond * 0.7 + (stats.totalBytesReceived / (elapsedSec || 1)) * 0.3;
        transferRate.textContent = `${formatBytes(stats.bytesPerSecond)}/s`;
    } else {
        transferRate.textContent = '0 B/s';
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// --- Search ---
let isSearchActive = false;
let searchMatches = [];
let currentMatchIndex = -1;

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => { setTimeout(performSearch, 300); });
    document.getElementById('searchNext').addEventListener('click', () => navigateSearch('next'));
    document.getElementById('searchPrev').addEventListener('click', () => navigateSearch('prev'));
}

export function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchInfo = document.getElementById('searchInfo');
    
    clearSearchHighlights();
    
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        searchInfo.textContent = '0 matches';
        isSearchActive = false;
        return;
    }
    
    isSearchActive = true;
    searchMatches = [];
    currentMatchIndex = -1;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = terminal.innerHTML;
    
    try {
        const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
        const terminalText = tempDiv.innerHTML;
        
        const markedContent = terminalText.replace(regex, match => 
            `<span class="search-highlight">${match}</span>`
        );
        
        terminal.innerHTML = markedContent;
        searchMatches = Array.from(terminal.querySelectorAll('.search-highlight'));
        searchInfo.textContent = `${searchMatches.length} matches`;
        
        if (searchMatches.length > 0) {
            navigateSearch('next');
        }
    } catch (e) {
        console.error('Search error:', e);
        searchInfo.textContent = 'Invalid search';
    }
}

function navigateSearch(direction) {
    const searchInfo = document.getElementById('searchInfo');
    if (searchMatches.length === 0) return;
    
    if (currentMatchIndex >= 0 && currentMatchIndex < searchMatches.length) {
        searchMatches[currentMatchIndex].classList.remove('active');
    }
    
    if (direction === 'next') {
        currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
    } else {
        currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    }
    
    const currentMatch = searchMatches[currentMatchIndex];
    currentMatch.classList.add('active');
    searchInfo.textContent = `${currentMatchIndex + 1}/${searchMatches.length} matches`;
    
    const matchRect = currentMatch.getBoundingClientRect();
    const contentRect = terminalContentArea.getBoundingClientRect();
    
    if (matchRect.top < contentRect.top || matchRect.bottom > contentRect.bottom) {
        currentMatch.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
}

function clearSearchHighlights() {
    const highlights = terminal.querySelectorAll('.search-highlight');
    highlights.forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// --- Filter ---
export let isFilterActive = false;
let activeFilters = { errors: false, commands: false, custom: '' };

function setupFilter() {
    document.getElementById('applyFilter').addEventListener('click', applyTerminalFilter);
    document.getElementById('resetFilter').addEventListener('click', resetTerminalFilter);
}

export function applyTerminalFilter() {
    const filterErrors = document.getElementById('filterErrors');
    const filterCommands = document.getElementById('filterCommands');
    const customFilter = document.getElementById('customFilter');

    activeFilters.errors = filterErrors.checked;
    activeFilters.commands = filterCommands.checked;
    activeFilters.custom = customFilter.value.trim();
    
    isFilterActive = activeFilters.errors || activeFilters.commands || activeFilters.custom;
    
    if (!isFilterActive) {
        resetTerminalFilter();
        return;
    }
    
    const lines = Array.from(terminal.childNodes);
    let anyVisible = false;
    
    lines.forEach(line => {
        let shouldShow = false;
        const content = line.textContent || '';
        
        if (activeFilters.errors && (line.classList?.contains('error') || content.match(/error|fail/i))) {
            shouldShow = true;
        } else if (activeFilters.commands && line.classList?.contains('command')) {
            shouldShow = true;
        } else if (activeFilters.custom && content.match(new RegExp(escapeRegExp(activeFilters.custom), 'i'))) {
            shouldShow = true;
        } else if (!activeFilters.errors && !activeFilters.commands && !activeFilters.custom) {
            shouldShow = true;
        }
        
        if (line.nodeType === 1) {
            if (shouldShow) {
                line.classList.remove('filtered-out');
                anyVisible = true;
            } else {
                line.classList.add('filtered-out');
            }
        }
    });

    const existingMsg = terminal.querySelector('.filter-message');
    if (existingMsg) existingMsg.remove();
    
    if (!anyVisible && isFilterActive) {
        const noMatchElement = document.createElement('div');
        noMatchElement.classList.add('output', 'filter-message');
        noMatchElement.textContent = 'No content matches the current filters';
        terminal.appendChild(noMatchElement);
    }
    
    filterToggle.classList.toggle('active', isFilterActive);
}

function resetTerminalFilter() {
    document.getElementById('filterErrors').checked = false;
    document.getElementById('filterCommands').checked = false;
    document.getElementById('customFilter').value = '';
    
    isFilterActive = false;
    activeFilters = { errors: false, commands: false, custom: '' };
    
    terminal.querySelectorAll('.filtered-out').forEach(el => el.classList.remove('filtered-out'));
    terminal.querySelectorAll('.filter-message').forEach(el => el.remove());
    filterToggle.classList.remove('active');
}

// --- Export ---
function setupExport() {
    document.getElementById('exportTxt').addEventListener('click', () => exportTerminalContent('txt'));
}

function exportTerminalContent(format) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = terminal.innerHTML;
    
    let content = extractTextFromTerminal(tempDiv);
    let filename = `terminal_export_${getTimestamp()}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
}

function extractTextFromTerminal(container) {
    let result = '';
    const nodes = Array.from(container.childNodes);
    
    nodes.forEach(node => {
        if (node.nodeType === 3) {
            result += node.textContent;
        } else if (node.nodeType === 1) {
            if (node.tagName === 'BR') {
                result += '\n';
            } else if (node.tagName === 'DIV' || node.tagName === 'P') {
                result += node.textContent + '\n';
            } else if (node.classList.contains('timestamp')) {
                result += node.textContent + ' ';
            } else {
                result += node.textContent;
            }
        }
    });
    
    return result;
}

// --- Traditional Terminal Mode ---
let isTraditionalMode = false;

function setupTerminalMode() {
    const terminalInputArea = document.querySelector('.traditional-terminal .terminal-input-area');
    const terminalCursor = document.querySelector('.traditional-terminal .terminal-cursor');
    const terminalPrompt = document.querySelector('.traditional-terminal .terminal-prompt');
    const terminalOutput = document.querySelector('.traditional-terminal .terminal-output');
    const modernInputArea = document.getElementById('modernInputArea');

    terminalModeToggle.addEventListener('click', () => {
        isTraditionalMode = !isTraditionalMode;
        const terminalContainer = document.querySelector('.terminal-container');
        
        if (isTraditionalMode) {
            terminalContainer.classList.add('traditional-mode');
            modernInputArea.classList.add('hidden');
            terminalModeToggle.classList.add('traditional-active');
            terminalModeToggle.setAttribute('title', 'Switch to modern mode');
            traditionalTerminal.click();
            updateCursorPosition(terminalInputArea, terminalCursor);
        } else {
            terminalContainer.classList.remove('traditional-mode');
            modernInputArea.classList.remove('hidden');
            terminalModeToggle.classList.remove('traditional-active');
            terminalModeToggle.setAttribute('title', 'Switch to traditional mode');
            document.getElementById('input').focus();
        }
    });

    traditionalTerminal.addEventListener('click', () => terminalInputArea.focus());

    terminalInputArea.addEventListener('keydown', async (event) => {
        if (event.ctrlKey || event.altKey || event.metaKey) return;
        
        if (event.key === 'Enter') {
            event.preventDefault();
            const command = terminalInputArea.textContent.trim();
            
            if (command) {
                terminalInputArea.textContent = '';
                
                const commandLine = document.createElement('div');
                commandLine.innerHTML = `<span class="terminal-prompt">${terminalPrompt.textContent}</span><span class="command">${escapeHtml(command)}</span>`;
                terminalOutput.appendChild(commandLine);
                
                if (isConnected) {
                    let dataToSend = command;
                    if (document.getElementById('addCR').checked) dataToSend += '\r';
                    if (document.getElementById('addLF').checked) dataToSend += '\n';

                    trackBytesSent(dataToSend.length);
                    await sendSerialDataText(dataToSend);
                } else {
                    const e = document.createElement('div');
                    e.innerHTML = `<span class="error">Not connected to a serial port</span>`;
                    terminalOutput.appendChild(e);
                }
                
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
        }
    });

    ['input', 'click', 'keyup', 'focus'].forEach(evt => {
        terminalInputArea.addEventListener(evt, () => {
            terminalCursor.style.display = 'inline-block';
            updateCursorPosition(terminalInputArea, terminalCursor);
        });
    });

    terminalInputArea.addEventListener('blur', () => terminalCursor.style.display = 'none');
    window.addEventListener('resize', () => {
        if(document.activeElement === terminalInputArea) {
            updateCursorPosition(terminalInputArea, terminalCursor);
        }
    });
}

function updateCursorPosition(terminalInputArea, terminalCursor) {
    terminalInputArea.insertAdjacentElement('afterend', terminalCursor);
}

// --- Auto-scroll and Terminal Settings ---

export function setupUIExtras() {
    const autoScrollToggle = document.getElementById('autoScrollToggle');
    const terminalHeight = document.getElementById('terminalHeight');
    const terminalFontSize = document.getElementById('terminalFontSize');
    
    // Auto-scroll
    autoScrollToggle?.addEventListener('click', () => {
        let active = !autoScrollToggle.classList.contains('disabled');
        active = !active; // Toggle
        autoScrollToggle.classList.toggle('disabled', !active);
        setAutoScroll(active);
        
        if (active) scrollToBottom();
        localStorage.setItem('autoScroll', active);
    });

    terminalContentArea.addEventListener('scroll', () => {
        if (terminalContentArea.scrollHeight - terminalContentArea.scrollTop > terminalContentArea.clientHeight + 30) {
            setAutoScroll(false);
            autoScrollToggle?.classList.add('disabled');
        } else if (terminalContentArea.scrollHeight - terminalContentArea.scrollTop <= terminalContentArea.clientHeight + 10) {
            setAutoScroll(true);
            autoScrollToggle?.classList.remove('disabled');
            localStorage.setItem('autoScroll', true);
        }
    });

    // Terminal Settings
    const updateSize = () => {
        const height = terminalHeight.value;
        const fontSize = terminalFontSize.value;
        document.querySelector('.terminal-container').style.height = `${height}px`;
        terminal.style.fontSize = `${fontSize}px`;
        traditionalTerminal.style.fontSize = `${fontSize}px`;
        localStorage.setItem('terminalHeight', height);
        localStorage.setItem('terminalFontSize', fontSize);
    };

    terminalHeight?.addEventListener('change', updateSize);
    terminalFontSize?.addEventListener('change', updateSize);
    
    // Load preferences
    if (localStorage.getItem('terminalHeight')) {
        if(terminalHeight) terminalHeight.value = localStorage.getItem('terminalHeight');
    }
    if (localStorage.getItem('terminalFontSize')) {
        if(terminalFontSize) terminalFontSize.value = localStorage.getItem('terminalFontSize');
    }
    if (localStorage.getItem('autoScroll') === 'false') {
        setAutoScroll(false);
        autoScrollToggle?.classList.add('disabled');
    }
    
    updateSize();
}

// Call this from setupFeatures
