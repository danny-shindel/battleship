import { motion } from "framer-motion";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WaitingRoom({ gameCode, status, player1Ready = false, player2Ready = false, isPlayer1 = false, opponentJoined = false }) {
  const copyCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast.success("Game code copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 py-8"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>

      {status === 'waiting' && (
        <>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold">Waiting for Opponent</h2>
            <p className="text-sm text-muted-foreground font-body">Share this code with your friend to start the battle</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-card border-2 border-dashed border-primary/30 rounded-xl px-8 py-4">
              <span className="font-heading text-3xl font-bold tracking-[0.3em] text-primary">{gameCode}</span>
            </div>
            <Button variant="outline" size="icon" onClick={copyCode}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {status === 'placing' && (
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold">Opponent is Placing Ships</h2>
          <p className="text-sm text-muted-foreground font-body">
            {isPlayer1 
              ? (player1Ready ? "You're ready! Waiting for opponent..." : "Place your ships to get ready.")
              : (player2Ready ? "You're ready! Waiting for opponent..." : "Place your ships to get ready.")}
          </p>
        </div>
      )}
    </motion.div>
  );
}