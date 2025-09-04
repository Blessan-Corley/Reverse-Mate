(function () {
    function checkThreat(getCellWithPieceAt, row, col, NUM_CELLS, TYPES) {
        
        var c = getCellWithPieceAt(row, col, TYPES.LAND_MINE);
        if (c) return c;
        
        c =
            getCellWithPieceAt(row + 1, col - 1, TYPES.PAWN) ||
            getCellWithPieceAt(row + 1, col + 1, TYPES.PAWN);
        if (c) return c;
        var i, j, cell;
        
        for (j = col - 1; j >= 0; j--) {
            cell = getCellWithPieceAt(row, j);
            if (cell && cell.piece) {
                if (cell.piece.type == TYPES.ROOK) return cell;
                else break;
            }
        }
        for (j = col + 1; j <= NUM_CELLS; j++) {
            cell = getCellWithPieceAt(row, j);
            if (cell && cell.piece) {
                if (cell.piece.type == TYPES.ROOK) return cell;
                else break;
            }
        }
        for (i = row + 1; i <= row + NUM_CELLS; i++) {
            cell = getCellWithPieceAt(i, col);
            if (cell && cell.piece) {
                if (cell.piece.type == TYPES.ROOK) return cell;
                else break;
            }
        }
        for (i = row - 1; i >= row - NUM_CELLS; i--) {
            cell = getCellWithPieceAt(i, col);
            if (cell && cell.piece) {
                if (cell.piece.type == TYPES.ROOK) return cell;
                else break;
            }
        }
        
        for (j = col - 1, i = row - 1; j >= 0; j--, i--) {
            cell = getCellWithPieceAt(i, j);
            if (cell && cell.piece) {
                if (cell.piece.type == TYPES.BISHOP) return cell;
                else break;
            }
        }
        for (j = col + 1, i = row - 1; j < NUM_CELLS; j++, i--) {
            cell = getCellWithPieceAt(i, j);
            if (cell && cell.piece) {
                if (cell.piece.type == TYPES.BISHOP) return cell;
                else break;
            }
        }
        for (j = col - 1, i = row + 1; j >= 0; j--, i++) {
            cell = getCellWithPieceAt(i, j);
            if (cell && cell.piece) {
                if (cell.piece.type == TYPES.BISHOP) return cell;
                else break;
            }
        }
        for (j = col + 1, i = row + 1; j < NUM_CELLS; j++, i++) {
            cell = getCellWithPieceAt(i, j);
            if (cell && cell.piece) {
                if (cell.piece.type == TYPES.BISHOP) return cell;
                else break;
            }
        }
        
        c =
            getCellWithPieceAt(row + 2, col - 1, TYPES.KNIGHT) ||
            getCellWithPieceAt(row - 2, col - 1, TYPES.KNIGHT) ||
            getCellWithPieceAt(row + 2, col + 1, TYPES.KNIGHT) ||
            getCellWithPieceAt(row - 2, col + 1, TYPES.KNIGHT) ||
            getCellWithPieceAt(row + 1, col - 2, TYPES.KNIGHT) ||
            getCellWithPieceAt(row - 1, col - 2, TYPES.KNIGHT) ||
            getCellWithPieceAt(row + 1, col + 2, TYPES.KNIGHT) ||
            getCellWithPieceAt(row - 1, col + 2, TYPES.KNIGHT);
        return c || null;
    }

    if (typeof window !== 'undefined') {
        window.Collisions = { checkThreat: checkThreat };
    }
})();
