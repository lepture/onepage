/**
 * Onepage
 *
 * A component inspired by jQuery Onepage.
 *
 * Copyright (c) 2013 by Hsiaoming Yang.
 */

/**
 * Interface of onepage.
 */
function Onepage(element, options) {
  options = options || {};

  element.className += ' onepage-container';

  var children = element.childNodes;
  var sections = [];

  for (var i = 0; i < children.length; i++) {
    (function(node) {
      if (node.nodeType === document.ELEMENT_NODE) {
        node.className += ' onepage-element';
        node.style.position = 'absolute';
        node.style.top = sections.length * 100 + '%';
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
  this.setup();
}

/**
 * Bind events for scrolling.
 */
Onepage.prototype.setup = function() {
  var me = this;
  document.addEventListener('mousewheel', function(e) {
    e.preventDefault();
    var now = new Date().getTime();
    var period = (me.options.period || 500) + me.options.duration;
    if (!me.transitioned || now - me.transitioned > period) {
      if (e.wheelDelta > 0) {
        me.move(me.page - 1);
      } else {
        me.move(me.page + 1);
      }
    }
  }, false);
};

/**
 * Change current page to the given page.
 */
Onepage.prototype.move = function(page) {
  // reset page value for safety
  if (page < 0) {
    page = 0;
  }
  if (page > this.sections.length - 1) {
    page = this.sections.length - 1;
  }
  this.page = page;
  var percent = page * 100 + '%';
  stylish(this.element, 'transform', 'translate3d(0,-' + percent + ',0)');
  this.transitioned = new Date().getTime();
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
