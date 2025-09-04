(function () {
    
    function updatePieceStyle(piece) {
        if (!piece || !piece.shape) return;
        piece.shape.style.opacity = piece.opacity;
        if (piece.scale > 0) {
            piece.shape.setAttributeNS(
                null,
                'transform',
                'scale(' +
                    piece.scale +
                    ') translate(' +
                    piece.x / piece.scale +
                    ',' +
                    piece.y / piece.scale +
                    ')'
            );
        }
    }

    if (typeof window !== 'undefined') {
        window.SvgLayer = { updatePieceStyle: updatePieceStyle };
    }
})();
