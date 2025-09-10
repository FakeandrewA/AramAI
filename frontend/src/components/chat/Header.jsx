const Header = () => {
  return (
    <header className="relative flex items-center justify-between px-8 py-3 bg-[linear-gradient(var(--gradient-header))] z-10">
      {/* Subtle overlay */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay bg-[url('/api/placeholder/100/100')]"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

      {/* Logo / Title */}
      <div className="flex items-center relative">
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1.5 h-6 bg-teal-400 rounded-full opacity-80"></div>
        <span className="font-heading font-bold text-xl tracking-tight text-white">
          ARAM AI
        </span>
      </div>
    </header>
  )
}

export default Header
