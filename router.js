function route(handle, dbh, pathname, querystring, response, postData, request) { 
 if (typeof handle[pathname] === 'function') {
    handle[pathname](response, postData, pathname, querystring, request, dbh); 
 } else { 
    handle["KB_x_showFile"](response, postData, pathname, querystring, request, dbh);
 }
} 
exports.route = route;