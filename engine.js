importScripts("./chess-webworker.js", "./utils.js");

const game = new Chess();
const PIECE_VALUES = {
  p: 100,
  n: 300,
  b: 300,
  r: 500,
  q: 900,
  k: 1000,
};

onmessage = (e) => {
  game.load(e.data.fen);
  let [move, score] = minimax(game, 4, true);
  console.log(score);
  postMessage({ move: move });
};

const minimax = (
  state,
  depth,
  isMaximizing,
  alpha = Number.NEGATIVE_INFINITY,
  beta = Number.POSITIVE_INFINITY
) => {
  if (depth == 0 || game.game_over()) {
    return [null, evaluate(state)];
  }

  let moves = shuffleArray(state.moves({ verbose: true }));

  let bestMove = null;
  let bestScore = isMaximizing
    ? Number.NEGATIVE_INFINITY
    : Number.POSITIVE_INFINITY;

  for (let i = 0; i < moves.length; i++) {
    let move = moves[i];
    state.move(move);

    let currScore = minimax(state, depth - 1, !isMaximizing, alpha, beta)[1];

    if (isMaximizing) {
      if (currScore > bestScore) {
        bestScore = currScore;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (currScore < bestScore) {
        bestScore = currScore;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }

    state.undo();
    if (alpha >= beta) break;
  }
  return [bestMove, bestScore];
};

const evaluate = (game) => {
  let score = 0;
  score += evaluatePieceScore(game.fen());
  score += evaluateCheckmateScore(game);
  // score += evaluatePositionScore(game);
  return score;
};

const evaluatePieceScore = (fen) => {
  // get piece letters from fen only
  fen = game.fen().split(" ")[0].replaceAll("/", "");
  fen = fen.replaceAll(/[0-9]/g, "");

  // tabulate piece values - since computer is black, white reduce score, black increase score
  let score = 0;
  for (let i = 0; i < fen.length; i++) {
    let ch = fen.charAt(i);

    if (isCapital(ch)) {
      score -= PIECE_VALUES[ch.toLowerCase()];
    } else {
      score += PIECE_VALUES[ch];
    }
  }
  return score;
};

const evaluatePositionScore = (game) => {
  console.log(game.board());
  // use piece position tables to evaluate score
};

const evaluateCheckmateScore = (game) => {
  if (game.in_checkmate()) {
    return game.turn() === "w" ? 9999 : -9999;
  }
  return 0;
};

const evaluateGameProgressionState = (game) => {
  // categorize game state into opening, midgame, endgame
};
