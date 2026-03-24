import { useState, useMemo } from "react";
import { BOARD_SIZE, SHIPS, checkShipSunk, countHits, TOTAL_SHIP_CELLS, createEmptyBoard } from "@/lib/gameUtils";
import GameBoard from "./GameBoard";
import { motion } from "framer-motion";
import { Target, Shield } from "lucide-react";

export default function AttackPhase({ 
  myBoard, 
  opponentBoard, 
  myAttacks, 
  enemyAttacks, 
  isMyTurn, 
  onAttack,
  myName,
  opponentName,
  winner
}) {
  const [lastHit, setLastHit] = useState(null);

  const myAttackGrid = useMemo(() => {
    const grid = createEmptyBoard().map(r => r.map(() => false));
    if (myAttacks) {
      const parsed = typeof myAttacks === 'string' ? JSON.parse(myAttacks) : myAttacks;
      parsed.forEach(([r, c]) => { grid[r][c] = true; });
    }
    return grid;
  }, [myAttacks]);

  const enemyAttackGrid = useMemo(() => {
    const grid = createEmptyBoard().map(r => r.map(() => false));
    if (enemyAttacks) {
      const parsed = typeof enemyAttacks === 'string' ? JSON.parse(enemyAttacks) : enemyAttacks;
      parsed.forEach(([r, c]) => { grid[r][c] = true; });
    }
    return grid;
  }, [enemyAttacks]);

  const parsedOpponentBoard = useMemo(() => {
    if (!opponentBoard) return createEmptyBoard();
    return typeof opponentBoard === 'string' ? JSON.parse(opponentBoard) : opponentBoard;
  }, [opponentBoard]);

  const parsedMyBoard = useMemo(() => {
    if (!myBoard) return createEmptyBoard();
    return typeof myBoard === 'string' ? JSON.parse(myBoard) : myBoard;
  }, [myBoard]);

  const sunkOpponentShips = useMemo(() => {
    const sunk = [];
    SHIPS.forEach((_, i) => {
      if (checkShipSunk(parsedOpponentBoard, myAttackGrid, i)) {
        sunk.push(i);
      }
    });
    return sunk;
  }, [parsedOpponentBoard, myAttackGrid]);

  const sunkMyShips = useMemo(() => {
    const sunk = [];
    SHIPS.forEach((_, i) => {
      if (checkShipSunk(parsedMyBoard, enemyAttackGrid, i)) {
        sunk.push(i);
      }
    });
    return sunk;
  }, [parsedMyBoard, enemyAttackGrid]);

  const myHits = countHits(parsedOpponentBoard, myAttackGrid);
  const enemyHits = countHits(parsedMyBoard, enemyAttackGrid);

  const handleAttack = (r, c) => {
    if (!isMyTurn || myAttackGrid[r][c] || winner) return;
    setLastHit([r, c]);
    onAttack(r, c);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Status Bar */}
      <div className={`text-center py-3 px-4 rounded-lg font-heading font-semibold text-sm ${
        winner 
          ? 'bg-accent/20 text-accent' 
          : isMyTurn 
            ? 'bg-primary/10 text-primary' 
            : 'bg-muted text-muted-foreground'
      }`}>
        {winner 
          ? (winner === 'you' ? '🎉 Victory! You sank all enemy ships!' : '💀 Defeat. Your fleet was destroyed.')
          : isMyTurn 
            ? 'Your turn — Fire at the enemy!' 
            : `Waiting for ${opponentName || 'opponent'}...`
        }
      </div>

      {/* Score */}
      <div className="flex items-center justify-between px-2 text-xs font-body text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-destructive" />
          Your hits: {myHits}/{TOTAL_SHIP_CELLS}
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary" />
          Enemy hits: {enemyHits}/{TOTAL_SHIP_CELLS}
        </span>
      </div>

      {/* Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="max-w-sm mx-auto w-full">
          <GameBoard
            board={parsedOpponentBoard}
            attacks={myAttackGrid}
            showShips={false}
            sunkShips={sunkOpponentShips}
            onCellClick={handleAttack}
            disabled={!isMyTurn || !!winner}
            label="Enemy Waters"
          />
        </div>
        <div className="max-w-sm mx-auto w-full">
          <GameBoard
            board={parsedMyBoard}
            attacks={enemyAttackGrid}
            showShips={true}
            sunkShips={sunkMyShips}
            onCellClick={() => {}}
            onCellHover={() => {}}
            onCellLeave={() => {}}
            disabled={true}
            label="Your Fleet"
          />
        </div>
      </div>

      {/* Ship status */}
      <div className="grid grid-cols-2 gap-4 text-xs font-body">
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium uppercase tracking-wide">Enemy Ships</span>
          {SHIPS.map((ship, i) => (
            <div key={ship.name} className={`flex items-center gap-2 ${sunkOpponentShips.includes(i) ? 'text-destructive line-through' : 'text-foreground'}`}>
              <div className="flex gap-0.5">
                {Array.from({ length: ship.size }, (_, j) => (
                  <div key={j} className={`w-2 h-2 rounded-sm ${sunkOpponentShips.includes(i) ? 'bg-destructive/50' : 'bg-muted-foreground/30'}`} />
                ))}
              </div>
              {ship.name}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium uppercase tracking-wide">Your Ships</span>
          {SHIPS.map((ship, i) => (
            <div key={ship.name} className={`flex items-center gap-2 ${sunkMyShips.includes(i) ? 'text-destructive line-through' : 'text-foreground'}`}>
              <div className="flex gap-0.5">
                {Array.from({ length: ship.size }, (_, j) => (
                  <div key={j} className={`w-2 h-2 rounded-sm ${sunkMyShips.includes(i) ? 'bg-destructive/50' : 'bg-primary/40'}`} />
                ))}
              </div>
              {ship.name}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}