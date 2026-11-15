import type { Metadata } from "next";

import ComponentCard from "@/components/common/ComponentCard";
import PageHeading from "@/components/common/PageHeading";
import NewDeckButton from "@/components/decks/NewDeckButton";
import ExportForm from "@/components/transfer/ExportForm";
import ImportForm from "@/components/transfer/ImportForm";
import { requireLanguage } from "@/lib/languages/pageLanguage";
import { listDecks } from "@/lib/queries/decks";

export const metadata: Metadata = { title: "Import und Export" };

export default async function TransferPage() {
  const { session, language } = await requireLanguage();
  const decks = (await listDecks(session.userId, language.id)).map((deck) => ({
    value: deck.id,
    label: deck.name,
  }));

  return (
    <>
      <PageHeading title="Import und Export" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard
          title="Importieren"
          desc={`In ${language.name}. Aus Anki: Notizen als Text exportieren.`}
        >
          {decks.length > 0 ? <ImportForm decks={decks} /> : <NewDeckButton />}
        </ComponentCard>
        <ComponentCard
          title="Exportieren"
          desc={`Alle Felder, eine Zeile je Karte, aus ${language.name}.`}
        >
          <ExportForm decks={decks} />
        </ComponentCard>
      </div>
    </>
  );
}
