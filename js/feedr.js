(function() { angular.module('feedy.Services').factory('Feed', [
  '$rootScope', '$http', '$q', '_', function($rootScope, $http, $q, _) {
    var _data;
    return {
      process: function(data) {
        var isInFeed, noobs;
        noobs = [];
        isInFeed = function(item) {
          var isIn;
          isIn = false;
          if (_data && _data.length > 0) {
            _.forEach(_data, function(n, key) {
              if (n.link === item.link) {
                isIn = true;
              }
            });
          }
          return isIn;
        };
        if (data && data.items && data.items.length) {
          _.forEach(data.items, function(n, key) {
            var idx;
            if (!isInFeed(n)) {
              n.id = _.uniqueId();
              if (n.published !== undefined) {
                n.published = moment(n.published).format('[Published: ]Do MMM YYYY [at] h:mm');
              }
              if (n.author && n.author.trim !== '') {
                idx = n.author.indexOf('(') + 1;
                n.author = n.author.substr(idx, n.author.length - (idx + 1));
              }
              if (n.tags && n.tags.trim !== '') {
                n.tags = n.tags.split(' ');
              }
              return noobs.push(n);
            }
          });
          if (noobs.length > 0) {
            if (!_data) {
              _data = noobs;
            } else if (_data.length) {
              _data = _.union(_data, noobs);
            }
          }
        } else {
          throw new Error('No data to be processed');
        }
        return {
          noobs: noobs,
          data: _data
        };
      },
      get: function(id) {
        if (!id) {
          return _data;
        } else {
          return _.find(_data, function(item) {
            return item.id === id;
          });
        }
      },
      reset: function() {
        return _data = undefined;
      },
      update: function(opts) {
        var self = this,
          deferred = $q.defer();
        if (opts && opts.reset) {
          self.reset();
        }
        self.fetch(opts).then(function(data) {
          try {
            deferred.resolve(self.process(data));
          } catch (_error) {
            deferred.reject(_error);
          }
        });
        return deferred.promise;
      },
      fetch: function(opts) {
        var self = this,
          deferred = $q.defer(),
          tags = opts && opts.tags && opts.tags.trim() !== '' ? 'tags=' + opts.tags.trim() + '&' : '',
          tagmode = opts && opts.tagmode && opts.tagmode.trim() !== '' ? 'tagmode=' + opts.tagmode.trim() + '&' : '',
          url = 'https://api.flickr.com/services/feeds/photos_public.gne?' + tags + tagmode + 'format=json&jsoncallback=JSON_CALLBACK';
        $http.jsonp(url).then((function(result) {
          deferred.resolve(result.data);
        }), function(result) {
          deferred.reject(result.data);
        });
        return deferred.promise;
      }
    };
  }
]);

angular.module('feedy.Services', []);

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

angular.module('feedy.Directives', []);

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

angular.module('feedy.Controllers', ['feedy.Services']);

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

angular.module('feedy').config(function($routeProvider) {
  return $routeProvider.when("/", {
    templateUrl: "views/feed.html"
  }).when("/view/:itemID", {
    templateUrl: "views/view.html"
  }).otherwise({
    redirectTo: "/"
  });
});

angular.module("feedr").run(["$templateCache", function($templateCache) {$templateCache.put("views/feed.html","<div ng-controller=\"FeedCtrl\"><div class=\"feed-controls\"><input ng-model=\"tag\" type=\"text\" placeholder=\"Enter tags to narrow search (comma separated)\" title=\"Input search tags.\" class=\"tx--black\"/><div ng-click=\"switchTagMode()\" ng-class=\"{\'is--any\': tagMode == \'any\'}\" title=\"Select tag mode.\" class=\"tag-mode-switch bd--grey\"><div class=\"tag-mode-switch--indicator\"></div></div></div><div ng-class=\"{\'is--loading\': loading, \'is--updating\': updating}\" class=\"feed-wrapper\"><div data-feed=\"data-feed\" data-feed-opts=\"feedOpts\" data-feed-data=\"feedData\"></div></div></div>");
$templateCache.put("views/view.html","<div ng-controller=\"ViewCtrl\" class=\"detail bd--grey rd--border padd\"><a href=\"#/\" class=\"btn bd--green bg--green tx--white item-view--back-btn\">Back</a><div class=\"detail--title\"><h1><a href=\"{{item.link}}\" target=\"_blank\">{{item.title}}</a></h1><p class=\"detail--\"><a target=\"_blank\" href=\"https://flickr.com/{{item.author_id}}\"> {{item.author}}</a> | {{item.published}}</p></div><div><div class=\"detail--image-holder\"><div><img src=\"{{item.media.m}}\"/></div></div><div class=\"detail--description\"><div ng-bind-html=\"item.description\"></div><ul ng-if=\"item.tags.length &gt; 0\" class=\"detail--tags\"><li><a ng-repeat=\"tag in item.tags\" href=\"https://www.flickr.com/search/?tags={{tag}}\" target=\"_blank\" class=\"feed-item--tag\">{{tag}}</a></li></ul></div></div></div>");
$templateCache.put("directives/Feed.html","<ul class=\"feed bd--grey rd--border\"></ul>");
$templateCache.put("directives/FeedItem.html","<li class=\"feed-item\"><div style=\"background-image: url(<%= media.m %>)\" class=\"feed-item--image\"><a href=\"#/view/<%=id%>\" title=\"View details for <%= title %>.\"></a></div><div class=\"feed-item--details\"><h1 class=\"feed-item--title tx--blue hv--pink\"><a href=\"#/view/<%=id%>\"><%= title %></a></h1><ul><li class=\"feed-item--detail\"><a href=\"https://flickr.com/<%= author_id %>\" target=\"_blank\" title=\"See <%= author %> on flickr.\"><%= author %></a></li><li class=\"feed-item--detail published\"><%= published %></li><li class=\"feed-item--detail\"><a href=\"<%= link %>\" target=\"_blank\">View on flickr</a></li></ul></div></li>");}]); }());