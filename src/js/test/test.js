describe('feedy', function() {
  var Feed,
    controller,
    data,
    compile,
    defer,
    q,
    rootScope,
    scope,
    dummyResponse,
    dummyData;

  beforeEach(function() {
    angular.mock.module('feedy');
    angular.mock.inject(function(_Feed_, _$httpBackend_, $controller, $rootScope, $q, $compile) {
      q = $q;
      Feed = _Feed_;
      defer = q.defer();
      Feed = {
        get: _Feed_.get,
        update: _Feed_.update,
        fetch: sinon.stub().returns(defer.promise),
        process: _Feed_.process,
        reset: _Feed_.reset
      };
      compile = $compile;
      rootScope = $rootScope;
      scope = $rootScope.$new();
      controller = $controller('FeedCtrl', {
        $rootScope: rootScope,
        $scope: scope,
        Feed: Feed
      });
    });
  });
  describe('Feed Service', function() {
    describe('reset', function() {
      it('wipes stored data', function() {
        dummyData = {
          title: 'I have items',
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }
          ]
        };
        Feed.process(dummyData);
        expect(Feed.get().length).to.equal(1);
        Feed.reset();
        return expect(Feed.get()).to.be.undefined;
      });
    });
    describe('get', function() {
      it('returns the correct entire data set', function() {
        dummyResponse = {
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }
          ]
        };
        defer.resolve(dummyResponse);
        Feed.update();
        scope.$digest();
        data = Feed.get();
        expect(data.length).to.equal(1);
        return expect(data[0].title).to.equal('A');
      });
      it('returns the correct entry if supplied an ID', function() {
        var idToRequest;
        dummyResponse = {
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }, {
              title: 'B',
              link: '/photos/B'
            }
          ]
        };
        defer.resolve(dummyResponse);
        Feed.update();
        scope.$digest();
        data = Feed.get();
        idToRequest = data[data.length - 1].id;
        data = Feed.get(idToRequest);
        return expect(data.title).to.equal('B');
      });
    });
    describe('process', function() {
      it('throws an error if no items in data', function() {
        dummyData = {
          title: 'I have no items'
        };
        return expect(Feed.process.bind(Feed, dummyData)).to["throw"]('No data to be processed');
      });
      it('updates data set correctly', function() {
        dummyData = {
          title: 'I have items',
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }
          ]
        };
        data = Feed.process(dummyData).data;
        expect(data.length).to.equal(1);
        return expect(data[0].title).to.equal('A');
      });
      it('does not add duplicates to data set', function() {
        dummyData = {
          title: 'I have items',
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }
          ]
        };
        Feed.process(dummyData);
        dummyData.items.push({
          title: 'B',
          link: '/photos/B'
        });
        data = Feed.process(dummyData).data;
        return expect(data.length).to.equal(2);
      });
      it('correctly identifies new entries', function() {
        dummyData = {
          title: 'I have items',
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }
          ]
        };
        Feed.process(dummyData);
        dummyData.items.push({
          title: 'B',
          link: '/photos/B'
        });
        data = Feed.process(dummyData);
        expect(data.noobs.length).to.equal(1);
        return expect(data.noobs[0].title).to.equal('B');
      });
      it('correctly trims author names in new entries', function() {
        dummyData = {
          title: 'I have items',
          items: [
            {
              title: 'A',
              link: '/photos/A',
              author: 'nobody@flickr.com (Jhey)'
            }
          ]
        };
        data = Feed.process(dummyData).data[0];
        return expect(data.author).to.equal('Jhey');
      });
      it('correctly converts published time stamp', function() {
        dummyData = {
          title: 'I have items',
          items: [
            {
              title: 'A',
              link: '/photos/A',
              published: 0
            }
          ]
        };
        data = Feed.process(dummyData).data[0];
        return expect(data.published).to.equal('Published: 1st Jan 1970 at 12:00');
      });
      it('generate correct amount of tags', function() {
        dummyData = {
          title: 'I have items',
          items: [
            {
              title: 'A',
              link: '/photos/A',
              tags: '#super #awesome #amazing #photo'
            }
          ]
        };
        data = Feed.process(dummyData).data[0];
        return expect(data.tags.length).to.equal(4);
      });
    });
    describe('update', function() {
      it('sets data to returned data', function() {
        dummyResponse = {
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }
          ]
        };
        defer.resolve(dummyResponse);
        Feed.update();
        scope.$digest();
        expect(Feed.get().length).to.equal(1);
        return expect(Feed.get()[0].title).to.equal('A');
      });
      it('data is not updated if no items', function() {
        dummyResponse = {
          title: 'I have no items'
        };
        defer.resolve(dummyResponse);
        Feed.update();
        scope.$digest();
        return expect(Feed.get()).to.be.undefined;
      });
      it('sets data correctly', function() {
        dummyResponse = {
          title: 'Photos',
          link: 'http://photos.p.com',
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }, {
              title: 'B',
              link: '/photos/B'
            }
          ]
        };
        defer.resolve(dummyResponse);
        Feed.update();
        scope.$digest();
        return expect(Feed.get().length).to.equal(2);
      });
      it('respects the reset option', function() {
        dummyData = {
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }, {
              title: 'B',
              link: '/photos/B'
            }
          ]
        };
        Feed.process(dummyData);
        expect(Feed.get().length).to.equal(2);
        dummyResponse = {
          items: [
            {
              title: 'C',
              link: '/photos/C'
            }
          ]
        };
        defer.resolve(dummyResponse);
        Feed.update({
          reset: true
        });
        scope.$digest();
        return expect(Feed.get().length).to.equal(1);
      });
    });
  });
  describe('FeedCtrl', function() {
    describe('switchTagMode', function() {
      it('correctly toggles scope tag mode', function() {
        scope.tagMode = 'all';
        scope.switchTagMode();
        expect(scope.tagMode).to.equal('any');
        scope.switchTagMode();
        expect(scope.tagMode).to.equal('all');
      });
      it('does not invoke search if less than two tags', function() {
        scope.tag = '';
        scope.search = sinon.stub();
        scope.switchTagMode();
        scope.$digest();
        return expect(scope.search).to.not.have.been.called;
      });
      it('invokes search if more than one tag', function() {
        scope.tag = 'a,b';
        scope.search = sinon.stub();
        scope.switchTagMode();
        scope.$digest();
        return expect(scope.search).to.have.been.called;
      });
    });
    describe('search', function() {
      it('invokes updateFeed with the correct opts', function() {
        scope.tag = 'a,b';
        scope.tagMode = 'any';
        scope.updateFeed = sinon.stub();
        scope.search();
        scope.$digest();
        return expect(scope.updateFeed).to.have.been.calledWith({
          reset: true,
          tags: 'a,b',
          tagmode: 'any'
        });
      });
    });
    describe('getFeed', function() {
      it('sets scopes feed data correctly when data received', function() {
        dummyResponse = {
          title: 'I have items',
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }
          ]
        };
        defer.resolve(dummyResponse);
        scope.getFeed();
        scope.$digest();
        return expect(scope.feedData.length).to.equal(1);
      });
    });
    describe('updateFeed', function() {
      it('fires $broadcast event when new data is received', function() {
        dummyResponse = {
          title: 'I have items',
          items: [
            {
              title: 'A',
              link: '/photos/A'
            }
          ]
        };
        rootScope.$broadcast = sinon.stub();
        defer.resolve(dummyResponse);
        scope.updateFeed();
        scope.$digest();

        /*
          This is ok because on first update noobs == data so we can use
          Feed.get()
         */
        return expect(rootScope.$broadcast).to.have.been.calledWith('newFeedData', {
          items: Feed.get(),
          reset: false
        });
      });
      it('respects the reset option', function() {
        scope.feedData = [
          {
            title: 'A',
            link: '/photos/A'
          }, {
            title: 'B',
            link: '/photos/B'
          }
        ];
        dummyResponse = {
          items: [
            {
              title: 'C',
              link: '/photos/C'
            }
          ]
        };
        defer.resolve(dummyResponse);
        scope.updateFeed({
          reset: true
        });
        scope.$digest();
        return expect(scope.feedData.length).to.equal(1);
      });
    });
  });
  describe('Feed directive', function(){
    it('compiles correct default HTML output', function() {
      element = '<div data-feed></div>';
      element = compile(element)(scope);
      scope.$digest();
      expect(element[0].tagName).to.equal('UL');
      // No scope data so inner HTML should be empty.
      expect(element.html().trim()).to.equal('');
      expect(element.attr('class').indexOf('feed')).to.not.equals(-1);
    });
  });
});
