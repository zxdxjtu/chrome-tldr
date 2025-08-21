# TLDR - Too Long, Do Read

AI-powered Chrome extension that helps you quickly grasp the core information of long web articles. Transform the "too long, didn't read" experience into "too long, help me read" efficient information acquisition solution.

## Features

1. **Smart Content Recognition and Extraction**
   - Automatically identify the main content area of web pages
   - Filter out ads, navigation, footer and other distracting elements

2. **AI-powered Analysis Engine**
   - Use large language models to deeply analyze extracted content
   - Generate structured reading guides

3. **Visual Highlighting System**
   - Visually optimize page content based on AI analysis results

## Installation (Development)

1. Clone or download this repository
2. Open Chrome browser and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `chrome-tldr` directory
5. The extension should now be installed and visible in your toolbar

## Usage

1. Navigate to any web page with long content
2. Click the TLDR extension icon in your toolbar
3. Click "Analyze Current Page" to process the content
4. View the summary and key points in the popup or highlighted on the page
5. Use "Clear Highlights" to remove the highlights

## Configuration

For full functionality, you need to configure your AI service API key:

1. Click the TLDR extension icon
2. Click "Settings"
3. Enter your OpenAI (or compatible) API key
4. Save the configuration

Currently supported AI services:
- OpenAI API
- Azure OpenAI Service
- Any OpenAI-compatible service (e.g., LocalAI, LM Studio)

## Development

This is an MVP version with core functionality implemented. The project structure includes:

- `manifest.json` - Extension configuration
- `background/` - Background service worker
- `content/` - Content scripts for page interaction
- `popup/` - Popup UI
- `utils/` - Utility functions (to be implemented)
- `assets/` - Static assets (icons, etc.)

## Limitations

This MVP version has the following limitations:

1. Basic content extraction (not using Readability.js yet)
2. Simulated AI analysis results (not connecting to real AI services)
3. Basic highlighting functionality
4. Minimal settings and configuration options

These will be improved in future versions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.