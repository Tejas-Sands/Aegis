import { Link, useLocation } from "react-router";
import { Shield, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const lastHideY = useRef(0);

  const isLanding = location.pathname === "/";
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      setScrolled(currentY > 60);

      // Hide navbar when scrolling down past 200px, show when scrolling up
      if (currentY > 200) {
        if (delta > 6 && currentY - lastHideY.current > 60) {
          setHidden(true);
          lastHideY.current = currentY;
        } else if (delta < -6) {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease",
        background: scrolled || !isLanding
          ? "rgba(0,0,0,0.85)"
          : "transparent",
        backdropFilter: scrolled || !isLanding ? "blur(20px) saturate(180%)" : undefined,
        borderBottom: scrolled || !isLanding ? "1px solid rgba(255,255,255,0.06)" : "none",
        mixBlendMode: (!scrolled && isLanding) ? "difference" : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" style={{ cursor: "none" }}>
            <Shield className="w-5 h-5 text-neon-green group-hover:drop-shadow-[0_0_8px_rgba(0,255,148,0.8)] transition-all duration-300" />
            <span
              className="text-white font-mono tracking-[0.2em] text-xs"
              style={{ fontWeight: 400, letterSpacing: "0.2em" }}
            >
              AEGIS
            </span>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-7">
            <LetterLink to="/about" active={isActive("/about")}>Lore</LetterLink>
            {isAuthenticated && (
              <>
                <LetterLink to="/dashboard" active={isActive("/dashboard")}>The Deck</LetterLink>
                <LetterLink to="/incidents" active={isActive("/incidents")}>Bounties</LetterLink>
                <LetterLink to="/settings" active={isActive("/settings")}>Ship Config</LetterLink>
              </>
            )}
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-xs text-white/40 font-mono tracking-wide">{user?.name ?? "Pirate"}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-white/40 hover:text-white font-mono tracking-wide transition-colors duration-300 flex items-center gap-1.5"
                  style={{ cursor: "none" }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Abandon Ship</span>
                </button>
              </div>
            ) : (
              <Link to="/login" style={{ cursor: "none" }}>
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-white/50 hover:text-white transition-colors duration-300 border border-white/15 hover:border-white/40 px-4 py-2 rounded-full">
                  <LogIn className="w-3 h-3" />
                  BOARD SHIP
                </div>
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

/* Individual letter wave link */
function LetterLink({ to, active, children }: { to: string; active: boolean; children: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    if (!linkRef.current) return;
    const letters = linkRef.current.querySelectorAll(".nav-letter");
    gsap.fromTo(letters,
      { y: 0 },
      {
        y: -3,
        duration: 0.25,
        ease: "power2.out",
        stagger: 0.04,
        yoyo: true,
        repeat: 1,
      }
    );
  };

  return (
    <Link
      ref={linkRef}
      to={to}
      onMouseEnter={handleMouseEnter}
      style={{ cursor: "none" }}
      className={`text-xs font-mono tracking-[0.12em] transition-colors duration-300 flex gap-[1px] ${
        active ? "text-white" : "text-white/40 hover:text-white"
      }`}
    >
      {children.split("").map((letter, i) => (
        <span key={i} className="nav-letter inline-block" style={{ willChange: "transform" }}>
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </Link>
  );
}
