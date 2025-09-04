(function () {
    
    function ensureCell(board, row, col) {
        if (!board[row]) board[row] = [];
        if (!board[row][col]) board[row][col] = {};
        return board[row][col];
    }

    function getCellWithPieceAt(board, row, col, type) {
        var rowArray = board[row];
        if (rowArray) {
            var cell = rowArray[col];
            if (cell && cell.piece && (!type || cell.piece.type == type)) {
                return cell;
            }
        }
        return null;
    }

    function addPieceAt(board, type, row, col) {
        var cell = ensureCell(board, row, col);
        var piece = {
            shape: null,
            type: type,
            row: row,
            col: col,
            showThreat: false,
        };
        cell.piece = piece;
        return cell;
    }

    function destroyPiece(board, piece) {
        if (!piece) return;
        var row = piece.row,
            col = piece.col;
        if (board[row] && board[row][col] && board[row][col].piece === piece) {
            board[row][col].piece = null;
        }
    }

    if (typeof window !== 'undefined') {
        window.Board = {
            ensureCell: ensureCell,
            getCellWithPieceAt: getCellWithPieceAt,
            addPieceAt: addPieceAt,
            destroyPiece: destroyPiece,
        };
    }
})();
