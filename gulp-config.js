var env = 'out/';
module.exports = {
  pkg: {
    name: 'feedy'
  },
  pluginOpts: {
    jade: {
      pretty: false
    },
    gSize: {
      showFiles: true
    },
    browserSync: {
      port   : 1987,
      server : {
        baseDir: env
      }
    },
    order: [
      'services/feedy.js',
      'services/**/*.js',
      'directives/feedy.js',
      'directives/**/*.js',
      'controllers/feedy.js',
      'controllers/**/*.js',
      'app.js',
      'routes.js',
      '**/templates.js'
    ],
    prefix: [
      'last 3 versions',
      'Blackberry 10',
      'Android 3',
      'Android 4'
    ],
    wrap: '(function() { <%= contents %> }());',
    load: {
      rename: {
        'gulp-gh-pages'             : 'deploy',
        'gulp-util'                 : 'gUtil',
        'gulp-minify-css'           : 'minify',
        'gulp-autoprefixer'         : 'prefix',
        'gulp-ng-annotate'          : 'ngmin',
        'gulp-angular-templatecache': 'templateCache'
      }
    }
  },
  paths: {
    base: env,
    sources: {
      js: [
        'src/js/**/*.js'
      ],
      vendor: {
        js: [
          'src/vendor/lodash/lodash.js',
          'src/vendor/moment/moment.js',
          'src/vendor/angular/angular.js',
          'src/vendor/angular-resource/angular-resource.js',
          'src/vendor/angular-route/angular-route.js',
          'src/vendor/angular-mocks/angular-mocks.js',
          'src/vendor/sinon/index.js'
        ]
      },
      jade: [
        'src/jade/documents/**/*.jade',
        'src/jade/layout-blocks/**/*.jade'
      ],
      docs: 'src/jade/documents/**/*.jade',
      views: 'src/jade/views/**/*.jade',
      templates: [
        'src/jade/templates/**/*.jade',
        'src/jade/views/**/*.jade'
      ],
      scss: 'src/scss/**/*.scss',
      overwatch: 'out/**/*.{html,js,css}'
    },
    destinations: {
      testing: {
        screenshots: './testing/screenshots'
      },
      dist: './dist',
      build: '',
      js: env + 'js/',
      html: env,
      css: env + 'css/',
      test: 'testEnv/',
      templates: 'src/js/tmp/'
    }
  }
};
