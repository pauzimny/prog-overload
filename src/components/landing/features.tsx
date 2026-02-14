import {
  Activity,
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { FeatureCard } from "./feature-card";

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you reach your fitness potential
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
  );
};
