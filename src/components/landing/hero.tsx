import { ArrowRight, Dumbbell, Link } from "lucide-react";
import { Button } from "../ui/button";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 pb-20 pt-4 lg:py-32">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-brfrom-primary/30 to-accent/30 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative bg-linear-to-br from-primary/10 to-accent/10 p-6 rounded-2xl border border-primary/20">
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
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/auth">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
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
  );
};
