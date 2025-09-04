(function () {
    
    var keyMap = {
        37: 'left',
        65: 'left',
        38: 'up',
        87: 'up',
        83: 'down',
        40: 'down',
        39: 'right',
        68: 'right',
        81: 'upLeft',
        69: 'upRight',
        90: 'downLeft',
        67: 'downRight',
        32: 'space',
        27: 'esc',
        13: 'enter',
    };

    if (typeof window !== 'undefined') {
        window.InputKeys = { keyMap: keyMap };
    }
})();
