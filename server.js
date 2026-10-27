const { createReadStream } = require("node:fs");
const { stat } = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { pipeline } = require("node:stream/promises");

const host = "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "4173", 10);
const siteRoot = path.join(__dirname, "www.allstarsassembly.com");
const mirroredRoots = [
  {
    urlPrefix: "/cdn.jsdelivr.net/",
    directory: "cdn.jsdelivr.net",
  },
  {
    urlPrefix: "/img.youtube.com/",
    directory: "img.youtube.com",
  },
  {
    urlPrefix: "/www.googletagmanager.com/",
    directory: "www.googletagmanager.com",
  },
];
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".ttf", "font/ttf"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function resolveFile(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  if (decodedPath.includes("\0") || decodedPath.includes("\\")) {
    throw new URIError("Invalid path");
  }

  let root = siteRoot;
  let relativePath = decodedPath.replace(/^\/+/, "");
  const mirroredRoot = mirroredRoots.find(({ urlPrefix }) =>
    decodedPath.startsWith(urlPrefix),
  );

  if (mirroredRoot) {
    root = path.join(__dirname, mirroredRoot.directory);
    relativePath = decodedPath.slice(mirroredRoot.urlPrefix.length);
  }

  const filePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, filePath);
  if (
    relativeToRoot === ".." ||
    relativeToRoot.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeToRoot)
  ) {
    throw new URIError("Path is outside the site");
  }

  return {
    filePath: decodedPath === "/" ? path.join(siteRoot, "index.html") : filePath,
    root,
  };
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(message);
}

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    sendText(response, 405, "Method not allowed");
    return;
  }

  let filePath;
  try {
    const requestUrl = new URL(request.url, `http://${host}:${port}`);
    ({ filePath } = resolveFile(requestUrl.pathname));
    let fileInfo = await stat(filePath);

    if (fileInfo.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      fileInfo = await stat(filePath);
    }

    if (!fileInfo.isFile()) {
      sendText(response, 404, "Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Length": fileInfo.size,
      "Content-Type":
        contentTypes.get(path.extname(filePath).toLowerCase()) ||
        "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    await pipeline(createReadStream(filePath), response);
  } catch (error) {
    if (error instanceof URIError || error instanceof TypeError) {
      sendText(response, 400, "Bad request");
    } else if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      sendText(response, 404, "Not found");
    } else {
      console.error("Failed to serve request:", error);
      if (response.headersSent) {
        response.destroy(error);
      } else {
        sendText(response, 500, "Internal server error");
      }
    }
  }
});

server.listen(port, host, () => {
  console.log(`Preview available at http://${host}:${port}`);
});
