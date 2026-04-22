# Little D's New Tab Page

A beautiful, feature-rich browser "New Tab" extension built with React, Tailwind CSS, and Vite. It replaces your default new tab page with a customizable dashboard designed for productivity and learning.

## Features

- **Dynamic Backgrounds:** Gorgeous, rotating nature and landscape backgrounds curated from Unsplash.
- **Top Sites:** Automatically displays your most frequently visited websites. Includes a quick "X" button to permanently hide sites you don't want to see.
- **RSS News Feed:** Add your favorite RSS feeds in the settings. The extension aggregates them, sorts them by date, and displays them in a clean grid. Includes read tracking and a toggle to hide/show read articles.
- **Language Word of the Day:** Learn a new word every day! Currently supports Mandarin (with HSK level 1-6 selection) and Spanish. The widget displays the word, pronunciation/Pinyin, and English translation.
- **Weather & Clock:** A sleek, real-time clock and a local weather widget powered by the Open-Meteo API.
- **Customizable Search:** A centered search bar with the ability to switch between Google, Bing, and DuckDuckGo in the settings.

## Installation (For Users)

Since this extension is not currently on the official Chrome Web Store or Edge Add-ons Store, you must install it manually:

1. Download the latest release `.zip` file from this repository.
2. Extract the `.zip` file to a folder on your computer.
3. Open your browser (Chrome or Edge).
4. Go to the extensions management page:
   - **Chrome:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
5. Enable **Developer mode** (usually a toggle in the top right corner).
6. Click the **Load unpacked** button.
7. Select the folder where you extracted the `.zip` file (make sure you select the `dist` folder if building from source).
8. Open a new tab and enjoy!

## Local Development (For Developers)

If you want to modify the extension or add your own features:

### Prerequisites
- Node.js installed on your machine.

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/newtab-extension.git
   cd newtab-extension
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (runs as a standard webpage at `http://localhost:5173` for easy UI testing):
   ```bash
   npm run dev
   ```
4. Build the final extension:
   ```bash
   npm run build
   ```
   *The built extension files will be placed in the `dist/` directory, which you can load into your browser via the "Load unpacked" method described above.*

## Adding More Languages
The Word of the Day widget is built to be easily extensible. To add a new language:
1. Create a new JSON file in `src/data/` (e.g., `french_vocab.json`).
2. Follow the structure: `{ "1": [{ "text": "Bonjour", "pronunciation": "bon-zhoor", "english": "Hello" }] }`.
3. Update `useWordOfDay.ts` to import and handle your new JSON file.
4. Add the language option to the dropdown in `SettingsSidebar.tsx`.
