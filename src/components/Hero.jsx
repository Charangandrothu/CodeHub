const Hero = () => {
  return (
    <section className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center px-8">

      {/* LEFT CONTENT */}
      <div>
        <h1 className="text-6xl font-bold leading-tight tracking-tight">
          Structured <br />
          Placement <br />
          Preparation.
        </h1>

        <p className="mt-6 text-gray-300 max-w-lg leading-relaxed">
          CodeHub helps you master Coding, Aptitude, and Core CS
          through a structured learn–practice–test system
          with clear progress tracking.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="px-8 py-3 rounded-full bg-orange-500 hover:bg-orange-600 transition shadow-lg shadow-orange-500/20">
            Start Preparing for Free
          </button>
          <button className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition">
            Explore Platform
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT – FLOATING GLASS CARDS */}
      <div className="relative h-[420px]">
        <GlassCard />
        <GlassCard className="absolute top-20 left-24 scale-95" />
      </div>

    </section>
  );
};

/* GLASS CARD */
const GlassCard = ({ className = "" }) => {
  return (
    <div
      className={`w-80 p-6 rounded-2xl 
      bg-white/10 backdrop-blur-xl 
      border border-white/20 
      shadow-[0_0_40px_rgba(255,140,0,0.15)]
      ${className}`}
    >
      <h3 className="font-semibold mb-4 text-lg">DSA Progress</h3>

      <div className="space-y-3 text-sm text-gray-200">
        <Progress label="Arrays" value="12 / 30" />
        <Progress label="Binary Search" value="6 / 15" />
        <Progress label="Strings" value="4 / 12" />
      </div>
    </div>
  );
};

const Progress = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span>{label}</span>
    <span className="text-gray-400">{value}</span>
  </div>
);

export default Hero;
