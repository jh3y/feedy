angular.module('feedy.Services').factory('Feed', [
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
