import { auth } from "@/lib/auth";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";
import prisma from "@/lib/prisma";
import Link from "next/link";
import "./home.css";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  // Fetch dashboard stats
  const projectWhereClause = {};

  const taskWhereClause = {};

  const [projectCount, taskCount, memberCount, completedTasks] = await Promise.all([
    prisma.project.count({
      where: projectWhereClause,
    }).catch(() => 0),
    prisma.task.count({
      where: taskWhereClause,
    }).catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.task.count({
      where: { ...taskWhereClause, status: "COMPLETED" },
    }).catch(() => 0),
  ]);

  const completionRate = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

  // Fetch recent projects
  const recentProjects = await prisma.project.findMany({
    where: projectWhereClause,
    take: 4,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { tasks: true } },
    },
  }).catch(() => []);

  // Fetch upcoming tasks
  const upcomingTasks = await prisma.task.findMany({
    where: {
      ...taskWhereClause,
      status: { not: "COMPLETED" },
      dueDate: { gte: new Date() },
    },
    take: 5,
    orderBy: { dueDate: "asc" },
    include: { project: { select: { name: true } } },
  }).catch(() => []);

  const stats = [
    {
      label: "Total Projects",
      value: projectCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      color: "primary",
    },
    {
      label: "Active Tasks",
      value: taskCount - completedTasks,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: "accent",
    },
    {
      label: "Team Members",
      value: memberCount,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: "info",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20V10" />
          <path d="M18 20V4" />
          <path d="M6 20v-4" />
        </svg>
      ),
      color: "success",
    },
  ];

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

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      LOW: "badge-info",
      MEDIUM: "badge-primary",
      HIGH: "badge-warning",
      URGENT: "badge-danger",
    };
    return styles[priority] || "badge-info";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayoutClient title="Dashboard" user={user || {}}>
      <div className="dashboard-home">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-text">
            <h2>Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋</h2>
            <p>Here&apos;s what&apos;s happening with your projects today.</p>
          </div>
          <Link href="/dashboard/projects/new" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Projects */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3>Recent Projects</h3>
              <Link href="/dashboard/projects" className="btn btn-ghost btn-sm">
                View all
              </Link>
            </div>
            <div className="card-body">
              {recentProjects.length > 0 ? (
                <div className="project-list">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="project-item"
                    >
                      <div className="project-info">
                        <div className="project-name">{project.name}</div>
                        <div className="project-meta">
                          <span>{project._count.tasks} tasks</span>
                          <span className={`badge ${getStatusBadge(project.status)}`}>
                            {project.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="project-progress">
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-label">{project.progress}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <p>No projects yet</p>
                  <Link href="/dashboard/projects/new" className="btn btn-primary btn-sm">
                    Create your first project
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h3>Upcoming Tasks</h3>
              <Link href="/dashboard/tasks" className="btn btn-ghost btn-sm">
                View all
              </Link>
            </div>
            <div className="card-body">
              {upcomingTasks.length > 0 ? (
                <div className="task-list">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="task-item">
                      <div className="task-checkbox">
                        <span className={`priority-dot priority-${task.priority.toLowerCase()}`}></span>
                      </div>
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <span>{task.project.name}</span>
                          <span>Due {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                      <span className={`badge ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p>No upcoming tasks</p>
                  <Link href="/dashboard/tasks" className="btn btn-primary btn-sm">
                    View all tasks
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutClient>
  );
}
