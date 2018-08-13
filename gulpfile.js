
var gulp = require('gulp')
, minifyHtml = require("gulp-minify-html");
 

gulp.task('minify-html', function () {
    gulp.src('./views/*.hbs') 
    .pipe(minifyHtml())
    .pipe(gulp.dest('path/to/hbs'));
});