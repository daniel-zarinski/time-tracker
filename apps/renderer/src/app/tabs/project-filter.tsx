import type { JiraProject } from '@time-tracker/jira';

interface ProjectFilterProps {
  value: string;
  onChange: (value: string) => void;
  projects: JiraProject[];
}

export function ProjectFilter({
  value,
  onChange,
  projects,
}: ProjectFilterProps) {
  if (projects.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="project-filter" className="text-sm font-medium">
        Project
      </label>
      <select
        id="project-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
      >
        <option value="all">All projects</option>
        {projects.map((p) => (
          <option key={p.key} value={p.key}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
