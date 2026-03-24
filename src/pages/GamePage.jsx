import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { TOTAL_SHIP_CELLS, countHits, createEmptyBoard } from "@/lib/gameUtils";
import ShipPlacement from "@/components/battleship/ShipPlacement";
import AttackPhase from "@/components/battleship/AttackPhase";
import WaitingRoom from "@/components/battleship/WaitingRoom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadGame = useCallback(async () => {
    const [gameData, userData] = await Promise.all([
      base44.entities.Game.filter({ id }),
      base44.auth.me(),
    ]);
    if (gameData.length > 0) setGame(gameData[0]);
    setUser(userData);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.Game.subscribe((event) => {
      if (event.data && String(event.data.id) === String(id)) {
        setGame(event.data);
      }
    });
    return unsubscribe;
  }, [id]);

  const isPlayer1 = useMemo(() => user && game && game.player1_email === user.email, [user, game]);
  const isPlayer2 = useMemo(() => user && game && game.player2_email === user.email, [user, game]);
  const isPlayer = isPlayer1 || isPlayer2;

  const myReady = isPlayer1 ? game?.player1_ready : game?.player2_ready;

  const handleShipsReady = useCallback(async (board) => {
    const boardStr = JSON.stringify(board);
    const update = isPlayer1
      ? { player1_board: boardStr, player1_ships: boardStr, player1_ready: true }
      : { player2_board: boardStr, player2_ships: boardStr, player2_ready: true };

    // Check if both ready after this
    const otherReady = isPlayer1 ? game.player2_ready : game.player1_ready;
    if (otherReady) {
      update.status = "playing";
      update.current_turn = game.player1_email;
    }

    await base44.entities.Game.update(game.id, update);
  }, [game, isPlayer1]);

  const handleAttack = useCallback(async (r, c) => {
    const myAttacksKey = isPlayer1 ? 'player1_attacks' : 'player2_attacks';
    const existingAttacks = game[myAttacksKey] ? JSON.parse(game[myAttacksKey]) : [];
    
    // Check if already attacked
    if (existingAttacks.some(([ar, ac]) => ar === r && ac === c)) return;

    const newAttacks = [...existingAttacks, [r, c]];
    const opponentBoard = isPlayer1
      ? JSON.parse(game.player2_board)
      : JSON.parse(game.player1_board);

    // Count hits to check for win
    const attackGrid = createEmptyBoard().map(row => row.map(() => false));
    newAttacks.forEach(([ar, ac]) => { attackGrid[ar][ac] = true; });
    const hits = countHits(opponentBoard, attackGrid);

    const update = {
      [myAttacksKey]: JSON.stringify(newAttacks),
      current_turn: isPlayer1 ? game.player2_email : game.player1_email,
    };

    if (hits >= TOTAL_SHIP_CELLS) {
      update.status = "finished";
      update.winner = user.email;
    }

    await base44.entities.Game.update(game.id, update);
  }, [game, isPlayer1, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-heading text-lg text-muted-foreground">Game not found</p>
        <Link to="/"><Button variant="outline" className="gap-2"><Home className="w-4 h-4" /> Back Home</Button></Link>
      </div>
    );
  }

  if (!isPlayer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-heading text-lg text-muted-foreground">You are not part of this game</p>
        <Link to="/"><Button variant="outline" className="gap-2"><Home className="w-4 h-4" /> Back Home</Button></Link>
      </div>
    );
  }

  const isMyTurn = game.current_turn === user?.email;
  const winnerLabel = game.winner === user?.email ? 'you' : 'opponent';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Leave
            </Button>
          </Link>
          <div className="text-center">
            <span className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground">Game</span>
            <span className="ml-2 font-heading text-sm font-bold text-primary tracking-wider">{game.code}</span>
          </div>
          <div className="text-xs font-body text-muted-foreground">
            {isPlayer1 ? 'Player 1' : 'Player 2'}
          </div>
        </div>
      </motion.header>

      {/* Game Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Waiting for opponent */}
        {game.status === 'waiting' && (
          <WaitingRoom gameCode={game.code} status="waiting" opponentJoined={false} />
        )}

        {/* Ship placement phase */}
        {game.status === 'placing' && !myReady && (
          <ShipPlacement onReady={handleShipsReady} />
        )}

        {game.status === 'placing' && myReady && (
          <WaitingRoom 
            gameCode={game.code} 
            status="placing" 
            player1Ready={game.player1_ready}
            player2Ready={game.player2_ready}
            isPlayer1={isPlayer1}
            opponentJoined={isPlayer1 ? game.player2_ready : game.player1_ready}
          />
        )}

        {/* Battle phase */}
        {(game.status === 'playing' || game.status === 'finished') && (
          <AttackPhase
            myBoard={isPlayer1 ? game.player1_board : game.player2_board}
            opponentBoard={isPlayer1 ? game.player2_board : game.player1_board}
            myAttacks={isPlayer1 ? game.player1_attacks : game.player2_attacks}
            enemyAttacks={isPlayer1 ? game.player2_attacks : game.player1_attacks}
            isMyTurn={isMyTurn}
            onAttack={handleAttack}
            myName="You"
            opponentName={isPlayer1 ? game.player2_email : game.player1_email}
            winner={game.status === 'finished' ? winnerLabel : null}
          />
        )}

        {/* Play again */}
        {game.status === 'finished' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Link to="/">
              <Button size="lg" className="gap-2 rounded-xl">
                <Home className="w-4 h-4" />
                Play Again
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}