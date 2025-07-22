import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Cpu, Globe, ArrowRight, Check } from "lucide-react";

export const ServicesSection = () => {
  const services = [
    {
      icon: Bot,
      title: "Robotics R&D",
      description: "End-to-end robotics solutions from concept to deployment",
      features: [
        "Autonomous navigation systems",
        "Computer vision integration",
        "ROS 2 development",
        "Sensor fusion & SLAM",
        "Robot simulation & testing",
        "Hardware-software integration"
      ],
      technologies: ["ROS 2", "OpenCV", "C++", "Python", "Gazebo", "Webots"],
      pricing: "Starting at $150/hour",
      popular: false
    },
    {
      icon: Cpu,
      title: "Embedded Firmware",
      description: "Custom firmware development for microcontroller systems",
      features: [
        "Bare-metal programming",
        "Real-time systems (RTOS)",
        "IoT device development",
        "Power optimization",
        "Communication protocols",
        "Hardware debugging"
      ],
      technologies: ["C/C++", "ESP32", "STM32", "Arduino", "FreeRTOS", "Altium"],
      pricing: "Starting at $120/hour",
      popular: true
    },
    {
      icon: Globe,
      title: "Full-Stack Applications",
      description: "Modern web applications with cloud infrastructure",
      features: [
        "React/Next.js development",
        "Backend API development",
        "Database design",
        "Cloud deployment",
        "Real-time dashboards",
        "Mobile-responsive design"
      ],
      technologies: ["React", "Node.js", "TypeScript", "Docker", "AWS", "MongoDB"],
      pricing: "Starting at $100/hour",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "What engagement models do you offer?",
      answer: "I offer flexible engagement models including hourly consulting, fixed-scope projects, and ongoing technical mentorship. We can discuss the best approach based on your project needs and timeline."
    },
    {
      question: "How do you handle cross-domain projects?",
      answer: "My strength lies in bridging hardware and software domains. I can handle complete system integration from PCB design to cloud deployment, ensuring seamless communication between all components."
    },
    {
      question: "Do you provide ongoing support and maintenance?",
      answer: "Yes, I offer maintenance packages and ongoing support for deployed systems. This includes bug fixes, feature updates, performance optimization, and technical consultation."
    },
    {
      question: "What's your typical project timeline?",
      answer: "Project timelines vary based on complexity. Simple firmware projects may take 2-4 weeks, while complete robotics systems can take 2-6 months. I provide detailed timeline estimates during the consultation phase."
    },
    {
      question: "Can you work with existing teams?",
      answer: "Absolutely! I frequently collaborate with existing development teams, providing specialized expertise in robotics, embedded systems, or full-stack development as needed."
    }
  ];

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              My <span className="text-primary">Services</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive technical solutions spanning robotics, embedded systems, and full-stack development. 
              From prototype to production, I deliver end-to-end engineering services.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card 
                  key={index}
                  className={`group bg-gradient-card border-border/20 shadow-glass hover:shadow-hover transition-all duration-500 relative overflow-hidden ${
                    service.popular ? "border-primary/40 shadow-glow" : ""
                  }`}
                >
                  {/* Popular Badge */}
                  {service.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <CardContent className="p-8">
                    {/* Service Header */}
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{service.title}</h3>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Technologies */}
                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Key Technologies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.technologies.map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-center border-t border-border pt-6">
                      <div className="text-2xl font-bold text-primary mb-4">{service.pricing}</div>
                      <Button 
                        className={`w-full group/btn ${
                          service.popular 
                            ? "bg-gradient-primary hover:shadow-hover" 
                            : "variant-outline"
                        }`}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Engagement Models */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-center mb-12">
              Flexible <span className="text-primary">Engagement Models</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gradient-card border-border/20 shadow-card">
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Consulting</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Hourly technical consultation for specific challenges, code reviews, and architectural guidance.
                  </p>
                  <div className="text-lg font-bold text-primary">$100-150/hour</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-border/20 shadow-card">
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Fixed-Scope Projects</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Complete project delivery with defined scope, timeline, and deliverables. Perfect for specific features or systems.
                  </p>
                  <div className="text-lg font-bold text-primary">Custom Quote</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-border/20 shadow-card">
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Technical Mentorship</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    Ongoing guidance for teams or individuals looking to enhance their technical capabilities in my areas of expertise.
                  </p>
                  <div className="text-lg font-bold text-primary">$75/hour</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-12">
              Frequently Asked <span className="text-primary">Questions</span>
            </h3>
            <div className="space-y-6 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-gradient-card border-border/20 shadow-card">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h4>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          {/* <div className="text-center mt-16">
            <Card className="bg-gradient-card border-primary/20 shadow-glass">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Ready to Start Your Project?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Let's discuss your technical challenges and explore how my expertise can help bring your ideas to life. 
                  Free initial consultation to understand your requirements.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-primary hover:shadow-hover transition-all duration-300">
                    Schedule Consultation
                  </Button>
                  <Button variant="outline">
                    View Case Studies
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </div>
    </section>
  );
};