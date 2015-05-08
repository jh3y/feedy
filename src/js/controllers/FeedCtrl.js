angular.module('feedy.Controllers').controller('FeedCtrl', [
  '_',
  '$rootScope',
  '$scope',
  '$timeout',
  '$location',
  '$routeParams',
  'Feed',
  function(_, $rootScope, $scope, $timeout, $location, $routeParams, Feed) {
    var tagHandler = _.debounce((function(n, o) {
      if (n || n === '') {
        return $scope.search();
      }
    }), 1000);
    $scope.feedData = undefined;
    $scope.tagMode = 'all';
    $scope.feedOpts = {
      updateEvent: 'newFeedData',
      requestEvent: 'requestNewData'
    };
    $scope.switchTagMode = function() {
      $scope.tagMode = $scope.tagMode === 'all' ? 'any' : 'all';
      if ($scope.tag && $scope.tag !== '' && $scope.tag.split(',').length > 1) {
        return $scope.search();
      }
    };
    $scope.search = function() {
      var opts;
      $scope.loading = true;
      opts = {
        reset: true,
        tags: $scope.tag,
        tagmode: $scope.tagMode
      };
      return $scope.updateFeed(opts);
    };
    $scope.updateFeed = function(opts) {
      var reset;
      reset = opts && opts.reset ? true : false;
      if (!opts && $scope.tag !== '') {
        opts = {
          tags: $scope.tag,
          tagmode: 'all'
        };
      }
      return Feed.update(opts).then(function(result) {
        $scope.feedData = result.data;
        $scope.loading = false;
        $scope.updating = false;
        return $rootScope.$broadcast($scope.feedOpts.updateEvent, {
          items: result.noobs,
          reset: reset
        });
      });
    };
    $scope.getFeed = function() {
      if (!Feed.get()) {
        $scope.loading = true;
        $scope.updateFeed();
      } else {
        $scope.feedData = Feed.get();
      }
    };
    $scope.getFeed();
    $scope.$on($scope.feedOpts.requestEvent, function() {
      $scope.updating = true;
      return $scope.updateFeed();
    });
    return $scope.$watch('tag', tagHandler);
  }
]);
