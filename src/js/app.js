var lodash = angular.module('lodash', []);

lodash.factory('_', function() {
  return window._;
});

var feedr = angular.module('feedy', [
  'lodash',
  'ngRoute',
  'feedy.Controllers',
  'feedy.Directives',
  'feedy.Services'
  ]
);
