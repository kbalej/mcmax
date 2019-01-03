function route(handle, dbh, pathname, querystring, response, postData, request) { 
 if (typeof handle[pathname] === 'function') {
     handle[pathname](response, postData, pathname, querystring, request, dbh); 
 } else { 
  //console.log("No request handler found for " + pathname); 
  //response.writeHead(404, {"Content-Type": "text/plain"}); 
  //response.write("404 Not found: " + pathname); 
  //response.end(); 
 }
} 
exports.route = route;