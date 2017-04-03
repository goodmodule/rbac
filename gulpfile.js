import jsdoc from 'gulp-jsdoc3';
import gulp from 'gulp';
import babel from 'gulp-babel';
import config from './jsdocConfig';

gulp.task('doc', (cb) => {
  return gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(jsdoc(config, cb));
});

gulp.task('build', () => {
  return gulp.src('./src/**/*.{js,jsx}')
    .pipe(babel())
    .pipe(gulp.dest('./dist'));
});
