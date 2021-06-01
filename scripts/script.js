class Game {
    constructor(parent) {
        this.state = {
            playerPoints: 0,
            aiPoints: 0,
            difficulty: null,
            winner: null,
            activeCell: null
        };
        this.parent = parent;
        this.board = new Board(10, 10, parent, this.playerAction.bind(this));
        this.controls = new Controls(parent, this.start);
    }

    playerAction(target) {
        if (this.state.activeCell && target === this.state.activeCell.element) {
            this.state.activeCell.claimPlayer();
            this.state.playerPoints++;
            this.state.activeCell = null;
            this.controls.setScore(this.state.playerPoints, this.state.aiPoints);
            this.checkForWinner();
        }
    }

    start = (interval) => {
        this.board.cells.forEach(cell => {
            cell.available = true;
            cell.element.className = 'cell';
        })
        this.state.aiPoints = 0;
        this.state.playerPoints = 0;
        this.state.activeCell = null;
        this.stop();
        console.log(this);
        this.intervalID = setInterval(this.tick.bind(this), interval)
    }

    stop() {
        clearInterval(this.intervalID);
    }

    tick() {
        if (this.state.activeCell) {
            this.state.activeCell.claimAi();
            this.state.aiPoints++;
            this.controls.setScore(this.state.playerPoints, this.state.aiPoints);
            if (this.checkForWinner()) return;
        }
        const cells = this.board.cells.filter(cell => cell.available)
        const idx = Math.floor(Math.random() * cells.length);
        cells[idx].available = false;
        this.state.activeCell = cells[idx];
        cells[idx].activate();
    }

    checkForWinner() {
        const winningScore = Math.ceil(this.board.cells.length / 2);

        switch (winningScore) {
            case this.state.aiPoints:
                this.state.winner = 'ai';
                break;
            case this.state.playerPoints:
                this.state.winner = 'player';
                break;
            default:
                return;
        }

        this.stop();
        this.controls.showWinner(this.state.winner);
        return true;
    }
}

class Board {
    constructor(sideX, sideY, parent, playerAction) {
        this.sideX = sideX;
        this.sideY = sideY;
        this.cells = [];
        this.playerAction = playerAction;
        this.render(parent);
    }

    clickHandler({ target }) {
        this.playerAction(target);
    }

    render(parent) {
        this.board = document.createElement('table');
        this.board.classList.add('board');
        for (let y = 0; y < this.sideY; y++) {
            const row = document.createElement('tr');
            for (let x = 0; x < this.sideX; x++) {
                this.cells.push(new Cell(y, x, row));
            }
            this.board.appendChild(row);
        }
        this.board.addEventListener('click', this.clickHandler.bind(this));
        parent.appendChild(this.board);
    }
}

class Cell {
    constructor(y, x, row) {
        this.x = x;
        this.y = y;
        this.element = null;
        this.available = true;
        this.render(row);
    }

    render(row) {
        const cell = document.createElement('td');
        this.element = cell;
        cell.classList.add('cell');
        row.appendChild(cell);
    }

    activate() {
        this.element.classList.add('active');
    }

    claimPlayer() {
        this.element.classList.remove('active');
        this.element.classList.add('player');
    }

    claimAi() {
        this.element.classList.remove('active');
        this.element.classList.add('ai');
    }

}

class Controls {
    constructor(parent, startGame) {
        this.interval = 1000;
        this.modes = [['Easy', 1500], ['Medium', 1000], ['Hard', 750]];
        this.modeBtns = [];
        this.startGame = startGame;
        this.scoreBoard = null;
        this.render(parent);
    }

    chooseMode({ target }) {
        console.log(this);
        this.interval = target.dataset.interval
        this.modeBtns.forEach(btn =>
            btn.classList[btn === target ? 'add' : 'remove']('active')
        );
    }

    setScore(playerPoints, aiPoints) {
        this.scoreBoard.children[0].innerText = "Player score: " + playerPoints + " | ";
        this.scoreBoard.children[1].innerText = "Computer score: " + aiPoints;
    }

    showWinner(winner) {
        this.scoreBoard.children[2].innerText = `${winner} won!`;
    }

    render(parent) {
        const controlsPanel = document.createElement('div');
        controlsPanel.classList.add('controls');
        this.modes.forEach(([difficulty, interval]) => {
            const button = document.createElement('button');
            button.addEventListener('click', this.chooseMode.bind(this));
            this.modeBtns.push(button);
            button.classList.add('difficulty-btn');
            if (interval === this.interval) {
                button.classList.add('active');
            }
            button.innerText = difficulty;
            button.dataset.interval = interval;
            controlsPanel.appendChild(button);
        });
        const newGameBtn = document.createElement('button');
        newGameBtn.innerText = 'New game';
        newGameBtn.classList.add('new-game-btn');
        newGameBtn.addEventListener('click', () => this.startGame(this.interval));
        controlsPanel.appendChild(newGameBtn);

        this.scoreBoard = document.createElement('div');
        this.scoreBoard.classList.add('score-boards');
        const playerPoints = document.createElement('span');
        playerPoints.classList.add('player-points');
        playerPoints.innerText = 'Player score: 0 | ';
        const aiPoints = document.createElement('span');
        aiPoints.classList.add('ai-points');
        aiPoints.innerText = 'Computer score: 0';
        const winnerMessage = document.createElement('p');
        winnerMessage.classList.add('winner-message');
        this.scoreBoard.append(playerPoints, aiPoints, winnerMessage);

        parent.append(controlsPanel, this.scoreBoard);
    }
}


document.querySelectorAll('.whackamole').forEach(parent => {
    new Game(parent);
});
