import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    // challenge 5 render a winning square
    if (props.isWinning) {
        return (
            <button className="winning square" onClick={props.onClick}>
                {props.value}
            </button>
        );
    } else {
        return (
            <button className="square" onClick={props.onClick}>
                {props.value}
            </button>
        );
    }

}

class Board extends React.Component {
    renderSquare(i, isWinningSquare) {
        return <Square
            key={"square" + i}
            value={this.props.squares[i]}
            isWinning={isWinningSquare}
            onClick={() => this.props.onClick(i)}
        />;
    }

    render() {
        const rows = []; //challenge 3
        for (let i = 0; i < 3; i++) {
            const row = [];
            for (let j = 0; j < 3; j++) {
                const index = j + (i * 3);
                let isWinningSquare;
                if (this.props.winningSquares) {
                    isWinningSquare = this.props.winningSquares.includes(index);
                }

                row.push(this.renderSquare(index, isWinningSquare));
            }
            rows.push(<div key={"row" + i} className="board-row">{row}</div>)
        }
        return (
            <div>
                {rows}
            </div>
        )

    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                address: null
            }],
            stepNumber: 0,
            sortAsc: true,
            xIsNext: true,
            result: null
        };
    }

    handleClick(i) {
        if (this.state.sortAsc) {
            const history = this.state.history.slice(0, this.state.stepNumber + 1);
            const current = history[history.length - 1];
            const squares = current.squares.slice();
            if (calculateWinner(squares) || squares[i]) {
                return;
            }
            squares[i] = this.state.xIsNext ? 'X' : 'O';

            this.setState({
                history: history.concat([{
                    squares: squares,
                    address: this.getAddress(i)
                }]),
                stepNumber: history.length,
                sortAsc: this.state.sortAsc,
                xIsNext: !this.state.xIsNext,
            });
        } else {
            const history = this.state.history.slice(this.state.stepNumber, this.state.history.length);
            const current = history[0];
            const squares = current.squares.slice();
            const newHistory = [{
                squares: squares,
                address: this.getAddress(i)
            }];
            if (calculateWinner(squares) || squares[i]) {
                return;
            }
            squares[i] = this.state.xIsNext ? 'X' : 'O';
            this.setState({
                history: newHistory.concat(history),
                stepNumber: 0,
                sortAsc: this.state.sortAsc,
                xIsNext: !this.state.xIsNext,
            });
        }

    }

    getAddress(i) {
        switch (i) {
            case 0:
                return "Top Left";
            case 1:
                return "Top Center";
            case 2:
                return "Top Right";
            case 3:
                return "Left";
            case 4:
                return "Center";
            case 5:
                return "Right";
            case 6:
                return "Bottom Left";
            case 7:
                return "Bottom";
            case 8:
                return "Bottom Right";
            default:
                return "Nothing";
        }

    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }
    //challenge 4
    sortHistory() {
        let newStepNumber = this.state.history.length - (this.state.stepNumber + 1);
        let reverseHistory = this.state.history.reverse();
        this.setState({
            history: reverseHistory,
            sortAsc: this.state.sortAsc ? false : true,
            stepNumber: newStepNumber
        });
    }

    isDraw(squares) {
        return squares.reduce((acc, val) => acc && val)
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        let status;
        let winningSquares = []
        if (winner) {
            status = 'Winner: ' + winner.name;
            winningSquares = winner.path;
        } else if (this.isDraw(current.squares)) {
            status = 'The game is a draw'; //challenge 6
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        const moves = history.map((step, move) => {
            const historyIndex = this.state.sortAsc ? move :
                history.length - (move + 1);
            const desc = historyIndex ?
                'Go to move #' + historyIndex :
                'Go to game start';
            const address = step.address; //challenge 1
            const isActive = current === step ? //challenge 2
                true : false;

            if (isActive) {
                return (

                    <li key={"history" + move}>
                        <button className="history active" onClick={() => this.jumpTo(move)}>{desc}</button>
                        <span className="history-span address">{address}</span>
                    </li>
                );
            } else {
                return (

                    <li key={"history" + move}>
                        <button className="history" onClick={() => this.jumpTo(move)}>{desc}</button>
                        <span className="history-span address">{address}</span>
                    </li>
                );
            }


        });

        let sortTitle = this.state.sortAsc ?
            "Sort by most recent move" :
            "Sort by first move";

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winningSquares={winningSquares}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div className="status">{status}</div>
                    <div>
                        <div className="slanted-button">
                            <button className="sort-history" onClick={() => this.sortHistory()}>{sortTitle}</button>
                        </div>
                        <ol>{moves}</ol>
                    </div>

                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            const winner = { name: squares[a], path: [] };
            winner.path.push(a, b, c);
            return winner;
        }
    }
    return null;
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);  