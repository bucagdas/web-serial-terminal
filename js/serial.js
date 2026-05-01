import { startStatsTracking, stopStatsTracking, trackBytesReceived } from "./features.js";
import { logToTerminal, formatOutputText, appendToTraditionalTerminal, updateTraditionalPrompt } from './terminal.js';

let port = null;
let reader = null;
let inputStream = null;
export let outputStream = null;
export let isConnected = false;
let uiDisconnectCallback = null;

export function setDisconnectCallback(cb) {
    uiDisconnectCallback = cb;
}

// Hardware Physical Disconnect Event
if ('serial' in navigator) {
    navigator.serial.addEventListener('disconnect', async (event) => {
        if (port && port === event.target) {
            logToTerminal('<span class="error">Warning: Hardware cable disconnected or connection lost!</span>\n');
            await forceDisconnect();
            if (uiDisconnectCallback) uiDisconnectCallback(false);
        }
    });
}

export async function connect(options) {
    try {
        port = await navigator.serial.requestPort();
        await port.open(options);
        
        const decoder = new TextDecoderStream();
        port.readable.pipeTo(decoder.writable);
        inputStream = decoder.readable;
        reader = inputStream.getReader();
        
        const encoder = new TextEncoderStream();
        encoder.readable.pipeTo(port.writable);
        outputStream = encoder.writable;
        
        isConnected = true;
        startStatsTracking();
        logToTerminal('<span class="output">Connected to serial port</span>\n');
        logToTerminal('<span class="prompt">serial@port:~$</span> ');
        appendToTraditionalTerminal('<span class="output">Connected to serial port</span>');
        updateTraditionalPrompt(true);
        
        readLoop();
        return true;
    } catch (error) {
        console.error('Connection error:', error);
        logToTerminal(`<span class="error">Error connecting: ${error.message}</span>\n`);
        return false;
    }
}

export async function disconnect() {
    await forceDisconnect();
}

async function forceDisconnect() {
    if (reader) {
        try { await reader.cancel(); } catch(e) { console.warn(e); }
        reader = null;
    }
    if (outputStream) {
        try { await outputStream.getWriter().close(); } catch(e) { console.warn(e); }
        outputStream = null;
    }
    if (port) {
        try { await port.close(); } catch(e) { console.warn(e); }
        port = null;
    }
    isConnected = false;
    stopStatsTracking();
    logToTerminal('<span class="output">Disconnected from serial port</span>\n');
    logToTerminal('<span class="prompt">user@webserial:~$</span> ');
    updateTraditionalPrompt(false);
}

async function readLoop() {
    while (true) {
        try {
            if (!reader) break;
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
                trackBytesReceived(value.length);
                logToTerminal(`<span class="output">${formatOutputText(value)}</span>`);
                appendToTraditionalTerminal(`<span class="output">${formatOutputText(value)}</span>`);
            }
        } catch (error) {
            console.error('Read error:', error);
            break;
        }
    }
}

export async function sendData(text) {
    if (!isConnected || !outputStream) return;
    
    try {
        const writer = outputStream.getWriter();
        await writer.write(text);
        writer.releaseLock();
    } catch (error) {
        console.error('Send error:', error);
        logToTerminal(`<span class="error">Error sending data: ${error.message}</span>\n`);
    }
}
