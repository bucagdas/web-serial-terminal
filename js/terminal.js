import { escapeHtml } from './utils.js';

export const terminal = document.getElementById('terminal');
export const terminalContentArea = document.querySelector('.terminal-content-area');
export const traditionalTerminal = document.getElementById('traditionalTerminal');
export const terminalOutput = document.querySelector('.traditional-terminal .terminal-output');
export const terminalPrompt = document.querySelector('.traditional-terminal .terminal-prompt');

export let autoScroll = true;

// True while we are programmatically scrolling to the bottom, so the scroll
// listener can tell our own scroll apart from a real user scroll and not
// mistakenly disable auto-scroll during a live data stream.
let programmaticScroll = false;

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
const MAX_MODERN_NODES = 5000;

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
    // Trim whole child nodes from the front so we never slice through a tag or
    // HTML entity (which the old character-based slice could do).
    while (terminal.childNodes.length > MAX_MODERN_NODES) {
        terminal.removeChild(terminal.firstChild);
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
    if (!autoScroll) return;
    const max = terminalContentArea.scrollHeight - terminalContentArea.clientHeight;
    // Already at the bottom: setting scrollTop won't fire a scroll event, so
    // don't arm the guard (it would swallow the user's next real scroll).
    if (terminalContentArea.scrollTop >= max - 1) return;
    programmaticScroll = true;
    terminalContentArea.scrollTop = max;
}

// Distance in pixels between the current scroll position and the bottom.
export function distanceFromBottom() {
    return terminalContentArea.scrollHeight - terminalContentArea.scrollTop - terminalContentArea.clientHeight;
}

// Returns true (and clears the flag) if the pending scroll event was caused by
// our own scrollToBottom() rather than the user. The guard is only armed when
// scrollToBottom actually moves the position, so exactly one event consumes it.
export function consumeProgrammaticScroll() {
    if (programmaticScroll) {
        programmaticScroll = false;
        return true;
    }
    return false;
}

export function formatOutputText(text) {
    const escaped = escapeHtml(text);
    return escaped
        .replace(/error|fail|exception|timeout/gi, '<span class="error">$&</span>')
        .replace(/warning|deprecated/gi, '<span style="color: var(--warning-color)">$&</span>')
        .replace(/(IP address|IPv4|IPv6):\s*([0-9a-f.:]+)/gi, '$1: <span style="color: var(--terminal-command)">$2</span>')
        .replace(/(success|connected|online|available)/gi, '<span style="color: var(--terminal-prompt)">$&</span>');
}
