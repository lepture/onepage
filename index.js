/**
 * Onepage
 *
 * A component inspired by Apple iPhone page.
 *
 * Copyright (c) 2013 - 2014 by Hsiaoming Yang.
 */

var events = require('event');
var emitter = require('emitter');

/**
 * Interface of onepage.
 */
function Onepage(element, options) {
  if (!(this instanceof Onepage)) {
    return new Onepage(element, options);
  }
  options = options || {};
  merge(options, {
    duration: 800,
    timingFunction: 'ease',
    period: 300,
    wheelDelta: 100,
    pagination: true,
    keyboard: true,
    loop: 'down'
  });

  var children = element.childNodes;
  var pages = [];

  var pagination;
  if (options.pagination) {
    // create pagination.
    pagination = document.createElement('div');
    pagination.className = 'onepage-pagination';
  }

  for (var i = 0; i < children.length; i++) {
    (function(node) {
      if (node.nodeType === document.ELEMENT_NODE) {
        node.className += ' onepage-element';
        node.style.top = pages.length * 100 + '%';

        if (pagination) {
          var page = document.createElement('a');
          page.href = '#' + pages.length;
          page.id = 'onepage-pagination-' + pages.length;
          // pagination with title
          if (node.title) {
            var explain = document.createElement('span');
            explain.className = 'text-title';
            explain.innerHTML = node.title;
            page.appendChild(explain);
            // clear node title
            node.title = '';
          }

          pagination.appendChild(page);
        }

        pages.push(node);
      }
    })(children[i]);
  }

  stylish(element, 'transitionTimingFunction', options.timingFunction);

  var prefix = stylish(
    element, 'transitionDuration', options.duration + 'ms'
  );

  element.className += ' onepage-container';

  // current active page
  this.page = parseInt(location.hash.slice(1), 10) || 0;

  // last animation time
  this.transitioned = null;

  this.options = options;
  this.element = element;
  this.pages = pages;
  this.pagination = pagination;

  setup(this);
  this.move(this.page);
}
emitter(Onepage.prototype);

Onepage.prototype.pageUp = function() {
  var me = this;
  var loop = me.options.loop;

  if (me.page > 0) {
    me.move(me.page - 1);
  } else if (loop === 'up' || loop === 'both') {
    me.move(me.pages.length - 1);
  }
};

Onepage.prototype.pageDown = function() {
  var me = this;
  var loop = me.options.loop;
  if (me.page < me.pages.length - 1) {
    me.move(me.page + 1);
  } else if (loop === 'down' || loop === 'both') {
    me.move(0);
  }
};

/**
 * Change current page to the given page.
 */
Onepage.prototype.move = function(page) {
  var me = this;
  // reset page value for safety
  if (page < 0) {
    page = 0;
  }
  if (page > me.pages.length - 1) {
    page = me.pages.length - 1;
  }

  var pagination = me.pagination;
  if (pagination) {
    // clear pagination active before
    var item = pagination.childNodes[me.page];
    item.className = '';
    // activate current pagination
    item = pagination.childNodes[page];
    item.className = 'active';
  }

  stylish(
    me.element, 'transform', 'translate3d(0,-' + page * 100 + '%,0)'
  );

  // emit events
  me.emit('move', page);
  setTimeout(function() {
    me.emit('end', page);
  }, me.options.duration);

  // update status
  me.page = page;
  me.transitioned = new Date().getTime();
};

/**
 * Setup everything for onepage scrolling.
 */
function setup(me) {
  // binding mousewheel
  events.bind(me.element, 'mousewheel', function(e) {
    e.preventDefault();
    var delta = new Date().getTime() - (me.transitioned || 0);
    var period = me.options.period + me.options.duration;
    if (delta > period && Math.abs(e.wheelDelta) > me.options.wheelDelta) {
      if (e.wheelDelta > 0) {
        me.pageUp();
      } else {
        me.pageDown();
      }
    }
  });

  // binding touch event
  events.bind(me.element, 'touchstart', function(e) {
    var x, y;
    var touches = e.touches;
    if (touches && touches.length) {
      x = touches[0].pageX;
      y = touches[0].pageY;

      var touchmove = function(e) {
        e.preventDefault();
        if (e.touches && e.touches.length) {
          var deltaX = x - e.touches[0].pageX;
          var deltaY = y - e.touches[0].pageY;
          if (deltaY >= 50) {
            me.pageDown();
          } else if (deltaY <= -50) {
            me.pageUp();
          }
          if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
            events.unbind(me.element, 'touchmove', touchmove);
          }
        }
      };

      events.bind(me.element, 'touchmove', touchmove);
    }
  }, false);

  // binding up and down key
  if (me.options.keyboard) {
    events.bind(document, 'keydown', function(e) {
      if (e.keyCode === 38) {
        me.pageUp();
      } else if (e.keyCode === 40) {
        me.pageDown();
      }
    });
  }

  // setup pagination
  var pagination = me.pagination;
  if (pagination) {
    var pages = pagination.getElementsByTagName('a');
    for (var i = 0; i < pages.length; i++) {
      (function(i) {
        events.bind(pages[i], 'click', function(e) {
          e.preventDefault();
          me.move(i);
        });
      })(i);
    }
    document.body.appendChild(pagination);
    // pagination be the vertical middle
    pagination.style.marginTop = '-' + (pagination.clientHeight / 2) + 'px';
  }
}

/**
 * Style an element with respect for browser prefixes.
 */
function stylish(node, key, value) {
  var prefixes = ['webkit', 'moz', 'ms', 'o'];
  var altKey = key.charAt(0).toUpperCase() + key.slice(1);
  var browser = null;

  for (var i = 0; i < prefixes.length; i++) {
    (function(prefix) {
      if (node.style[prefix + altKey] !== undefined) {
        node.style[prefix + altKey] = value;
        browser = prefix;
      }
    })(prefixes[i]);
  }

  if (!browser) {
    node.style[key] = value;
  }

  return browser;
}

function merge(obj, params) {
  for (var key in params) {
    (function(key) {
      if (obj[key] === undefined) {
        obj[key] = params[key];
      }
    })(key);
  }
}

module.exports = Onepage;
