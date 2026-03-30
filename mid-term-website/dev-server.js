const fs = require("fs");
const path = require("path");
const http = require("http");
const next = require("next");

const port = Number(process.env.PORT || 3000);
const hostname = "127.0.0.1";
const distDir = path.join(process.cwd(), ".next");

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

const app = next({ dev: true, dir: process.cwd(), hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => handle(req, res))
      .listen(port, hostname, () => {
        console.log(`AdFlow Pro dev server ready at http://${hostname}:${port}`);
      });
  })
  .catch((error) => {
    console.error("Failed to start custom Next dev server");
    console.error(error);
    process.exit(1);
  });
