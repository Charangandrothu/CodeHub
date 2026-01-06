import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import spaceBg from "../assets/space-bg.jpg";

const LandingPage = () => {
  return (
    <div
      className="min-h-screen text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${spaceBg})` }}
    >
      {/* Dark overlay */}
      <div className="min-h-screen bg-black/60 backdrop-blur-sm">
        <Navbar />
        <Hero />
      </div>
    </div>
  );
};

export default LandingPage;
