var gulp = require('gulp');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var jsdoc = require("gulp-jsdoc");

gulp.task('test', function () {
    return gulp.src('./tests/**/*.js')
    .pipe(babel())
    .pipe(mocha({
    	timeout: 20000
    }));
});

gulp.task('build', function (callback) {
	return gulp.src('./src/**/*.js')
    	.pipe(babel())
    	.pipe(gulp.dest("./dist"));
});

gulp.task('doc', function (callback) {
	return gulp.src('./src/**/*.js')
    	.pipe(babel())
    	.pipe(jsdoc.parser())
  		.pipe(jsdoc.generator('./documentation' , {
  			path: 'node_modules/jaguarjs-jsdoc'
  		}));
});

gulp.doneCallback = function (err) {
	process.exit(err ? 1 : 0);
};