import { StepCard } from "./step-card";

export const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">How It Works</h2>
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
  );
};
