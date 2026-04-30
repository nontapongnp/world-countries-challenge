# World Map Quiz

**World Map Quiz** (Global Knowledge Mission) is an interactive, web-based geography game built with Next.js, React, and D3.js. The objective of the game is to identify all 195 sovereign countries within a 20-minute time limit by typing their names.

## 🌟 Features

- **Interactive Map:** A fully interactive world map built with D3.js and TopoJSON.
- **2D & 3D Views:** Seamlessly toggle between a traditional 2D map projection and an orthographic 3D globe view.
- **Zoom & Pan:** Scroll to zoom and drag to explore different regions of the world.
- **Real-time Identification:** Type the name of a country, and it will instantly light up on the map if correct.
- **Smart Aliases:** Supports common abbreviations and alternative names (e.g., "USA" for United States of America, "UK" for United Kingdom).
- **Countdown Timer:** A 20-minute timer adds a layer of challenge.
- **Dynamic Hints:** Hover over an unidentified country to see a satellite hint indicating the number of characters in its name.
- **Visual Feedback:** Get instant visual cues and score updates when you successfully identify a country.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Data Visualization:** [D3.js](https://d3js.org/)
- **Geospatial Data:** [TopoJSON](https://github.com/topojson/topojson)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to run the project locally:

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repository-url>
   cd WorldMapQuiz
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

## 🎮 How to Play

1. Click the **"Start Challenge"** button.
2. A text input will appear. Start typing the names of countries.
3. If you type a valid country name (or alias), your score will increase, and the country will be highlighted in green on the map.
4. Try to find all **195** countries before the timer runs out!
5. You can pause the game by clicking the pause button in the header.
6. You can adjust the timer by clicking the plus or minus button in the header.

## 🤝 Contributing

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, feel free to open an issue or submit a pull request.
