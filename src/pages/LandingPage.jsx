import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import bgImage from "../assets/bg_image.jpg";

const LandingPage = () => {
  return (
    <div
      className="relative min-h-screen text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark overlay */}
      <div className="relative min-h-screen bg-black/70 backdrop-blur-sm">
        
        {/* Glow effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-orange-500/10 blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/10 blur-[120px]" />
        </div>

        {/* Centered content container */}
        <div className="relative max-w-7xl mx-auto px-6">
          <Navbar />
          <Hero />
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
