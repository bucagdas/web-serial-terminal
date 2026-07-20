import { startStatsTracking, stopStatsTracking, trackBytesReceived } from "./features.js";
import { logToTerminal, formatOutputText, appendToTraditionalTerminal, updateTraditionalPrompt } from './terminal.js';

let port = null;
let reader = null;
let inputStream = null;
export let outputStream = null;
export let isConnected = false;
let uiDisconnectCallback = null;

// References to the pipeTo() promises so they can be awaited during teardown.
// Without this, port.close() can throw because the streams are still locked,
// and the pipe promises reject unhandled.
let readableStreamClosed = null;
let writableStreamClosed = null;

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
        readableStreamClosed = port.readable.pipeTo(decoder.writable).catch(() => {});
        inputStream = decoder.readable;
        reader = inputStream.getReader();

        const encoder = new TextEncoderStream();
        writableStreamClosed = encoder.readable.pipeTo(port.writable).catch(() => {});
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
    // Stop the read side first, then wait for its pipe to settle so
    // port.readable becomes unlocked before we close the port.
    if (reader) {
        try { await reader.cancel(); } catch(e) { console.warn(e); }
        try { await readableStreamClosed; } catch(e) { /* already caught */ }
        reader = null;
        readableStreamClosed = null;
    }
    if (outputStream) {
        try { await outputStream.close(); } catch(e) { console.warn(e); }
        try { await writableStreamClosed; } catch(e) { /* already caught */ }
        outputStream = null;
        writableStreamClosed = null;
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
