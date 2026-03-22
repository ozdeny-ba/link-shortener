import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUpButton } from "@clerk/nextjs";
import {
  Link2,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Home(): Promise<React.JSX.Element> {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 gap-6">
        <Badge variant="secondary" className="mb-2">
          Free to use &mdash; no credit card required
        </Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-3xl">
          Shorten links.{" "}
          <span className="text-muted-foreground">Share smarter.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Turn any long URL into a clean, shareable short link in seconds. Track
          clicks and manage all your links from a single dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <SignUpButton mode="modal">
            <Button size="lg" className="gap-2">
              Get started for free <ArrowRight className="size-4" />
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="px-4 py-20 bg-muted/40 border-t border-border"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-12">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need
            </h2>
            <p className="text-muted-foreground max-w-md">
              A simple but powerful toolkit for link management, built for
              individuals and teams alike.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 mb-3">
                  <Zap className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">Instant shortening</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Paste any URL and get a short link instantly. No setup, no
                  waiting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 mb-3">
                  <Link2 className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">Custom slugs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Choose a memorable custom slug for your links so they&apos;re
                  easy to share and recognise.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 mb-3">
                  <MousePointerClick className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">Click tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See how many times each link has been clicked and understand
                  your audience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 mb-3">
                  <BarChart3 className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">Link dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage, edit, and delete all your short links from one
                  organised dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24 flex flex-col items-center text-center gap-6">
        <div className="flex items-center justify-center size-14 rounded-full bg-primary/10">
          <Shield className="size-7 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight max-w-md">
          Ready to start shortening?
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Create your free account and start managing your links in under a
          minute.
        </p>
        <SignUpButton mode="modal">
          <Button size="lg" className="gap-2">
            Create free account <ArrowRight className="size-4" />
          </Button>
        </SignUpButton>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Link Shortener. All rights reserved.
      </footer>
    </div>
  );
}


