import { Chess } from "./chess.js";

// const isPawnPromoted = (source, target, piece) => {
//   if (piece.charAt(1) == "P") {
//     if (
//       (source.charAt(1) == 7 && target.charAt(1) == 8) ||
//       (source.charAt(1) == 2 && target.charAt(1) == 1)
//     ) {
//       return true;
//     }
//   }
// };

const onDragStart = (source, piece, position, orientation) => {
  // don't move other side pieces or if game is over
  if (piece.includes("b") || game.game_over() || game.turn() == "b")
    return false;
};

const onPieceDrop = (source, target, piece, newPos, oldPos, orientation) => {
  let desiredMove = { from: source, to: target, promotion: "q" };

  // snapback if move is invalid
  if (game.move(desiredMove) == null) {
    return "snapback";
  }

  console.log("Player moved:", source, target, piece);
};

const onSnapEnd = (source, target, piece) => {
  // update board and check if game over after player's move
  board.position(game.fen());
  if (game.game_over()) {
    endGame();
    return;
  }

  // ask engine to give a move
  console.log(game.fen());
  engine.postMessage({ fen: game.fen() });
  document.getElementById("turnInfo").innerHTML = "Computer Thinking..."

};

const endGame = () => {
  let data = getGameData();
  console.log(data);

  if (data.checkmate) {
    $("#gameStatus").text(
      game.turn() + " was checkmated\n" + JSON.stringify(data)
    );
  } else if (data.draw) {
    $("#gameStatus").text("draw\n" + JSON.stringify(data));
  }

  console.log(game.fen());
  console.log(game.pgn());
};

const getGameData = () => {
  return {
    over: game.game_over(),
    checkmate: game.in_checkmate(),
    draw: game.in_draw(),
    stalemate: game.in_stalemate(),
    insuff: game.insufficient_material(),
    three_reps: game.in_threefold_repetition(),
    fifty_reps: game.fen().split(" ")[4] == 100 ? true : false,
    fen: game.fen(),
    pgn: game.pgn(),
  };
};

const resetGame = () => {
  game.reset();
  board.start();
};

var game = new Chess();
var board = new Chessboard("board", {
  draggable: true,
  showNotation: false,
  showErrors: "console",
  position: "start",
  moveSpeed: "10",
  onDragStart: onDragStart,
  onDrop: onPieceDrop,
  onSnapEnd: onSnapEnd,
});

// initialize chess engine
const engine = new Worker("./src/engine.js");

// listen to engine messages
engine.onmessage = (e) => {
  // run computer move and update board
  let computerMove = e.data.move;
  if (computerMove) {
    game.move(computerMove);
    board.position(game.fen());
    document.getElementById("turnInfo").innerHTML = "Your Turn";
  }
  console.log("GOT MESSAGE", e.data);
  document.getElementById("fen").innerHTML = "FEN: " + game.fen();
  document.getElementById("pgn").innerHTML = "PGN: " + game.pgn();
  document.getElementById("score").innerHTML = -e.data.score;

  // check if game over after computer's move
  if (game.game_over()) endGame();
};

// reset board and game on click
$("#resetButton").on("click", () => {
  resetGame(game, board);
  $("#gameStatus").text("");
});

// prevent scroll when dragging a piece on mobile
document
  .getElementById("board")
  .addEventListener("touchmove", (e) => e.preventDefault, { passive: false });
