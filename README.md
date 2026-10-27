# All Stars Assembly website preview

This workspace contains a static HTML copy of the All Stars Assembly website.
Use Node.js 24 to run the dependency-free local preview server:

```powershell
npm start
```

Open <http://127.0.0.1:4173/> in a browser. The server serves the site from
`www.allstarsassembly.com` and the locally mirrored CDN, YouTube thumbnail, and
Google Tag Manager assets. It listens on localhost only.

Set the `PORT` environment variable to use a different port.
