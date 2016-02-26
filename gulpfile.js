import jsdoc from 'gulp-jsdoc';
import gulp from 'gulp';
import babel from 'gulp-babel';
import jsxCoverage from 'gulp-jsx-coverage';
import path from 'path';
import coveralls from 'gulp-coveralls';

gulp.task('doc', () => {
  return gulp.src('./src/**/*.js')
    .pipe(babel())
    .pipe(jsdoc.parser())
    .pipe(jsdoc.generator('./documentation', {
      path: 'node_modules/jaguarjs-jsdoc',
    }));
});

gulp.task('test', jsxCoverage.createTask({
  src: ['./tests/**/*{.js,.jsx}'],  // will pass to gulp.src as mocha tests
  istanbul: {                                      // will pass to istanbul or isparta
    preserveComments: true,                      // required for istanbul 0.4.0+
    coverageVariable: '__MY_TEST_COVERAGE__',
    exclude: /node_modules|test[0-9]/,            // do not instrument these files
  },

  threshold: 50,                                   // fail the task when coverage lower than this
                                                   // default is no threshold
  thresholdType: 'lines',                         // one of 'lines', 'statements', 'functions', 'banches'
                                                   // default is 'lines'
  transpile: {                                     // this is default whitelist/blacklist for transpilers
    babel: {
      include: /\.jsx?$/,
      exclude: /node_modules/,
      omitExt: false,                           // if you wanna omit file ext when require(), put an array
    },                                           // of file exts here. Ex: ['.jsx', '.es6'] (NOT RECOMMENDED)                                         // of file exts here. Ex: ['.cjsx'] (NOT RECOMMENDED)
  },
  coverage: {
    reporters: ['text-summary', 'json', 'lcov'], // list of istanbul reporters
    directory: 'coverage',                        // will pass to istanbul reporters
  },
  mocha: {                                         // will pass to mocha
    reporter: 'spec',
  },
}));

gulp.task('build', () => {
  return gulp.src('./src/**/*.{js,jsx}')
    .pipe(babel())
    .pipe(gulp.dest('./dist'));
});

gulp.task('coveralls', ['test'], () => {
  if (!process.env.CI) {
    return void 0;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.doneCallback = (err) => {
  process.exit(err ? 1 : 0);
};
