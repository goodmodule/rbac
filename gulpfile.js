import gulp from 'gulp';
import mocha from 'gulp-mocha';
import babel from 'gulp-babel';
import jsdoc from 'gulp-jsdoc';

const babelConfig = {
  stage: 0,
};

gulp.task('test', () => {
  return gulp.src('./tests/**/*.js')
  .pipe(babel(babelConfig))
  .pipe(mocha({
    timeout: 20000,
  }));
});

gulp.task('build', () => {
  return gulp.src('./src/**/*.{js,jsx}')
    .pipe(babel(babelConfig))
    .pipe(gulp.dest('./dist'));
});

gulp.task('doc', () => {
  return gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(jsdoc.parser())
    .pipe(jsdoc.generator('./documentation', {
      path: 'node_modules/jaguarjs-jsdoc',
    }));
});

gulp.doneCallback = (err) => {
  process.exit(err ? 1 : 0);
};
