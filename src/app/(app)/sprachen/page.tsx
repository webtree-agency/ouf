import type { Metadata } from "next";

import ComponentCard from "@/components/common/ComponentCard";
import PageHeading from "@/components/common/PageHeading";
import AddLanguage from "@/components/languages/AddLanguage";
import RemoveLanguage from "@/components/languages/RemoveLanguage";
import Badge from "@/components/ui/badge/Badge";
import { sessionOrLogin } from "@/lib/auth/pageAccess";
import { counted } from "@/lib/format/plural";
import { LANGUAGES } from "@/lib/languages/catalog";
import { activeLanguage } from "@/lib/queries/languages";

export const metadata: Metadata = { title: "Sprachen" };

export default async function LanguagesPage() {
  const session = await sessionOrLogin();
  const { active, all } = await activeLanguage(session.userId);
  const vorhanden = new Set(all.map((language) => language.code));
  const choices = LANGUAGES.filter(
    (language) => !vorhanden.has(language.code),
  ).map((language) => ({
    value: language.code,
    label: language.genders ? `${language.name} (mit Genus)` : language.name,
  }));

  return (
    <>
      <PageHeading
        title="Sprachen"
        description={
          all.length === 0
            ? "Zuerst eine Sprache wählen. Darin entstehen die Decks."
            : undefined
        }
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {all.length > 0 && (
          <ComponentCard>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {all.map((language) => (
                <li
                  key={language.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {language.name}
                      </p>
                      {language.id === active?.id && (
                        <Badge size="sm" color="primary">
                          Aktiv
                        </Badge>
                      )}
                    </div>
                    <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                      {counted(language.deckCount, {
                        one: "Deck",
                        many: "Decks",
                      })}
                    </p>
                  </div>
                  <RemoveLanguage
                    id={language.id}
                    name={language.name}
                    deckCount={language.deckCount}
                  />
                </li>
              ))}
            </ul>
          </ComponentCard>
        )}
        <ComponentCard title="Sprache hinzufügen">
          <AddLanguage choices={choices} />
          {choices.length === 0 && (
            <p className="text-theme-sm text-gray-500 dark:text-gray-400">
              Alle Sprachen sind angelegt.
            </p>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
