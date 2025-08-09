import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { SkillsSection } from "@/components/SkillsSection";
import { PortfolioSection } from "@/components/PortfolioSection";
import { ServicesSection } from "@/components/ServicesSection";
import { BlogSection } from "@/components/BlogSection";
import { MilestoneSection } from "@/components/MilestoneSection";
import { ContactSection } from "@/components/ContactSection";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
//import me from "@/assets/me.png";


const PortfolioContent = () => {
  const [activeSection, setActiveSection] = useState("home");
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Handle scroll-based section detection
  useEffect(() => {
    const sections = ["home", "about", "skills", "portfolio", "services", "blog", "education", "contact"];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setActiveSection(sectionId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={scrollToSection}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      
      <main>
        <section id="home">
          <HeroSection />
        </section>
        
        <section id="about">
          <AboutSection />
        </section>
        
        <section id="skills">
          <SkillsSection />
        </section>
        
        <section id="portfolio">
          <PortfolioSection />
        </section>
        
        {/* <section id="services">
          <ServicesSection />
        </section> */}
        
        <section id="blog">
          <BlogSection />
        </section>
        
        <section id="education">
          <MilestoneSection />
        </section>
        
        <section id="contact">
          <ContactSection />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
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
            <span className="text-lg font-semibold text-foreground">Kiran Gunathilaka</span>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Systems Developer • Robotics • Embedded Systems • Full-Stack Software
          </p>
          <p className="text-xs text-muted-foreground">
            © 2024 Kiran Lokanjana Gunathilaka. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="kiran-portfolio-theme">
      <PortfolioContent />
    </ThemeProvider>
  );
};

export default Index;
