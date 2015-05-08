#feedy

[![Build Status](https://travis-ci.org/jh3y/feedy.svg)](https://travis-ci.org/jh3y/feedy)

__feedy__ is an angular app that consumes the flickr public photo feeds.

You can see it in action @ [jh3y.github.io/feedy](http://jh3y.github.io/feedy).

* infinite scrolling for loading feed
* tag mode toggling
* narrow searches via tags (comma separated)
* script optimization and minification

##Under the hood
Built with

* angular
* lodash
* jade
* scss
* gulp
* moment

And tested with

* karma
* mocha
* chai
* sinon

##Tests
Check out the tests @ [travis-ci.org/jh3y/feedy](https://travis-ci.org/jh3y/feedy).

##Running the source
To run the source;

1. Clone the repo.

        git clone https://github.com/jh3y/feedy.git

2. Navigate into the repo and install the dependencies.

        cd feedy
        npm install
        bower install

3. Run gulp!

        gulp

This will set up a livereload browser using `browser-sync` and watches on the different file types so that any changes made are reflected in the browser.

The output source being watched is located in the `out/` directory after compilation.

To run tests;

1. Prepare the test environment

        gulp compile --test

2. Run karma

        karma start

##Issues/Todos

* Store tags and tag mode in service so accessible between views.
* Refactor
* Implement better responsive layout and design
* Structure style source better
* Write more/better tests (directives)

##Feedback/Contributions
Happy to hear how I can improve things or discuss other approaches!

@jh3y 2015
