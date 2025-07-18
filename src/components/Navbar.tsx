const Navbar = ({}) => {
  return (
    <nav className="bg-[#b0f2ae] shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <div className="flex items-center">
            <img src="https://public-assets.wompi.com/brand_wompi/logos/logo-primary.svg" alt="logo" className="w-40 h-10" />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-xl font-bold text-black hover:text-gray-900 transition-colors duration-200">
              Juan Esteban Valdés Ospina
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 