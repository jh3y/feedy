angular.module('feedy.Controllers').controller('ViewCtrl', [
  '$scope',
  '$sce',
  '$location',
  '$routeParams',
  'Feed',
  function($scope, $sce, $location, $routeParams, Feed) {
    $scope.itemID = $routeParams.itemID;
    $scope.item = Feed.get($scope.itemID);
    if (!$scope.item) {
      return $location.path('/');
    } else {
      if (typeof $scope.item.description === 'string') {
        $scope.item.description = $sce.trustAsHtml($scope.item.description);
      }
    }
  }
]);
