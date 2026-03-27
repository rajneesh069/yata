"use client";

import { getAllWorkspaces } from "@/app/actions/getAllWorkspaces";
import { Workspace } from "@/types/workspace";
import { useQuery } from "@tanstack/react-query";
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
  const { data: workspaces } = useQuery({
    queryKey: ["all-workspaces", id],
    initialData: initialWorkspaces,
    staleTime: Infinity,
    queryFn: getAllWorkspaces,
  });

  const [workspaceId, setWorkspaceId] = useQueryState("w", {
    scroll: false,
    shallow: false,
  });

  async function handleworkspaceIdChange(v: string) {
    setWorkspaceId(v);
  }

  return (
    <Select
      value={workspaceId ?? workspaces[0]?.id}
      onValueChange={handleworkspaceIdChange}
    >
      <SelectTrigger className="w-full max-w-32 md:max-w-48">
        <SelectValue placeholder={"Workspaces"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Workspaces</SelectLabel>
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
