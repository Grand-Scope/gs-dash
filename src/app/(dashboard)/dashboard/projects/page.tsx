import { auth } from "@/lib/auth";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";
import prisma from "@/lib/prisma";
import Link from "next/link";
import "./projects.css";

export default async function ProjectsPage() {
  const session = await auth();
  const user = session?.user;

  const projects = await prisma.project.findMany({
    where: {},
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { name: true, image: true } },
      _count: { select: { tasks: true, members: true } },
    },
  }).catch(() => []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PLANNING: "badge-info",
      IN_PROGRESS: "badge-primary",
      ON_HOLD: "badge-warning",
      COMPLETED: "badge-success",
      CANCELLED: "badge-danger",
    };
    return styles[status] || "badge-info";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <DashboardLayoutClient title="Projects" user={user || {}}>
      <div className="projects-page">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <h2>All Projects</h2>
            <p>Manage and track all your team projects</p>
          </div>
          <Link href="/dashboard/projects/new" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="project-card card"
              >
                <div className="project-card-header">
                  <div className="project-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span className={`badge ${getStatusBadge(project.status)}`}>
                    {project.status.replace("_", " ")}
                  </span>
                </div>

                <h3 className="project-card-title">{project.name}</h3>
                <p className="project-card-desc">
                  {project.description || "No description provided"}
                </p>

                <div className="project-card-progress">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted">Progress</span>
                    <span className="text-sm font-semibold">{project.progress}%</span>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="project-card-meta">
                  <div className="project-card-dates">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </div>
                  <div className="project-card-stats">
                    <span title="Tasks">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      {project._count.tasks}
                    </span>
                    <span title="Members">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      {project._count.members + 1}
                    </span>
                  </div>
                </div>

                <div className="project-card-footer">
                  <div className="project-card-owner">
                    <div className="avatar avatar-sm">
                      {project.owner.image ? (
                        <img src={project.owner.image} alt={project.owner.name || ""} />
                      ) : (
                        project.owner.name?.[0] || "U"
                      )}
                    </div>
                    <span>{project.owner.name || "Unknown"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state-large">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>No projects yet</h3>
            <p>Get started by creating your first project</p>
            <Link href="/dashboard/projects/new" className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Project
            </Link>
          </div>
        )}
      </div>
    </DashboardLayoutClient>
  );
}
