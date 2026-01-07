const Navbar = () => {
  return (
    <>
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-xl font-semibold tracking-wide">
          CodeHub
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-4">
          <button className="px-5 py-2 rounded-full border border-white/20 text-sm hover:bg-white/10 transition">
            Login
          </button>
          <button className="px-6 py-2 rounded-full bg-orange-500 text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-500/20">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Subtle glowing divider */}
      <div className="h-px max-w-7xl mx-auto bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
    </>
  );
};

export default Navbar;
