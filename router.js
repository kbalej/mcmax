function route(handle, dbh, pathname, querystring, response, postData, request,io) { 
 if (typeof handle[pathname] === 'function') {
    handle[pathname](response, postData, pathname, querystring, request, dbh,io); 
 } else { 
    handle["KB_showFile"](response, postData, pathname, querystring, request, dbh,io);
 }
} 
exports.route = route;