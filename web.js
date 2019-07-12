var express = require('express');
var app = new express();

app.get('/', function(request, response){
    response.sendFile('index.html');
});