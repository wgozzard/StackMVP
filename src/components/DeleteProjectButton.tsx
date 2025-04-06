'use client';

interface DeleteProjectButtonProps {
  projectId: string;
}

export function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  return (
    <form action={`/api/projects/${projectId}/delete`} method="POST">
      <button
        type="submit"
        className="rounded-lg border border-red-900 bg-red-950 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-900 hover:text-white"
        onClick={(e) => {
          if (!confirm('Are you sure you want to delete this project?')) {
            e.preventDefault();
          }
        }}
      >
        Delete Project
      </button>
    </form>
  );
} 