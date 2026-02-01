"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Target,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuthModal from "@/components/auth-modal";

export default function Home() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (user) {
    // Redirect logged-in users to dashboard
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-2xl border border-primary/20">
                  <Dumbbell className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Transform Your
              <span className="text-primary"> Fitness Journey</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Track workouts, monitor progress, and achieve your fitness goals
              with our comprehensive training management platform. Built for
              athletes, by athletes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => setIsOpen(true)}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
                asChild
              >
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-secondary/30 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you reach your fitness
              potential
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="h-8 w-8" />}
              title="Smart Training Plans"
              description="Create and follow personalized workout plans tailored to your goals and fitness level."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Progress Tracking"
              description="Monitor your performance with detailed analytics and visualize your improvement over time."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Workout Scheduling"
              description="Plan your training sessions and stay consistent with smart scheduling reminders."
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8" />}
              title="Exercise Library"
              description="Access comprehensive exercise database with proper form instructions and variations."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Performance Analytics"
              description="Get insights into your training patterns and optimize your workout routine."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community Support"
              description="Connect with fellow fitness enthusiasts and share your journey together."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              step="1"
              title="Create Account"
              description="Sign up for free and set up your fitness profile in minutes."
            />
            <StepCard
              step="2"
              title="Plan Workouts"
              description="Design your training schedule or choose from expert-created plans."
            />
            <StepCard
              step="3"
              title="Track Progress"
              description="Log your workouts and watch your fitness goals become reality."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already transforming their fitness.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6 bg-background text-foreground hover:bg-background/90 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:scale-105 hover:border-primary/30">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 mb-6 text-primary group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground transition-all border border-primary/20">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="text-center group">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform">
        {step}
      </div>
      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
