importScripts("./chess-webworker.js", "./utils.js", "./pieceVals.js");

const game = new Chess();

onmessage = (e) => {
  game.load(e.data.fen);
  postMessage({ score: evaluate(game) });
  const [move, score] = minimax(game, 4, true);
  game.move(move);
  postMessage({ move, score: evaluate(game)});
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
  score += evaluatePositionScore(game);
  return score;
};

const evaluatePieceScore = (fen) => {
  // get piece letters from fen only
  fen = fen.split(" ")[0].replaceAll("/", "").replaceAll(/[0-9]/g, "")

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
  piecePositions = game.board();
  // console.log(piecePositions)
  score = 0;
  for (let i = 0; i < 8; i ++) 
  {
    for (let j = 0; j < 8; j++) 
    {
      let piece = piecePositions[i][j];
      if (piece) 
      {
        const isWhite = piece.color === "w"
        if (isWhite)
        {
          score -= POSITION_VALUES[piece.type.toLowerCase()][i][j];
        } else {
          score += POSITION_VALUES[piece.type.toLowerCase()][7-i][j];
        }
      }
    }
  }
  return score;
};

const evaluateCheckmateScore = (game) => {
  if (game.in_checkmate()) {
    return game.turn() === "w" ? 99999 : -99999;
  }
  return 0;
};