"use client"; // Tippen schreibt entprellt in die Adresse; gefiltert wird auf dem Server.

import FilterBar, { FilterSearch } from "@/components/common/FilterBar";
import FilterSelect, {
  type FilterOption,
} from "@/components/common/FilterSelect";
import { useUrlSearch } from "@/hooks/useUrlSearch";
import { GENDER_LABELS } from "@/lib/languages/catalog";

const GENDER_OPTIONS: FilterOption[] = [
  { value: "m", label: GENDER_LABELS.m },
  { value: "f", label: GENDER_LABELS.f },
];

export const CARD_FILTER_PARAMS = ["suche", "deck", "tag", "genus", "seite"];

export default function CardFilters({
  decks,
  tags,
  genders,
}: {
  decks: FilterOption[];
  tags: FilterOption[];
  genders: boolean;
}) {
  const [query, setQuery] = useUrlSearch("suche");

  return (
    <FilterBar
      columns={genders ? 4 : 3}
      params={CARD_FILTER_PARAMS}
      onReset={() => setQuery("")}
    >
      <FilterSearch id="filter-suche" value={query} onChange={setQuery} />
      <FilterSelect
        param="deck"
        label="Deck"
        options={decks}
        allLabel="Alle Decks"
      />
      {tags.length > 0 ? (
        <FilterSelect
          param="tag"
          label="Tag"
          options={tags}
          allLabel="Alle Tags"
        />
      ) : null}
      {genders && (
        <FilterSelect
          param="genus"
          label="Genus"
          options={GENDER_OPTIONS}
          allLabel="Alle"
        />
      )}
    </FilterBar>
  );
}
