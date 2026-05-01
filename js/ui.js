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

export function setupUI() {
    setupThemeToggle();
    
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
