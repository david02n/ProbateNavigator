import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SwiftLogo, SwiftLogoWithText } from "@/components/ui/SwiftLogo";
import { Menu, User, LogOut, ChevronDown, Smartphone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  label: string;
  href: string;
  onClick?: () => void;
}

const Header: React.FC = () => {
  const { user: currentUser, logoutMutation } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Handle scroll events for transparent/solid header transition
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  // Detect mobile devices for optimized experience
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsMobile(mobile);
      
      if (mobile) {
        console.log('Mobile browser detected in Header');
      }
    };
    
    checkMobile();
    
    // Log current page for debugging
    console.log('Current location:', location);
  }, [location]);

  // Define navigation items based on authentication state
  const publicNavItems: NavItem[] = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Assessment", href: "#", onClick: () => window.dispatchEvent(new CustomEvent('open-assessment')) },
    { label: "FAQ", href: "#faq" },
  ];

  const authenticatedNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Documents", href: "/dashboard?tab=documents" },
    { label: "Tasks", href: "/dashboard?tab=tasks" },
  ];

  const navItems: NavItem[] = currentUser ? authenticatedNavItems : publicNavItems;

  const handleLogout = () => {
    // Show toast for better user experience
    toast({
      title: "Logging out...",
      description: "Please wait while we sign you out",
    });
    
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Provide feedback for successful logout
        toast({
          title: "Logout successful",
          description: "You have been signed out",
        });
        
        // Use direct navigation for mobile devices to avoid caching issues
        if (isMobile) {
          console.log("Using direct navigation for mobile logout");
          window.location.href = '/';
        }
      },
      onError: (error) => {
        console.error("Logout error:", error);
        toast({
          variant: "destructive",
          title: "Logout failed",
          description: "There was a problem signing you out. Please try again.",
        });
      }
    });
  };
  
  // Handle mobile-specific login option
  const handleMobileLogin = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      // Log for debugging
      console.log("Mobile login redirect");
      
      // Try direct navigation with query params for mobile
      window.location.href = '/auth?mobile=true';
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
      scrolled ? "bg-white shadow-sm py-3" : "bg-white py-5"
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href={currentUser ? "/dashboard" : "/"}>
            <div className="flex items-center cursor-pointer">
              <SwiftLogoWithText height={36} />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {navItems.map((item, index) => (
              <li key={index}>
                {item.href.startsWith('/') ? (
                  <Link 
                    href={item.href} 
                    className="font-medium text-charcoal/90 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : item.onClick ? (
                  <button 
                    onClick={item.onClick} 
                    className="font-medium text-charcoal/90 hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    {item.label}
                  </button>
                ) : (
                  <a 
                    href={item.href} 
                    className="font-medium text-charcoal/90 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="flex items-center space-x-4">
          {currentUser ? (
            /* Authenticated user actions */
            <>
              <div className="hidden md:flex items-center">
                <div className="mr-6 text-sm text-charcoal/70 hidden lg:block">
                  Hello, {currentUser.firstName || currentUser.email.split('@')[0]}
                </div>
                <Button 
                  variant="ghost" 
                  className="hidden md:inline-flex text-charcoal/90 hover:text-primary hover:bg-transparent"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
              <Link href="/dashboard">
                <Button className="bg-primary text-white hover:bg-primary/90 rounded-full shadow-sm px-6 py-2 justify-center min-w-[120px]">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            /* Public user actions */
            <>
              <Link href="/auth" onClick={handleMobileLogin}>
                <Button 
                  variant="ghost" 
                  className="hidden md:inline-flex text-charcoal/90 hover:text-primary hover:bg-transparent"
                >
                  {isMobile ? (
                    <span className="flex items-center">
                      <Smartphone className="h-3 w-3 mr-1" />
                      Mobile Login
                    </span>
                  ) : "Log In"}
                </Button>
              </Link>
              <Link href="/auth?tab=register" onClick={handleMobileLogin}>
                <Button className="bg-primary text-white hover:bg-primary/90 rounded-full shadow-sm px-6 py-2 justify-center min-w-[120px]">
                  Get Started
                </Button>
              </Link>
            </>
          )}
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-8 pt-8">
                <div className="flex items-center">
                  <SwiftLogoWithText height={32} />
                </div>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item, index) => (
                    item.href.startsWith('/') ? (
                      <Link 
                        key={index}
                        href={item.href}
                        className="py-2 font-medium hover:text-primary transition-colors text-lg"
                      >
                        {item.label}
                      </Link>
                    ) : item.onClick ? (
                      <button 
                        key={index}
                        onClick={item.onClick} 
                        className="py-2 text-left font-medium hover:text-primary transition-colors text-lg bg-transparent border-none cursor-pointer w-full"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a 
                        key={index}
                        href={item.href}
                        className="py-2 font-medium hover:text-primary transition-colors text-lg"
                      >
                        {item.label}
                      </a>
                    )
                  ))}
                  <div className="flex flex-col gap-3 pt-6 mt-2 border-t border-gray-100">
                    {currentUser ? (
                      /* Authenticated mobile actions */
                      <>
                        <div className="text-sm text-charcoal/60 mb-2">
                          Signed in as {currentUser.firstName || currentUser.email.split('@')[0]}
                        </div>
                        <Link href="/dashboard" className="w-full">
                          <Button className="bg-primary text-white hover:bg-primary/90 w-full rounded-full py-2 justify-center">
                            Dashboard
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="border-gray-200 text-charcoal hover:bg-gray-50 w-full rounded-full py-2 justify-center"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLogout();
                          }}
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      /* Public mobile actions */
                      <>
                        <Link href="/auth?tab=register" className="w-full" onClick={handleMobileLogin}>
                          <Button className="bg-primary text-white hover:bg-primary/90 w-full rounded-full py-2 justify-center">
                            Get Started
                          </Button>
                        </Link>
                        <Link href="/auth?mobile=true" className="w-full" onClick={handleMobileLogin}>
                          <Button 
                            variant="outline" 
                            className="border-gray-200 text-charcoal hover:bg-gray-50 w-full rounded-full py-2 justify-center"
                          >
                            {isMobile ? (
                              <span className="flex items-center justify-center">
                                <Smartphone className="h-4 w-4 mr-2" />
                                Mobile Login
                              </span>
                            ) : "Log In"}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
