import { ArrowRight, Link } from "lucide-react";
import { Button } from "../ui/button";

export const CTA = () => {
  return (
    <section className="py-20 bg-linear-to-br from-primary via-primary/90 to-accent text-primary-foreground relative overflow-hidden">
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
          asChild
        >
          <Link href="/auth">
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
};
