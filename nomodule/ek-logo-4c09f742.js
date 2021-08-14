System.register(['assert', 'tty', 'util', 'fs', 'net', 'stream', 'readable-stream/transform'], function (exports) {
  'use strict';
  var require$$0$1, require$$0, require$$1, require$$3, require$$4, require$$3$1, require$$4$1;
  return {
    setters: [function (module) {
      require$$0$1 = module.default;
    }, function (module) {
      require$$0 = module.default;
    }, function (module) {
      require$$1 = module.default;
    }, function (module) {
      require$$3 = module.default;
    }, function (module) {
      require$$4 = module.default;
    }, function (module) {
      require$$3$1 = module.default;
    }, function (module) {
      require$$4$1 = module.default;
    }],
    execute: function () {

      var src = {exports: {}};

      var browser = {exports: {}};

      var debug$1 = {exports: {}};

      /**
       * Helpers.
       */

      var s = 1000;
      var m = s * 60;
      var h = m * 60;
      var d = h * 24;
      var y = d * 365.25;

      /**
       * Parse or format the given `val`.
       *
       * Options:
       *
       *  - `long` verbose formatting [false]
       *
       * @param {String|Number} val
       * @param {Object} [options]
       * @throws {Error} throw an error if val is not a non-empty string or a number
       * @return {String|Number}
       * @api public
       */

      var ms = function(val, options) {
        options = options || {};
        var type = typeof val;
        if (type === 'string' && val.length > 0) {
          return parse(val);
        } else if (type === 'number' && isNaN(val) === false) {
          return options.long ? fmtLong(val) : fmtShort(val);
        }
        throw new Error(
          'val is not a non-empty string or a valid number. val=' +
            JSON.stringify(val)
        );
      };

      /**
       * Parse the given `str` and return milliseconds.
       *
       * @param {String} str
       * @return {Number}
       * @api private
       */

      function parse(str) {
        str = String(str);
        if (str.length > 100) {
          return;
        }
        var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
          str
        );
        if (!match) {
          return;
        }
        var n = parseFloat(match[1]);
        var type = (match[2] || 'ms').toLowerCase();
        switch (type) {
          case 'years':
          case 'year':
          case 'yrs':
          case 'yr':
          case 'y':
            return n * y;
          case 'days':
          case 'day':
          case 'd':
            return n * d;
          case 'hours':
          case 'hour':
          case 'hrs':
          case 'hr':
          case 'h':
            return n * h;
          case 'minutes':
          case 'minute':
          case 'mins':
          case 'min':
          case 'm':
            return n * m;
          case 'seconds':
          case 'second':
          case 'secs':
          case 'sec':
          case 's':
            return n * s;
          case 'milliseconds':
          case 'millisecond':
          case 'msecs':
          case 'msec':
          case 'ms':
            return n;
          default:
            return undefined;
        }
      }

      /**
       * Short format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function fmtShort(ms) {
        if (ms >= d) {
          return Math.round(ms / d) + 'd';
        }
        if (ms >= h) {
          return Math.round(ms / h) + 'h';
        }
        if (ms >= m) {
          return Math.round(ms / m) + 'm';
        }
        if (ms >= s) {
          return Math.round(ms / s) + 's';
        }
        return ms + 'ms';
      }

      /**
       * Long format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function fmtLong(ms) {
        return plural(ms, d, 'day') ||
          plural(ms, h, 'hour') ||
          plural(ms, m, 'minute') ||
          plural(ms, s, 'second') ||
          ms + ' ms';
      }

      /**
       * Pluralization helper.
       */

      function plural(ms, n, name) {
        if (ms < n) {
          return;
        }
        if (ms < n * 1.5) {
          return Math.floor(ms / n) + ' ' + name;
        }
        return Math.ceil(ms / n) + ' ' + name + 's';
      }

      (function (module, exports) {
      /**
       * This is the common logic for both the Node.js and web browser
       * implementations of `debug()`.
       *
       * Expose `debug()` as the module.
       */

      exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
      exports.coerce = coerce;
      exports.disable = disable;
      exports.enable = enable;
      exports.enabled = enabled;
      exports.humanize = ms;

      /**
       * The currently active debug mode names, and names to skip.
       */

      exports.names = [];
      exports.skips = [];

      /**
       * Map of special "%n" handling functions, for the debug "format" argument.
       *
       * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
       */

      exports.formatters = {};

      /**
       * Previous log timestamp.
       */

      var prevTime;

      /**
       * Select a color.
       * @param {String} namespace
       * @return {Number}
       * @api private
       */

      function selectColor(namespace) {
        var hash = 0, i;

        for (i in namespace) {
          hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }

        return exports.colors[Math.abs(hash) % exports.colors.length];
      }

      /**
       * Create a debugger with the given `namespace`.
       *
       * @param {String} namespace
       * @return {Function}
       * @api public
       */

      function createDebug(namespace) {

        function debug() {
          // disabled?
          if (!debug.enabled) return;

          var self = debug;

          // set `diff` timestamp
          var curr = +new Date();
          var ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;

          // turn the `arguments` into a proper Array
          var args = new Array(arguments.length);
          for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i];
          }

          args[0] = exports.coerce(args[0]);

          if ('string' !== typeof args[0]) {
            // anything else let's inspect with %O
            args.unshift('%O');
          }

          // apply any `formatters` transformations
          var index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
            // if we encounter an escaped % then don't increase the array index
            if (match === '%%') return match;
            index++;
            var formatter = exports.formatters[format];
            if ('function' === typeof formatter) {
              var val = args[index];
              match = formatter.call(self, val);

              // now we need to remove `args[index]` since it's inlined in the `format`
              args.splice(index, 1);
              index--;
            }
            return match;
          });

          // apply env-specific formatting (colors, etc.)
          exports.formatArgs.call(self, args);

          var logFn = debug.log || exports.log || console.log.bind(console);
          logFn.apply(self, args);
        }

        debug.namespace = namespace;
        debug.enabled = exports.enabled(namespace);
        debug.useColors = exports.useColors();
        debug.color = selectColor(namespace);

        // env-specific initialization logic for debug instances
        if ('function' === typeof exports.init) {
          exports.init(debug);
        }

        return debug;
      }

      /**
       * Enables a debug mode by namespaces. This can include modes
       * separated by a colon and wildcards.
       *
       * @param {String} namespaces
       * @api public
       */

      function enable(namespaces) {
        exports.save(namespaces);

        exports.names = [];
        exports.skips = [];

        var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
        var len = split.length;

        for (var i = 0; i < len; i++) {
          if (!split[i]) continue; // ignore empty strings
          namespaces = split[i].replace(/\*/g, '.*?');
          if (namespaces[0] === '-') {
            exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
          } else {
            exports.names.push(new RegExp('^' + namespaces + '$'));
          }
        }
      }

      /**
       * Disable debug output.
       *
       * @api public
       */

      function disable() {
        exports.enable('');
      }

      /**
       * Returns true if the given mode name is enabled, false otherwise.
       *
       * @param {String} name
       * @return {Boolean}
       * @api public
       */

      function enabled(name) {
        var i, len;
        for (i = 0, len = exports.skips.length; i < len; i++) {
          if (exports.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = exports.names.length; i < len; i++) {
          if (exports.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }

      /**
       * Coerce `val`.
       *
       * @param {Mixed} val
       * @return {Mixed}
       * @api private
       */

      function coerce(val) {
        if (val instanceof Error) return val.stack || val.message;
        return val;
      }
      }(debug$1, debug$1.exports));

      /**
       * This is the web browser implementation of `debug()`.
       *
       * Expose `debug()` as the module.
       */

      (function (module, exports) {
      exports = module.exports = debug$1.exports;
      exports.log = log;
      exports.formatArgs = formatArgs;
      exports.save = save;
      exports.load = load;
      exports.useColors = useColors;
      exports.storage = 'undefined' != typeof chrome
                     && 'undefined' != typeof chrome.storage
                        ? chrome.storage.local
                        : localstorage();

      /**
       * Colors.
       */

      exports.colors = [
        'lightseagreen',
        'forestgreen',
        'goldenrod',
        'dodgerblue',
        'darkorchid',
        'crimson'
      ];

      /**
       * Currently only WebKit-based Web Inspectors, Firefox >= v31,
       * and the Firebug extension (any Firefox version) are known
       * to support "%c" CSS customizations.
       *
       * TODO: add a `localStorage` variable to explicitly enable/disable colors
       */

      function useColors() {
        // NB: In an Electron preload script, document will be defined but not fully
        // initialized. Since we know we're in Chrome, we'll just detect this case
        // explicitly
        if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
          return true;
        }

        // is webkit? http://stackoverflow.com/a/16459606/376773
        // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
        return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
          // is firebug? http://stackoverflow.com/a/398120/376773
          (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
          // is firefox >= v31?
          // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
          (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
          // double check webkit in userAgent just in case we are in a worker
          (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
      }

      /**
       * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
       */

      exports.formatters.j = function(v) {
        try {
          return JSON.stringify(v);
        } catch (err) {
          return '[UnexpectedJSONParseError]: ' + err.message;
        }
      };


      /**
       * Colorize log arguments if enabled.
       *
       * @api public
       */

      function formatArgs(args) {
        var useColors = this.useColors;

        args[0] = (useColors ? '%c' : '')
          + this.namespace
          + (useColors ? ' %c' : ' ')
          + args[0]
          + (useColors ? '%c ' : ' ')
          + '+' + exports.humanize(this.diff);

        if (!useColors) return;

        var c = 'color: ' + this.color;
        args.splice(1, 0, c, 'color: inherit');

        // the final "%c" is somewhat tricky, because there could be other
        // arguments passed either before or after the %c, so we need to
        // figure out the correct index to insert the CSS into
        var index = 0;
        var lastC = 0;
        args[0].replace(/%[a-zA-Z%]/g, function(match) {
          if ('%%' === match) return;
          index++;
          if ('%c' === match) {
            // we only are interested in the *last* %c
            // (the user may have provided their own)
            lastC = index;
          }
        });

        args.splice(lastC, 0, c);
      }

      /**
       * Invokes `console.log()` when available.
       * No-op when `console.log` is not a "function".
       *
       * @api public
       */

      function log() {
        // this hackery is required for IE8/9, where
        // the `console.log` function doesn't have 'apply'
        return 'object' === typeof console
          && console.log
          && Function.prototype.apply.call(console.log, console, arguments);
      }

      /**
       * Save `namespaces`.
       *
       * @param {String} namespaces
       * @api private
       */

      function save(namespaces) {
        try {
          if (null == namespaces) {
            exports.storage.removeItem('debug');
          } else {
            exports.storage.debug = namespaces;
          }
        } catch(e) {}
      }

      /**
       * Load `namespaces`.
       *
       * @return {String} returns the previously persisted debug modes
       * @api private
       */

      function load() {
        var r;
        try {
          r = exports.storage.debug;
        } catch(e) {}

        // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
        if (!r && typeof process !== 'undefined' && 'env' in process) {
          r = process.env.DEBUG;
        }

        return r;
      }

      /**
       * Enable namespaces listed in `localStorage.debug` initially.
       */

      exports.enable(load());

      /**
       * Localstorage attempts to return the localstorage.
       *
       * This is necessary because safari throws
       * when a user disables cookies/localstorage
       * and you attempt to access it.
       *
       * @return {LocalStorage}
       * @api private
       */

      function localstorage() {
        try {
          return window.localStorage;
        } catch (e) {}
      }
      }(browser, browser.exports));

      var node = {exports: {}};

      /**
       * Module dependencies.
       */

      (function (module, exports) {
      var tty = require$$0;
      var util = require$$1;

      /**
       * This is the Node.js implementation of `debug()`.
       *
       * Expose `debug()` as the module.
       */

      exports = module.exports = debug$1.exports;
      exports.init = init;
      exports.log = log;
      exports.formatArgs = formatArgs;
      exports.save = save;
      exports.load = load;
      exports.useColors = useColors;

      /**
       * Colors.
       */

      exports.colors = [6, 2, 3, 4, 5, 1];

      /**
       * Build up the default `inspectOpts` object from the environment variables.
       *
       *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
       */

      exports.inspectOpts = Object.keys(process.env).filter(function (key) {
        return /^debug_/i.test(key);
      }).reduce(function (obj, key) {
        // camel-case
        var prop = key
          .substring(6)
          .toLowerCase()
          .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

        // coerce string value into JS value
        var val = process.env[key];
        if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
        else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
        else if (val === 'null') val = null;
        else val = Number(val);

        obj[prop] = val;
        return obj;
      }, {});

      /**
       * The file descriptor to write the `debug()` calls to.
       * Set the `DEBUG_FD` env variable to override with another value. i.e.:
       *
       *   $ DEBUG_FD=3 node script.js 3>debug.log
       */

      var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

      if (1 !== fd && 2 !== fd) {
        util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')();
      }

      var stream = 1 === fd ? process.stdout :
                   2 === fd ? process.stderr :
                   createWritableStdioStream(fd);

      /**
       * Is stdout a TTY? Colored output is enabled when `true`.
       */

      function useColors() {
        return 'colors' in exports.inspectOpts
          ? Boolean(exports.inspectOpts.colors)
          : tty.isatty(fd);
      }

      /**
       * Map %o to `util.inspect()`, all on a single line.
       */

      exports.formatters.o = function(v) {
        this.inspectOpts.colors = this.useColors;
        return util.inspect(v, this.inspectOpts)
          .split('\n').map(function(str) {
            return str.trim()
          }).join(' ');
      };

      /**
       * Map %o to `util.inspect()`, allowing multiple lines if needed.
       */

      exports.formatters.O = function(v) {
        this.inspectOpts.colors = this.useColors;
        return util.inspect(v, this.inspectOpts);
      };

      /**
       * Adds ANSI color escape codes if enabled.
       *
       * @api public
       */

      function formatArgs(args) {
        var name = this.namespace;
        var useColors = this.useColors;

        if (useColors) {
          var c = this.color;
          var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

          args[0] = prefix + args[0].split('\n').join('\n' + prefix);
          args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
        } else {
          args[0] = new Date().toUTCString()
            + ' ' + name + ' ' + args[0];
        }
      }

      /**
       * Invokes `util.format()` with the specified arguments and writes to `stream`.
       */

      function log() {
        return stream.write(util.format.apply(util, arguments) + '\n');
      }

      /**
       * Save `namespaces`.
       *
       * @param {String} namespaces
       * @api private
       */

      function save(namespaces) {
        if (null == namespaces) {
          // If you set a process.env field to null or undefined, it gets cast to the
          // string 'null' or 'undefined'. Just delete instead.
          delete process.env.DEBUG;
        } else {
          process.env.DEBUG = namespaces;
        }
      }

      /**
       * Load `namespaces`.
       *
       * @return {String} returns the previously persisted debug modes
       * @api private
       */

      function load() {
        return process.env.DEBUG;
      }

      /**
       * Copied from `node/src/node.js`.
       *
       * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
       * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
       */

      function createWritableStdioStream (fd) {
        var stream;
        var tty_wrap = process.binding('tty_wrap');

        // Note stream._type is used for test-module-load-list.js

        switch (tty_wrap.guessHandleType(fd)) {
          case 'TTY':
            stream = new tty.WriteStream(fd);
            stream._type = 'tty';

            // Hack to have stream not keep the event loop alive.
            // See https://github.com/joyent/node/issues/1726
            if (stream._handle && stream._handle.unref) {
              stream._handle.unref();
            }
            break;

          case 'FILE':
            var fs = require$$3;
            stream = new fs.SyncWriteStream(fd, { autoClose: false });
            stream._type = 'fs';
            break;

          case 'PIPE':
          case 'TCP':
            var net = require$$4;
            stream = new net.Socket({
              fd: fd,
              readable: false,
              writable: true
            });

            // FIXME Should probably have an option in net.Socket to create a
            // stream from an existing fd which is writable only. But for now
            // we'll just add this hack and set the `readable` member to false.
            // Test: ./node test/fixtures/echo.js < /etc/passwd
            stream.readable = false;
            stream.read = null;
            stream._type = 'pipe';

            // FIXME Hack to have stream not keep the event loop alive.
            // See https://github.com/joyent/node/issues/1726
            if (stream._handle && stream._handle.unref) {
              stream._handle.unref();
            }
            break;

          default:
            // Probably an error on in uv_guess_handle()
            throw new Error('Implement me. Unknown stream file type!');
        }

        // For supporting legacy API we put the FD here.
        stream.fd = fd;

        stream._isStdio = true;

        return stream;
      }

      /**
       * Init logic for `debug` instances.
       *
       * Create a new `inspectOpts` object in case `useColors` is set
       * differently for a particular `debug` instance.
       */

      function init (debug) {
        debug.inspectOpts = {};

        var keys = Object.keys(exports.inspectOpts);
        for (var i = 0; i < keys.length; i++) {
          debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
        }
      }

      /**
       * Enable namespaces listed in `process.env.DEBUG` initially.
       */

      exports.enable(load());
      }(node, node.exports));

      /**
       * Detect Electron renderer process, which is node, but we should
       * treat as a browser.
       */

      if (typeof process !== 'undefined' && process.type === 'renderer') {
        src.exports = browser.exports;
      } else {
        src.exports = node.exports;
      }

      /**
       * Module dependencies.
       */

      var assert = require$$0$1;
      var debug = src.exports('stream-parser');

      /**
       * Module exports.
       */

      var streamParser = Parser$1;

      /**
       * Parser states.
       */

      var INIT        = -1;
      var BUFFERING   = 0;
      var SKIPPING    = 1;
      var PASSTHROUGH = 2;

      /**
       * The `Parser` stream mixin works with either `Writable` or `Transform` stream
       * instances/subclasses. Provides a convenient generic "parsing" API:
       *
       *   _bytes(n, cb) - buffers "n" bytes and then calls "cb" with the "chunk"
       *   _skipBytes(n, cb) - skips "n" bytes and then calls "cb" when done
       *
       * If you extend a `Transform` stream, then the `_passthrough()` function is also
       * added:
       *
       *   _passthrough(n, cb) - passes through "n" bytes untouched and then calls "cb"
       *
       * @param {Stream} stream Transform or Writable stream instance to extend
       * @api public
       */

      function Parser$1 (stream) {
        var isTransform = stream && 'function' == typeof stream._transform;
        var isWritable = stream && 'function' == typeof stream._write;

        if (!isTransform && !isWritable) throw new Error('must pass a Writable or Transform stream in');
        debug('extending Parser into stream');

        // Transform streams and Writable streams get `_bytes()` and `_skipBytes()`
        stream._bytes = _bytes;
        stream._skipBytes = _skipBytes;

        // only Transform streams get the `_passthrough()` function
        if (isTransform) stream._passthrough = _passthrough;

        // take control of the streams2 callback functions for this stream
        if (isTransform) {
          stream._transform = transform;
        } else {
          stream._write = write;
        }
      }

      function init$1 (stream) {
        debug('initializing parser stream');

        // number of bytes left to parser for the next "chunk"
        stream._parserBytesLeft = 0;

        // array of Buffer instances that make up the next "chunk"
        stream._parserBuffers = [];

        // number of bytes parsed so far for the next "chunk"
        stream._parserBuffered = 0;

        // flag that keeps track of if what the parser should do with bytes received
        stream._parserState = INIT;

        // the callback for the next "chunk"
        stream._parserCallback = null;

        // XXX: backwards compat with the old Transform API... remove at some point..
        if ('function' == typeof stream.push) {
          stream._parserOutput = stream.push.bind(stream);
        }

        stream._parserInit = true;
      }

      /**
       * Buffers `n` bytes and then invokes `fn` once that amount has been collected.
       *
       * @param {Number} n the number of bytes to buffer
       * @param {Function} fn callback function to invoke when `n` bytes are buffered
       * @api public
       */

      function _bytes (n, fn) {
        assert(!this._parserCallback, 'there is already a "callback" set!');
        assert(isFinite(n) && n > 0, 'can only buffer a finite number of bytes > 0, got "' + n + '"');
        if (!this._parserInit) init$1(this);
        debug('buffering %o bytes', n);
        this._parserBytesLeft = n;
        this._parserCallback = fn;
        this._parserState = BUFFERING;
      }

      /**
       * Skips over the next `n` bytes, then invokes `fn` once that amount has
       * been discarded.
       *
       * @param {Number} n the number of bytes to discard
       * @param {Function} fn callback function to invoke when `n` bytes have been skipped
       * @api public
       */

      function _skipBytes (n, fn) {
        assert(!this._parserCallback, 'there is already a "callback" set!');
        assert(n > 0, 'can only skip > 0 bytes, got "' + n + '"');
        if (!this._parserInit) init$1(this);
        debug('skipping %o bytes', n);
        this._parserBytesLeft = n;
        this._parserCallback = fn;
        this._parserState = SKIPPING;
      }

      /**
       * Passes through `n` bytes to the readable side of this stream untouched,
       * then invokes `fn` once that amount has been passed through.
       *
       * @param {Number} n the number of bytes to pass through
       * @param {Function} fn callback function to invoke when `n` bytes have passed through
       * @api public
       */

      function _passthrough (n, fn) {
        assert(!this._parserCallback, 'There is already a "callback" set!');
        assert(n > 0, 'can only pass through > 0 bytes, got "' + n + '"');
        if (!this._parserInit) init$1(this);
        debug('passing through %o bytes', n);
        this._parserBytesLeft = n;
        this._parserCallback = fn;
        this._parserState = PASSTHROUGH;
      }

      /**
       * The `_write()` callback function implementation.
       *
       * @api private
       */

      function write (chunk, encoding, fn) {
        if (!this._parserInit) init$1(this);
        debug('write(%o bytes)', chunk.length);

        // XXX: old Writable stream API compat... remove at some point...
        if ('function' == typeof encoding) fn = encoding;

        data(this, chunk, null, fn);
      }

      /**
       * The `_transform()` callback function implementation.
       *
       * @api private
       */


      function transform (chunk, output, fn) {
        if (!this._parserInit) init$1(this);
        debug('transform(%o bytes)', chunk.length);

        // XXX: old Transform stream API compat... remove at some point...
        if ('function' != typeof output) {
          output = this._parserOutput;
        }

        data(this, chunk, output, fn);
      }

      /**
       * The internal buffering/passthrough logic...
       *
       * This `_data` function get's "trampolined" to prevent stack overflows for tight
       * loops. This technique requires us to return a "thunk" function for any
       * synchronous action. Async stuff breaks the trampoline, but that's ok since it's
       * working with a new stack at that point anyway.
       *
       * @api private
       */

      function _data (stream, chunk, output, fn) {
        if (stream._parserBytesLeft <= 0) {
          return fn(new Error('got data but not currently parsing anything'));
        }

        if (chunk.length <= stream._parserBytesLeft) {
          // small buffer fits within the "_parserBytesLeft" window
          return function () {
            return process$1(stream, chunk, output, fn);
          };
        } else {
          // large buffer needs to be sliced on "_parserBytesLeft" and processed
          return function () {
            var b = chunk.slice(0, stream._parserBytesLeft);
            return process$1(stream, b, output, function (err) {
              if (err) return fn(err);
              if (chunk.length > b.length) {
                return function () {
                  return _data(stream, chunk.slice(b.length), output, fn);
                };
              }
            });
          };
        }
      }

      /**
       * The internal `process` function gets called by the `data` function when
       * something "interesting" happens. This function takes care of buffering the
       * bytes when buffering, passing through the bytes when doing that, and invoking
       * the user callback when the number of bytes has been reached.
       *
       * @api private
       */

      function process$1 (stream, chunk, output, fn) {
        stream._parserBytesLeft -= chunk.length;
        debug('%o bytes left for stream piece', stream._parserBytesLeft);

        if (stream._parserState === BUFFERING) {
          // buffer
          stream._parserBuffers.push(chunk);
          stream._parserBuffered += chunk.length;
        } else if (stream._parserState === PASSTHROUGH) {
          // passthrough
          output(chunk);
        }
        // don't need to do anything for the SKIPPING case

        if (0 === stream._parserBytesLeft) {
          // done with stream "piece", invoke the callback
          var cb = stream._parserCallback;
          if (cb && stream._parserState === BUFFERING && stream._parserBuffers.length > 1) {
            chunk = Buffer.concat(stream._parserBuffers, stream._parserBuffered);
          }
          if (stream._parserState !== BUFFERING) {
            chunk = null;
          }
          stream._parserCallback = null;
          stream._parserBuffered = 0;
          stream._parserState = INIT;
          stream._parserBuffers.splice(0); // empty

          if (cb) {
            var args = [];
            if (chunk) {
              // buffered
              args.push(chunk);
            }
            if (output) {
              // on a Transform stream, has "output" function
              args.push(output);
            }
            var async = cb.length > args.length;
            if (async) {
              args.push(trampoline(fn));
            }
            // invoke cb
            var rtn = cb.apply(stream, args);
            if (!async || fn === rtn) return fn;
          }
        } else {
          // need more bytes
          return fn;
        }
      }

      var data = trampoline(_data);

      /**
       * Generic thunk-based "trampoline" helper function.
       *
       * @param {Function} input function
       * @return {Function} "trampolined" function
       * @api private
       */

      function trampoline (fn) {
        return function () {
          var result = fn.apply(this, arguments);

          while ('function' == typeof result) {
            result = result();
          }

          return result;
        };
      }

      var Parser = streamParser;
      var inherits = require$$1.inherits;
      var Transform = require$$3$1.Transform;

      // node v0.8.x compat
      if (!Transform) Transform = require$$4$1;

      /**
       * Module exports.
       */

      var throttle = exports('t', Throttle);

      /**
       * The `Throttle` passthrough stream class is very similar to the node core
       * `stream.Passthrough` stream, except that you specify a `bps` "bytes per
       * second" option and data *will not* be passed through faster than the byte
       * value you specify.
       *
       * You can invoke with just a `bps` Number and get the rest of the default
       * options. This should be more common:
       *
       * ``` js
       * process.stdin.pipe(new Throttle(100 * 1024)).pipe(process.stdout);
       * ```
       *
       * Or you can pass an `options` Object in, with a `bps` value specified along with
       * other options:
       *
       * ``` js
       * var t = new Throttle({ bps: 100 * 1024, chunkSize: 100, highWaterMark: 500 });
       * ```
       *
       * @param {Number|Object} opts an options object or the "bps" Number value
       * @api public
       */

      function Throttle (opts) {
        if (!(this instanceof Throttle)) return new Throttle(opts);

        if ('number' == typeof opts) opts = { bps: opts };
        if (!opts) opts = {};
        if (null == opts.lowWaterMark) opts.lowWaterMark = 0;
        if (null == opts.highWaterMark) opts.highWaterMark = 0;
        if (null == opts.bps) throw new Error('must pass a "bps" bytes-per-second option');
        if (null == opts.chunkSize) opts.chunkSize = opts.bps / 10 | 0; // 1/10th of "bps" by default

        Transform.call(this, opts);

        this.bps = opts.bps;
        this.chunkSize = Math.max(1, opts.chunkSize);

        this.totalBytes = 0;
        this.startTime = Date.now();

        this._passthroughChunk();
      }
      inherits(Throttle, Transform);

      /**
       * Mixin `Parser`.
       */

      Parser(Throttle.prototype);

      /**
       * Begins passing through the next "chunk" of bytes.
       *
       * @api private
       */

      Throttle.prototype._passthroughChunk = function () {
        this._passthrough(this.chunkSize, this._onchunk);
        this.totalBytes += this.chunkSize;
      };

      /**
       * Called once a "chunk" of bytes has been passed through. Waits if necessary
       * before passing through the next chunk of bytes.
       *
       * @api private
       */

      Throttle.prototype._onchunk = function (output, done) {
        var self = this;
        var totalSeconds = (Date.now() - this.startTime) / 1000;
        var expected = totalSeconds * this.bps;

        function d () {
          self._passthroughChunk();
          done();
        }

        if (this.totalBytes > expected) {
          // Use this byte count to calculate how many seconds ahead we are.
          var remainder = this.totalBytes - expected;
          var sleepTime = remainder / this.bps * 1000;
          //console.error('sleep time: %d', sleepTime);
          if (sleepTime > 0) {
            setTimeout(d, sleepTime);
          } else {
            d();
          }
        } else {
          d();
        }
      };

      var xhtml = "http://www.w3.org/1999/xhtml";

      var namespaces = {
        svg: "http://www.w3.org/2000/svg",
        xhtml: xhtml,
        xlink: "http://www.w3.org/1999/xlink",
        xml: "http://www.w3.org/XML/1998/namespace",
        xmlns: "http://www.w3.org/2000/xmlns/"
      };

      function namespace(name) {
        var prefix = name += "", i = prefix.indexOf(":");
        if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
        return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
      }

      function creatorInherit(name) {
        return function() {
          var document = this.ownerDocument,
              uri = this.namespaceURI;
          return uri === xhtml && document.documentElement.namespaceURI === xhtml
              ? document.createElement(name)
              : document.createElementNS(uri, name);
        };
      }

      function creatorFixed(fullname) {
        return function() {
          return this.ownerDocument.createElementNS(fullname.space, fullname.local);
        };
      }

      function creator(name) {
        var fullname = namespace(name);
        return (fullname.local
            ? creatorFixed
            : creatorInherit)(fullname);
      }

      function none() {}

      function selector(selector) {
        return selector == null ? none : function() {
          return this.querySelector(selector);
        };
      }

      function selection_select(select) {
        if (typeof select !== "function") select = selector(select);

        for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
          for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
            if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
              if ("__data__" in node) subnode.__data__ = node.__data__;
              subgroup[i] = subnode;
            }
          }
        }

        return new Selection$1(subgroups, this._parents);
      }

      function array(x) {
        return typeof x === "object" && "length" in x
          ? x // Array, TypedArray, NodeList, array-like
          : Array.from(x); // Map, Set, iterable, string, or anything else
      }

      function empty() {
        return [];
      }

      function selectorAll(selector) {
        return selector == null ? empty : function() {
          return this.querySelectorAll(selector);
        };
      }

      function arrayAll(select) {
        return function() {
          var group = select.apply(this, arguments);
          return group == null ? [] : array(group);
        };
      }

      function selection_selectAll(select) {
        if (typeof select === "function") select = arrayAll(select);
        else select = selectorAll(select);

        for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
          for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
            if (node = group[i]) {
              subgroups.push(select.call(node, node.__data__, i, group));
              parents.push(node);
            }
          }
        }

        return new Selection$1(subgroups, parents);
      }

      function matcher(selector) {
        return function() {
          return this.matches(selector);
        };
      }

      function childMatcher(selector) {
        return function(node) {
          return node.matches(selector);
        };
      }

      var find = Array.prototype.find;

      function childFind(match) {
        return function() {
          return find.call(this.children, match);
        };
      }

      function childFirst() {
        return this.firstElementChild;
      }

      function selection_selectChild(match) {
        return this.select(match == null ? childFirst
            : childFind(typeof match === "function" ? match : childMatcher(match)));
      }

      var filter = Array.prototype.filter;

      function children() {
        return this.children;
      }

      function childrenFilter(match) {
        return function() {
          return filter.call(this.children, match);
        };
      }

      function selection_selectChildren(match) {
        return this.selectAll(match == null ? children
            : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
      }

      function selection_filter(match) {
        if (typeof match !== "function") match = matcher(match);

        for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
          for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
            if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
              subgroup.push(node);
            }
          }
        }

        return new Selection$1(subgroups, this._parents);
      }

      function sparse(update) {
        return new Array(update.length);
      }

      function selection_enter() {
        return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
      }

      function EnterNode(parent, datum) {
        this.ownerDocument = parent.ownerDocument;
        this.namespaceURI = parent.namespaceURI;
        this._next = null;
        this._parent = parent;
        this.__data__ = datum;
      }

      EnterNode.prototype = {
        constructor: EnterNode,
        appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
        insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
        querySelector: function(selector) { return this._parent.querySelector(selector); },
        querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
      };

      function constant$1(x) {
        return function() {
          return x;
        };
      }

      function bindIndex(parent, group, enter, update, exit, data) {
        var i = 0,
            node,
            groupLength = group.length,
            dataLength = data.length;

        // Put any non-null nodes that fit into update.
        // Put any null nodes into enter.
        // Put any remaining data into enter.
        for (; i < dataLength; ++i) {
          if (node = group[i]) {
            node.__data__ = data[i];
            update[i] = node;
          } else {
            enter[i] = new EnterNode(parent, data[i]);
          }
        }

        // Put any non-null nodes that don’t fit into exit.
        for (; i < groupLength; ++i) {
          if (node = group[i]) {
            exit[i] = node;
          }
        }
      }

      function bindKey(parent, group, enter, update, exit, data, key) {
        var i,
            node,
            nodeByKeyValue = new Map,
            groupLength = group.length,
            dataLength = data.length,
            keyValues = new Array(groupLength),
            keyValue;

        // Compute the key for each node.
        // If multiple nodes have the same key, the duplicates are added to exit.
        for (i = 0; i < groupLength; ++i) {
          if (node = group[i]) {
            keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
            if (nodeByKeyValue.has(keyValue)) {
              exit[i] = node;
            } else {
              nodeByKeyValue.set(keyValue, node);
            }
          }
        }

        // Compute the key for each datum.
        // If there a node associated with this key, join and add it to update.
        // If there is not (or the key is a duplicate), add it to enter.
        for (i = 0; i < dataLength; ++i) {
          keyValue = key.call(parent, data[i], i, data) + "";
          if (node = nodeByKeyValue.get(keyValue)) {
            update[i] = node;
            node.__data__ = data[i];
            nodeByKeyValue.delete(keyValue);
          } else {
            enter[i] = new EnterNode(parent, data[i]);
          }
        }

        // Add any remaining nodes that were not bound to data to exit.
        for (i = 0; i < groupLength; ++i) {
          if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
            exit[i] = node;
          }
        }
      }

      function datum(node) {
        return node.__data__;
      }

      function selection_data(value, key) {
        if (!arguments.length) return Array.from(this, datum);

        var bind = key ? bindKey : bindIndex,
            parents = this._parents,
            groups = this._groups;

        if (typeof value !== "function") value = constant$1(value);

        for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
          var parent = parents[j],
              group = groups[j],
              groupLength = group.length,
              data = array(value.call(parent, parent && parent.__data__, j, parents)),
              dataLength = data.length,
              enterGroup = enter[j] = new Array(dataLength),
              updateGroup = update[j] = new Array(dataLength),
              exitGroup = exit[j] = new Array(groupLength);

          bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

          // Now connect the enter nodes to their following update node, such that
          // appendChild can insert the materialized enter node before this node,
          // rather than at the end of the parent node.
          for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
            if (previous = enterGroup[i0]) {
              if (i0 >= i1) i1 = i0 + 1;
              while (!(next = updateGroup[i1]) && ++i1 < dataLength);
              previous._next = next || null;
            }
          }
        }

        update = new Selection$1(update, parents);
        update._enter = enter;
        update._exit = exit;
        return update;
      }

      function selection_exit() {
        return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
      }

      function selection_join(onenter, onupdate, onexit) {
        var enter = this.enter(), update = this, exit = this.exit();
        enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
        if (onupdate != null) update = onupdate(update);
        if (onexit == null) exit.remove(); else onexit(exit);
        return enter && update ? enter.merge(update).order() : update;
      }

      function selection_merge(selection) {
        if (!(selection instanceof Selection$1)) throw new Error("invalid merge");

        for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
          for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
            if (node = group0[i] || group1[i]) {
              merge[i] = node;
            }
          }
        }

        for (; j < m0; ++j) {
          merges[j] = groups0[j];
        }

        return new Selection$1(merges, this._parents);
      }

      function selection_order() {

        for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
          for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
            if (node = group[i]) {
              if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
              next = node;
            }
          }
        }

        return this;
      }

      function selection_sort(compare) {
        if (!compare) compare = ascending;

        function compareNode(a, b) {
          return a && b ? compare(a.__data__, b.__data__) : !a - !b;
        }

        for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
          for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
            if (node = group[i]) {
              sortgroup[i] = node;
            }
          }
          sortgroup.sort(compareNode);
        }

        return new Selection$1(sortgroups, this._parents).order();
      }

      function ascending(a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
      }

      function selection_call() {
        var callback = arguments[0];
        arguments[0] = this;
        callback.apply(null, arguments);
        return this;
      }

      function selection_nodes() {
        return Array.from(this);
      }

      function selection_node() {

        for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
          for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
            var node = group[i];
            if (node) return node;
          }
        }

        return null;
      }

      function selection_size() {
        let size = 0;
        for (const node of this) ++size; // eslint-disable-line no-unused-vars
        return size;
      }

      function selection_empty() {
        return !this.node();
      }

      function selection_each(callback) {

        for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
          for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
            if (node = group[i]) callback.call(node, node.__data__, i, group);
          }
        }

        return this;
      }

      function attrRemove$1(name) {
        return function() {
          this.removeAttribute(name);
        };
      }

      function attrRemoveNS$1(fullname) {
        return function() {
          this.removeAttributeNS(fullname.space, fullname.local);
        };
      }

      function attrConstant$1(name, value) {
        return function() {
          this.setAttribute(name, value);
        };
      }

      function attrConstantNS$1(fullname, value) {
        return function() {
          this.setAttributeNS(fullname.space, fullname.local, value);
        };
      }

      function attrFunction$1(name, value) {
        return function() {
          var v = value.apply(this, arguments);
          if (v == null) this.removeAttribute(name);
          else this.setAttribute(name, v);
        };
      }

      function attrFunctionNS$1(fullname, value) {
        return function() {
          var v = value.apply(this, arguments);
          if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
          else this.setAttributeNS(fullname.space, fullname.local, v);
        };
      }

      function selection_attr(name, value) {
        var fullname = namespace(name);

        if (arguments.length < 2) {
          var node = this.node();
          return fullname.local
              ? node.getAttributeNS(fullname.space, fullname.local)
              : node.getAttribute(fullname);
        }

        return this.each((value == null
            ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
            ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
            : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
      }

      function defaultView(node) {
        return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
            || (node.document && node) // node is a Window
            || node.defaultView; // node is a Document
      }

      function styleRemove$1(name) {
        return function() {
          this.style.removeProperty(name);
        };
      }

      function styleConstant$1(name, value, priority) {
        return function() {
          this.style.setProperty(name, value, priority);
        };
      }

      function styleFunction$1(name, value, priority) {
        return function() {
          var v = value.apply(this, arguments);
          if (v == null) this.style.removeProperty(name);
          else this.style.setProperty(name, v, priority);
        };
      }

      function selection_style(name, value, priority) {
        return arguments.length > 1
            ? this.each((value == null
                  ? styleRemove$1 : typeof value === "function"
                  ? styleFunction$1
                  : styleConstant$1)(name, value, priority == null ? "" : priority))
            : styleValue(this.node(), name);
      }

      function styleValue(node, name) {
        return node.style.getPropertyValue(name)
            || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
      }

      function propertyRemove(name) {
        return function() {
          delete this[name];
        };
      }

      function propertyConstant(name, value) {
        return function() {
          this[name] = value;
        };
      }

      function propertyFunction(name, value) {
        return function() {
          var v = value.apply(this, arguments);
          if (v == null) delete this[name];
          else this[name] = v;
        };
      }

      function selection_property(name, value) {
        return arguments.length > 1
            ? this.each((value == null
                ? propertyRemove : typeof value === "function"
                ? propertyFunction
                : propertyConstant)(name, value))
            : this.node()[name];
      }

      function classArray(string) {
        return string.trim().split(/^|\s+/);
      }

      function classList(node) {
        return node.classList || new ClassList(node);
      }

      function ClassList(node) {
        this._node = node;
        this._names = classArray(node.getAttribute("class") || "");
      }

      ClassList.prototype = {
        add: function(name) {
          var i = this._names.indexOf(name);
          if (i < 0) {
            this._names.push(name);
            this._node.setAttribute("class", this._names.join(" "));
          }
        },
        remove: function(name) {
          var i = this._names.indexOf(name);
          if (i >= 0) {
            this._names.splice(i, 1);
            this._node.setAttribute("class", this._names.join(" "));
          }
        },
        contains: function(name) {
          return this._names.indexOf(name) >= 0;
        }
      };

      function classedAdd(node, names) {
        var list = classList(node), i = -1, n = names.length;
        while (++i < n) list.add(names[i]);
      }

      function classedRemove(node, names) {
        var list = classList(node), i = -1, n = names.length;
        while (++i < n) list.remove(names[i]);
      }

      function classedTrue(names) {
        return function() {
          classedAdd(this, names);
        };
      }

      function classedFalse(names) {
        return function() {
          classedRemove(this, names);
        };
      }

      function classedFunction(names, value) {
        return function() {
          (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
        };
      }

      function selection_classed(name, value) {
        var names = classArray(name + "");

        if (arguments.length < 2) {
          var list = classList(this.node()), i = -1, n = names.length;
          while (++i < n) if (!list.contains(names[i])) return false;
          return true;
        }

        return this.each((typeof value === "function"
            ? classedFunction : value
            ? classedTrue
            : classedFalse)(names, value));
      }

      function textRemove() {
        this.textContent = "";
      }

      function textConstant$1(value) {
        return function() {
          this.textContent = value;
        };
      }

      function textFunction$1(value) {
        return function() {
          var v = value.apply(this, arguments);
          this.textContent = v == null ? "" : v;
        };
      }

      function selection_text(value) {
        return arguments.length
            ? this.each(value == null
                ? textRemove : (typeof value === "function"
                ? textFunction$1
                : textConstant$1)(value))
            : this.node().textContent;
      }

      function htmlRemove() {
        this.innerHTML = "";
      }

      function htmlConstant(value) {
        return function() {
          this.innerHTML = value;
        };
      }

      function htmlFunction(value) {
        return function() {
          var v = value.apply(this, arguments);
          this.innerHTML = v == null ? "" : v;
        };
      }

      function selection_html(value) {
        return arguments.length
            ? this.each(value == null
                ? htmlRemove : (typeof value === "function"
                ? htmlFunction
                : htmlConstant)(value))
            : this.node().innerHTML;
      }

      function raise() {
        if (this.nextSibling) this.parentNode.appendChild(this);
      }

      function selection_raise() {
        return this.each(raise);
      }

      function lower() {
        if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
      }

      function selection_lower() {
        return this.each(lower);
      }

      function selection_append(name) {
        var create = typeof name === "function" ? name : creator(name);
        return this.select(function() {
          return this.appendChild(create.apply(this, arguments));
        });
      }

      function constantNull() {
        return null;
      }

      function selection_insert(name, before) {
        var create = typeof name === "function" ? name : creator(name),
            select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
        return this.select(function() {
          return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
        });
      }

      function remove() {
        var parent = this.parentNode;
        if (parent) parent.removeChild(this);
      }

      function selection_remove() {
        return this.each(remove);
      }

      function selection_cloneShallow() {
        var clone = this.cloneNode(false), parent = this.parentNode;
        return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
      }

      function selection_cloneDeep() {
        var clone = this.cloneNode(true), parent = this.parentNode;
        return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
      }

      function selection_clone(deep) {
        return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
      }

      function selection_datum(value) {
        return arguments.length
            ? this.property("__data__", value)
            : this.node().__data__;
      }

      function contextListener(listener) {
        return function(event) {
          listener.call(this, event, this.__data__);
        };
      }

      function parseTypenames$1(typenames) {
        return typenames.trim().split(/^|\s+/).map(function(t) {
          var name = "", i = t.indexOf(".");
          if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
          return {type: t, name: name};
        });
      }

      function onRemove(typename) {
        return function() {
          var on = this.__on;
          if (!on) return;
          for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
            if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
              this.removeEventListener(o.type, o.listener, o.options);
            } else {
              on[++i] = o;
            }
          }
          if (++i) on.length = i;
          else delete this.__on;
        };
      }

      function onAdd(typename, value, options) {
        return function() {
          var on = this.__on, o, listener = contextListener(value);
          if (on) for (var j = 0, m = on.length; j < m; ++j) {
            if ((o = on[j]).type === typename.type && o.name === typename.name) {
              this.removeEventListener(o.type, o.listener, o.options);
              this.addEventListener(o.type, o.listener = listener, o.options = options);
              o.value = value;
              return;
            }
          }
          this.addEventListener(typename.type, listener, options);
          o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
          if (!on) this.__on = [o];
          else on.push(o);
        };
      }

      function selection_on(typename, value, options) {
        var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;

        if (arguments.length < 2) {
          var on = this.node().__on;
          if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
            for (i = 0, o = on[j]; i < n; ++i) {
              if ((t = typenames[i]).type === o.type && t.name === o.name) {
                return o.value;
              }
            }
          }
          return;
        }

        on = value ? onAdd : onRemove;
        for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
        return this;
      }

      function dispatchEvent(node, type, params) {
        var window = defaultView(node),
            event = window.CustomEvent;

        if (typeof event === "function") {
          event = new event(type, params);
        } else {
          event = window.document.createEvent("Event");
          if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
          else event.initEvent(type, false, false);
        }

        node.dispatchEvent(event);
      }

      function dispatchConstant(type, params) {
        return function() {
          return dispatchEvent(this, type, params);
        };
      }

      function dispatchFunction(type, params) {
        return function() {
          return dispatchEvent(this, type, params.apply(this, arguments));
        };
      }

      function selection_dispatch(type, params) {
        return this.each((typeof params === "function"
            ? dispatchFunction
            : dispatchConstant)(type, params));
      }

      function* selection_iterator() {
        for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
          for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
            if (node = group[i]) yield node;
          }
        }
      }

      var root = [null];

      function Selection$1(groups, parents) {
        this._groups = groups;
        this._parents = parents;
      }

      function selection() {
        return new Selection$1([[document.documentElement]], root);
      }

      function selection_selection() {
        return this;
      }

      Selection$1.prototype = selection.prototype = {
        constructor: Selection$1,
        select: selection_select,
        selectAll: selection_selectAll,
        selectChild: selection_selectChild,
        selectChildren: selection_selectChildren,
        filter: selection_filter,
        data: selection_data,
        enter: selection_enter,
        exit: selection_exit,
        join: selection_join,
        merge: selection_merge,
        selection: selection_selection,
        order: selection_order,
        sort: selection_sort,
        call: selection_call,
        nodes: selection_nodes,
        node: selection_node,
        size: selection_size,
        empty: selection_empty,
        each: selection_each,
        attr: selection_attr,
        style: selection_style,
        property: selection_property,
        classed: selection_classed,
        text: selection_text,
        html: selection_html,
        raise: selection_raise,
        lower: selection_lower,
        append: selection_append,
        insert: selection_insert,
        remove: selection_remove,
        clone: selection_clone,
        datum: selection_datum,
        on: selection_on,
        dispatch: selection_dispatch,
        [Symbol.iterator]: selection_iterator
      };

      function select(selector) {
        return typeof selector === "string"
            ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
            : new Selection$1([[selector]], root);
      }

      var noop = {value: () => {}};

      function dispatch() {
        for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
          if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
          _[t] = [];
        }
        return new Dispatch(_);
      }

      function Dispatch(_) {
        this._ = _;
      }

      function parseTypenames(typenames, types) {
        return typenames.trim().split(/^|\s+/).map(function(t) {
          var name = "", i = t.indexOf(".");
          if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
          if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
          return {type: t, name: name};
        });
      }

      Dispatch.prototype = dispatch.prototype = {
        constructor: Dispatch,
        on: function(typename, callback) {
          var _ = this._,
              T = parseTypenames(typename + "", _),
              t,
              i = -1,
              n = T.length;

          // If no callback was specified, return the callback of the given type and name.
          if (arguments.length < 2) {
            while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
            return;
          }

          // If a type was specified, set the callback for the given type and name.
          // Otherwise, if a null callback was specified, remove callbacks of the given name.
          if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
          while (++i < n) {
            if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
            else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
          }

          return this;
        },
        copy: function() {
          var copy = {}, _ = this._;
          for (var t in _) copy[t] = _[t].slice();
          return new Dispatch(copy);
        },
        call: function(type, that) {
          if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
          if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
          for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
        },
        apply: function(type, that, args) {
          if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
          for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
        }
      };

      function get$1(type, name) {
        for (var i = 0, n = type.length, c; i < n; ++i) {
          if ((c = type[i]).name === name) {
            return c.value;
          }
        }
      }

      function set$1(type, name, callback) {
        for (var i = 0, n = type.length; i < n; ++i) {
          if (type[i].name === name) {
            type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
            break;
          }
        }
        if (callback != null) type.push({name: name, value: callback});
        return type;
      }

      var frame = 0, // is an animation frame pending?
          timeout$1 = 0, // is a timeout pending?
          interval = 0, // are any timers active?
          pokeDelay = 1000, // how frequently we check for clock skew
          taskHead,
          taskTail,
          clockLast = 0,
          clockNow = 0,
          clockSkew = 0,
          clock = typeof performance === "object" && performance.now ? performance : Date,
          setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

      function now() {
        return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
      }

      function clearNow() {
        clockNow = 0;
      }

      function Timer() {
        this._call =
        this._time =
        this._next = null;
      }

      Timer.prototype = timer.prototype = {
        constructor: Timer,
        restart: function(callback, delay, time) {
          if (typeof callback !== "function") throw new TypeError("callback is not a function");
          time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
          if (!this._next && taskTail !== this) {
            if (taskTail) taskTail._next = this;
            else taskHead = this;
            taskTail = this;
          }
          this._call = callback;
          this._time = time;
          sleep();
        },
        stop: function() {
          if (this._call) {
            this._call = null;
            this._time = Infinity;
            sleep();
          }
        }
      };

      function timer(callback, delay, time) {
        var t = new Timer;
        t.restart(callback, delay, time);
        return t;
      }

      function timerFlush() {
        now(); // Get the current time, if not already set.
        ++frame; // Pretend we’ve set an alarm, if we haven’t already.
        var t = taskHead, e;
        while (t) {
          if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
          t = t._next;
        }
        --frame;
      }

      function wake() {
        clockNow = (clockLast = clock.now()) + clockSkew;
        frame = timeout$1 = 0;
        try {
          timerFlush();
        } finally {
          frame = 0;
          nap();
          clockNow = 0;
        }
      }

      function poke() {
        var now = clock.now(), delay = now - clockLast;
        if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
      }

      function nap() {
        var t0, t1 = taskHead, t2, time = Infinity;
        while (t1) {
          if (t1._call) {
            if (time > t1._time) time = t1._time;
            t0 = t1, t1 = t1._next;
          } else {
            t2 = t1._next, t1._next = null;
            t1 = t0 ? t0._next = t2 : taskHead = t2;
          }
        }
        taskTail = t0;
        sleep(time);
      }

      function sleep(time) {
        if (frame) return; // Soonest alarm already set, or will be.
        if (timeout$1) timeout$1 = clearTimeout(timeout$1);
        var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
        if (delay > 24) {
          if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
          if (interval) interval = clearInterval(interval);
        } else {
          if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
          frame = 1, setFrame(wake);
        }
      }

      function timeout(callback, delay, time) {
        var t = new Timer;
        delay = delay == null ? 0 : +delay;
        t.restart(elapsed => {
          t.stop();
          callback(elapsed + delay);
        }, delay, time);
        return t;
      }

      var emptyOn = dispatch("start", "end", "cancel", "interrupt");
      var emptyTween = [];

      var CREATED = 0;
      var SCHEDULED = 1;
      var STARTING = 2;
      var STARTED = 3;
      var RUNNING = 4;
      var ENDING = 5;
      var ENDED = 6;

      function schedule(node, name, id, index, group, timing) {
        var schedules = node.__transition;
        if (!schedules) node.__transition = {};
        else if (id in schedules) return;
        create(node, id, {
          name: name,
          index: index, // For context during callback.
          group: group, // For context during callback.
          on: emptyOn,
          tween: emptyTween,
          time: timing.time,
          delay: timing.delay,
          duration: timing.duration,
          ease: timing.ease,
          timer: null,
          state: CREATED
        });
      }

      function init(node, id) {
        var schedule = get(node, id);
        if (schedule.state > CREATED) throw new Error("too late; already scheduled");
        return schedule;
      }

      function set(node, id) {
        var schedule = get(node, id);
        if (schedule.state > STARTED) throw new Error("too late; already running");
        return schedule;
      }

      function get(node, id) {
        var schedule = node.__transition;
        if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
        return schedule;
      }

      function create(node, id, self) {
        var schedules = node.__transition,
            tween;

        // Initialize the self timer when the transition is created.
        // Note the actual delay is not known until the first callback!
        schedules[id] = self;
        self.timer = timer(schedule, 0, self.time);

        function schedule(elapsed) {
          self.state = SCHEDULED;
          self.timer.restart(start, self.delay, self.time);

          // If the elapsed delay is less than our first sleep, start immediately.
          if (self.delay <= elapsed) start(elapsed - self.delay);
        }

        function start(elapsed) {
          var i, j, n, o;

          // If the state is not SCHEDULED, then we previously errored on start.
          if (self.state !== SCHEDULED) return stop();

          for (i in schedules) {
            o = schedules[i];
            if (o.name !== self.name) continue;

            // While this element already has a starting transition during this frame,
            // defer starting an interrupting transition until that transition has a
            // chance to tick (and possibly end); see d3/d3-transition#54!
            if (o.state === STARTED) return timeout(start);

            // Interrupt the active transition, if any.
            if (o.state === RUNNING) {
              o.state = ENDED;
              o.timer.stop();
              o.on.call("interrupt", node, node.__data__, o.index, o.group);
              delete schedules[i];
            }

            // Cancel any pre-empted transitions.
            else if (+i < id) {
              o.state = ENDED;
              o.timer.stop();
              o.on.call("cancel", node, node.__data__, o.index, o.group);
              delete schedules[i];
            }
          }

          // Defer the first tick to end of the current frame; see d3/d3#1576.
          // Note the transition may be canceled after start and before the first tick!
          // Note this must be scheduled before the start event; see d3/d3-transition#16!
          // Assuming this is successful, subsequent callbacks go straight to tick.
          timeout(function() {
            if (self.state === STARTED) {
              self.state = RUNNING;
              self.timer.restart(tick, self.delay, self.time);
              tick(elapsed);
            }
          });

          // Dispatch the start event.
          // Note this must be done before the tween are initialized.
          self.state = STARTING;
          self.on.call("start", node, node.__data__, self.index, self.group);
          if (self.state !== STARTING) return; // interrupted
          self.state = STARTED;

          // Initialize the tween, deleting null tween.
          tween = new Array(n = self.tween.length);
          for (i = 0, j = -1; i < n; ++i) {
            if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
              tween[++j] = o;
            }
          }
          tween.length = j + 1;
        }

        function tick(elapsed) {
          var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
              i = -1,
              n = tween.length;

          while (++i < n) {
            tween[i].call(node, t);
          }

          // Dispatch the end event.
          if (self.state === ENDING) {
            self.on.call("end", node, node.__data__, self.index, self.group);
            stop();
          }
        }

        function stop() {
          self.state = ENDED;
          self.timer.stop();
          delete schedules[id];
          for (var i in schedules) return; // eslint-disable-line no-unused-vars
          delete node.__transition;
        }
      }

      function interrupt(node, name) {
        var schedules = node.__transition,
            schedule,
            active,
            empty = true,
            i;

        if (!schedules) return;

        name = name == null ? null : name + "";

        for (i in schedules) {
          if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
          active = schedule.state > STARTING && schedule.state < ENDING;
          schedule.state = ENDED;
          schedule.timer.stop();
          schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
          delete schedules[i];
        }

        if (empty) delete node.__transition;
      }

      function selection_interrupt(name) {
        return this.each(function() {
          interrupt(this, name);
        });
      }

      function define(constructor, factory, prototype) {
        constructor.prototype = factory.prototype = prototype;
        prototype.constructor = constructor;
      }

      function extend(parent, definition) {
        var prototype = Object.create(parent.prototype);
        for (var key in definition) prototype[key] = definition[key];
        return prototype;
      }

      function Color() {}

      var darker = 0.7;
      var brighter = 1 / darker;

      var reI = "\\s*([+-]?\\d+)\\s*",
          reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
          reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
          reHex = /^#([0-9a-f]{3,8})$/,
          reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
          reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
          reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
          reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
          reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
          reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

      var named = {
        aliceblue: 0xf0f8ff,
        antiquewhite: 0xfaebd7,
        aqua: 0x00ffff,
        aquamarine: 0x7fffd4,
        azure: 0xf0ffff,
        beige: 0xf5f5dc,
        bisque: 0xffe4c4,
        black: 0x000000,
        blanchedalmond: 0xffebcd,
        blue: 0x0000ff,
        blueviolet: 0x8a2be2,
        brown: 0xa52a2a,
        burlywood: 0xdeb887,
        cadetblue: 0x5f9ea0,
        chartreuse: 0x7fff00,
        chocolate: 0xd2691e,
        coral: 0xff7f50,
        cornflowerblue: 0x6495ed,
        cornsilk: 0xfff8dc,
        crimson: 0xdc143c,
        cyan: 0x00ffff,
        darkblue: 0x00008b,
        darkcyan: 0x008b8b,
        darkgoldenrod: 0xb8860b,
        darkgray: 0xa9a9a9,
        darkgreen: 0x006400,
        darkgrey: 0xa9a9a9,
        darkkhaki: 0xbdb76b,
        darkmagenta: 0x8b008b,
        darkolivegreen: 0x556b2f,
        darkorange: 0xff8c00,
        darkorchid: 0x9932cc,
        darkred: 0x8b0000,
        darksalmon: 0xe9967a,
        darkseagreen: 0x8fbc8f,
        darkslateblue: 0x483d8b,
        darkslategray: 0x2f4f4f,
        darkslategrey: 0x2f4f4f,
        darkturquoise: 0x00ced1,
        darkviolet: 0x9400d3,
        deeppink: 0xff1493,
        deepskyblue: 0x00bfff,
        dimgray: 0x696969,
        dimgrey: 0x696969,
        dodgerblue: 0x1e90ff,
        firebrick: 0xb22222,
        floralwhite: 0xfffaf0,
        forestgreen: 0x228b22,
        fuchsia: 0xff00ff,
        gainsboro: 0xdcdcdc,
        ghostwhite: 0xf8f8ff,
        gold: 0xffd700,
        goldenrod: 0xdaa520,
        gray: 0x808080,
        green: 0x008000,
        greenyellow: 0xadff2f,
        grey: 0x808080,
        honeydew: 0xf0fff0,
        hotpink: 0xff69b4,
        indianred: 0xcd5c5c,
        indigo: 0x4b0082,
        ivory: 0xfffff0,
        khaki: 0xf0e68c,
        lavender: 0xe6e6fa,
        lavenderblush: 0xfff0f5,
        lawngreen: 0x7cfc00,
        lemonchiffon: 0xfffacd,
        lightblue: 0xadd8e6,
        lightcoral: 0xf08080,
        lightcyan: 0xe0ffff,
        lightgoldenrodyellow: 0xfafad2,
        lightgray: 0xd3d3d3,
        lightgreen: 0x90ee90,
        lightgrey: 0xd3d3d3,
        lightpink: 0xffb6c1,
        lightsalmon: 0xffa07a,
        lightseagreen: 0x20b2aa,
        lightskyblue: 0x87cefa,
        lightslategray: 0x778899,
        lightslategrey: 0x778899,
        lightsteelblue: 0xb0c4de,
        lightyellow: 0xffffe0,
        lime: 0x00ff00,
        limegreen: 0x32cd32,
        linen: 0xfaf0e6,
        magenta: 0xff00ff,
        maroon: 0x800000,
        mediumaquamarine: 0x66cdaa,
        mediumblue: 0x0000cd,
        mediumorchid: 0xba55d3,
        mediumpurple: 0x9370db,
        mediumseagreen: 0x3cb371,
        mediumslateblue: 0x7b68ee,
        mediumspringgreen: 0x00fa9a,
        mediumturquoise: 0x48d1cc,
        mediumvioletred: 0xc71585,
        midnightblue: 0x191970,
        mintcream: 0xf5fffa,
        mistyrose: 0xffe4e1,
        moccasin: 0xffe4b5,
        navajowhite: 0xffdead,
        navy: 0x000080,
        oldlace: 0xfdf5e6,
        olive: 0x808000,
        olivedrab: 0x6b8e23,
        orange: 0xffa500,
        orangered: 0xff4500,
        orchid: 0xda70d6,
        palegoldenrod: 0xeee8aa,
        palegreen: 0x98fb98,
        paleturquoise: 0xafeeee,
        palevioletred: 0xdb7093,
        papayawhip: 0xffefd5,
        peachpuff: 0xffdab9,
        peru: 0xcd853f,
        pink: 0xffc0cb,
        plum: 0xdda0dd,
        powderblue: 0xb0e0e6,
        purple: 0x800080,
        rebeccapurple: 0x663399,
        red: 0xff0000,
        rosybrown: 0xbc8f8f,
        royalblue: 0x4169e1,
        saddlebrown: 0x8b4513,
        salmon: 0xfa8072,
        sandybrown: 0xf4a460,
        seagreen: 0x2e8b57,
        seashell: 0xfff5ee,
        sienna: 0xa0522d,
        silver: 0xc0c0c0,
        skyblue: 0x87ceeb,
        slateblue: 0x6a5acd,
        slategray: 0x708090,
        slategrey: 0x708090,
        snow: 0xfffafa,
        springgreen: 0x00ff7f,
        steelblue: 0x4682b4,
        tan: 0xd2b48c,
        teal: 0x008080,
        thistle: 0xd8bfd8,
        tomato: 0xff6347,
        turquoise: 0x40e0d0,
        violet: 0xee82ee,
        wheat: 0xf5deb3,
        white: 0xffffff,
        whitesmoke: 0xf5f5f5,
        yellow: 0xffff00,
        yellowgreen: 0x9acd32
      };

      define(Color, color, {
        copy: function(channels) {
          return Object.assign(new this.constructor, this, channels);
        },
        displayable: function() {
          return this.rgb().displayable();
        },
        hex: color_formatHex, // Deprecated! Use color.formatHex.
        formatHex: color_formatHex,
        formatHsl: color_formatHsl,
        formatRgb: color_formatRgb,
        toString: color_formatRgb
      });

      function color_formatHex() {
        return this.rgb().formatHex();
      }

      function color_formatHsl() {
        return hslConvert(this).formatHsl();
      }

      function color_formatRgb() {
        return this.rgb().formatRgb();
      }

      function color(format) {
        var m, l;
        format = (format + "").trim().toLowerCase();
        return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
            : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
            : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
            : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
            : null) // invalid hex
            : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
            : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
            : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
            : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
            : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
            : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
            : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
            : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
            : null;
      }

      function rgbn(n) {
        return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
      }

      function rgba(r, g, b, a) {
        if (a <= 0) r = g = b = NaN;
        return new Rgb(r, g, b, a);
      }

      function rgbConvert(o) {
        if (!(o instanceof Color)) o = color(o);
        if (!o) return new Rgb;
        o = o.rgb();
        return new Rgb(o.r, o.g, o.b, o.opacity);
      }

      function rgb(r, g, b, opacity) {
        return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
      }

      function Rgb(r, g, b, opacity) {
        this.r = +r;
        this.g = +g;
        this.b = +b;
        this.opacity = +opacity;
      }

      define(Rgb, rgb, extend(Color, {
        brighter: function(k) {
          k = k == null ? brighter : Math.pow(brighter, k);
          return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
        },
        darker: function(k) {
          k = k == null ? darker : Math.pow(darker, k);
          return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
        },
        rgb: function() {
          return this;
        },
        displayable: function() {
          return (-0.5 <= this.r && this.r < 255.5)
              && (-0.5 <= this.g && this.g < 255.5)
              && (-0.5 <= this.b && this.b < 255.5)
              && (0 <= this.opacity && this.opacity <= 1);
        },
        hex: rgb_formatHex, // Deprecated! Use color.formatHex.
        formatHex: rgb_formatHex,
        formatRgb: rgb_formatRgb,
        toString: rgb_formatRgb
      }));

      function rgb_formatHex() {
        return "#" + hex(this.r) + hex(this.g) + hex(this.b);
      }

      function rgb_formatRgb() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "rgb(" : "rgba(")
            + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
            + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
            + Math.max(0, Math.min(255, Math.round(this.b) || 0))
            + (a === 1 ? ")" : ", " + a + ")");
      }

      function hex(value) {
        value = Math.max(0, Math.min(255, Math.round(value) || 0));
        return (value < 16 ? "0" : "") + value.toString(16);
      }

      function hsla(h, s, l, a) {
        if (a <= 0) h = s = l = NaN;
        else if (l <= 0 || l >= 1) h = s = NaN;
        else if (s <= 0) h = NaN;
        return new Hsl(h, s, l, a);
      }

      function hslConvert(o) {
        if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
        if (!(o instanceof Color)) o = color(o);
        if (!o) return new Hsl;
        if (o instanceof Hsl) return o;
        o = o.rgb();
        var r = o.r / 255,
            g = o.g / 255,
            b = o.b / 255,
            min = Math.min(r, g, b),
            max = Math.max(r, g, b),
            h = NaN,
            s = max - min,
            l = (max + min) / 2;
        if (s) {
          if (r === max) h = (g - b) / s + (g < b) * 6;
          else if (g === max) h = (b - r) / s + 2;
          else h = (r - g) / s + 4;
          s /= l < 0.5 ? max + min : 2 - max - min;
          h *= 60;
        } else {
          s = l > 0 && l < 1 ? 0 : h;
        }
        return new Hsl(h, s, l, o.opacity);
      }

      function hsl(h, s, l, opacity) {
        return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
      }

      function Hsl(h, s, l, opacity) {
        this.h = +h;
        this.s = +s;
        this.l = +l;
        this.opacity = +opacity;
      }

      define(Hsl, hsl, extend(Color, {
        brighter: function(k) {
          k = k == null ? brighter : Math.pow(brighter, k);
          return new Hsl(this.h, this.s, this.l * k, this.opacity);
        },
        darker: function(k) {
          k = k == null ? darker : Math.pow(darker, k);
          return new Hsl(this.h, this.s, this.l * k, this.opacity);
        },
        rgb: function() {
          var h = this.h % 360 + (this.h < 0) * 360,
              s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
              l = this.l,
              m2 = l + (l < 0.5 ? l : 1 - l) * s,
              m1 = 2 * l - m2;
          return new Rgb(
            hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
            hsl2rgb(h, m1, m2),
            hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
            this.opacity
          );
        },
        displayable: function() {
          return (0 <= this.s && this.s <= 1 || isNaN(this.s))
              && (0 <= this.l && this.l <= 1)
              && (0 <= this.opacity && this.opacity <= 1);
        },
        formatHsl: function() {
          var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
          return (a === 1 ? "hsl(" : "hsla(")
              + (this.h || 0) + ", "
              + (this.s || 0) * 100 + "%, "
              + (this.l || 0) * 100 + "%"
              + (a === 1 ? ")" : ", " + a + ")");
        }
      }));

      /* From FvD 13.37, CSS Color Module Level 3 */
      function hsl2rgb(h, m1, m2) {
        return (h < 60 ? m1 + (m2 - m1) * h / 60
            : h < 180 ? m2
            : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
            : m1) * 255;
      }

      var constant = x => () => x;

      function linear(a, d) {
        return function(t) {
          return a + t * d;
        };
      }

      function exponential(a, b, y) {
        return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
          return Math.pow(a + t * b, y);
        };
      }

      function gamma(y) {
        return (y = +y) === 1 ? nogamma : function(a, b) {
          return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
        };
      }

      function nogamma(a, b) {
        var d = b - a;
        return d ? linear(a, d) : constant(isNaN(a) ? b : a);
      }

      var interpolateRgb = (function rgbGamma(y) {
        var color = gamma(y);

        function rgb$1(start, end) {
          var r = color((start = rgb(start)).r, (end = rgb(end)).r),
              g = color(start.g, end.g),
              b = color(start.b, end.b),
              opacity = nogamma(start.opacity, end.opacity);
          return function(t) {
            start.r = r(t);
            start.g = g(t);
            start.b = b(t);
            start.opacity = opacity(t);
            return start + "";
          };
        }

        rgb$1.gamma = rgbGamma;

        return rgb$1;
      })(1);

      function interpolateNumber(a, b) {
        return a = +a, b = +b, function(t) {
          return a * (1 - t) + b * t;
        };
      }

      var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
          reB = new RegExp(reA.source, "g");

      function zero(b) {
        return function() {
          return b;
        };
      }

      function one(b) {
        return function(t) {
          return b(t) + "";
        };
      }

      function interpolateString(a, b) {
        var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
            am, // current match in a
            bm, // current match in b
            bs, // string preceding current number in b, if any
            i = -1, // index in s
            s = [], // string constants and placeholders
            q = []; // number interpolators

        // Coerce inputs to strings.
        a = a + "", b = b + "";

        // Interpolate pairs of numbers in a & b.
        while ((am = reA.exec(a))
            && (bm = reB.exec(b))) {
          if ((bs = bm.index) > bi) { // a string precedes the next number in b
            bs = b.slice(bi, bs);
            if (s[i]) s[i] += bs; // coalesce with previous string
            else s[++i] = bs;
          }
          if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
            if (s[i]) s[i] += bm; // coalesce with previous string
            else s[++i] = bm;
          } else { // interpolate non-matching numbers
            s[++i] = null;
            q.push({i: i, x: interpolateNumber(am, bm)});
          }
          bi = reB.lastIndex;
        }

        // Add remains of b.
        if (bi < b.length) {
          bs = b.slice(bi);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }

        // Special optimization for only a single match.
        // Otherwise, interpolate each of the numbers and rejoin the string.
        return s.length < 2 ? (q[0]
            ? one(q[0].x)
            : zero(b))
            : (b = q.length, function(t) {
                for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
                return s.join("");
              });
      }

      var degrees = 180 / Math.PI;

      var identity = {
        translateX: 0,
        translateY: 0,
        rotate: 0,
        skewX: 0,
        scaleX: 1,
        scaleY: 1
      };

      function decompose(a, b, c, d, e, f) {
        var scaleX, scaleY, skewX;
        if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
        if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
        if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
        if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
        return {
          translateX: e,
          translateY: f,
          rotate: Math.atan2(b, a) * degrees,
          skewX: Math.atan(skewX) * degrees,
          scaleX: scaleX,
          scaleY: scaleY
        };
      }

      var svgNode;

      /* eslint-disable no-undef */
      function parseCss(value) {
        const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
        return m.isIdentity ? identity : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
      }

      function parseSvg(value) {
        if (value == null) return identity;
        if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svgNode.setAttribute("transform", value);
        if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
        value = value.matrix;
        return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
      }

      function interpolateTransform(parse, pxComma, pxParen, degParen) {

        function pop(s) {
          return s.length ? s.pop() + " " : "";
        }

        function translate(xa, ya, xb, yb, s, q) {
          if (xa !== xb || ya !== yb) {
            var i = s.push("translate(", null, pxComma, null, pxParen);
            q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
          } else if (xb || yb) {
            s.push("translate(" + xb + pxComma + yb + pxParen);
          }
        }

        function rotate(a, b, s, q) {
          if (a !== b) {
            if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
            q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
          } else if (b) {
            s.push(pop(s) + "rotate(" + b + degParen);
          }
        }

        function skewX(a, b, s, q) {
          if (a !== b) {
            q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
          } else if (b) {
            s.push(pop(s) + "skewX(" + b + degParen);
          }
        }

        function scale(xa, ya, xb, yb, s, q) {
          if (xa !== xb || ya !== yb) {
            var i = s.push(pop(s) + "scale(", null, ",", null, ")");
            q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
          } else if (xb !== 1 || yb !== 1) {
            s.push(pop(s) + "scale(" + xb + "," + yb + ")");
          }
        }

        return function(a, b) {
          var s = [], // string constants and placeholders
              q = []; // number interpolators
          a = parse(a), b = parse(b);
          translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
          rotate(a.rotate, b.rotate, s, q);
          skewX(a.skewX, b.skewX, s, q);
          scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
          a = b = null; // gc
          return function(t) {
            var i = -1, n = q.length, o;
            while (++i < n) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          };
        };
      }

      var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
      var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

      function tweenRemove(id, name) {
        var tween0, tween1;
        return function() {
          var schedule = set(this, id),
              tween = schedule.tween;

          // If this node shared tween with the previous node,
          // just assign the updated shared tween and we’re done!
          // Otherwise, copy-on-write.
          if (tween !== tween0) {
            tween1 = tween0 = tween;
            for (var i = 0, n = tween1.length; i < n; ++i) {
              if (tween1[i].name === name) {
                tween1 = tween1.slice();
                tween1.splice(i, 1);
                break;
              }
            }
          }

          schedule.tween = tween1;
        };
      }

      function tweenFunction(id, name, value) {
        var tween0, tween1;
        if (typeof value !== "function") throw new Error;
        return function() {
          var schedule = set(this, id),
              tween = schedule.tween;

          // If this node shared tween with the previous node,
          // just assign the updated shared tween and we’re done!
          // Otherwise, copy-on-write.
          if (tween !== tween0) {
            tween1 = (tween0 = tween).slice();
            for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
              if (tween1[i].name === name) {
                tween1[i] = t;
                break;
              }
            }
            if (i === n) tween1.push(t);
          }

          schedule.tween = tween1;
        };
      }

      function transition_tween(name, value) {
        var id = this._id;

        name += "";

        if (arguments.length < 2) {
          var tween = get(this.node(), id).tween;
          for (var i = 0, n = tween.length, t; i < n; ++i) {
            if ((t = tween[i]).name === name) {
              return t.value;
            }
          }
          return null;
        }

        return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
      }

      function tweenValue(transition, name, value) {
        var id = transition._id;

        transition.each(function() {
          var schedule = set(this, id);
          (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
        });

        return function(node) {
          return get(node, id).value[name];
        };
      }

      function interpolate(a, b) {
        var c;
        return (typeof b === "number" ? interpolateNumber
            : b instanceof color ? interpolateRgb
            : (c = color(b)) ? (b = c, interpolateRgb)
            : interpolateString)(a, b);
      }

      function attrRemove(name) {
        return function() {
          this.removeAttribute(name);
        };
      }

      function attrRemoveNS(fullname) {
        return function() {
          this.removeAttributeNS(fullname.space, fullname.local);
        };
      }

      function attrConstant(name, interpolate, value1) {
        var string00,
            string1 = value1 + "",
            interpolate0;
        return function() {
          var string0 = this.getAttribute(name);
          return string0 === string1 ? null
              : string0 === string00 ? interpolate0
              : interpolate0 = interpolate(string00 = string0, value1);
        };
      }

      function attrConstantNS(fullname, interpolate, value1) {
        var string00,
            string1 = value1 + "",
            interpolate0;
        return function() {
          var string0 = this.getAttributeNS(fullname.space, fullname.local);
          return string0 === string1 ? null
              : string0 === string00 ? interpolate0
              : interpolate0 = interpolate(string00 = string0, value1);
        };
      }

      function attrFunction(name, interpolate, value) {
        var string00,
            string10,
            interpolate0;
        return function() {
          var string0, value1 = value(this), string1;
          if (value1 == null) return void this.removeAttribute(name);
          string0 = this.getAttribute(name);
          string1 = value1 + "";
          return string0 === string1 ? null
              : string0 === string00 && string1 === string10 ? interpolate0
              : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
        };
      }

      function attrFunctionNS(fullname, interpolate, value) {
        var string00,
            string10,
            interpolate0;
        return function() {
          var string0, value1 = value(this), string1;
          if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
          string0 = this.getAttributeNS(fullname.space, fullname.local);
          string1 = value1 + "";
          return string0 === string1 ? null
              : string0 === string00 && string1 === string10 ? interpolate0
              : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
        };
      }

      function transition_attr(name, value) {
        var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
        return this.attrTween(name, typeof value === "function"
            ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
            : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
            : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
      }

      function attrInterpolate(name, i) {
        return function(t) {
          this.setAttribute(name, i.call(this, t));
        };
      }

      function attrInterpolateNS(fullname, i) {
        return function(t) {
          this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
        };
      }

      function attrTweenNS(fullname, value) {
        var t0, i0;
        function tween() {
          var i = value.apply(this, arguments);
          if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
          return t0;
        }
        tween._value = value;
        return tween;
      }

      function attrTween(name, value) {
        var t0, i0;
        function tween() {
          var i = value.apply(this, arguments);
          if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
          return t0;
        }
        tween._value = value;
        return tween;
      }

      function transition_attrTween(name, value) {
        var key = "attr." + name;
        if (arguments.length < 2) return (key = this.tween(key)) && key._value;
        if (value == null) return this.tween(key, null);
        if (typeof value !== "function") throw new Error;
        var fullname = namespace(name);
        return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
      }

      function delayFunction(id, value) {
        return function() {
          init(this, id).delay = +value.apply(this, arguments);
        };
      }

      function delayConstant(id, value) {
        return value = +value, function() {
          init(this, id).delay = value;
        };
      }

      function transition_delay(value) {
        var id = this._id;

        return arguments.length
            ? this.each((typeof value === "function"
                ? delayFunction
                : delayConstant)(id, value))
            : get(this.node(), id).delay;
      }

      function durationFunction(id, value) {
        return function() {
          set(this, id).duration = +value.apply(this, arguments);
        };
      }

      function durationConstant(id, value) {
        return value = +value, function() {
          set(this, id).duration = value;
        };
      }

      function transition_duration(value) {
        var id = this._id;

        return arguments.length
            ? this.each((typeof value === "function"
                ? durationFunction
                : durationConstant)(id, value))
            : get(this.node(), id).duration;
      }

      function easeConstant(id, value) {
        if (typeof value !== "function") throw new Error;
        return function() {
          set(this, id).ease = value;
        };
      }

      function transition_ease(value) {
        var id = this._id;

        return arguments.length
            ? this.each(easeConstant(id, value))
            : get(this.node(), id).ease;
      }

      function easeVarying(id, value) {
        return function() {
          var v = value.apply(this, arguments);
          if (typeof v !== "function") throw new Error;
          set(this, id).ease = v;
        };
      }

      function transition_easeVarying(value) {
        if (typeof value !== "function") throw new Error;
        return this.each(easeVarying(this._id, value));
      }

      function transition_filter(match) {
        if (typeof match !== "function") match = matcher(match);

        for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
          for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
            if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
              subgroup.push(node);
            }
          }
        }

        return new Transition(subgroups, this._parents, this._name, this._id);
      }

      function transition_merge(transition) {
        if (transition._id !== this._id) throw new Error;

        for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
          for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
            if (node = group0[i] || group1[i]) {
              merge[i] = node;
            }
          }
        }

        for (; j < m0; ++j) {
          merges[j] = groups0[j];
        }

        return new Transition(merges, this._parents, this._name, this._id);
      }

      function start(name) {
        return (name + "").trim().split(/^|\s+/).every(function(t) {
          var i = t.indexOf(".");
          if (i >= 0) t = t.slice(0, i);
          return !t || t === "start";
        });
      }

      function onFunction(id, name, listener) {
        var on0, on1, sit = start(name) ? init : set;
        return function() {
          var schedule = sit(this, id),
              on = schedule.on;

          // If this node shared a dispatch with the previous node,
          // just assign the updated shared dispatch and we’re done!
          // Otherwise, copy-on-write.
          if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

          schedule.on = on1;
        };
      }

      function transition_on(name, listener) {
        var id = this._id;

        return arguments.length < 2
            ? get(this.node(), id).on.on(name)
            : this.each(onFunction(id, name, listener));
      }

      function removeFunction(id) {
        return function() {
          var parent = this.parentNode;
          for (var i in this.__transition) if (+i !== id) return;
          if (parent) parent.removeChild(this);
        };
      }

      function transition_remove() {
        return this.on("end.remove", removeFunction(this._id));
      }

      function transition_select(select) {
        var name = this._name,
            id = this._id;

        if (typeof select !== "function") select = selector(select);

        for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
          for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
            if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
              if ("__data__" in node) subnode.__data__ = node.__data__;
              subgroup[i] = subnode;
              schedule(subgroup[i], name, id, i, subgroup, get(node, id));
            }
          }
        }

        return new Transition(subgroups, this._parents, name, id);
      }

      function transition_selectAll(select) {
        var name = this._name,
            id = this._id;

        if (typeof select !== "function") select = selectorAll(select);

        for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
          for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
            if (node = group[i]) {
              for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
                if (child = children[k]) {
                  schedule(child, name, id, k, children, inherit);
                }
              }
              subgroups.push(children);
              parents.push(node);
            }
          }
        }

        return new Transition(subgroups, parents, name, id);
      }

      var Selection = selection.prototype.constructor;

      function transition_selection() {
        return new Selection(this._groups, this._parents);
      }

      function styleNull(name, interpolate) {
        var string00,
            string10,
            interpolate0;
        return function() {
          var string0 = styleValue(this, name),
              string1 = (this.style.removeProperty(name), styleValue(this, name));
          return string0 === string1 ? null
              : string0 === string00 && string1 === string10 ? interpolate0
              : interpolate0 = interpolate(string00 = string0, string10 = string1);
        };
      }

      function styleRemove(name) {
        return function() {
          this.style.removeProperty(name);
        };
      }

      function styleConstant(name, interpolate, value1) {
        var string00,
            string1 = value1 + "",
            interpolate0;
        return function() {
          var string0 = styleValue(this, name);
          return string0 === string1 ? null
              : string0 === string00 ? interpolate0
              : interpolate0 = interpolate(string00 = string0, value1);
        };
      }

      function styleFunction(name, interpolate, value) {
        var string00,
            string10,
            interpolate0;
        return function() {
          var string0 = styleValue(this, name),
              value1 = value(this),
              string1 = value1 + "";
          if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
          return string0 === string1 ? null
              : string0 === string00 && string1 === string10 ? interpolate0
              : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
        };
      }

      function styleMaybeRemove(id, name) {
        var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
        return function() {
          var schedule = set(this, id),
              on = schedule.on,
              listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

          // If this node shared a dispatch with the previous node,
          // just assign the updated shared dispatch and we’re done!
          // Otherwise, copy-on-write.
          if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

          schedule.on = on1;
        };
      }

      function transition_style(name, value, priority) {
        var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
        return value == null ? this
            .styleTween(name, styleNull(name, i))
            .on("end.style." + name, styleRemove(name))
          : typeof value === "function" ? this
            .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
            .each(styleMaybeRemove(this._id, name))
          : this
            .styleTween(name, styleConstant(name, i, value), priority)
            .on("end.style." + name, null);
      }

      function styleInterpolate(name, i, priority) {
        return function(t) {
          this.style.setProperty(name, i.call(this, t), priority);
        };
      }

      function styleTween(name, value, priority) {
        var t, i0;
        function tween() {
          var i = value.apply(this, arguments);
          if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
          return t;
        }
        tween._value = value;
        return tween;
      }

      function transition_styleTween(name, value, priority) {
        var key = "style." + (name += "");
        if (arguments.length < 2) return (key = this.tween(key)) && key._value;
        if (value == null) return this.tween(key, null);
        if (typeof value !== "function") throw new Error;
        return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
      }

      function textConstant(value) {
        return function() {
          this.textContent = value;
        };
      }

      function textFunction(value) {
        return function() {
          var value1 = value(this);
          this.textContent = value1 == null ? "" : value1;
        };
      }

      function transition_text(value) {
        return this.tween("text", typeof value === "function"
            ? textFunction(tweenValue(this, "text", value))
            : textConstant(value == null ? "" : value + ""));
      }

      function textInterpolate(i) {
        return function(t) {
          this.textContent = i.call(this, t);
        };
      }

      function textTween(value) {
        var t0, i0;
        function tween() {
          var i = value.apply(this, arguments);
          if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
          return t0;
        }
        tween._value = value;
        return tween;
      }

      function transition_textTween(value) {
        var key = "text";
        if (arguments.length < 1) return (key = this.tween(key)) && key._value;
        if (value == null) return this.tween(key, null);
        if (typeof value !== "function") throw new Error;
        return this.tween(key, textTween(value));
      }

      function transition_transition() {
        var name = this._name,
            id0 = this._id,
            id1 = newId();

        for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
          for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
            if (node = group[i]) {
              var inherit = get(node, id0);
              schedule(node, name, id1, i, group, {
                time: inherit.time + inherit.delay + inherit.duration,
                delay: 0,
                duration: inherit.duration,
                ease: inherit.ease
              });
            }
          }
        }

        return new Transition(groups, this._parents, name, id1);
      }

      function transition_end() {
        var on0, on1, that = this, id = that._id, size = that.size();
        return new Promise(function(resolve, reject) {
          var cancel = {value: reject},
              end = {value: function() { if (--size === 0) resolve(); }};

          that.each(function() {
            var schedule = set(this, id),
                on = schedule.on;

            // If this node shared a dispatch with the previous node,
            // just assign the updated shared dispatch and we’re done!
            // Otherwise, copy-on-write.
            if (on !== on0) {
              on1 = (on0 = on).copy();
              on1._.cancel.push(cancel);
              on1._.interrupt.push(cancel);
              on1._.end.push(end);
            }

            schedule.on = on1;
          });

          // The selection was empty, resolve end immediately
          if (size === 0) resolve();
        });
      }

      var id = 0;

      function Transition(groups, parents, name, id) {
        this._groups = groups;
        this._parents = parents;
        this._name = name;
        this._id = id;
      }

      function newId() {
        return ++id;
      }

      var selection_prototype = selection.prototype;

      Transition.prototype = {
        constructor: Transition,
        select: transition_select,
        selectAll: transition_selectAll,
        filter: transition_filter,
        merge: transition_merge,
        selection: transition_selection,
        transition: transition_transition,
        call: selection_prototype.call,
        nodes: selection_prototype.nodes,
        node: selection_prototype.node,
        size: selection_prototype.size,
        empty: selection_prototype.empty,
        each: selection_prototype.each,
        on: transition_on,
        attr: transition_attr,
        attrTween: transition_attrTween,
        style: transition_style,
        styleTween: transition_styleTween,
        text: transition_text,
        textTween: transition_textTween,
        remove: transition_remove,
        tween: transition_tween,
        delay: transition_delay,
        duration: transition_duration,
        ease: transition_ease,
        easeVarying: transition_easeVarying,
        end: transition_end,
        [Symbol.iterator]: selection_prototype[Symbol.iterator]
      };

      function cubicInOut(t) {
        return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
      }

      var defaultTiming = {
        time: null, // Set on use.
        delay: 0,
        duration: 250,
        ease: cubicInOut
      };

      function inherit(node, id) {
        var timing;
        while (!(timing = node.__transition) || !(timing = timing[id])) {
          if (!(node = node.parentNode)) {
            throw new Error(`transition ${id} not found`);
          }
        }
        return timing;
      }

      function selection_transition(name) {
        var id,
            timing;

        if (name instanceof Transition) {
          id = name._id, name = name._name;
        } else {
          id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
        }

        for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
          for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
            if (node = group[i]) {
              schedule(node, name, id, i, group, timing || inherit(node, id));
            }
          }
        }

        return new Transition(groups, this._parents, name, id);
      }

      selection.prototype.interrupt = selection_interrupt;
      selection.prototype.transition = selection_transition;

      // configuration vars
      const colors = ['#47ebbf','#506ced','#eb4778','#ebcd47'];
      const bboxWidth = 255,  // :IMPORTANT: must match `svg.ek-text` attributes in HTML
            bboxHeight = 180;
      const pV =[50, 90, 140];

      // helpers
      function shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        } return array;
      }

      // find DOM attachment points
      const r = document.querySelector(':root');
      const logoHTML = document.getElementById('logo-graphic');

      // init elements
      let logo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      document.createElementNS("http://www.w3.org/2000/svg", "g");
        logo.id = 'graphic-ek';
        logo.setAttribute('viewBox', '-20 0 ' + bboxWidth + ' ' + bboxHeight);

      let gradient1Defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      let gradient1 = `
<radialGradient id="radialGradient1"
    cx="0" cy="0" r="1" fx="0.1" fy="0.1">
  <stop class="stopG1_1" offset="0%"/>
  <stop class="stopG1_2" offset="100%"/>
  </radialGradient>`;

      logo.appendChild(gradient1Defs);
      gradient1Defs.innerHTML = gradient1;

      let e = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      let i1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      e.id = 'e';
      i1.id = 'i1';

      e.setAttribute('cx', `0`);
      e.setAttribute('cy', `0`);
      e.setAttribute('r', '12.7');
      e.setAttribute('fill', 'var(--c2)');

      i1.setAttribute('x', `-4.4`);
      i1.setAttribute('y', `-4.4`);
      i1.setAttribute('width', '8.8');
      i1.setAttribute('height', '8.8');
      i1.setAttribute('fill', 'var(--c1)');

      let path1ID3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      let path2ID3 = document.createElementNS("http://www.w3.org/2000/svg", "path");

      function initPath(el) {
        el.style = 'stroke-width:3px';
        el.setAttribute('stroke-linecap', 'round');
        el.classList.add(`ek-path`);
      }
      initPath(path1ID3);
      initPath(path2ID3);
      path1ID3.id = 'path1ID3';
      path2ID3.id = 'path2ID3';
      path2ID3.setAttribute('stroke-dasharray', '8,8');

      let ani1 = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      let ani2 = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");

      function initMotion(el) {
        el.setAttribute('repeatCount', 'indefinite');
        el.setAttribute('keyPoints', '0;1;0');
        el.setAttribute('keyTimes', '0;0.5;1');
      }
      initMotion(ani1);
      initMotion(ani2);
      ani1.id = 'EKani1';
      ani2.id = 'EKani2';

      e.appendChild(ani1);
      i1.appendChild(ani2);
      logo.appendChild(path1ID3);
      logo.appendChild(path2ID3);
      logo.appendChild(e);
      logo.appendChild(i1);

      logoHTML.appendChild(logo);

      // grab D3 refs to generated DOM elements
      const path1 = select('#path1ID3'),
            path2 = select('#path2ID3'),
            anim1 = select('#EKani1'),
            anim2 = select('#EKani2');

      // setup internal state
      let rPoints = [];
      let rPointsArray =[];
      let cT = 1;
      let x1 = 55;
      let y1 = 92;
      let x2 = 168;
      let y2 = 75;

      //create Array of Arrays with random points
      for(let rA = 0; rA < 30; rA++){
        rPointsArray[rA] = new Array();
        for(let r = 0; r < 12; r++){
          rPoints[r] = pV[pV.length * Math.random() | 0];
          rPointsArray[rA].push(rPoints[r]);
        }
      }

      // define callback for randomising graphic
      window.randomizeEKLogo = function(
        cycleDuration = 18000,
        subCycleRepeats = 3,
        transitionDuration = 2000
      ) {
        shuffle(colors);
        r.style.setProperty('--c1', colors[0]);
        r.style.setProperty('--c2', colors[1]);
        r.style.setProperty('--c3', colors[2]);
        r.style.setProperty('--c4', colors[3]);

        let path1Instructions =
          `M ${x1},${y1}
    C 0,0
    ${rPointsArray[cT][0]},${rPointsArray[cT][1]}
    ${rPointsArray[cT][2]},${rPointsArray[cT][3]}
    S ${rPointsArray[cT][4]},${rPointsArray[cT][5]}
    ${x2},${y2}`;

        let path1InstructionsNext =
          `M ${x1},${y1}
    C 0,0
    ${rPointsArray[cT + 1][0]},${rPointsArray[cT + 1][1]}
    ${rPointsArray[cT + 1][2]},${rPointsArray[cT + 1][3]}
    S ${rPointsArray[cT + 1][4]},${rPointsArray[cT + 1][5]}
    ${x2},${y2}`;

        path1
        .attr('d', path1Instructions)
        .transition()
        .duration(transitionDuration)
        .attr('d', path1InstructionsNext);

        let path2Instructions =
          `M ${x2},${y2}
    C 0,0
    ${rPointsArray[cT][6]},${rPointsArray[cT][7]}
    ${rPointsArray[cT][8]},${rPointsArray[cT][9]}
    S ${rPointsArray[cT][10]},${rPointsArray[cT][11]}
    ${x1},${y1}`;

        let path2InstructionsNext =
          `M ${x2},${y2}
    C 0,0
    ${rPointsArray[cT + 1][6]},${rPointsArray[cT + 1][7]}
    ${rPointsArray[cT + 1][8]},${rPointsArray[cT + 1][9]}
    S ${rPointsArray[cT + 1][10]},${rPointsArray[cT + 1][11]}
    ${x1},${y1}`;

        path2
        .attr('d', path2Instructions)
        .transition()
        .duration(transitionDuration)
        .attr('d', path2InstructionsNext);

        cT = cT + 1;
        if (cT == 29){cT = 1;}
        ani1.setAttribute('dur', cycleDuration + 'ms');
        anim1
        .attr('path', path1Instructions)
        .transition()
        .duration(transitionDuration)
        .attr('path', path1InstructionsNext);

        ani2.setAttribute('dur', Math.floor(cycleDuration / subCycleRepeats) + 'ms');
        anim2
        .attr('path', path2Instructions)
        .transition()
        .duration(transitionDuration)
        .attr('path', path2InstructionsNext);
      };

    }
  };
});
//# sourceMappingURL=ek-logo-4c09f742.js.map
