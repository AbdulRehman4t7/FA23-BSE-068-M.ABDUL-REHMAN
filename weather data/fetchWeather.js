// Import required modules
const axios = require('axios'); // Third-party module from NPM for HTTP requests
const fs = require('fs'); // Core Node.js module for file system operations

// API endpoint for Open-Meteo (free weather API, no key required)
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current=temperature_2m,windspeed_10m&timezone=America/New_York';

/**
 * EVENT LOOP EXPLANATION:
 * When this script runs, Node.js executes synchronous code first (imports, variable declarations).
 * Asynchronous operations (axios.get, fs.writeFile) are offloaded to the system,
 * allowing the Event Loop to continue processing other tasks without blocking.
 */

console.log('Starting weather fetch... (Non-blocking operation initiated)');

// Using Promises with async/await for cleaner asynchronous code
async function fetchAndSaveWeather() {
  try {
    // STEP 1: Fetch weather data using axios (asynchronous HTTP request)
    // The Event Loop registers this operation and continues without waiting
    console.log('Fetching weather data from API...');
    
    const response = await axios.get(WEATHER_API_URL);
    
    // Extract relevant data from the API response
    const weatherData = {
      temperature: response.data.current.temperature_2m,
      windSpeed: response.data.current.windspeed_10m,
      timestamp: new Date().toISOString(),
      location: 'New York City'
    };
    
    console.log('Weather data received:', weatherData);
    
    // STEP 2: Format the data for saving
    const logEntry = `
=== Weather Log ===
Location: ${weatherData.location}
Temperature: ${weatherData.temperature}°C
Wind Speed: ${weatherData.windSpeed} km/h
Timestamp: ${weatherData.timestamp}
==================
`;
    
    // STEP 3: Save to file using fs.writeFile (asynchronous file operation)
    // The Event Loop handles this I/O operation without blocking other code
    await fs.promises.writeFile('weather_log.txt', logEntry);
    
    console.log('Weather data saved to weather_log.txt');
    console.log('✓ All operations completed successfully!');
    
  } catch (error) {
    // Error handling for both network and file system errors
    console.error('Error occurred:', error.message);
  }
}

// Execute the main function
fetchAndSaveWeather();

/**
 * EVENT LOOP FLOW:
 * 1. Synchronous code executes first (imports, function definition)
 * 2. fetchAndSaveWeather() is called and starts executing
 * 3. axios.get() is initiated - Node.js delegates this to the system (libuv)
 * 4. Event Loop continues, doesn't wait for the HTTP request
 * 5. When response arrives, callback is queued in the Event Loop
 * 6. fs.writeFile() is initiated - another async operation
 * 7. When file write completes, its callback is queued
 * 8. All callbacks execute in order, maintaining non-blocking behavior
 */
