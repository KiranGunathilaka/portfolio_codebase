import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Bot, Cpu, Globe, Smartphone, ArrowLeft, FolderOpen } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import ApiService from "../services/api";

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription?: string;
  category: string;
  technologies: string[];
  features?: string[];
  techDetails?: string;
  github?: string;
  demo?: string;
  image?: string;
  featured: boolean;
  date: string;
  published: boolean;
}

export const ProjectListPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getProjects({ 
          limit: 50, 
          published: true 
        });
        setProjects(response.projects || []);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filters = [
    { id: "all", label: "All Projects", icon: Globe },
    { id: "robotics", label: "Robotics", icon: Bot },
    { id: "iot", label: "IoT", icon: Smartphone },
    { id: "hardware", label: "Hardware", icon: Cpu },
    { id: "software", label: "Software", icon: Globe }
  ];

const filteredProjects = (activeFilter === "all"
  ? projects
  : projects.filter(project => project.category === activeFilter)
).sort((a, b) => {
  // Featured projects first
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return 1;
  return 0; // Keep original order for same featured status
});

  const handleBackToPortfolio = () => {
    navigate("/", { state: { scrollToPortfolio: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-96 mx-auto mb-8"></div>
                <div className="flex justify-center gap-4 mb-12">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded w-24"></div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-muted rounded-lg h-96"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Error Loading Projects</h1>
            <p className="text-red-500 mb-6">{error}</p>
            <div className="space-x-4">
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button variant="outline" onClick={handleBackToPortfolio}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Button
              variant="outline"
              onClick={handleBackToPortfolio}
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portfolio
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              All <span className="text-primary">Projects</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore my complete portfolio of projects across robotics, IoT,
              hardware design, and software development.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-2 ${activeFilter === filter.id
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "hover:bg-primary/10"
                    }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{filter.label}</span>
                </Button>
              );
            })}
          </div>

          {/* No projects message */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                {activeFilter === "all" ? "No Projects Found" : `No ${filters.find(f => f.id === activeFilter)?.label} Projects`}
              </h2>
              <p className="text-muted-foreground">
                {activeFilter === "all" 
                  ? "Check back later for new projects!" 
                  : "Try selecting a different category or view all projects."
                }
              </p>
              {activeFilter !== "all" && (
                <Button 
                  variant="outline" 
                  onClick={() => setActiveFilter("all")}
                  className="mt-4"
                >
                  View All Projects
                </Button>
              )}
            </div>
          )}

          {/* Projects Grid */}
          {filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <Link
                  to={`/project/${project.slug}`}
                  key={project._id}
                  className="block group bg-gradient-card border-border/20 shadow-glass hover:shadow-hover transition-all duration-500 overflow-hidden rounded-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="h-full border-0 shadow-none">
                    {/* Project Image */}
                    <div className="relative h-48 md:h-56 bg-muted/50 overflow-hidden">
                      {project.image ? (
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-amber/20 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center">
                              <span className="text-2xl font-bold text-primary">
                                {project.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Project Preview</p>
                          </div>
                        </div>
                      )}

                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                        {project.github && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.github} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4 mr-2" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demo && (
                          <Button size="sm" asChild>
                            <a href={project.demo} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Demo
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Featured Badge */}
                      {project.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-amber text-amber-foreground">
                            Featured
                          </Badge>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="capitalize">
                          {project.category}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Project Info */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 4).map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 4} more
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        {project.github && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={project.github} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4 mr-2" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demo && (
                          <Button
                            size="sm"
                            className="flex-1"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={project.demo} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};