/* eslint-disable block-scoped-var */
/* eslint-disable no-redeclare */
/* eslint-disable radix */
/* eslint-disable no-use-before-define */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
(function (exports, ByteArray, global) {
  const Protocol = exports;

  const PKG_HEAD_BYTES = 4;
  const MSG_FLAG_BYTES = 1;
  const MSG_ROUTE_CODE_BYTES = 2;
  const MSG_ID_MAX_BYTES = 5;
  const MSG_ROUTE_LEN_BYTES = 1;

  const MSG_ROUTE_CODE_MAX = 0xffff;

  const MSG_COMPRESS_ROUTE_MASK = 0x1;
  const MSG_TYPE_MASK = 0x7;

  const Package = Protocol.Package = {};
  const Message = Protocol.Message = {};

  Package.TYPE_HANDSHAKE = 1;
  Package.TYPE_HANDSHAKE_ACK = 2;
  Package.TYPE_HEARTBEAT = 3;
  Package.TYPE_DATA = 4;
  Package.TYPE_KICK = 5;

  Message.TYPE_REQUEST = 0;
  Message.TYPE_NOTIFY = 1;
  Message.TYPE_RESPONSE = 2;
  Message.TYPE_PUSH = 3;

  /**
     * pomele client encode
     * id message id;
     * route message route
     * msg message body
     * socketio current support string
     */
  Protocol.strencode = function (str) {
    const byteArray = new ByteArray(str.length * 3);
    let offset = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      let codes = null;
      if (charCode <= 0x7f) {
        codes = [charCode];
      } else if (charCode <= 0x7ff) {
        codes = [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)];
      } else {
        codes = [0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f)];
      }
      for (let j = 0; j < codes.length; j++) {
        byteArray[offset] = codes[j];
        ++offset;
      }
    }
    const _buffer = new ByteArray(offset);
    copyArray(_buffer, 0, byteArray, 0, offset);
    return _buffer;
  };

  /**
     * client decode
     * msg String data
     * return Message Object
     */
  Protocol.strdecode = function (buffer) {
    const bytes = new ByteArray(buffer);
    const array = [];
    let offset = 0;
    let charCode = 0;
    const end = bytes.length;
    while (offset < end) {
      if (bytes[offset] < 128) {
        charCode = bytes[offset];
        offset += 1;
      } else if (bytes[offset] < 224) {
        charCode = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f);
        offset += 2;
      } else {
        charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
        offset += 3;
      }
      array.push(charCode);
    }
    return String.fromCharCode.apply(null, array);
  };

  /**
     * Package protocol encode.
     *
     * Pomelo package format:
     * +------+-------------+------------------+
     * | type | body length |       body       |
     * +------+-------------+------------------+
     *
     * Head: 4bytes
     *   0: package type,
     *      1 - handshake,
     *      2 - handshake ack,
     *      3 - heartbeat,
     *      4 - data
     *      5 - kick
     *   1 - 3: big-endian body length
     * Body: body length bytes
     *
     * @param  {Number}    type   package type
     * @param  {ByteArray} body   body content in bytes
     * @return {ByteArray}        new byte array that contains encode result
     */
  Package.encode = function (type, body) {
    const length = body ? body.length : 0;
    const buffer = new ByteArray(PKG_HEAD_BYTES + length);
    let index = 0;
    buffer[index++] = type & 0xff;
    buffer[index++] = (length >> 16) & 0xff;
    buffer[index++] = (length >> 8) & 0xff;
    buffer[index++] = length & 0xff;
    if (body) {
      copyArray(buffer, index, body, 0, length);
    }
    return buffer;
  };

  /**
     * Package protocol decode.
     * See encode for package format.
     *
     * @param  {ByteArray} buffer byte array containing package content
     * @return {Object}           {type: package type, buffer: body byte array}
     */
  Package.decode = function (buffer) {
    let offset = 0;
    const bytes = new ByteArray(buffer);
    let length = 0;
    const rs = [];
    while (offset < bytes.length) {
      const type = bytes[offset++];
      length = ((bytes[offset++]) << 16 | (bytes[offset++]) << 8 | bytes[offset++]) >>> 0;
      const body = length ? new ByteArray(length) : null;
      copyArray(body, 0, bytes, offset, length);
      offset += length;
      rs.push({ type, body });
    }
    return rs.length === 1 ? rs[0] : rs;
  };

  /**
     * Message protocol encode.
     *
     * @param  {Number} id            message id
     * @param  {Number} type          message type
     * @param  {Number} compressRoute whether compress route
     * @param  {Number|String} route  route code or route string
     * @param  {Buffer} msg           message body bytes
     * @return {Buffer}               encode result
     */
  Message.encode = function (id, type, compressRoute, route, msg) {
    // caculate message max length
    const idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0;
    let msgLen = MSG_FLAG_BYTES + idBytes;

    if (msgHasRoute(type)) {
      if (compressRoute) {
        if (typeof route !== 'number') {
          throw new Error('error flag for number route!');
        }
        msgLen += MSG_ROUTE_CODE_BYTES;
      } else {
        msgLen += MSG_ROUTE_LEN_BYTES;
        if (route) {
          route = Protocol.strencode(route);
          if (route.length > 255) {
            throw new Error('route maxlength is overflow');
          }
          msgLen += route.length;
        }
      }
    }

    if (msg) {
      msgLen += msg.length;
    }

    const buffer = new ByteArray(msgLen);
    let offset = 0;

    // add flag
    offset = encodeMsgFlag(type, compressRoute, buffer, offset);

    // add message id
    if (msgHasId(type)) {
      offset = encodeMsgId(id, buffer, offset);
    }

    // add route
    if (msgHasRoute(type)) {
      offset = encodeMsgRoute(compressRoute, route, buffer, offset);
    }

    // add body
    if (msg) {
      offset = encodeMsgBody(msg, buffer, offset);
    }

    return buffer;
  };

  /**
     * Message protocol decode.
     *
     * @param  {Buffer|Uint8Array} buffer message bytes
     * @return {Object}            message object
     */
  Message.decode = function (buffer) {
    const bytes = new ByteArray(buffer);
    const bytesLen = bytes.length || bytes.byteLength;
    let offset = 0;
    let id = 0;
    let route = null;

    // parse flag
    const flag = bytes[offset++];
    const compressRoute = flag & MSG_COMPRESS_ROUTE_MASK;
    const type = (flag >> 1) & MSG_TYPE_MASK;

    // parse id
    if (msgHasId(type)) {
      var m = parseInt(bytes[offset]);
      let i = 0;
      do {
        var m = parseInt(bytes[offset]);
        id += ((m & 0x7f) * 2 ** (7 * i));
        offset++;
        i++;
      } while (m >= 128);
    }

    // parse route
    if (msgHasRoute(type)) {
      if (compressRoute) {
        route = (bytes[offset++]) << 8 | bytes[offset++];
      } else {
        const routeLen = bytes[offset++];
        if (routeLen) {
          route = new ByteArray(routeLen);
          copyArray(route, 0, bytes, offset, routeLen);
          route = Protocol.strdecode(route);
        } else {
          route = '';
        }
        offset += routeLen;
      }
    }

    // parse body
    const bodyLen = bytesLen - offset;
    const body = new ByteArray(bodyLen);

    copyArray(body, 0, bytes, offset, bodyLen);

    return {
      id,
      type,
      compressRoute,
      route,
      body,
    };
  };

  var copyArray = function (dest, doffset, src, soffset, length) {
    if (typeof src.copy === 'function') {
      // Buffer
      src.copy(dest, doffset, soffset, soffset + length);
    } else {
      // Uint8Array
      for (let index = 0; index < length; index++) {
        dest[doffset++] = src[soffset++];
      }
    }
  };

  var msgHasId = function (type) {
    return type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE;
  };

  var msgHasRoute = function (type) {
    return type === Message.TYPE_REQUEST || type === Message.TYPE_NOTIFY
             || type === Message.TYPE_PUSH;
  };

  var caculateMsgIdBytes = function (id) {
    let len = 0;
    do {
      len += 1;
      id >>= 7;
    } while (id > 0);
    return len;
  };

  var encodeMsgFlag = function (type, compressRoute, buffer, offset) {
    if (type !== Message.TYPE_REQUEST && type !== Message.TYPE_NOTIFY
         && type !== Message.TYPE_RESPONSE && type !== Message.TYPE_PUSH) {
      throw new Error(`unkonw message type: ${type}`);
    }

    buffer[offset] = (type << 1) | (compressRoute ? 1 : 0);

    return offset + MSG_FLAG_BYTES;
  };

  var encodeMsgId = function (id, buffer, offset) {
    do {
      let tmp = id % 128;
      const next = Math.floor(id / 128);

      if (next !== 0) {
        tmp += 128;
      }
      buffer[offset++] = tmp;

      id = next;
    } while (id !== 0);

    return offset;
  };

  var encodeMsgRoute = function (compressRoute, route, buffer, offset) {
    if (compressRoute) {
      if (route > MSG_ROUTE_CODE_MAX) {
        throw new Error('route number is overflow');
      }

      buffer[offset++] = (route >> 8) & 0xff;
      buffer[offset++] = route & 0xff;
    } else if (route) {
      buffer[offset++] = route.length & 0xff;
      copyArray(buffer, offset, route, 0, route.length);
      offset += route.length;
    } else {
      buffer[offset++] = 0;
    }

    return offset;
  };

  var encodeMsgBody = function (msg, buffer, offset) {
    copyArray(buffer, offset, msg, 0, msg.length);
    return offset + msg.length;
  };

  if (typeof (window) !== 'undefined') {
    window.Protocol = Protocol;
  }
}(typeof (window) === 'undefined' ? module.exports : (this.Protocol = {}), typeof (window) === 'undefined' ? Buffer : Uint8Array, this));
