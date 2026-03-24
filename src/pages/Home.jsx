import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { generateGameCode } from "@/lib/gameUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Anchor, Swords, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

function Home() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const user = await base44.auth.me();
    const code = generateGameCode();
    const game = await base44.entities.Game.create({
      code,
      status: "waiting",
      player1_email: user.email,
      player1_ready: false,
      player2_ready: false,
      player1_attacks: "[]",
      player2_attacks: "[]",
    });
    navigate(`/game/${game.id}`);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a game code");
      return;
    }
    setJoining(true);
    const user = await base44.auth.me();
    const games = await base44.entities.Game.filter({ code: joinCode.trim().toUpperCase() });
    if (games.length === 0) {
      toast.error("Game not found");
      setJoining(false);
      return;
    }
    const game = games[0];
    if (game.player2_email) {
      if (game.player1_email === user.email || game.player2_email === user.email) {
        navigate(`/game/${game.id}`);
        return;
      }
      toast.error("Game is full");
      setJoining(false);
      return;
    }
    if (game.player1_email === user.email) {
      navigate(`/game/${game.id}`);
      return;
    }
    await base44.entities.Game.update(game.id, {
      player2_email: user.email,
      status: "placing",
    });
    navigate(`/game/${game.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md space-y-10"
      >
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20"
          >
            <Anchor className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
            Battleship
          </h1>
          <p className="text-muted-foreground font-body text-sm max-w-xs mx-auto">
            Deploy your fleet, hunt the enemy, and sink them all. Two players, one ocean, no mercy.
          </p>
        </div>

        {/* Create Game */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="w-full h-14 text-base gap-3 rounded-xl"
            size="lg"
          >
            <Swords className="w-5 h-5" />
            {creating ? "Creating..." : "Create New Game"}
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-body uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Join Game */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter game code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                className="h-14 text-center font-heading text-lg tracking-widest uppercase"
                maxLength={6}
              />
              <Button
                onClick={handleJoin}
                disabled={joining}
                variant="outline"
                className="h-14 px-6 rounded-xl gap-2"
              >
                <Users className="w-4 h-4" />
                {joining ? "..." : "Join"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground/60 font-body uppercase tracking-widest">
          Classic Naval Strategy Game
        </p>
      </motion.div>
    </div>
  );
}

export { Home };
export default Home;