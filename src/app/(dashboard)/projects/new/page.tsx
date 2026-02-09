import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createProject } from "@/lib/actions/projects";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      
      <form
        action={async (formData) => {
          "use server";
          const result = await createProject(formData);
          if (result.success) {
            redirect(`/dashboard/projects/${result.projectId}`);
          }
        }}
        className="space-y-6 bg-card p-6 rounded-lg border border-border"
      >
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="form-input w-full"
            placeholder="e.g., Website Redesign"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="form-textarea w-full"
            placeholder="Describe your project..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="btn btn-primary"
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
}
