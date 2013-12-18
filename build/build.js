
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-event/index.js", function(exports, require, module){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);

  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);

  return fn;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("onepage/index.js", function(exports, require, module){
/**
 * Onepage
 *
 * A component inspired by Apple iPhone-5c page.
 *
 * Copyright (c) 2013 by Hsiaoming Yang.
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
          if (!pages.length) {
            page.className = 'active';
          }

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
  this.page = 0;

  // last animation time
  this.transitioned = null;

  this.options = options;
  this.element = element;
  this.pages = pages;
  this.pagination = pagination;
  this.setup();
}
emitter(Onepage.prototype);

/**
 * Setup everything for onepage scrolling.
 */
Onepage.prototype.setup = function() {
  var me = this;
  var loop = me.options.loop;

  var pageDown = function() {
    if (me.page < me.pages.length - 1) {
      me.move(me.page + 1);
    } else if (loop === 'down' || loop === 'both') {
      me.move(0);
    }
  };

  var pageUp = function() {
    if (me.page > 0) {
      me.move(me.page - 1);
    } else if (loop === 'up' || loop === 'both') {
      me.move(me.pages.length - 1);
    }
  };

  // binding mousewheel
  events.bind(me.element, 'mousewheel', function(e) {
    e.preventDefault();
    var delta = new Date().getTime() - (me.transitioned || 0);
    var period = me.options.period + me.options.duration;
    if (delta > period && Math.abs(e.wheelDelta) > me.options.wheelDelta) {
      if (e.wheelDelta > 0) {
        pageUp();
      } else {
        pageDown();
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
            pageDown();
          } else if (deltaY <= -50) {
            pageUp();
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
        pageUp();
      } else if (e.keyCode === 40) {
        pageDown();
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

});




require.alias("component-event/index.js", "onepage/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-emitter/index.js", "onepage/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
