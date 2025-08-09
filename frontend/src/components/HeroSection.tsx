import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, Download, MessageCircle } from "lucide-react";

export const HeroSection = () => {
  const rotatingSubtitles = ["Robotics", "Embedded Systems", "Full-Stack Software"];

  // Responsive particle count logic
  const [pointCount, setPointCount] = useState(60); // default desktop

  const getPointCount = (width: number) => {
    if (width < 640) return 20;       // Mobile
    if (width < 1024) return 40;      // Tablet
    return 60;                        // Desktop
  };

  useEffect(() => {
    const updatePoints = () => setPointCount(getPointCount(window.innerWidth));
    updatePoints(); // run once on mount
    window.addEventListener("resize", updatePoints);
    return () => window.removeEventListener("resize", updatePoints);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-hero">
      {/* Background Animation - Circuit Pattern */}
      {/* <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 border border-primary rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-amber rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 border border-electric-cyan rounded-full animate-pulse delay-500"></div>
      </div> */}

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(pointCount)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-primary rounded-full animate-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Greeting */}
          <p className="text-lg text-muted-foreground mb-4 animate-fade-in">
            Hi, I'm Kiran Lokanjana Gunathilaka!
          </p>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in animation-delay-200">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Innovative
            </span>{" "}
            <span className="text-foreground">
              Systems Developer
            </span>
          </h1>

          {/* Rotating Subtitle */}
          <div className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in animation-delay-400">
            <span>Specializing in </span>
            <span className="text-primary font-medium">
              Robotics · Embedded Systems · Software
            </span>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in animation-delay-600">
            Building complete solutions from custom PCBs and bare-metal firmware to cloud-hosted applications.
            Bridging the gap between hardware and software for next-generation technology.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center animate-fade-in animation-delay-800">
            <Button
              size="lg"
              className="bg-gradient-primary hover:shadow-hover transition-all duration-300 group"
              onClick={() => {
                const contactSection = document.getElementById("contact");
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Hire Me
            </Button>
          </div>


          {/* Scroll Indicator */}
          <button
            onClick={() => {
              const aboutSection = document.getElementById('about');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="absolute bottom-[-4rem] left-1/2 transform -translate-x-1/2 animate-bounce hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowDown className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </section>
  );
};
