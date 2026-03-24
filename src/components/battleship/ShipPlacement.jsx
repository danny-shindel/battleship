import { useState, useCallback } from "react";
import { SHIPS, BOARD_SIZE, createEmptyBoard, canPlaceShip, placeShip } from "@/lib/gameUtils";
import GameBoard from "./GameBoard";
import { Button } from "@/components/ui/button";
import { RotateCw, Undo2, Anchor } from "lucide-react";
import { motion } from "framer-motion";

export default function ShipPlacement({ onReady }) {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [horizontal, setHorizontal] = useState(true);
  const [hoverCells, setHoverCells] = useState([]);
  const [invalidHover, setInvalidHover] = useState(false);
  const [placedShips, setPlacedShips] = useState([]);

  const currentShip = currentShipIndex < SHIPS.length ? SHIPS[currentShipIndex] : null;

  const getShipCells = useCallback((row, col, size, isHorizontal) => {
    const cells = [];
    for (let i = 0; i < size; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      if (r < BOARD_SIZE && c < BOARD_SIZE) cells.push([r, c]);
    }
    return cells;
  }, []);

  const handleCellHover = useCallback((r, c) => {
    if (!currentShip) return;
    const cells = getShipCells(r, c, currentShip.size, horizontal);
    setHoverCells(cells);
    setInvalidHover(!canPlaceShip(board, r, c, currentShip.size, horizontal));
  }, [currentShip, horizontal, board, getShipCells]);

  const handleCellLeave = useCallback(() => {
    setHoverCells([]);
    setInvalidHover(false);
  }, []);

  const handleCellClick = useCallback((r, c) => {
    if (!currentShip) return;
    if (!canPlaceShip(board, r, c, currentShip.size, horizontal)) return;

    const newBoard = placeShip(board, r, c, currentShip.size, horizontal, currentShipIndex);
    setBoard(newBoard);
    setPlacedShips(prev => [...prev, { row: r, col: c, size: currentShip.size, horizontal, index: currentShipIndex }]);
    setCurrentShipIndex(prev => prev + 1);
    setHoverCells([]);
  }, [currentShip, board, horizontal, currentShipIndex]);

  const handleUndo = useCallback(() => {
    if (placedShips.length === 0) return;
    const last = placedShips[placedShips.length - 1];
    const newBoard = board.map(r => [...r]);
    for (let i = 0; i < last.size; i++) {
      const r = last.horizontal ? last.row : last.row + i;
      const c = last.horizontal ? last.col + i : last.col;
      newBoard[r][c] = null;
    }
    setBoard(newBoard);
    setPlacedShips(prev => prev.slice(0, -1));
    setCurrentShipIndex(prev => prev - 1);
  }, [board, placedShips]);

  const allPlaced = currentShipIndex >= SHIPS.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="font-heading text-xl font-bold text-foreground">Deploy Your Fleet</h2>
        {currentShip ? (
          <p className="text-sm text-muted-foreground font-body">
            Place your <span className="font-semibold text-primary">{currentShip.name}</span> ({currentShip.size} cells)
          </p>
        ) : (
          <p className="text-sm text-accent font-body font-medium">All ships deployed!</p>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        {SHIPS.map((ship, i) => (
          <div
            key={ship.name}
            className={`flex gap-0.5 ${i < currentShipIndex ? 'opacity-40' : i === currentShipIndex ? 'opacity-100' : 'opacity-20'}`}
            title={ship.name}
          >
            {Array.from({ length: ship.size }, (_, j) => (
              <div
                key={j}
                className={`w-3 h-3 rounded-sm ${i < currentShipIndex ? 'bg-primary/50' : i === currentShipIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="max-w-sm mx-auto">
        <GameBoard
          board={board}
          attacks={createEmptyBoard().map(r => r.map(() => false))}
          showShips={true}
          hoverCells={hoverCells}
          invalidHover={invalidHover}
          onCellClick={handleCellClick}
          onCellHover={handleCellHover}
          onCellLeave={handleCellLeave}
          disabled={allPlaced}
          label="Ship Placement"
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        {!allPlaced && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setHorizontal(h => !h)}
            className="gap-2"
          >
            <RotateCw className="w-4 h-4" />
            {horizontal ? 'Horizontal' : 'Vertical'}
          </Button>
        )}
        {placedShips.length > 0 && !allPlaced && (
          <Button variant="ghost" size="sm" onClick={handleUndo} className="gap-2">
            <Undo2 className="w-4 h-4" />
            Undo
          </Button>
        )}
        {allPlaced && (
          <Button onClick={() => onReady(board)} className="gap-2" size="lg">
            <Anchor className="w-4 h-4" />
            Ready for Battle
          </Button>
        )}
      </div>
    </motion.div>
  );
}