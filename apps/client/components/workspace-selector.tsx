import { getAllProjects } from "@/app/actions/getAllProjects";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

export async function WorkspaceSelector() {
  const allProjects = await getAllProjects();
  return (
    <Select>
      <SelectTrigger className="w-full max-w-32 md:max-w-48">
        <SelectValue placeholder={allProjects[0]?.name} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Projects</SelectLabel>
          {allProjects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
