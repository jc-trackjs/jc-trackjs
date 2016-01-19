var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');

gulp.task('js:prod', function() {
    return gulp.src('src/*.js')
      .pipe(gp_concat('listener.js'))
      .pipe(gulp.dest('dist'))
      .pipe(gp_uglify())
      .pipe(gp_rename('listener.min.js'))
      .pipe(gulp.dest('dist'));
});


gulp.task('default', ['js:prod']);