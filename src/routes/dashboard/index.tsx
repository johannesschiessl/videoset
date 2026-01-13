import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Play, Pencil, Trash2, LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async ({ context }) => {
    const session = await context.authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/auth" });
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const videos = useQuery(api.videos.getMyVideos);
  const createVideo = useMutation(api.videos.createVideo);
  const deleteVideo = useMutation(api.videos.deleteVideo);

  const handleCreateVideo = async () => {
    const videoId = await createVideo({ title: "Untitled Video" });
    navigate({ to: "/dashboard/editor/$videoId", params: { videoId } });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="bg-background min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">Videoset</h1>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Videos</h2>
          <Button onClick={handleCreateVideo}>
            <Plus className="mr-2 h-4 w-4" />
            New Video
          </Button>
        </div>

        {videos === undefined ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="bg-muted h-5 w-32 rounded" />
                  <div className="bg-muted h-4 w-24 rounded" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                You haven't created any videos yet
              </p>
              <Button onClick={handleCreateVideo}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first video
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video._id}>
                <CardHeader>
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <CardDescription>
                    {video.status === "draft" && "Draft"}
                    {video.status === "processing" && "Processing"}
                    {video.status === "published" && "Published"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate({
                          to: "/dashboard/editor/$videoId",
                          params: { videoId: video._id },
                        })
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    {video.status === "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate({
                            to: "/video/$videoId",
                            params: { videoId: video._id },
                          })
                        }
                      >
                        <Play className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVideo({ videoId: video._id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
