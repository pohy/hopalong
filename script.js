(function () {
    'use strict';

    window.addEventListener('load', init);

    function init() {
        const canvas = document.getElementById('canvas');
        const hopalong = new Hopalong(canvas);
        window.hopalong = hopalong;
        // resizeCanvasToWindow(canvas);
        // const {width, height} = canvas;
        // const ctx = canvas.getContext('2d');
        // ctx.fillStyle = '#000';
        // ctx.fillRect(0, 0, width, height);
        // ctx.strokeStyle = '#fff';
        // ctx.beginPath();
        // ctx.moveTo(0, 0);
        // ctx.lineTo(width, height);
        // ctx.stroke();
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
