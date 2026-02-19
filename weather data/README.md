# Node.js Weather App - Beginner Project

A beginner-friendly Node.js project demonstrating core concepts: Event Loop, Non-blocking I/O, Core Modules, and NPM.

## 📚 Topics Covered

- **Event Loop & Non-blocking I/O**: Understanding how Node.js handles asynchronous operations
- **Core Modules**: Using `fs` (file system) and `http` (web server)
- **NPM**: Package management with `package.json` and third-party modules (axios)

## 🚀 Setup Instructions

### 1. Initialize the Project

The `package.json` file is already created. To install dependencies, run:

```bash
npm install
```

This will install the `axios` package listed in dependencies.

### 2. Fetch Weather Data

Run the weather fetch script to get current weather data and save it to a file:

```bash
npm run fetch
```

This script will:
- Use `axios` to fetch weather data from Open-Meteo API (New York City)
- Use `fs` module to save the data to `weather_log.txt`
- Demonstrate asynchronous operations with Promises

### 3. Start the Server

Start the HTTP server to view the weather data in your browser:

```bash
npm start
```

Then open your browser and visit: `http://localhost:3000`

## 📁 Project Structure

```
nodejs-weather-app/
├── package.json          # NPM configuration and dependencies
├── fetchWeather.js       # Script to fetch and save weather data
├── server.js            # HTTP server to display weather data
├── weather_log.txt      # Generated file with weather data
└── README.md            # This file
```

## 🔍 How It Works

### Event Loop Explanation

Node.js uses a single-threaded Event Loop to handle asynchronous operations:

1. **Synchronous code** executes first
2. **Asynchronous operations** (HTTP requests, file I/O) are delegated to the system
3. **Event Loop** continues without blocking
4. **Callbacks** execute when operations complete

### fetchWeather.js

- Uses `axios` (NPM package) for HTTP requests
- Fetches weather data from Open-Meteo API
- Uses `fs.promises.writeFile()` to save data asynchronously
- Demonstrates Promise-based async/await pattern

### server.js

- Uses `http` core module to create a web server
- Uses `fs.readFile()` to read weather data asynchronously
- Serves HTML page displaying the weather information
- Handles multiple requests concurrently without blocking

## 🎓 Learning Points

1. **NPM**: Initialized with `npm init`, dependencies managed in `package.json`
2. **Async Operations**: All I/O operations are non-blocking
3. **Event Loop**: Handles multiple operations concurrently with a single thread
4. **Core Modules**: `fs` for file operations, `http` for web server
5. **Third-party Modules**: `axios` for simplified HTTP requests

## 🌐 API Used

This project uses the free Open-Meteo API (no API key required):
- URL: https://api.open-meteo.com
- Location: New York City (latitude: 40.7128, longitude: -74.0060)

## 💡 Next Steps

Try modifying the project:
- Change the location coordinates in `fetchWeather.js`
- Add more weather parameters (humidity, precipitation)
- Create a route to fetch fresh data directly from the server
- Add error handling for network failures
- Style the HTML page with CSS

## 📝 Notes

- The weather data is fetched for New York City by default
- No API key is required for Open-Meteo
- The server runs on port 3000 (make sure it's available)
