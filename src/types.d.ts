/**
 * @module js-libp2p-spdy
 */
declare module "js-libp2p-spdy" {
    /**
     * create
     * @param {*} rawConn
     * @param {*} isListener
     */
    function create(rawConn: any, isListener: any): void;
    /**
     * @type {string}
     */
    var multicodec: string;
    /**
     * @type {function}
     * @param {*} conn
     */
    function dialer(conn: any): void;
    /**
     * @type {function}
     *  @param {*} conn
     */
    function listener(conn: any): void;
}

/**
 * @module  js-libp2p-spdy/muxer
 */
declare module "js-libp2p-spdy/muxer" {
    /**
     *
     * @param {*} conn
     * @param {*} spdy
     */
    class Muxer {
        constructor(conn: any, spdy: any);
        /**
         * Conditionally emit errors if we have listeners. All other
         * events are sent to EventEmitter.emit
         *
         * @param {string} eventName
         * @param  {...any} args
         * @returns {void}
         */
        emit(eventName: string, ...args: any[]): void;
    }
}

/**
 * @module  js-libp2p-spdy/spdy-codec
 */
declare module "js-libp2p-spdy/spdy-codec" { }

/**
 * @module  js-libp2p-spdy/spdy-codec
 */
declare module "js-libp2p-spdy/spdy-codec" { }

