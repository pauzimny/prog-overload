interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

export const StepCard = ({ step, title, description }: StepCardProps) => {
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
};
