const Hero = () => {
  return (
    <section className="px-10 mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      
      {/* LEFT CONTENT */}
      <div>
        <h1 className="text-5xl font-bold leading-tight">
          Structured <br />
          Placement <br />
          Preparation.
        </h1>

        <p className="mt-6 text-gray-300 max-w-xl">
          CodeHub helps you master Coding, Aptitude, and Core CS
          through a structured learn-practice-test system
          with clear progress tracking.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="px-8 py-3 rounded-full bg-orange-500 hover:bg-orange-600 transition">
            Start Preparing for Free
          </button>
          <button className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition">
            Explore Platform
          </button>
        </div>
      </div>

      {/* RIGHT GLASS CARDS */}
      <div className="relative">
        <GlassCard title="DSA Progress" />
        <GlassCard title="DSA Progress" className="absolute top-16 left-16" />
      </div>

    </section>
  );
};

export default Hero;
