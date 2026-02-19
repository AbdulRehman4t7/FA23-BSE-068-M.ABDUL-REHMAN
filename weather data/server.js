// Import core Node.js modules
const http = require('http'); // Core module for creating HTTP servers
const fs = require('fs'); // Core module for file system operations

// Server configuration
const PORT = 3000;
const HOSTNAME = 'localhost';

/**
 * EVENT LOOP & NON-BLOCKING I/O:
 * The http server uses the Event Loop to handle multiple requests concurrently.
 * Each request is processed asynchronously, allowing the server to handle
 * thousands of connections without creating separate threads.
 */

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Handle different routes
  if (req.url === '/' && req.method === 'GET') {
    
    /**
     * ASYNCHRONOUS FILE READING:
     * fs.readFile is non-blocking. The Event Loop registers this I/O operation
     * and continues processing other requests. When the file is read,
     * the callback function is executed.
     */
    fs.readFile('weather_log.txt', 'utf8', (err, data) => {
      if (err) {
        // Handle error if file doesn't exist or can't be read
        console.error('Error reading file:', err.message);
        
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Weather App</title></head>
            <body>
              <h1>Weather Data Not Found</h1>
              <p>Please run the weather fetch script first:</p>
              <code>npm run fetch</code>
              <p>Error: ${err.message}</p>
            </body>
          </html>
        `);
        return;
      }
      
      // Success: Send the weather data as HTML response
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>Weather App</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              pre { background: #f4f4f4; padding: 15px; border-radius: 5px; }
              h1 { color: #333; }
              .info { background: #e7f3ff; padding: 10px; border-left: 4px solid #2196F3; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>🌤️ Current Weather Data</h1>
            <pre>${data}</pre>
            <div class="info">
              <strong>How this works:</strong>
              <ul>
                <li>Server runs on Node.js Event Loop (non-blocking)</li>
                <li>File read operation is asynchronous</li>
                <li>Multiple requests can be handled simultaneously</li>
              </ul>
            </div>
            <p><a href="/">Refresh</a></p>
          </body>
        </html>
      `);
      
      console.log('Weather data sent to client');
    });
    
  } else {
    // Handle 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Page Not Found');
  }
});

/**
 * START THE SERVER:
 * server.listen() is also non-blocking. It registers the server with the Event Loop,
 * which then listens for incoming connections and handles them asynchronously.
 */
server.listen(PORT, HOSTNAME, () => {
  console.log(`✓ Server running at http://${HOSTNAME}:${PORT}/`);
  console.log('Event Loop is now listening for incoming requests...');
  console.log('\nTo fetch weather data, run: npm run fetch');
  console.log('Then visit the server URL to see the results.');
});

/**
 * EVENT LOOP IN ACTION:
 * 
 * 1. Server starts and listens on port 3000 (non-blocking)
 * 2. Event Loop waits for events (incoming HTTP requests)
 * 3. When request arrives, callback function executes
 * 4. fs.readFile() is called (non-blocking I/O operation)
 * 5. Event Loop continues, can handle other requests
 * 6. When file read completes, callback executes with data
 * 7. Response is sent back to client
 * 8. Event Loop continues waiting for next request
 * 
 * This architecture allows Node.js to handle thousands of concurrent
 * connections with a single thread, making it highly efficient for I/O-bound tasks.
 */
