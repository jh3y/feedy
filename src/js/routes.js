angular.module('feedy').config(function($routeProvider) {
  return $routeProvider.when("/", {
    templateUrl: "views/feed.html"
  }).when("/view/:itemID", {
    templateUrl: "views/view.html"
  }).otherwise({
    redirectTo: "/"
  });
});
