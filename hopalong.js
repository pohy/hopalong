(function () {
    'use strict';

    window.Hopalong = Hopalong;

    // TODO: rewrite to class
    function Hopalong(canvas) {
        const {width, height} = document.body.getBoundingClientRect();
        window.addEventListener('resize', this._onResize.bind(this));

        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        this._color = '#fff';
        this._constants = {
            SCALE_MIN: 20,
            SCALE_MAX: 750
        };
        this._renderStartedAt = 0;
        this._dragging = false;
        this._points = [];
        this.parameters = {};
        this._createParameterSetter('iterations', 100000);
        this._createParameterSetter('offsetLeft', width / 2);
        this._createParameterSetter('offsetTop', height / 2);
        this._createParameterSetter('scale', 80, this._scaleOnSet.bind(this));
        this._createParameterSetter('seed', Math.random(), undefined, true);
        this._createParameterSetter('batchSize', 100);

        this._resizeToWindow();
        this._clear();
        this.run(true);
    }

    Hopalong.prototype.toggleDragging = function (value = !this._dragging) {
        this._dragging = value;
    };

    Hopalong.prototype.setOffset = function (left = null, top = null) {
        if (left === null || top === null) {
            throw new Error(`Parameters 'left', and 'top', cannot be undefined.`);
        }
        this.parameters._offsetLeft = left;
        this.parameters._offsetTop = top;
    };

    Hopalong.prototype._createParameterSetter = function (name, defaultValue = null, onSet = window.hopalongUtil.identity, restart = false) {
        const propName = `_${name}`;
        this.parameters[propName] = defaultValue;
        Object.defineProperty(this.parameters, name, {
            set: setter.bind(this),
            get: getter.bind(this)
        });

        function setter(value) {
            this.parameters[propName] = onSet(value);
            this.run(restart);
        }
        function getter() {
            return this.parameters[propName];
        }
    };

    Hopalong.prototype._scaleOnSet = function (value) {
        const {SCALE_MIN, SCALE_MAX} = this._constants;
        return value >= SCALE_MIN && value <= SCALE_MAX
            ? value
            : this.parameters.scale;
    };

    Hopalong.prototype._calculatePoints = function (a, b, c, restart) {
        if (restart) {
            this._points = [];
        }
        const {iterations} = this.parameters;
        const {_points: {length: size}} = this;
        const startingIteration = restart ? 0 : size - 1;
        let x = 0, y = 0;
        for (let i = startingIteration; i < iterations; i++) {
            let sign = x === 0 ? 0 : x / Math.abs(x);
            const xx = y - sign * Math.pow(Math.abs(b * x - c), 0.5);
            const yy = a - x;
            this._points[i] = [xx, yy];
            x = xx;
            y = yy;
        }
    };

    Hopalong.prototype._render = function () {
        let iteration = 0;
        const {batchSize, scale, iterations} = this.parameters;
        const renderStartedAt = this._renderStartedAt = Date.now();

        window.requestAnimationFrame(draw.bind(this));

        // FIXME: haze on scale change
        // FIXME: not all points drawing on iterations change
        function draw() {
            const currentBatchSize = this._dragging ? 1000 : iteration + batchSize;
            for (iteration; iteration < currentBatchSize; iteration++) {
                if (iteration >= iterations || !this._points[iteration]) {
                    return;
                }
                const [x, y] = this._points[iteration];
                if (iteration % batchSize === 0) {
                    this._color = this._generateColor(iteration);
                }
                this._plotWithOffset(x * scale, y * scale);
            }
            if (iteration < iterations && this._renderStartedAt === renderStartedAt) {
                window.requestAnimationFrame(draw.bind(this));
            } else if (iteration >= iterations) {
                this.run(true);
            }
        }
    };

    Hopalong.prototype._generateColor = function (iteration) {
        const hue = 360 / this.parameters.iterations * iteration;
        const saturation = 100;
        const lightness = 50;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    Hopalong.prototype.run = function (restart) {
        this._clear();
        Math.seedrandom(this.parameters.seed);
        this._calculatePoints(Math.random(), Math.random(), Math.random(), restart);
        this._render();
    };

    Hopalong.prototype._plotWithOffset = function (x, y) {
        const {offsetLeft, offsetTop} = this.parameters;
        this._plot(offsetLeft + x, offsetTop + y);
    };

    Hopalong.prototype._plot = function (x, y) {
        if (this._isPointVisible(x, y)) {
            this._ctx.fillStyle = this._color;
            this._ctx.fillRect(x, y, 1, 1);
        }
    };

    Hopalong.prototype._isPointVisible = function (x, y) {
        const {width, height} = document.body.getBoundingClientRect();
        return x >= 0 && x <= width && y >= 0 && y <= height;
    }

    Hopalong.prototype._clear = function () {
        const {width, height} = document.body.getBoundingClientRect();
        this._ctx.fillStyle = '#000';
        this._ctx.fillRect(0, 0, width, height);
    };

    Hopalong.prototype._onResize = function () {
        const {width, height} = document.body.getBoundingClientRect();
        this.setOffset(width / 2, height / 2);
        this._resizeToWindow();
        this._clear();
        this.run();
    };

    Hopalong.prototype._resizeToWindow = function () {
        const {width, height} = document.body.getBoundingClientRect();
        this._canvas.width = width;
        this._canvas.height = height;
    };
})();
