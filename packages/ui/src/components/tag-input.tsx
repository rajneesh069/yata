"use client";
import { useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { XIcon } from "lucide-react";

type TagInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  id: string;
};

export function TagInput({ value = [], onChange, id }: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag() {
    if (!input || value?.includes(input)) return;
    onChange([...value, input.toLowerCase()]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value?.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {value?.map((tag, idx) => (
          <Badge
            key={`${tag}-${idx}`}
            className="flex gap-1 cursor-pointer"
            onClick={() => removeTag(tag)}
          >
            {tag}
            <XIcon size={12} />
          </Badge>
        ))}
      </div>

      <Input
        value={input}
        id={id}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder="tag"
      />
    </div>
  );
}
