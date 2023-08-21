import { useState  } from "react";


function Square({isWinningSquare, value, onSquareClick}) {
  // const [value, setValue] = useState(null)
  //    To collect data from multiple children, or to have two child components 
  // communicate with each other, declare the shared state in their parent component 
  // instead. The parent component can pass that state back down to the children 
  // via props. This keeps the child components in sync with each other and with 
  // their parent.

  // function handleClick() {
  //   setValue('X');
  // }

  return (
    <button 
      className={`square ${isWinningSquare ? 'winning-square' : ''}`}
      onClick={onSquareClick}
      // onClick={handleClick}
    >
      {value}
    </button>
  );
}

function Board({currentMove, xIsNext, squares, onPlay}) {
  // const [xIsNext, setXIsNext] = useState(true);
  // const [squares, setSquares] = useState(Array(9).fill(null));

  /*
  JavaScript supports closures which means an inner function (e.g. handleClick) 
  has access to variables and functions defined in a outer function (e.g. Board).
  The handleClick function can read the squares state and call the setSquares 
  method because they are both defined inside of the Board function.
  */ 
 
  function handleClick(index) {
    /* Why is immutability important? 
    By not mutating the underlying data directly it allows "time travel" back 
    to prevent states. 
    All child components rerender when the state of the parent is altered. 
    Immutability allows for cheap comparison of compenents enabling skipping'
    of unecessary rerendering. 
    */

    if (squares[index] || calculateWinner(squares)[0]) return;
  
    const nextSquares = squares.slice();

    if (xIsNext) {
      nextSquares[index] = "X";
    } else {
      nextSquares[index] = "O"
    }

    // setSquares(nextSquares);
    // setXIsNext(!xIsNext);
    onPlay(nextSquares, index)
  }

  /*
  Why does onSquareClick={handleClick(0)} result in errors?
     During the intial rendering of the Board component handleClick(0) will be
  called. handleClick alters state of the board by calling setSquares. Any time
  state of a component is altered the entire component is rerendered. This results
  an infinite loop of re-renders and calls to handleClick(0)

  Passing onSquareClick={handleClick} does not result in infinite re-rendering 
  because the FUNCTION is passed as a prop whereas handleClick(0) passes a 
  FUNCTION CALL as a prop. 

  The solution is to pass a function as a prop that calls handleClick(0)
  */

  /*
  . In React, it’s conventional to use onSomething names for props which represent
   events and handleSomething for the function definitions which handle those events.
  */

  
   // Ran every time the Board component is re-rendered
   const [winner, winningSquares] = calculateWinner(squares);
   let status;
   if (winner) {
    status = "WINNER: " + winner;
   } else if (currentMove != 9) {
    status = "NEXT PLAYER: " + (xIsNext ? "X" : "O");
   } else {
    status = 'DRAW'
   }

   function createSquares() {
    let rows = []
    for (let row = 0; row < 3; row++) {
      let rowSquares  = []
      for (let col = 0; col < 3; col++) {
        let index = 3 * row + col
        rowSquares.push(<Square 
          key={index}
          isWinningSquare={winningSquares?.includes(index)}
          value={squares[index]} 
          onSquareClick={() => handleClick(index)}
          />)
      }
      rows.push(<div key={row} className="board-row">{rowSquares}</div>);
    }
    return rows;
   }


  return (
    <>
      <div className="status">{status}</div>
      {createSquares()}
    </>
  );
}


/* export default keywords tell index.js that Game() is the top level component 
*/
export default function Game() {
  // const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMove, setCurrentMove] = useState(0)
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares, index) {
    const nextMove = [Math.floor(index/3), index % 3]
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    const nextMoveHistory = [...moveHistory.slice(0, currentMove), nextMove]

    // setHistory([...history, nextSquares]);
    setMoveHistory(nextMoveHistory)
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
    // setXIsNext(!xIsNext);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    // setXIsNext(nextMove % 2 === 0);
  }

  function toggleOrder() {
    setIsAscending(!isAscending);
  }
  
  const moves = history.map((_, move) => {
    let description, row, col;
    let coord = ''
    if (move > 0) {
      [row, col] = moveHistory[move - 1]
      coord = `(${row}, ${col})` 
      description = `GO TO MOVE #${move} ${coord}`;
    } else {
      description = 'GO TO GAME START'
    }
    
    /* React needs a KEY property for each list item to differentiate between from
    each other. 
    */
   let item;
   if (move !== currentMove) {
     item = (<button onClick={() => jumpTo(move)}>
                {description}
              </button>)
    } else {
      item = `YOU ARE AT MOVE #${move} ${coord}`
    }
    
    return (
      <li key={move}>{item}</li>
      ) 
    })
    
  let toggleLable;
  if (!isAscending) {
    moves.reverse()
    toggleLable = 'ASC'
  } else {
    toggleLable = 'DESC'
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board currentMove={currentMove} xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
      </div>
      <div className="game-info">
        <button onClick={() => toggleOrder()}>{toggleLable}</button>
        <ol>{moves}</ol>
      </div>
    </div>
  )
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
      return [squares[a], lines[i]];
    }
  }
  return [null, null];
}