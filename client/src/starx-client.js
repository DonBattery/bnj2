// JOIN FUNC
// var join = function (data) {
//   console.log(data);
//   if(data.code === 0) {
//       console.log('Successfully joined to server.')
//   }
// };

// starx.init({host: 'localhost', port: 8080, path: '/hub', user:{
//       'key1': 'Value1',
//       'key2': 'Value2',
//   }}, function () {
//   console.log('initialized');
//   starx.request('RoomManager.Join', {
//       'key':'val',
//   }, join);
// })

(function () {
  function Emitter(obj) {
    if (obj) return mixin(obj);
  }
  /**
     * Mixin the emitter properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */

  function mixin(obj) {
    for (const key in Emitter.prototype) {
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

  Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
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

  Emitter.prototype.once = function (event, fn) {
    const self = this;
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

  Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
    this._callbacks = this._callbacks || {};

    // all
    if (arguments.length == 0) {
      this._callbacks = {};
      return this;
    }

    // specific event
    const callbacks = this._callbacks[event];
    if (!callbacks) return this;

    // remove all handlers
    if (arguments.length == 1) {
      delete this._callbacks[event];
      return this;
    }

    // remove specific handler
    let cb;
    for (let i = 0; i < callbacks.length; i++) {
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

  Emitter.prototype.emit = function (event) {
    this._callbacks = this._callbacks || {};
    const args = [].slice.call(arguments, 1);
    let callbacks = this._callbacks[event];

    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (let i = 0, len = callbacks.length; i < len; ++i) {
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

  Emitter.prototype.listeners = function (event) {
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

  Emitter.prototype.hasListeners = function (event) {
    return !!this.listeners(event).length;
  };
  const JS_WS_CLIENT_TYPE = 'js-websocket';
  const JS_WS_CLIENT_VERSION = '0.0.1';

  const { Protocol } = window;
  const decodeIO_encoder = null;
  const decodeIO_decoder = null;
  const { Package } = Protocol;
  const { Message } = Protocol;
  const EventEmitter = Emitter;
  const { rsa } = window;

  if (typeof (window) !== 'undefined' && typeof (sys) !== 'undefined' && sys.localStorage) {
    window.localStorage = sys.localStorage;
  }

  const RES_OK = 200;
  const RES_FAIL = 500;
  const RES_OLD_CLIENT = 501;

  if (typeof Object.create !== 'function') {
    Object.create = function (o) {
      function F() {}
      F.prototype = o;
      return new F();
    };
  }

  const root = window;
  const starx = Object.create(EventEmitter.prototype); // object extend from object
  root.starx = starx;
  let socket = null;
  let reqId = 0;
  const callbacks = {};
  const handlers = {};
  // Map from request id to route
  const routeMap = {};
  let dict = {}; // route string to code
  let abbrs = {}; // code to route string

  let heartbeatInterval = 0;
  let heartbeatTimeout = 0;
  let nextHeartbeatTimeout = 0;
  const gapThreshold = 100; // heartbeat gap threashold
  let heartbeatId = null;
  let heartbeatTimeoutId = null;
  let handshakeCallback = null;

  let decode = null;
  let encode = null;

  let reconnect = false;
  let reconncetTimer = null;
  let reconnectUrl = null;
  let reconnectAttempts = 0;
  let reconnectionDelay = 5000;
  const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;

  let useCrypto;

  const handshakeBuffer = {
    sys: {
      type: JS_WS_CLIENT_TYPE,
      version: JS_WS_CLIENT_VERSION,
      rsa: {},
    },
    user: {
    },
  };

  let initCallback = null;

  starx.init = function (params, cb) {
    initCallback = cb;
    const { host } = params;
    const { port } = params;
    const { path } = params;

    encode = params.encode || defaultEncode;
    decode = params.decode || defaultDecode;

    let url = `ws://${host}`;
    if (port) {
      url += `:${port}`;
    }

    if (path) {
      url += path;
    }

    handshakeBuffer.user = params.user;
    if (params.encrypt) {
      useCrypto = true;
      rsa.generate(1024, '10001');
      const data = {
        rsa_n: rsa.n.toString(16),
        rsa_e: rsa.e,
      };
      handshakeBuffer.sys.rsa = data;
    }
    handshakeCallback = params.handshakeCallback;
    connect(params, url, cb);
  };

  var defaultDecode = starx.decode = function (data) {
    const msg = Message.decode(data);

    if (msg.id > 0) {
      msg.route = routeMap[msg.id];
      delete routeMap[msg.id];
      if (!msg.route) {
        return;
      }
    }

    msg.body = deCompose(msg);
    return msg;
  };

  var defaultEncode = starx.encode = function (reqId, route, msg) {
    const type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;

    if (decodeIO_encoder && decodeIO_encoder.lookup(route)) {
      const Builder = decodeIO_encoder.build(route);
      msg = new Builder(msg).encodeNB();
    } else {
      msg = Protocol.strencode(JSON.stringify(msg));
    }

    let compressRoute = 0;
    if (dict && dict[route]) {
      route = dict[route];
      compressRoute = 1;
    }

    return Message.encode(reqId, type, compressRoute, route, msg);
  };

  var connect = function (params, url, cb) {
    console.log(`connect to ${url}`);

    var params = params || {};
    const maxReconnectAttempts = params.maxReconnectAttempts || DEFAULT_MAX_RECONNECT_ATTEMPTS;
    reconnectUrl = url;

    const onopen = function (event) {
      if (reconnect) {
        starx.emit('reconnect');
      }
      reset();
      const obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(handshakeBuffer)));
      send(obj);
    };
    const onmessage = function (event) {
      processPackage(Package.decode(event.data), cb);
      // new package arrived, update the heartbeat timeout
      if (heartbeatTimeout) {
        nextHeartbeatTimeout = Date.now() + heartbeatTimeout;
      }
    };
    const onerror = function (event) {
      starx.emit('io-error', event);
      console.error('socket error: ', event);
    };
    const onclose = function (event) {
      starx.emit('close', event);
      starx.emit('disconnect', event);
      console.log('socket close: ', event);
      if (!!params.reconnect && reconnectAttempts < maxReconnectAttempts) {
        reconnect = true;
        reconnectAttempts++;
        reconncetTimer = setTimeout(() => {
          connect(params, reconnectUrl, cb);
        }, reconnectionDelay);
        reconnectionDelay *= 2;
      }
    };
    socket = new WebSocket(url);
    socket.binaryType = 'arraybuffer';
    socket.onopen = onopen;
    socket.onmessage = onmessage;
    socket.onerror = onerror;
    socket.onclose = onclose;
  };

  starx.disconnect = function () {
    if (socket) {
      if (socket.disconnect) socket.disconnect();
      if (socket.close) socket.close();
      console.log('disconnect');
      socket = null;
    }

    if (heartbeatId) {
      clearTimeout(heartbeatId);
      heartbeatId = null;
    }
    if (heartbeatTimeoutId) {
      clearTimeout(heartbeatTimeoutId);
      heartbeatTimeoutId = null;
    }
  };

  var reset = function () {
    reconnect = false;
    reconnectionDelay = 1000 * 5;
    reconnectAttempts = 0;
    clearTimeout(reconncetTimer);
  };

  starx.request = function (route, msg, cb) {
    if (arguments.length === 2 && typeof msg === 'function') {
      cb = msg;
      msg = {};
    } else {
      msg = msg || {};
    }
    route = route || msg.route;
    if (!route) {
      return;
    }

    reqId++;
    sendMessage(reqId, route, msg);

    callbacks[reqId] = cb;
    routeMap[reqId] = route;
  };

  starx.notify = function (route, msg) {
    msg = msg || {};
    sendMessage(0, route, msg);
  };

  var sendMessage = function (reqId, route, msg) {
    if (useCrypto) {
      msg = JSON.stringify(msg);
      const sig = rsa.signString(msg, 'sha256');
      msg = JSON.parse(msg);
      msg.__crypto__ = sig;
    }

    if (encode) {
      msg = encode(reqId, route, msg);
    }

    const packet = Package.encode(Package.TYPE_DATA, msg);
    send(packet);
  };

  var send = function (packet) {
    socket.send(packet.buffer);
  };

  const handler = {};

  const heartbeat = function (data) {
    if (!heartbeatInterval) {
      // no heartbeat
      return;
    }

    const obj = Package.encode(Package.TYPE_HEARTBEAT);
    if (heartbeatTimeoutId) {
      clearTimeout(heartbeatTimeoutId);
      heartbeatTimeoutId = null;
    }

    if (heartbeatId) {
      // already in a heartbeat interval
      return;
    }
    heartbeatId = setTimeout(() => {
      heartbeatId = null;
      send(obj);

      nextHeartbeatTimeout = Date.now() + heartbeatTimeout;
      heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, heartbeatTimeout);
    }, heartbeatInterval);
  };

  var heartbeatTimeoutCb = function () {
    const gap = nextHeartbeatTimeout - Date.now();
    if (gap > gapThreshold) {
      heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, gap);
    } else {
      console.error('server heartbeat timeout');
      starx.emit('heartbeat timeout');
      starx.disconnect();
    }
  };

  const handshake = function (data) {
    data = JSON.parse(Protocol.strdecode(data));
    if (data.code === RES_OLD_CLIENT) {
      starx.emit('error', 'client version not fullfill');
      return;
    }

    if (data.code !== RES_OK) {
      starx.emit('error', 'handshake fail');
      return;
    }

    handshakeInit(data);

    const obj = Package.encode(Package.TYPE_HANDSHAKE_ACK);
    send(obj);
    if (initCallback) {
      initCallback(socket);
    }
  };

  const onData = function (data) {
    let msg = data;
    if (decode) {
      msg = decode(msg);
    }
    processMessage(starx, msg);
  };

  const onKick = function (data) {
    data = JSON.parse(Protocol.strdecode(data));
    starx.emit('onKick', data);
  };

  handlers[Package.TYPE_HANDSHAKE] = handshake;
  handlers[Package.TYPE_HEARTBEAT] = heartbeat;
  handlers[Package.TYPE_DATA] = onData;
  handlers[Package.TYPE_KICK] = onKick;

  var processPackage = function (msgs) {
    if (Array.isArray(msgs)) {
      for (let i = 0; i < msgs.length; i++) {
        const msg = msgs[i];
        handlers[msg.type](msg.body);
      }
    } else {
      handlers[msgs.type](msgs.body);
    }
  };

  var processMessage = function (starx, msg) {
    if (!msg.id) {
      // server push message
      starx.emit(msg.route, msg.body);
      return;
    }

    // if have a id then find the callback function with the request
    const cb = callbacks[msg.id];

    delete callbacks[msg.id];
    if (typeof cb !== 'function') {
      return;
    }

    cb(msg.body);
  };

  const processMessageBatch = function (starx, msgs) {
    for (let i = 0, l = msgs.length; i < l; i++) {
      processMessage(starx, msgs[i]);
    }
  };

  var deCompose = function (msg) {
    let { route } = msg;

    // Decompose route from dict
    if (msg.compressRoute) {
      if (!abbrs[route]) {
        return {};
      }

      route = msg.route = abbrs[route];
    }

    if (decodeIO_decoder && decodeIO_decoder.lookup(route)) {
      return decodeIO_decoder.build(route).decode(msg.body);
    }
    return JSON.parse(Protocol.strdecode(msg.body));

    return msg;
  };

  var handshakeInit = function (data) {
    if (data.sys && data.sys.heartbeat) {
      heartbeatInterval = data.sys.heartbeat * 1000; // heartbeat interval
      heartbeatTimeout = heartbeatInterval * 2; // max heartbeat timeout
    } else {
      heartbeatInterval = 0;
      heartbeatTimeout = 0;
    }

    initData(data);

    if (typeof handshakeCallback === 'function') {
      handshakeCallback(data.user);
    }
  };

  // Initilize data used in starx client
  var initData = function (data) {
    if (!data || !data.sys) {
      return;
    }
    dict = data.sys.dict;

    // Init compress dict
    if (dict) {
      dict = dict;
      abbrs = {};

      for (const route in dict) {
        abbrs[dict[route]] = route;
      }
    }

    window.starx = starx;
  };
}());
