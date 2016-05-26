var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname+"/public_html/")).listen(80);
console.log('Server running at http://127.0.0.1:80/');
