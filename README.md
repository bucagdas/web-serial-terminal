# Web Serial Terminal

A modern, user-friendly, and customizable web-based terminal interface that allows you to communicate with devices using the Web Serial API.

## Features

- 📡 Connect to serial port devices directly from your browser
- ⚙️ Customize serial port settings such as baud rate, data bits, parity, and flow control
- 🎨 Customizable interface with light and dark theme support
- 📋 Quick access to frequently used commands
- 📊 Hideable panels for a clean and focused working environment
- ⌨️ Send control sequences such as Ctrl+C, Ctrl+Z
- 🔄 Local echo and CR/LF settings

## Requirements

- **A browser that supports the Web Serial API**:
  - [Google Chrome](https://www.google.com/chrome/) (version 89+)
  - [Microsoft Edge](https://www.microsoft.com/edge/download) (version 89+)
  - Other Chromium-based browsers
- The Web Serial API only works over **HTTPS** or **localhost** (for security reasons)

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

1. Open the page (via HTTPS or localhost)
2. Click the "Connect" button
3. Select the serial port device you want to connect to
4. Enter and send your terminal commands

## Hiding/Showing Panels

- The settings panel and command shortcuts panel can be hidden/shown using the buttons in the header bar or the buttons in the panel headers
- Panel states are stored in browser memory, so they are preserved when the page is refreshed

## License

MIT

## Contributors

This project is open source and welcomes your contributions! 