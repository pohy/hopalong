(function () {
    'use strict';

    window.hopalongUtil = {
        identity
    };

    window.addEventListener('load', init);

    function init() {
        const canvas = document.getElementById('canvas');
        window.hopalong = new Hopalong(canvas);
        bindParameterControl('iterations');
        bindParameterControl('scale');
        bindControlEvent('new-seed', newSeed);
        bindZoom();
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

    function bindZoom() {
        document.body.addEventListener('wheel', onZoom);

        function onZoom(event) {
            window.hopalong.parameters.scale = window.hopalong.parameters.scale - event.deltaY;
        }
    }

    function identity(value) {
        return value;
    }
})();
