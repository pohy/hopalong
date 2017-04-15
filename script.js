(function () {
    'use strict';

    window.addEventListener('load', init);

    function init() {
        const canvas = document.getElementById('canvas');
        window.hopalong = new Hopalong(canvas);
        bindParameterControl('iterations');
        bindParameterControl('scale');
    }

    function bindParameterControl(parameter, listener) {
        const controlEl = document.getElementById(parameter);
        if (!controlEl) {
            throw new Error(`Control with id '${parameter}' not found`);
        }
        if (typeof window.hopalong.parameters[parameter] === 'undefined') {
            throw new Error(`Parameter with name '${parameter}' does not exist`);
        }
        controlEl.addEventListener('change', listener || onChange);
        controlEl.addEventListener('input', listener || onChange);

        function onChange({target: {value}}) {
            const parsedValue = parseInt(value, 10);
            window.hopalong.parameters[parameter] = isNaN(parsedValue) ? 0 : parsedValue;
        }
    }

    function Hopalong(canvas) {
        const {width, height} = document.body.getBoundingClientRect();

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.color = '#fff';
        this.parameters = {};
        this._createParameterSetter('iterations', 10000);
        this._createParameterSetter('offsetLeft', width / 2);
        this._createParameterSetter('offsetTop', height / 2);
        this._createParameterSetter('scale', 80);

        this._resizeToWindow();
        this._clear();
        this.run();
    }

    Hopalong.prototype._createParameterSetter = function (name, defaultValue = null) {
        const propName = `_${name}`;
        this.parameters[propName] = defaultValue;
        Object.defineProperty(this.parameters, name, {
            set: setter.bind(this),
            get: getter.bind(this)
        });

        function setter(value) {
            this.parameters[propName] = value;
            this.run();
        }
        function getter() {
            return this.parameters[propName];
        }
    };

    /*
     INPUT num
     INPUT a, b, c
     x = 0
     y = 0
     PLOT(x, y)
     FOR i = 1 TO num
     xx = y - SIGN(x) * [ABS(b*x - c)]^0.5
     yy = a - x
     x = xx
     y = yy
     */

    Hopalong.prototype._run = function (a, b, c) {
        const {scale, iterations} = this.parameters;
        let y = 0;
        let x = 0;
        this._plotWithOffset(x, y);
        for (let i = 0; i < iterations; i++) {
            let sign = x === 0 ? 0 : x / Math.abs(x);
            const q = b * x - c;
            const number = Math.pow(Math.abs(q), 0.5);
            const xx = y - (sign) * number;
            const yy = a - x;
            this._plotWithOffset(xx * scale, yy * scale);
            x = xx;
            y = yy;
        }
    };

    Hopalong.prototype.run = function (num) {
        this._clear();
        this.parameters._iterations = num || this.parameters._iterations;
        this._run(Math.random(), Math.random(), Math.random());
    };

    Hopalong.prototype._plotWithOffset = function (x, y) {
        const {offsetLeft, offsetTop} = this.parameters;
        this._plot(offsetLeft + x, offsetTop + y);
    };

    Hopalong.prototype._plot = function (x, y) {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(x, y, 1, 1);
    };

    Hopalong.prototype._clear = function () {
        const {width, height} = document.body.getBoundingClientRect();
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);
    };

    Hopalong.prototype._resizeToWindow = function () {
        const {width, height} = document.body.getBoundingClientRect();
        this.canvas.width = width;
        this.canvas.height = height;
    };
})();
