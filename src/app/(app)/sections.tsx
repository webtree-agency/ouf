import StatTiles from "@/components/stats/StatTiles";
import TodayDecks from "@/components/stats/TodayDecks";
import { listDecks } from "@/lib/queries/decks";
import { tiles } from "@/lib/queries/stats";

type Scope = { userId: string; languageId: string };

export async function TilesSection({ scope }: { scope: Scope }) {
  return <StatTiles tiles={await tiles(scope)} />;
}

export async function DecksSection({
  scope,
  languageName,
}: {
  scope: Scope;
  languageName: string;
}) {
  return (
    <TodayDecks
      decks={await listDecks(scope.userId, scope.languageId)}
      languageName={languageName}
    />
  );
}
