import { useEffect } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const Route = createFileRoute("/dashboard/editor/new")({
  beforeLoad: async ({ context }) => {
    const session = await context.authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/auth" });
    }
  },
  component: NewEditorPage,
});

function NewEditorPage() {
  const navigate = useNavigate();
  const createVideo = useMutation(api.videos.createVideo);

  useEffect(() => {
    const create = async () => {
      const videoId = await createVideo({ title: "Untitled Video" });
      navigate({
        to: "/dashboard/editor/$videoId",
        params: { videoId },
        replace: true,
      });
    };
    create();
  }, [createVideo, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        <p className="text-sm text-zinc-500">Creating new video...</p>
      </div>
    </div>
  );
}
