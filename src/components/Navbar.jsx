const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-10 py-6">
      {/* Logo */}
      <div className="text-xl font-semibold tracking-wide">
        CodeHub
      </div>

      {/* Right buttons */}
      <div className="flex items-center gap-4">
        <button className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition">
          Login
        </button>
        <button className="px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 transition">
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
