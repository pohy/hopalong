(function () {
    'use strict';

    window.hopalongUtil = {
        identity
    };

    window.addEventListener('load', init);

    function init() {
        const SCALE_ID = 'scale';
        const canvas = document.getElementById('canvas');
        window.hopalong = new Hopalong(canvas);
        bindParameterControl('iterations');
        bindParameterControl(SCALE_ID);
        initScaleLimits(SCALE_ID);
        bindControlEvent('new-seed', newSeed);
        bindZoom(SCALE_ID);
        bindDragging(canvas);
    }

    function newSeed() {
        window.hopalong.parameters.seed = Math.random();
    }

    function bindControlEvent(controlId, listener) {
        const controlEl = document.getElementById(controlId);
        if (!controlEl) {
            throw new Error(`Control with id '${controlId}' not found`);
        }
        if (!listener) {
            throw new Error('Listener not defined');
        }
        if (isButton()) {
            controlEl.addEventListener('click', listener);
        } else {
            controlEl.addEventListener('change', listener);
            controlEl.addEventListener('input', listener);
        }

        return controlEl;

        function isButton() {
            return controlEl.tagName.toLowerCase() === 'button'
                || controlEl.attributes.type && controlEl.attributes.type.name === 'button';
        }
    }

    function bindParameterControl(parameter) {
        if (typeof window.hopalong.parameters[parameter] === 'undefined') {
            throw new Error(`Parameter with name '${parameter}' does not exist`);
        }
        const controlEl = bindControlEvent(parameter, onChange);
        controlEl.value = window.hopalong.parameters[parameter];

        function onChange({target: {value}}) {
            const parsedValue = parseInt(value, 10);
            window.hopalong.parameters[parameter] = isNaN(parsedValue) ? 0 : parsedValue;
        }
    }

    function bindZoom(scaleId) {
        document.body.addEventListener('wheel', onZoom);

        function onZoom({deltaY}) {
            window.hopalong.parameters.scale = window.hopalong.parameters.scale - deltaY;
            setInputValue(scaleId, window.hopalong.parameters.scale);
        }
    }

    function initScaleLimits(scaleId) {
        const {SCALE_MIN, SCALE_MAX} = window.hopalong._constants;
        const scaleEl = document.getElementById(scaleId);
        if (!scaleEl) {
            return console.error('Scale element not found');
        }
        scaleEl.setAttribute('min', SCALE_MIN);
        scaleEl.setAttribute('max', SCALE_MAX);
    }

    function bindDragging(canvas) {
        let prevX = null, prevY = null;
        let initalIterations = null;
        canvas.addEventListener('dragstart', onDragStart);
        canvas.addEventListener('drag', onDrag);
        canvas.addEventListener('dragend', onDragEnd);

        function onDragStart({clientX, clientY, dataTransfer}) {
            prevX = clientX;
            prevY = clientY;
            const img = this.cloneNode(true);
            img.style.opacity = 0;
            dataTransfer.setDragImage(img, 0, 0);
            window.hopalong.toggleDragging();
        }

        function onDrag({clientX, clientY}) {
            if (
                (clientX !== 0 && clientY !== 0)
                && (prevX !== clientX || prevY !== clientY)
            ) {
                window.hopalong.setOffset(
                    window.hopalong.parameters.offsetLeft - (prevX - clientX),
                    window.hopalong.parameters.offsetTop - (prevY - clientY)
                );
                prevX = clientX;
                prevY = clientY;
            }
        }

        function onDragEnd() {
            window.hopalong.toggleDragging();
            window.hopalong.run();
        }
    }

    function setInputValue(id, value) {
        const inputEl = document.getElementById(id);
        if (!inputEl) {
            return console.error(`Input with id '${id}' not found`);
        }
        inputEl.value = value;
    }

    function identity(value) {
        return value;
    }
})();
