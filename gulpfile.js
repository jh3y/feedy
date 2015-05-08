var gulp       = require('gulp'),
  gConfig      = require('./gulp-config'),
  browserSync  = require('browser-sync'),
  pluginOpts   = gConfig.pluginOpts,
  plugins      = require('gulp-load-plugins')(pluginOpts.load),
  isDist       = (plugins.gUtil.env.dist)    ? true: false,
  isDev        = (plugins.gUtil.env.dev)     ? true: false,
  isDeploy     = (plugins.gUtil.env.deploy)  ? true: false,
  isMapped     = (plugins.gUtil.env.map)     ? true: false,
  isStat       = (plugins.gUtil.env.stat)    ? true: false,
  isTest       = (plugins.gUtil.env.test)    ? true: false,
  sources      = gConfig.paths.sources,
  destinations = gConfig.paths.destinations;

/*
  serve; creates local static livereload server using browser-sync.
*/
gulp.task('serve', ['build:complete'], function(event) {
  browserSync(pluginOpts.browserSync);
  return gulp.watch(sources.overwatch).on('change', browserSync.reload);
});



/*
  js:compile/js:watch

  watch for changes to JavaScript files then compile app JavaScript file
  from source.
*/

gulp.task('js:compile', ['templates:compile'], function(event) {
  var testFilter = plugins.filter('test/**/*.js'),
    noTestFilter = plugins.filter([
      '**/*.js',
      '!test/**/*.js'
    ]);
  return gulp.src(sources.js.concat([destinations.templates + '**/*.*']), {base: 'src/js/'})
    .pipe(plugins.plumber())
    .pipe(isTest ? testFilter: plugins.gUtil.noop())
    .pipe(isTest ? gulp.dest(destinations.test): plugins.gUtil.noop())
    .pipe(isTest ? testFilter.restore(): plugins.gUtil.noop())
    .pipe(noTestFilter)
    .pipe(isMapped ? gulp.dest(destinations.js): plugins.gUtil.noop())
    .pipe(isMapped ? plugins.sourcemaps.init(): plugins.gUtil.noop())
    .pipe(plugins.order(pluginOpts.order))
    .pipe(plugins.concat(gConfig.pkg.name + '.js'))
    .pipe(plugins.wrap(pluginOpts.wrap))
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(isDeploy ? plugins.gUtil.noop(): gulp.dest(isDist ? destinations.dist: destinations.js))
    .pipe(isMapped ? plugins.sourcemaps.write('./'): plugins.gUtil.noop())
    .pipe(plugins.ngmin())
    .pipe(plugins.uglify())
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(gulp.dest(isDist ? destinations.dist: destinations.js));
});
gulp.task('js:watch', function(event) {
  gulp.watch(sources.js, ['js:compile']);
});



/*
  templates:compile/watch

  handle angular view/directive template watching and compilation

*/

gulp.task('templates:compile', function(event) {
  return gulp.src(sources.templates)
    .pipe(plugins.jade())
    .pipe(plugins.templateCache({
      module: gConfig.pkg.name
    }))
    .pipe(gulp.dest(destinations.templates));
});
gulp.task('templates:watch', function(event) {
  gulp.watch(sources.templates, ['js:compile']);
});


/*
  scss:compile/scss:watch

  watch for changes to stylus files then compile stylesheet from source
  auto prefixing content and generating output based on env flag.
*/
gulp.task('scss:compile', function(event) {
  return gulp.src(sources.scss)
    .pipe(plugins.plumber())
    .pipe(plugins.concat(gConfig.pkg.name + '.scss'))
    .pipe(plugins.sass())
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(isDeploy ? plugins.gUtil.noop(): gulp.dest(isDist ? destination.dist: destinations.css))
    .pipe(plugins.prefix(gConfig.prefix))
    .pipe(plugins.minify())
    .pipe(plugins.rename({
      suffix: '.min'
    }))
    .pipe(isStat ? plugins.size(pluginOpts.gSize): plugins.gUtil.noop())
    .pipe(gulp.dest(isDist ? destination.dist: destinations.css));
});
gulp.task('scss:watch', function(event) {
  gulp.watch(sources.scss, ['scss:compile']);
});


/*
  jade:compile/jade:watch

  watch for all jade file changes then compile
  page document files.
*/
gulp.task('jade:compile', function(event) {
  return gulp.src(sources.docs)
    .pipe(plugins.plumber())
    .pipe(isDeploy ? plugins.jade(): plugins.jade(pluginOpts.jade))
    .pipe(gulp.dest(destinations.html));
});
gulp.task('jade:watch', function(event){
  gulp.watch(sources.jade, ['jade:compile']);
});





/*
  vendor:publish

  handles packaging vendor scripts.

*/

gulp.task('vendor:publish', function(event) {
  var testFilter = plugins.filter([
    '**/*.*',
    '!angular-mocks/*.js',
    '!sinon/*.js'
  ]);
  return gulp.src(sources.vendor.js, {base: 'src/vendor'})
    .pipe(isTest ? plugins.gUtil.noop(): testFilter)
    .pipe(plugins.concat('vendor.js'))
    .pipe(gulp.dest(isTest ? destinations.test: destinations.js))
    .pipe(plugins.concat('vendor.min.js'))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(isTest ? destinations.test: destinations.js));
});

gulp.task('compile', [
  'vendor:publish',
  'js:compile'
]);

gulp.task('deploy:ghpages', ['build:complete'], function(event) {
  isDeploy = true;
  return gulp.src(sources.overwatch)
    .pipe(plugins.deploy());
});


gulp.task('build:complete', [
  'vendor:publish',
  'jade:compile',
  'scss:compile',
  'js:compile'
]);

gulp.task('watch', [
  'jade:watch',
  'scss:watch',
  'js:watch',
  'templates:watch'
]);


var defaultTasks = isDeploy ? [
  'deploy:ghpages'
]:[
  'vendor:publish',
  'serve',
  'watch'
];

gulp.task('default', defaultTasks);
