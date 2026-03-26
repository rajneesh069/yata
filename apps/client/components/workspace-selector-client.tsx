"use client";

import { getAllWorkspaces } from "@/app/actions/getAllWorkspaces";
import { Workspace } from "@/types/workspace";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useQueryState } from "nuqs";
export function WorkspaceSelectorClient({
  workspaces: initialWorkspaces,
  id,
}: {
  workspaces: Workspace[];
  id: string;
}) {
  const { data: workspaces } = useSuspenseQuery({
    queryKey: ["all-workspaces", id],
    initialData: initialWorkspaces,
    staleTime: Infinity,
    queryFn: getAllWorkspaces,
  });

  const [projectId, setProjectId] = useQueryState("w", {
    scroll: false,
    shallow: false,
    defaultValue: String(initialWorkspaces[0]?.id),
  });

  async function handleProjectIdChange(v: string) {
    setProjectId(v);
  }

  return (
    <Select value={projectId} onValueChange={handleProjectIdChange}>
      <SelectTrigger className="w-full max-w-32 md:max-w-48">
        <SelectValue placeholder={workspaces[0]?.name} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Projects</SelectLabel>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
