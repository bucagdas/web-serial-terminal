import { escapeHtml } from './utils.js';

export const terminal = document.getElementById('terminal');
export const terminalContentArea = document.querySelector('.terminal-content-area');
export const traditionalTerminal = document.getElementById('traditionalTerminal');
export const terminalOutput = document.querySelector('.traditional-terminal .terminal-output');
export const terminalPrompt = document.querySelector('.traditional-terminal .terminal-prompt');

export let autoScroll = true;

// Buffer State
let renderBuffer = '';
let renderTimer = null;
let traditionalBuffer = '';
let traditionalTimer = null;

let postRenderCallback = null;
export function setTerminalUpdateCallback(cb) {
    postRenderCallback = cb;
}

// Configs for DOM Limit
const MAX_TRADITIONAL_LINES = 1000;
const MAX_MODERN_CHARS = 200000;

export function setAutoScroll(value) {
    autoScroll = value;
}

export function logToTerminal(text) {
    renderBuffer += text;
    if (!renderTimer) {
        renderTimer = requestAnimationFrame(flushModernTerminal);
    }
}

function flushModernTerminal() {
    if (!renderBuffer) return;
    
    terminal.insertAdjacentHTML('beforeend', renderBuffer);
    renderBuffer = '';
    renderTimer = null;
    
    limitTerminalSize();
    if (postRenderCallback) postRenderCallback();
    scrollToBottom();
}

export function clearTerminal() {
    terminal.innerHTML = '';
    renderBuffer = '';
}

export function appendToTraditionalTerminal(html) {
    traditionalBuffer += `<div>${html}</div>`;
    if (!traditionalTimer) {
        traditionalTimer = requestAnimationFrame(flushTraditionalTerminal);
    }
}

function flushTraditionalTerminal() {
    if (!traditionalBuffer) return;
    
    terminalOutput.insertAdjacentHTML('beforeend', traditionalBuffer);
    traditionalBuffer = '';
    traditionalTimer = null;
    
    while (terminalOutput.children.length > MAX_TRADITIONAL_LINES) {
        terminalOutput.removeChild(terminalOutput.firstChild);
    }

    if (autoScroll) {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
}

function limitTerminalSize() {
    if (terminal.innerHTML.length > MAX_MODERN_CHARS) {
        const newContent = terminal.innerHTML.slice(-(MAX_MODERN_CHARS / 2));
        const safeIndex = newContent.indexOf('<span');
        terminal.innerHTML = safeIndex !== -1 ? newContent.slice(safeIndex) : newContent;
    }
}

export function updateTraditionalPrompt(isConnected) {
    if (isConnected) {
        terminalPrompt.textContent = 'serial@port:~$ ';
    } else {
        terminalPrompt.textContent = 'user@webserial:~$ ';
    }
}

export function scrollToBottom() {
    if (autoScroll) {
        terminalContentArea.scrollTop = terminalContentArea.scrollHeight;
    }
}

export function formatOutputText(text) {
    const escaped = escapeHtml(text);
    return escaped
        .replace(/error|fail|exception|timeout/gi, '<span class="error">$&</span>')
        .replace(/warning|deprecated/gi, '<span style="color: var(--warning-color)">$&</span>')
        .replace(/(IP address|IPv4|IPv6):\s*([0-9a-f.:]+)/gi, '$1: <span style="color: var(--terminal-command)">$2</span>')
        .replace(/(success|connected|online|available)/gi, '<span style="color: var(--terminal-prompt)">$&</span>');
}
