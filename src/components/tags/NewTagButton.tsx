"use client"; // Öffnet den Dialog.

import { useState } from "react";

import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import TagFormModal from "./TagFormModal";

export default function NewTagButton({
  variant = "primary",
}: {
  variant?: "primary" | "outline";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant={variant}
        onClick={() => setOpen(true)}
        startIcon={<PlusIcon />}
      >
        Neuer Tag
      </Button>
      <TagFormModal
        tag={{ name: "", emoji: null, color: "gray" }}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
