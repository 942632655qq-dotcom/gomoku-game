class GamePage {
    static BOARD_SIZE = 15;
    static EMPTY = 0;
    static BLACK = 1;
    static WHITE = 2;
    static DIRECTIONS = [[0,1],[1,0],[1,1],[1,-1]];
    static STAR_POINTS = new Set(['3,3','3,7','3,11','7,3','7,7','7,11','11,3','11,7','11,11']);
    static COL_LETTERS = 'ABCDEFGHIJKLMNO';

    constructor() {
        this.board = [];
        this.currentPlayer = GamePage.BLACK;
        this.moves = [];
        this.gameOver = false;
        this.winner = null;
        this.scores = { black: 0, white: 0 };
        this.lastMove = null;
    }

    render() {
        this.resetState();
        this.renderHTML();
        this.bindEvents();
    }

    resetState() {
        this.board = Array.from({ length: GamePage.BOARD_SIZE }, () =>
            Array(GamePage.BOARD_SIZE).fill(GamePage.EMPTY)
        );
        this.currentPlayer = GamePage.BLACK;
        this.moves = [];
        this.gameOver = false;
        this.winner = null;
        this.lastMove = null;
    }

    renderHTML() {
        const main = document.getElementById('main-content');
        main.innerHTML = this.template();
    }

    template() {
        const cells = this.buildCellsHTML();
        return `
            <div class="game">
                <h1 class="game__title">Gomoku</h1>
                <p class="game__subtitle">Five in a Row</p>
                <div class="game__status" id="game-status">
                    <div class="game__player game__player--active" id="indicator-black">
                        <span class="game__piece game__piece--black"></span>
                        <span>Black</span>
                        <span class="game__score" id="score-black">${this.scores.black}</span>
                    </div>
                    <span>VS</span>
                    <div class="game__player" id="indicator-white">
                        <span class="game__piece game__piece--white"></span>
                        <span>White</span>
                        <span class="game__score" id="score-white">${this.scores.white}</span>
                    </div>
                </div>
                <div class="game__board-wrapper" id="board-wrapper">
                    <div class="game__board" id="game-board">${cells}</div>
                </div>
                <div class="game__controls">
                    <button class="btn btn--primary" id="btn-restart">New Game</button>
                    <button class="btn btn--outline" id="btn-undo">Undo</button>
                    <button class="btn btn--outline" id="btn-reset-score">Reset Score</button>
                </div>
                <div class="game__history">
                    <h3 class="game__history-title">Move History</h3>
                    <div class="game__history-list" id="history-list">
                        <span class="history-empty">No moves yet</span>
                    </div>
                </div>
            </div>`;
    }

    buildCellsHTML() {
        let html = '';
        for (let r = 0; r < GamePage.BOARD_SIZE; r++) {
            for (let c = 0; c < GamePage.BOARD_SIZE; c++) {
                const key = r + ',' + c;
                let cls = 'game__cell';
                if (r === 0) cls += ' game__cell--top';
                if (r === GamePage.BOARD_SIZE - 1) cls += ' game__cell--bottom';
                if (c === 0) cls += ' game__cell--left';
                if (c === GamePage.BOARD_SIZE - 1) cls += ' game__cell--right';
                if (GamePage.STAR_POINTS.has(key)) cls += ' game__cell--star';
                html += '<div class="' + cls + '" data-row="' + r + '" data-col="' + c + '" id="cell-' + r + '-' + c + '">';
                if (GamePage.STAR_POINTS.has(key)) html += '<span></span>';
                html += '</div>';
            }
        }
        return html;
    }

    bindEvents() {
        const boardEl = document.getElementById('game-board');
        if (boardEl) {
            boardEl.addEventListener('click', (e) => this.onCellClick(e));
        }
        this.bindButton('btn-restart', () => this.onRestart());
        this.bindButton('btn-undo', () => this.onUndo());
        this.bindButton('btn-reset-score', () => this.onResetScore());
    }

    bindButton(id, handler) {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handler);
    }

    onCellClick(e) {
        if (this.gameOver) return;
        const cell = e.target.closest('.game__cell');
        if (!cell) return;
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);
        this.placePiece(row, col);
    }

    placePiece(row, col) {
        if (this.board[row][col] !== GamePage.EMPTY) return;

        this.board[row][col] = this.currentPlayer;
        this.moves.push({ row, col, player: this.currentPlayer });
        this.lastMove = { row, col };

        this.renderPiece(row, col, this.currentPlayer);
        this.highlightLastMove();

        if (this.checkWin(row, col, this.currentPlayer)) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.onWin();
            return;
        }
        if (this.moves.length === GamePage.BOARD_SIZE * GamePage.BOARD_SIZE) {
            this.gameOver = true;
            this.onDraw();
            return;
        }

        this.currentPlayer = this.currentPlayer === GamePage.BLACK ? GamePage.WHITE : GamePage.BLACK;
        this.updateIndicators();
        this.updateHistory();
    }

    renderPiece(row, col, player) {
        const cell = document.getElementById('cell-' + row + '-' + col);
        if (!cell) return;
        cell.classList.add('game__cell--has-piece');
        const cls = player === GamePage.BLACK ? 'game__piece-on-board--black' : 'game__piece-on-board--white';
        const piece = Utils.createElement('div', { className: 'game__piece-on-board ' + cls });
        cell.appendChild(piece);
    }

    highlightLastMove() {
        const board = document.getElementById('game-board');
        if (!board) return;
        const prev = board.querySelector('.game__piece-on-board--last');
        if (prev) prev.classList.remove('game__piece-on-board--last');
        if (this.lastMove) {
            const cell = document.getElementById('cell-' + this.lastMove.row + '-' + this.lastMove.col);
            if (cell) {
                const piece = cell.querySelector('.game__piece-on-board');
                if (piece) piece.classList.add('game__piece-on-board--last');
            }
        }
    }

    checkWin(row, col, player) {
        for (const [dr, dc] of GamePage.DIRECTIONS) {
            let count = 1;
            for (let i = 1; i < 5; i++) {
                const r = row + dr * i, c = col + dc * i;
                if (r < 0 || r >= GamePage.BOARD_SIZE || c < 0 || c >= GamePage.BOARD_SIZE) break;
                if (this.board[r][c] !== player) break;
                count++;
            }
            for (let i = 1; i < 5; i++) {
                const r = row - dr * i, c = col - dc * i;
                if (r < 0 || r >= GamePage.BOARD_SIZE || c < 0 || c >= GamePage.BOARD_SIZE) break;
                if (this.board[r][c] !== player) break;
                count++;
            }
            if (count >= 5) return true;
        }
        return false;
    }

    onWin() {
        const name = this.winner === GamePage.BLACK ? 'Black' : 'White';
        if (this.winner === GamePage.BLACK) this.scores.black++;
        else this.scores.white++;
        this.updateScores();
        this.updateHistory();
        this.showOverlay(name + ' wins!');
        Toast.success(name + ' wins the game!');
    }

    onDraw() {
        this.updateHistory();
        this.showOverlay('Draw!');
        Toast.info('The game is a draw.');
    }

    showOverlay(msg) {
        const wrapper = document.getElementById('board-wrapper');
        if (!wrapper) return;
        const overlay = Utils.createElement('div', { className: 'game__overlay' });
        overlay.innerHTML = `
            <div class="game__overlay-box">
                <p class="game__overlay-msg">${Utils.escape(msg)}</p>
                <button class="btn btn--primary" id="btn-play-again">Play Again</button>
            </div>`;
        wrapper.appendChild(overlay);
        const btn = document.getElementById('btn-play-again');
        if (btn) btn.addEventListener('click', () => this.onRestart());
    }

    removeOverlay() {
        const overlay = document.querySelector('.game__overlay');
        if (overlay) overlay.parentNode.removeChild(overlay);
    }

    updateIndicators() {
        const blackEl = document.getElementById('indicator-black');
        const whiteEl = document.getElementById('indicator-white');
        if (blackEl) blackEl.classList.toggle('game__player--active', this.currentPlayer === GamePage.BLACK);
        if (whiteEl) whiteEl.classList.toggle('game__player--active', this.currentPlayer === GamePage.WHITE);
    }

    updateScores() {
        const elB = document.getElementById('score-black');
        const elW = document.getElementById('score-white');
        if (elB) elB.textContent = this.scores.black;
        if (elW) elW.textContent = this.scores.white;
    }

    updateHistory() {
        const list = document.getElementById('history-list');
        if (!list) return;
        if (this.moves.length === 0) {
            list.innerHTML = '<span class="history-empty">No moves yet</span>';
            return;
        }
        const visible = this.moves.slice(-40);
        let html = '';
        visible.forEach((move, i) => {
            const num = this.moves.length - visible.length + i + 1;
            const label = GamePage.COL_LETTERS[move.col] + (move.row + 1);
            const cls = move.player === GamePage.BLACK ? 'game__history-move--black' : 'game__history-move--white';
            html += '<span class="game__history-move ' + cls + '">' + num + '.' + label + '</span>';
        });
        if (this.moves.length > 40) {
            html = '<span class="history-empty">...' + (this.moves.length - 40) + ' moves</span>' + html;
        }
        list.innerHTML = html;
        list.scrollTop = list.scrollHeight;
    }

    onRestart() {
        this.resetState();
        this.removeOverlay();
        this.renderHTML();
        this.bindEvents();
    }

    onUndo() {
        if (this.gameOver || this.moves.length === 0) return;
        const move = this.moves.pop();
        this.board[move.row][move.col] = GamePage.EMPTY;
        this.currentPlayer = move.player;
        const cell = document.getElementById('cell-' + move.row + '-' + move.col);
        if (cell) {
            cell.classList.remove('game__cell--has-piece');
            const piece = cell.querySelector('.game__piece-on-board');
            if (piece) piece.parentNode.removeChild(piece);
        }
        this.lastMove = this.moves.length > 0 ? this.moves[this.moves.length - 1] : null;
        this.highlightLastMove();
        this.updateIndicators();
        this.updateHistory();
    }

    onResetScore() {
        this.scores.black = 0;
        this.scores.white = 0;
        this.updateScores();
        this.onRestart();
        Toast.info('Scores have been reset');
    }
}
