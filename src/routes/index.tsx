import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Play, Layers, MessageCircleQuestion, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-amber-500">
              <Play className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-semibold">Videoset</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-zinc-200"
              >
                Sign in
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-white text-zinc-900 hover:bg-zinc-200">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Now in public beta
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl leading-tight font-bold tracking-tight md:text-6xl lg:text-7xl">
            Create{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              interactive
            </span>{" "}
            videos that{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              engage
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            Build branching video experiences with interactive questions. Let
            viewers choose their own path and create personalized journeys.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/auth">
              <Button
                size="lg"
                className="h-12 gap-2 bg-white px-6 text-zinc-900 hover:bg-zinc-200"
              >
                Start Creating
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 border-zinc-700 px-6 hover:bg-zinc-800"
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <Layers className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Chapters</h3>
              <p className="text-zinc-400">
                Organize your content with chapters. Help viewers navigate to
                the sections that matter most to them.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                <MessageCircleQuestion className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Interactive Questions
              </h3>
              <p className="text-zinc-400">
                Add multiple-choice questions that pause the video. Each answer
                leads to a different timestamp.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <Play className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Guided Experience</h3>
              <p className="text-zinc-400">
                Viewers can't skip ahead. They must watch and interact, creating
                a focused learning experience.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-12 text-center">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mx-auto mt-4 max-w-lg text-zinc-400">
              Create your first interactive video in minutes. No credit card
              required.
            </p>
            <Link to="/auth">
              <Button
                size="lg"
                className="mt-8 h-12 gap-2 bg-white px-8 text-zinc-900 hover:bg-zinc-200"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-amber-500">
                <Play className="h-3 w-3 text-white" fill="white" />
              </div>
              Videoset
            </div>
            <p className="text-sm text-zinc-600">
              Built with Convex, React, and TanStack Router
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
