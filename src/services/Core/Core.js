const EventEmitter = require('events');
const { default: init, ContainerService } = require('stremio-core-web');

function Core() {
    let active = false;
    let error = null;
    let starting = false;
    let containerService = null;
    let events = new EventEmitter();
    events.on('error', () => { });

    function onStateChanged() {
        events.emit('stateChanged');
    }
    function start() {
        if (active || error instanceof Error || starting) {
            return;
        }

        starting = true;
        init()
            .then(() => {
                if (starting) {
                    containerService = new ContainerService(({ name, args } = {}) => {
                        if (active) {
                            try {
                                events.emit(name, args);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    });
                    active = true;
                    onStateChanged();
                }
            })
            .catch((e) => {
                error = new Error('Unable to init stremio-core-web');
                error.error = e;
                onStateChanged();
            })
            .then(() => {
                starting = false;
            });
    }
    function stop() {
        active = false;
        error = null;
        starting = false;
        containerService = null;
        onStateChanged();
    }
    function on(name, listener) {
        events.on(name, listener);
    }
    function off(name, listener) {
        events.off(name, listener);
    }
    function dispatch(action, model = 'All') {
        if (!active) {
            return;
        }

        containerService.dispatch({
            model,
            args: action
        });
    }
    function getState(...args) {
        if (!active) {
            return {};
        }

        return containerService.get_state(...args);
    }

    Object.defineProperties(this, {
        active: {
            configurable: false,
            enumerable: true,
            get: function() {
                return active;
            }
        },
        error: {
            configurable: false,
            enumerable: true,
            get: function() {
                return error;
            }
        }
    });

    this.start = start;
    this.stop = stop;
    this.on = on;
    this.off = off;
    this.dispatch = dispatch;
    this.getState = getState;

    Object.freeze(this);
};

module.exports = Core;
