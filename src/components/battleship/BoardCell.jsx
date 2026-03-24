import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function BoardCell({ isShip, isHit, isMiss, isSunk, isHover, isInvalid, onClick, onMouseEnter, onMouseLeave, disabled }) {
  return (
    <motion.button
      className={cn(
        "w-full aspect-square rounded-sm border transition-all duration-150 relative overflow-hidden",
        "focus:outline-none focus:ring-1 focus:ring-primary/40",
        disabled && "cursor-default",
        !disabled && !isHit && !isMiss && "cursor-crosshair hover:border-accent",
        isShip && !isHit && !isSunk && "bg-primary/20 border-primary/30",
        isHit && !isSunk && "bg-destructive/80 border-destructive",
        isSunk && "bg-destructive/60 border-destructive/80",
        isMiss && "bg-muted/80 border-muted-foreground/20",
        !isShip && !isHit && !isMiss && "bg-card border-border/50",
        isHover && !isInvalid && "bg-accent/30 border-accent",
        isHover && isInvalid && "bg-destructive/20 border-destructive/40",
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.9 } : {}}
    >
      {isHit && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2/3 h-2/3 rounded-full bg-destructive/90 animate-pulse" />
        </div>
      )}
      {isMiss && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
        </div>
      )}
    </motion.button>
  );
}