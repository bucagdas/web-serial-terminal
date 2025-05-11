# Web Serial Terminal

A modern, user-friendly, and customizable web-based terminal interface that allows you to communicate with devices using the Web Serial API.

**[🌐 Live Demo: https://webserialterminal.com/](https://webserialterminal.com/)**

## Features

- 📡 Connect to serial port devices directly from your browser
- ⚙️ Customize serial port settings such as baud rate, data bits, parity, and flow control
- 🎨 Customizable interface with light and dark theme support
- 📋 Quick access to frequently used commands
- 📊 Hideable panels for a clean and focused working environment
- ⌨️ Send control sequences such as Ctrl+C, Ctrl+Z
- 🔄 Local echo and CR/LF settings
- 🖥️ Two terminal modes: Modern (with separate input field) and Traditional (classic terminal experience)

## Requirements

- **A browser that supports the Web Serial API**:
  - [Google Chrome](https://www.google.com/chrome/) (version 89+)
  - [Microsoft Edge](https://www.microsoft.com/edge/download) (version 89+)
  - Other Chromium-based browsers
- The Web Serial API only works over **HTTPS** or **localhost** (for security reasons)

## Terminal Modes

The application offers two different terminal interface modes to accommodate different user preferences:

### Modern Mode (Default)
- Uses a separate input field and send button
- Easier for touch devices and mobile users
- More familiar for web application users
- Better control over input formatting

### Traditional Mode
- Classic terminal experience similar to desktop terminals like PuTTY or Linux Terminal
- Type directly in the terminal window
- Blinking cursor and command prompt
- Familiar for users experienced with command-line interfaces

You can switch between these modes by clicking the keyboard icon (🖮) in the terminal header. Your preferred mode is saved and will be used on your next visit.

## Serverless Usage

This application can run serverlessly, meaning it doesn't require any backend server. You can run the application in the following ways:

### Local Usage

1. Clone this repository or download it as a ZIP file
2. Open the `index.html` file in Chrome or Edge browser
   - **Note**: The Web Serial API may not work when run from the local file system (`file://` protocol) for security reasons
   - The safest method is to use one of the simple local servers below

### Using a Simple Local Server

**With Python (Python 3.x):**
```bash
python -m http.server
```
Access the application by navigating to http://localhost:8000 in your browser.

**With Node.js (using npx):**
```bash
npx serve
```
Access the application by navigating to http://localhost:5000 in your browser.

### Publishing with GitHub Pages

1. Fork this repository to GitHub or create a new repository and upload the files
2. Go to your GitHub repository settings
3. Click on the "Pages" tab
4. Select the "main" (or "master") branch in the "Source" section
5. Click the "Save" button
6. Your GitHub Pages site will be published within a few minutes

### Other Static Hosting Services

You can use any of the following static hosting services:
- Netlify
- Vercel
- Firebase Hosting
- GitLab Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

## Security Notes

- The Web Serial API only works over HTTPS (or localhost) for security reasons
- Port access cannot be requested without user interaction (e.g., clicking a button)
- The user must grant permission for each device connection

## How to Use

You can try the application immediately through our live demo at **[https://webserialterminal.com/](https://webserialterminal.com/)** or follow these steps to run it locally:

1. Open the page (via HTTPS or localhost)
2. Click the "Connect" button
3. Select the serial port device you want to connect to
4. Choose your preferred terminal mode (Modern or Traditional) by clicking the keyboard icon in the terminal header
5. Enter and send your terminal commands:
   - In Modern mode: Type in the input field and click the send button or press Enter
   - In Traditional mode: Click anywhere in the terminal and type directly, press Enter to send

## Terminal Features

### Modern Terminal Mode
- Type commands in the dedicated input field
- Press Enter or click the Send button to transmit
- Terminal output is displayed separately from input
- Easier to edit long commands with standard text input features

### Traditional Terminal Mode
- Click anywhere in the terminal to start typing
- Commands appear right after the prompt
- Press Enter to transmit the command
- Experience similar to a native terminal with blinking cursor
- Better for users familiar with command-line interfaces

## Hiding/Showing Panels

- The settings panel and command shortcuts panel can be hidden/shown using the buttons in the header bar or the buttons in the panel headers
- Panel states are stored in browser memory, so they are preserved when the page is refreshed

## License

MIT

## Author

[sarusadgac](https://github.com/sarusadgac)

## Repository

This project is hosted on GitHub: [https://github.com/sarusadgac/web-serial-terminal](https://github.com/sarusadgac/web-serial-terminal)

Live Demo: [https://webserialterminal.com/](https://webserialterminal.com/)

## Contributors

This project is open source and welcomes your contributions! 
