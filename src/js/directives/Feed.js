angular.module('feedy.Directives').directive('feed', [
  '$rootScope', '$templateCache', '_', function($rootScope, $templateCache, _) {
    return {
      templateUrl: 'directives/Feed.html',
      restrict: 'AE',
      transclude: true,
      replace: true,
      scope: {
        feedOpts: '=',
        feedData: '='
      },
      controller: function($scope, $element, $attrs) {
        $scope.feedItemTmpl = $templateCache.get('directives/FeedItem.html');
      },
      link: function($scope, $elem, $attrs, $ctrl) {
        var el = $elem[0],
          triggerHeight = 600,
          scrollHandle = _.debounce((function() {
            $rootScope.pos = el.scrollTop;
            if ((el.scrollHeight - el.scrollTop) < triggerHeight) {
              $scope.$emit($scope.feedOpts.requestEvent);
            }
          }), 250);
        $scope.renderFeed = function(data, reset) {
          var elements = '';
          if (reset) {
            $elem.empty();
            el.scrollTop = 0;
          }
          _.forEach(data, function(n, key) {
            elements += _.template($scope.feedItemTmpl)(n);
          });
          return $elem.append(elements);
        };
        $elem.on('scroll', scrollHandle);
        if ($scope.feedData && $scope.feedData.length > 0) {
          $scope.renderFeed($scope.feedData);
          if ($rootScope.pos > 0) {
            el.scrollTop = $rootScope.pos;
          }
        }
        if ($scope.feedOpts && $scope.feedOpts.updateEvent) {
          $scope.$on($scope.feedOpts.updateEvent, function(e, data) {
            if (data.items.length > 0) {
              $scope.renderFeed(data.items, data.reset);
            }
          });
        }
      }
    };
  }
]);
