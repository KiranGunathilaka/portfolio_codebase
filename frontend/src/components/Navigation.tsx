import { useState } from "react";
import { Menu, X, Moon, Sun, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
//import me from "@/assets/me.png";

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navigation = ({ activeSection, setActiveSection, isDark, toggleTheme }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "portfolio", label: "Projects" },
    // { id: "services", label: "Services" },
    { id: "blog", label: "Blog" },
    { id: "education", label: "Milestones" },
    { id: "contact", label: "Contact" }
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/KiranGunathilaka", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/in/kiran-gunathilaka-1900b5188", label: "LinkedIn" },
    { icon: Mail, href: "mailto:kirangunathilaka@gmail.com", label: "Email" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <Avatar className="w-10 h-10 shrink-0">
              {/* Put your photo in /public or /src/assets and update the path */}
              <AvatarImage
                src= "https://res.cloudinary.com/dxavadkl2/image/upload/v1753638847/me_cs4dvb.png"
                alt="Kiran Gunathilaka"
                className="object-cover"
              />
              {/* Fallback shows until the image loads or if it fails */}
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                KG
              </AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold text-foreground hidden sm:block">Kiran Gunathilaka</span>
            <span className="text-lg font-bold text-foreground sm:hidden">Kiran Gunathilaka</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === item.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="ml-4"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile/Tablet Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-3 mt-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left text-sm font-medium transition-colors hover:text-primary ${activeSection === item.id ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};