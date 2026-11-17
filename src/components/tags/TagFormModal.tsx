"use client"; // Dialog mit Formular.

import { useState, useTransition } from "react";

import {
  createTagAction,
  updateTagAction,
} from "@/app/(app)/decks/tags/actions";
import AuthNotice from "@/components/common/AuthNotice";
import EmojiPicker from "@/components/form/EmojiPicker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import type { TagLook } from "@/lib/tags/colors";
import ColorChoice from "./ColorChoice";

export type TagValues = TagLook & { id?: string };

export default function TagFormModal({
  tag,
  isOpen,
  onClose,
}: {
  tag: TagValues;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(tag.name);
  const [emoji, setEmoji] = useState(tag.emoji ?? "");
  const [color, setColor] = useState(tag.color);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function close() {
    setError(null);
    setFields({});
    onClose();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const input = { name, emoji, color };
      const result = tag.id
        ? await updateTagAction(tag.id, input)
        : await createTagAction(input);
      if (result.ok) {
        close();
        if (!tag.id) {
          setName("");
          setEmoji("");
          setColor("gray");
        }
        return;
      }
      const amFeld = result.fields ?? {};
      setFields(amFeld);
      setError(Object.keys(amFeld).length ? null : result.message);
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={close} className="max-w-md p-6 sm:p-8">
      <h2 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
        {tag.id ? "Tag bearbeiten" : "Neuer Tag"}
      </h2>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {error && <AuthNotice tone="error">{error}</AuthNotice>}
        <EmojiPicker value={emoji} onChange={setEmoji} name={name}>
          {/* Nicht „Name": Dort bietet iOS den eigenen Kontakt an. */}
          <Label htmlFor="tag-title">Tag</Label>
          <Input
            id="tag-title"
            autoComplete="off"
            value={name}
            autoFocus
            autoCapitalize="none"
            onChange={(event) => setName(event.target.value)}
            error={Boolean(fields.name ?? fields.emoji)}
            hint={fields.name ?? fields.emoji}
          />
        </EmojiPicker>
        <ColorChoice
          value={color}
          onChange={setColor}
          name={name.trim().toLowerCase()}
          emoji={emoji}
        />
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={close}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Wird gespeichert …" : "Speichern"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
