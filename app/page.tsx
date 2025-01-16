import NameGenerator from '@/components/name-generator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-accent to-background bg-[length:400%_400%] animate-[gradient_15s_ease_infinite]">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
      <div className="container mx-auto px-4 py-12 max-w-4xl relative">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 animate-float">
            Chinese Name Generator
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover your meaningful Chinese name based on your English name and interests
          </p>
        </div>
        <NameGenerator />
      </div>
    </main>
  );
}