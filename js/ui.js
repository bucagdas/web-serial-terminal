import { clearTerminal } from './terminal.js';

export function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    let currentTheme = localStorage.getItem('theme') || 'light';
    
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    });

    applyTheme(currentTheme);
}

export function updateConnectionStatusUI(isConnected) {
    const connectionStatus = document.getElementById('connectionStatus');
    const connectButton = document.getElementById('connectButton');
    const input = document.getElementById('input');
    const sendButton = document.getElementById('sendButton');
    const commandButtons = document.querySelectorAll('.command-button');

    connectionStatus.textContent = isConnected ? 'Connected' : 'Disconnected';
    connectionStatus.className = isConnected 
        ? 'connection-status status-connected' 
        : 'connection-status status-disconnected';
    
    connectButton.innerHTML = isConnected ? '<i class="fas fa-plug"></i> Disconnect' : '<i class="fas fa-plug"></i> Connect';
    
    input.disabled = !isConnected;
    sendButton.disabled = !isConnected;
    commandButtons.forEach(btn => btn.disabled = !isConnected);
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            const container = tab.closest('.commands-panel') || document;

            container.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const target = document.getElementById(targetId);
            if (target) target.classList.add('active');
        });
    });
}

function setupPanelCollapse() {
    // Chevron buttons inside panel headers collapse/expand their panel body.
    // Reuses the existing `.hidden` styles (which also rotate the chevron) and
    // keeps the matching header toggle button's active state in sync.
    document.querySelectorAll('.panel-toggle[data-target]').forEach(button => {
        button.addEventListener('click', () => {
            const panel = document.getElementById(button.getAttribute('data-target'));
            if (!panel) return;
            const hidden = panel.classList.toggle('hidden');

            const headerToggleId = panel.id === 'settingsPanel' ? 'settingsToggle'
                : panel.id === 'commandsPanel' ? 'commandsToggle' : null;
            if (headerToggleId) {
                document.getElementById(headerToggleId)?.classList.toggle('active', !hidden);
            }
        });
    });
}

function setupTerminalWindowButtons() {
    const terminalContainer = document.querySelector('.terminal-container');

    document.querySelector('.control-close')?.addEventListener('click', () => {
        // Use clearTerminal() so the modern terminal's pending render buffer is
        // reset too — clearing innerHTML alone lets a buffered rAF flush reappear.
        clearTerminal();
        const traditionalOutput = document.querySelector('.traditional-terminal .terminal-output');
        if (traditionalOutput) traditionalOutput.innerHTML = '';
    });

    document.querySelector('.control-minimize')?.addEventListener('click', () => {
        terminalContainer?.classList.toggle('minimized');
    });

    document.querySelector('.control-maximize')?.addEventListener('click', function () {
        const isMax = terminalContainer?.classList.toggle('maximized');
        const icon = this.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-expand', !isMax);
            icon.classList.toggle('fa-compress', isMax);
        }
    });
}

export function setupUI() {
    setupThemeToggle();
    setupTabs();
    setupPanelCollapse();
    setupTerminalWindowButtons();

    // Panel Toggles
    const settingsToggle = document.getElementById('settingsToggle');
    const commandsToggle = document.getElementById('commandsToggle');

    settingsToggle?.addEventListener('click', () => {
        document.getElementById('settingsPanel').classList.toggle('hidden');
        settingsToggle.classList.toggle('active');
    });

    commandsToggle?.addEventListener('click', () => {
        document.getElementById('commandsPanel').classList.toggle('hidden');
        commandsToggle.classList.toggle('active');
    });
}
