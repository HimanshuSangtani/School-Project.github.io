var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 7002));

app.use(express.static(__dirname));

// views is directory for all template files
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
//fs.createReadStream('index-local.html').pipe(fs.createWriteStream('index.html'));
//process.argv.forEach(function (val, index, array) {
//});
//fs.rename('index.html', 'index-local.html', function (err) {
//        if (err)
//            throw err;
//    });


var fs = require('fs');

if (fs.existsSync('index.html'))
{
    fs.unlinkSync('index.html');
}


if (process.argv[2] == 'local')
{
    fs.createReadStream('index-local.html').pipe(fs.createWriteStream('index.html'));
} else if (process.argv[2] == 'local1')
{
    fs.createReadStream('index-local1.html').pipe(fs.createWriteStream('index.html'));
} else {
    fs.createReadStream('index-main.html').pipe(fs.createWriteStream('index.html'));
}



app.get('/', function (request, response) {
    response.sendfile(__dirname + '/index.html');
});


app.listen(app.get('port'), function () {
});


