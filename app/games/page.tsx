import { AlienSignalRepeat } from "@/components/alien-signal-repeat";
import { CosmicDodge } from "@/components/cosmic-dodge";
import { GameArcade } from "@/components/game-arcade";
import { QuantumBlink } from "@/components/quantum-blink";
import { SiteShell } from "@/components/site-shell";
import { VisualGameLab } from "@/components/visual-game-lab";

export default function GamesPage() {
  return (
    <SiteShell eyebrow="" title="" description="">
      <div className="space-y-8">
        <AlienSignalRepeat />
        <QuantumBlink />
        <CosmicDodge />
        <VisualGameLab />
        <GameArcade />
      </div>
    </SiteShell>
  );
}
