import DeckList from "@/components/home/DeckList";
import TodayCard from "@/components/home/TodayCard";
import { listDecks } from "@/lib/queries/decks";

type Scope = { userId: string; languageId: string };

export async function TodaySection({ scope }: { scope: Scope }) {
  const decks = await listDecks(scope.userId, scope.languageId);
  return (
    <>
      <TodayCard decks={decks} />
      <DeckList decks={decks} />
    </>
  );
}
