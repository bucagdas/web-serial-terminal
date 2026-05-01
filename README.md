# Web Serial Terminal

A modern, high-performance, and customizable web-based terminal interface that allows you to communicate with devices using the Web Serial API. 

Built with modern web standards, it works completely offline and handles massive data streams without crashing your browser.

**[🌐 Live Demo: https://webserialterminal.com/](https://webserialterminal.com/)**

## Features

- 📡 **Web Serial API**: Connect to serial port devices (Arduino, ESP32, Raspberry Pi, etc.) directly from your browser.
- ⚡ **High Performance**: Features a custom render buffer (using `requestAnimationFrame`) and automated DOM garbage collection. It can handle continuous, high-speed data streams safely without freezing the interface.
- 📱 **PWA & Offline Ready**: Complete Progressive Web App (PWA) support. Install it on your desktop or mobile device and use it entirely offline.
- 🔌 **Hardware Resilience**: Gracefully handles unexpected USB cable disconnects or hardware power losses.
- ♿ **Accessible**: Screen-reader friendly terminal outputs powered by ARIA live attributes.
- ⚙️ **Full Customization**: Configure baud rate, data bits, parity, stop bits, and flow control.
- 🎨 **Themes & UI**: Clean, hideable panels with Light and Dark mode support.
- 📋 **Macros**: Quick access to frequently used commands and control sequences (Ctrl+C, Ctrl+Z, etc.).
- 🔄 **Terminal Modes**: Switch between Modern (separate input field) and Traditional (type directly in the console) experiences.

## Requirements

- **A browser that supports the Web Serial API**:
  - [Google Chrome](https://www.google.com/chrome/) (version 89+)
  - [Microsoft Edge](https://www.microsoft.com/edge/download) (version 89+)
  - Other Chromium-based browsers
- The Web Serial API and Service Workers only work over **HTTPS** or **localhost** (for security reasons).

## Architecture

This project is built using strictly Vanilla JavaScript with a clean ES6 Module architecture. No heavy frameworks (like React or Vue) are used, ensuring maximum performance and zero dependency overhead.

- `js/main.js`: Application entry point and PWA Service Worker registration.
- `js/serial.js`: Web Serial API core, reader/writer streams, and disconnect events.
- `js/terminal.js`: Terminal rendering, batch-buffer logic, and DOM limit management.
- `js/ui.js`: Theme, panel interactions, and UI state synchronization.
- `js/utils.js`: Helpers for formatting and data manipulation.
- `sw.js`: Service worker for offline caching.

## Serverless Usage

This application can run serverlessly, meaning it doesn't require any backend server. You can run the application in the following ways:

### Local Usage

The safest method is to use a simple local server to bypass `file://` protocol security restrictions.

**With Python (Python 3.x):**
```bash
python -m http.server
```
Access the application by navigating to http://localhost:8000 in your browser.

**With Node.js (using npx):**
```bash
npx serve
```
Access the application by navigating to http://localhost:3000 in your browser.

### Publishing with GitHub Pages

1. Fork this repository to GitHub or create a new repository and upload the files
2. Go to your GitHub repository settings
3. Click on the "Pages" tab
4. Select the "main" branch in the "Source" section
5. Click the "Save" button

### Other Static Hosting Services

You can use any static hosting service like Netlify, Vercel, Firebase Hosting, GitLab Pages, or AWS S3.

## Terminal Modes

### Modern Mode (Default)
- Uses a separate input field and send button.
- Best for touch devices, mobile users, and editing long string commands before sending.

### Traditional Mode
- Classic terminal experience similar to PuTTY.
- Type directly in the terminal window with a blinking cursor and command prompt.
- Best for users deeply familiar with native command-line interfaces.

*You can switch between these modes by clicking the keyboard icon (🖮) in the terminal header. Preferences are saved automatically.*

## Security Notes

- Port access cannot be requested without explicit user interaction (e.g., clicking the connect button).
- The user must grant permission for each newly connected device.

## License

[MIT License](LICENSE)

## Author

[bucagdas](https://github.com/bucagdas)

## Repository

This project is hosted on GitHub: [https://github.com/bucagdas/web-serial-terminal](https://github.com/bucagdas/web-serial-terminal)

Contributors are always welcome! Feel free to open an issue or submit a Pull Request.
