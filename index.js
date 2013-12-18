/**
 * Onepage
 *
 * A component inspired by jQuery Onepage.
 *
 * Copyright (c) 2013 by Hsiaoming Yang.
 */

var events = require('event');
var emitter = require('emitter');

/**
 * Interface of onepage.
 */
function Onepage(element, options) {
  // default values of options
  // {
  //   duration: 800,
  //   timingFunction: 'ease',
  //   period: 500
  // }
  options = options || {};

  element.className += ' onepage-container';

  var children = element.childNodes;
  var sections = [];

  // create pagination.
  var pagination = document.createElement('div');
  pagination.className = 'onepage-pagination';

  for (var i = 0; i < children.length; i++) {
    (function(node) {
      if (node.nodeType === document.ELEMENT_NODE) {
        node.className += ' onepage-element';
        node.style.position = 'absolute';
        node.style.top = sections.length * 100 + '%';
        var page = document.createElement('a');
        page.href = '#' + sections.length;
        page.id = 'onepage-pagination-' + sections.length;
        if (!sections.length) {
          page.className = 'active';
        }
        pagination.appendChild(page);
        sections.push(node);
      }
    })(children[i]);
  }

  stylish(
    element,
    'transitionTimingFunction', options.timingFunction || 'ease'
  );

  options.duration = options.duration || 800;
  var prefix = stylish(
    element, 'transitionDuration', options.duration + 'ms'
  );

  // current active page
  this.page = 0;

  // last animation time
  this.transitioned = null;

  this.options = options;
  this.element = element;
  this.sections = sections;
  this.pagination = pagination;
  this.setup();
}
emitter(Onepage.prototype);

/**
 * Setup everything for onepage scrolling.
 */
Onepage.prototype.setup = function() {
  var me = this;
  // binding mousewheel
  events.bind(document, 'mousewheel', function(e) {
    e.preventDefault();
    var now = new Date().getTime();
    var period = (me.options.period || 500) + me.options.duration;
    if (!me.transitioned || now - me.transitioned > period) {
      if (e.wheelDelta > 0) {
        me.move(me.page - 1);
      } else if (me.page >= me.sections.length - 1) {
        me.move(0);
      } else {
        me.move(me.page + 1);
      }
    }
  });

  // binding up and down key
  events.bind(document, 'keydown', function(e) {
    if (e.keyCode === 38) {
      me.move(me.page - 1);
    } else if (e.keyCode === 40) {
      if (me.page >= me.sections.length - 1) {
        me.move(0);
      } else {
        me.move(me.page + 1);
      }
    }
  });

  // setup pagination
  var pagination = me.pagination;
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
  pagination.style.marginTop = '-' + (pagination.clientHeight / 2) + 'px';
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
  if (page > me.sections.length - 1) {
    page = me.sections.length - 1;
  }

  var pagination = me.pagination;
  // clear pagination active before
  var item = pagination.childNodes[me.page];
  item.className = '';
  // activate current pagination
  item = pagination.childNodes[page];
  item.className = 'active';

  var percent = page * 100 + '%';
  stylish(me.element, 'transform', 'translate3d(0,-' + percent + ',0)');

  // emit events
  me.emit('move', page);
  setTimeout(function() {
    me.emit('finish', page);
  }, me.options.duration);

  // update status
  me.page = page;
  me.transitioned = new Date().getTime();
};


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

module.exports = Onepage;
