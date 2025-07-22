import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import profile from "@/assets/profile.jpeg";


export const AboutSection = () => {
  const stats = [
    { number: "4+", label: "Years Experience", description: "Academic & Project Work" },
    { number: "15+", label: "Projects Completed", description: "Robotics & Software" },
    { number: "3+", label: "Ongoing Projects", description: "Active Development" }
  ];

  const highlights = [
    "End-to-end problem solving from hardware to cloud",
    "Expertise in autonomous robotics and IoT systems",
    "Cross-domain fluency in embedded and web technologies",
    "Leadership experience in competitive robotics teams",
    "Open source contributor and technical mentor"
  ];

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-primary">Me</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              I'm Kiran Lokanjana Gunathilaka, a Systems Developer who builds complete solutions—from
              custom PCBs and bare-metal firmware to cloud-hosted applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Profile Image Placeholder */}
            <div className="order-2 md:order-1">
              <div className="relative">
                <div className="w-full max-w-md mx-auto h-96 rounded-2xl bg-gradient-card shadow-glass border border-border/20 backdrop-blur-sm
                    flex items-center justify-center overflow-hidden">

                  {/* Avatar with subtle glow */}
                  <img
                    src= {profile}
                    alt="Kiran Gunathilaka"
                  />
                </div>

                {/* Decorative Elements (unchanged) */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-xl" />
              </div>
            </div>
            {/* Bio Content */}
            <div className="order-1 md:order-2 space-y-6">
              <div className="prose prose-lg dark:prose-invert">
                <p className="text-foreground leading-relaxed">
                  Currently pursuing B.Sc. Electronic & Telecommunication Engineering at the University of Moratuwa,
                  I specialize in creating innovative solutions that bridge the physical and digital worlds.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  My expertise spans from designing custom PCBs and developing bare-metal firmware to creating
                  sophisticated web applications and cloud architectures. I'm passionate about autonomous robotics,
                  IoT systems, and building technology that makes a meaningful impact.
                </p>
              </div>

              {/* Mission & Values */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Mission & Values</h3>
                <div className="space-y-2">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <p className="text-muted-foreground">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currently Panel */}
              <Card className="bg-gradient-card border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <h4 className="font-semibold text-foreground">Currently</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">🎓 B.Sc. Electronic & Telecommunication Engineering</p>
                    <p className="text-sm text-muted-foreground">📍 University of Moratuwa • CGPA 3.74</p>
                    <p className="text-sm text-muted-foreground">🎯 Expected Graduation: 2027</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary">Available for Freelance</Badge>
                      <Badge variant="outline">Open to Internships</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-gradient-card border-border/20 shadow-glass hover:shadow-hover transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-1">{stat.label}</h4>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};