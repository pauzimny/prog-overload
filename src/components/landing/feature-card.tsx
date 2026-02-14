interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all hover:shadow-xl hover:scale-105 hover:border-primary/30">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative flex iśtems-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 mb-6 text-primary group-hover:from-primary group-hover:to-accent group-hover:text-primary-foreground transition-all border border-primary/20">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary tranśsition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};
