import { BOARD_SIZE, ROW_LABELS } from "@/lib/gameUtils";
import BoardCell from "./BoardCell";

export default function GameBoard({ 
  board, 
  attacks, 
  showShips, 
  sunkShips = [],
  hoverCells = [],
  invalidHover = false,
  onCellClick = (r, c) => {}, 
  onCellHover = (r, c) => {}, 
  onCellLeave = () => {},
  disabled = false,
  label = "" 
}) {
  const isHover = (r, c) => hoverCells.some(([hr, hc]) => hr === r && hc === c);

  return (
    <div className="w-full">
      {label && (
        <h3 className="font-heading font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">{label}</h3>
      )}
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `24px repeat(${BOARD_SIZE}, 1fr)` }}>
        <div />
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div key={i} className="text-center text-[10px] font-body font-medium text-muted-foreground pb-1">
            {i + 1}
          </div>
        ))}

        {Array.from({ length: BOARD_SIZE }, (_, r) => (
          <>
            <div key={`label-${r}`} className="flex items-center justify-center text-[10px] font-body font-medium text-muted-foreground pr-1">
              {ROW_LABELS[r]}
            </div>
            {Array.from({ length: BOARD_SIZE }, (_, c) => {
              const shipIndex = board ? board[r][c] : null;
              const attacked = attacks ? attacks[r][c] : false;
              const isShip = shipIndex !== null && shipIndex !== undefined;
              const isHitCell = attacked && isShip;
              const isMissCell = attacked && !isShip;
              const isSunk = isHitCell && sunkShips.includes(shipIndex);

              return (
                <BoardCell
                  key={`${r}-${c}`}
                  isShip={showShips && isShip}
                  isHit={isHitCell}
                  isMiss={isMissCell}
                  isSunk={isSunk}
                  isHover={isHover(r, c)}
                  isInvalid={invalidHover && isHover(r, c)}
                  onClick={() => onCellClick?.(r, c)}
                  onMouseEnter={() => onCellHover?.(r, c)}
                  onMouseLeave={() => onCellLeave?.()}
                  disabled={disabled || attacked}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}