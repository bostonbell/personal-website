var gulp = require('gulp');
var os = require('os');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var gutil = require('gulp-util');
var minify = require('gulp-minify');

var EXPRESS_PORT = 4000;
var EXPRESS_ROOT = __dirname;
var LIVERELOAD_PORT = 35729;


var getNetworkInformation = function(){
    console.log("Starting express on local host: " + EXPRESS_PORT);
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces)
    {
        for (var k2 in interfaces[k])
        {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal)
            {
                addresses.push(address.address);
            }
        }
    }

    return addresses;
}

function startExpress(){
    var express = require('express');
    var app = express();
    app.use(require('connect-livereload')());
    app.use(express.static(EXPRESS_ROOT));
    app.listen(EXPRESS_PORT);
}

var lr;

function startLiveReload(){
    lr = require('tiny-lr')();
    lr.listen(LIVERELOAD_PORT);
}

function notifyLivereload(event){
    var fileName = require('path').relative(EXPRESS_ROOT, event.path);
    console.log("Change.");

    lr.changed({
        body: {
        files: [fileName]
    }
    });
}

gulp.task('pug', function(){
    gulp.src('./pug/*.pug')
    .pipe(pug({
       pretty: true
    }).on('error', gutil.log))
	.pipe(gulp.dest('./'));
});

gulp.task('watch', function(){
    gulp.watch('./sass/**/*', ['sass']);
    gulp.watch(['./pug/**/*', './pug/*', './pug/**/**/*'], ['pug']);
});

gulp.task('sass', function(){
    return gulp.src(['sass/app.scss'])
    .pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('css/'));
});

gulp.task('produce', function(){
    return gulp.src('ProductionFiles/**/*').pipe(
        minify({
            minify: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true,
            getKeptComment: function(content, filePath){
                var m = content.match(/\/\*![\s\S]*?\*\//img);
                return m && m.join('\n') + '\n' || '';
            }
        })).pipe(gulp.dest('Final'));
});

gulp.task('default', function()
{
    console.log("Current network information")
    console.log(getNetworkInformation());
    startExpress();
    startLiveReload();
    gulp.watch(['index.html', 'js/td.js', 'css/app.css', 'js/app.js'], notifyLivereload);
});
