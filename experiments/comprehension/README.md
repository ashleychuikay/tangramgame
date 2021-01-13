To run locally,

1. put your local `/audio/` directory at `/comprehension/static/audio/` (files too big to store in github)
2. run `npm install` in the `/comprehension/` directory
3. run `node app.js` in the `/comprehension/` directory
4. go to `http://localhost:8887/comprehension.html` in the browser

To run on the server,

Make sure `node store.js` is also running (note: if it can't be run, the port may be in use; grep for all occurences of 6004 (e.g. at the top of `store.js`, the socket request in `app.js`, etc) and change to another port.