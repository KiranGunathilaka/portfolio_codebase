import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  ExternalLink,
  Send,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import emailjs from '@emailjs/browser';

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // EmailJS configuration
  const EMAILJS_CONFIG = {
    publicKey: "7jFkgEY2jthFQGfsc",
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_3fh47fh",
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_w7kpl3k"
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "kirangunathilaka@gmail.com",
      href: "mailto:kirangunathilaka@gmail.com",
      description: "Primary contact"
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: "kiran-gunathilaka",
      href: "https://linkedin.com/in/kiran-gunathilaka-1900b5188",
      description: "Professional network and experience"
    },
    {
      icon: Github,
      label: "GitHub",
      value: "KiranGunathilaka",
      href: "https://github.com/KiranGunathilaka",
      description: "Open source projects and code repositories"
    },
    {
      icon: ExternalLink,
      label: "GrabCAD",
      value: "kiran.gunathilaka",
      href: "https://grabcad.com/kiran.gunathilaka-1",
      description: "3D designs and mechanical designs"
    }
  ];

  const quickContacts = [
    {
      title: "Quick Discussion",
      description: "Have a quick question or want to discuss a potential project?",
      action: "Send Message",
      preferred: true
    },
    {
      title: "Project Consultation",
      description: "Need detailed technical consultation for your project?",
      action: "Schedule Call",
      preferred: false
    },
    {
      title: "Collaboration",
      description: "Interested in long-term collaboration or partnership?",
      action: "Let's Connect",
      preferred: false
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Initialize EmailJS with public key
      emailjs.init(EMAILJS_CONFIG.publicKey);

      // Prepare template parameters that match your EmailJS template
      const templateParams = {
        to_name: "Kiran", // Your name as the recipient
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        reply_to: formData.email
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log('Email sent successfully:', response);

      toast({
        title: "Message sent successfully!",
        description: "Thank you for reaching out. I'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });

    } catch (error) {
      console.error('Error sending email:', error);
      
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message. Please try again or contact me directly via email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get In <span className="text-primary">Touch</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to bring your ideas to life? Let's discuss your project and explore
              how I can help achieve your technical goals.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="bg-gradient-card border-border/20 shadow-glass">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Send Me a Message
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-foreground">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="mt-2"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-foreground">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="mt-2"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-foreground">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                        placeholder="Project inquiry, consultation, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-foreground">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        className="mt-2 min-h-[120px]"
                        placeholder="Tell me about your project, timeline, and any specific requirements..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-primary hover:shadow-hover transition-all duration-300 group"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      🔒 Your information is secure and will never be shared with third parties.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Direct Contact */}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Direct Contact
              </h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="bg-gradient-card border-border/20 shadow-card hover:shadow-hover transition-all duration-300 group">
                      <CardContent className="p-6">
                        <a
                          href={info.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-4 text-foreground hover:text-primary transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{info.label}</h4>
                            <p className="text-primary">{info.value}</p>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </a>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="space-y-6 mt-6">
                {/* Location */}
                <Card className="bg-gradient-card border-border/20 shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Location</h4>
                        <p className="text-muted-foreground">Colombo, Sri Lanka</p>
                        <p className="text-sm text-muted-foreground">Available for remote work globally</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Response Time */}
                <Card className="bg-gradient-card border-primary/20 shadow-glass">
                  <CardContent className="p-6 text-center">
                    <h4 className="font-semibold text-foreground mb-2">Response Time</h4>
                    <p className="text-2xl font-bold text-primary mb-2">&lt; 24 Hours</p>
                    <p className="text-sm text-muted-foreground">
                      I typically respond to all inquiries within 24 hours during business days.
                    </p>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-card border-border/20 shadow-glass">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Let's Build Something Amazing Together
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Whether you have a clear vision or just an idea, I'm here to help bring your
                  technical projects to life. From concept to deployment, let's create innovative solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-gradient-primary hover:shadow-hover transition-all duration-300"
                    asChild
                  >
                    <a href="mailto:kirangunathilaka@gmail.com">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Me Directly
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                  >
                    <a href="https://linkedin.com/in/kiran-gunathilaka-1900b5188" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" />
                      Connect on LinkedIn
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};