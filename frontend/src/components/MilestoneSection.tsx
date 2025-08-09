import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, GraduationCap, Award, Calendar, ExternalLink } from "lucide-react";
import ApiService from "../services/api";

interface Milestone {
  _id: string;
  type: 'education' | 'certification';
  title: string;
  institution?: string;
  issuer?: string;
  period?: string;
  date?: string;
  status?: string;
  grade?: string;
  gpa?: string;
  recentGPA?: string;
  description?: string;
  achievements?: string[];
  coursework?: string[];
  certType?: string;
  order: number;
}

export const MilestoneSection = () => {
  const [education, setEducation] = useState<Milestone[]>([]);
  const [certifications, setCertifications] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getMilestones();
        const milestones = response.milestones || [];

        // Separate education and certifications
        const educationData = milestones
          .filter((milestone: Milestone) => milestone.type === 'education')
          .sort((a: Milestone, b: Milestone) => (b.order || 0) - (a.order || 0));

        const certificationData = milestones
          .filter((milestone: Milestone) => milestone.type === 'certification')
          .sort((a: Milestone, b: Milestone) => (a.order || 0) - (b.order || 0));

        setEducation(educationData);
        setCertifications(certificationData);
      } catch (err: any) {
        console.error('Error fetching milestones:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  const handleCertificationClick = (credentialUrl: string) => {
    if (credentialUrl && credentialUrl.trim()) {
      // Add https:// if not present
      const url = credentialUrl.startsWith('http') ? credentialUrl : `https://${credentialUrl}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-96 mx-auto mb-8"></div>
                <div className="space-y-8 sm:space-y-0">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-muted rounded-lg h-48"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-red-500">Error loading milestones: {error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Major <span className="text-primary">Milestones</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A strong academic foundation in engineering with continuous learning
              and professional development in emerging technologies.
            </p>
          </div>

          {/* Education Timeline */}
          {education.length > 0 && (
            <div className="relative mb-20">
              {/* Timeline Line - Desktop (center) */}
              <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-amber to-primary transform -translate-x-1/2"></div>
              {/* Timeline Line - Mobile (left side) */}
              <div className="sm:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-amber to-primary"></div>

              <div className="space-y-8">
                {education.map((edu, index) => (
                  <div key={edu._id} className={`relative flex items-center ${index % 2 === 0 ? 'sm:justify-start' : 'sm:justify-end'} justify-start`}>
                    {/* Timeline Dot - Desktop (center) */}
                    <div className="hidden sm:block absolute left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-glow transform -translate-x-1/2 z-10"></div>
                    {/* Timeline Dot - Mobile (left side) */}
                    <div className="sm:hidden absolute left-4 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-glow z-10"></div>

                    <div className={`sm:w-5/12 w-full ${index % 2 === 0 ? 'sm:pr-8' : 'sm:pl-8'} pl-16 sm:pl-0`}>
                      <Card className="bg-gradient-card border-border/20 shadow-glass hover:shadow-hover transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge
                              className={`${edu.status === "Current"
                                ? "bg-green-500 text-white"
                                : "bg-primary text-primary-foreground"
                              }`}
                            >
                              {edu.status}
                            </Badge>
                            {edu.period && (
                              <div className="flex items-center text-muted-foreground text-sm">
                                <Calendar className="w-4 h-4 mr-1" />
                                {edu.period}
                              </div>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {edu.title}
                          </h3>
                          {edu.institution && (
                            <p className="text-primary mb-2">{edu.institution}</p>
                          )}

                          {edu.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                              {edu.description}
                            </p>
                          )}

                          {/* Academic Performance */}
                          {(edu.gpa || edu.grade) && (
                            <div className="flex flex-wrap gap-3 mb-4">
                              {edu.gpa && (
                                <div className="flex items-center space-x-2">
                                  <GraduationCap className="w-4 h-4 text-primary" />
                                  <span className="font-semibold text-sm">{edu.gpa}</span>
                                </div>
                              )}
                              {edu.recentGPA && (
                                <div className="text-xs text-muted-foreground">
                                  ({edu.recentGPA})
                                </div>
                              )}
                              {edu.grade && (
                                <div className="flex items-center space-x-2">
                                  <Award className="w-4 h-4 text-amber" />
                                  <span className="font-semibold text-sm">{edu.grade}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Achievements */}
                          {edu.achievements && edu.achievements.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Key Achievements:</h4>
                              <div className="space-y-1">
                                {edu.achievements.map((achievement, achIndex) => (
                                  <div key={achIndex} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                                    <span className="text-xs text-muted-foreground">{achievement}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-center mb-12">
                Professional <span className="text-primary">Certifications</span>
              </h3>
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-6 min-w-max px-4">
                  {certifications.map((cert, index) => (
                    <div
                      key={cert._id}
                      onClick={() => cert.description && handleCertificationClick(cert.description)}
                      className={`group flex-shrink-0 w-64 transition-all duration-300 ${
                        cert.description && cert.description.trim()
                          ? 'cursor-pointer hover:scale-105 hover:shadow-hover'
                          : ''
                      }`}
                    >
                      <Card className="bg-gradient-card border-border/20 shadow-card hover:shadow-hover transition-all duration-300 h-full">
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Award className="w-6 h-6 text-primary" />
                          </div>
                          
                          <h4 className="font-semibold text-foreground mb-2 text-sm group-hover:text-primary transition-colors">
                            {cert.title}
                          </h4>
                          
                          {cert.issuer && (
                            <p className="text-xs text-muted-foreground mb-2">{cert.issuer}</p>
                          )}
                          
                          {/* Show external link icon if credential URL exists */}
                          {cert.description && cert.description.trim() && (
                            <div className="flex items-center justify-center mb-2">
                              <ExternalLink className="w-3 h-3 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                              <span className="text-xs text-primary ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                View Credential
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            {cert.certType && (
                              <Badge variant="secondary" className="text-xs">{cert.certType}</Badge>
                            )}
                            {cert.date && (
                              <span className="text-xs text-muted-foreground">{cert.date}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Experience Placeholder */}
          <div className="mb-16">
            <Card className="bg-gradient-card border-border/20 shadow-glass border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Professional Experience
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Currently open to opportunities.
                  Actively seeking positions in robotics, embedded systems, and software development.
                </p>
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
                  Let's Collaborate
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};