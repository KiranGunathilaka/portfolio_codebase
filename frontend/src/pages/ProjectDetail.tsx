import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Github, ExternalLink, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const projectData = await ApiService.getProjectBySlug(slug);
        setProject(projectData);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolio
            </button>
          </div>
        </header>

        {/* Loading Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="h-64 bg-muted rounded mb-8"></div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error ? 'Error Loading Project' : 'Project Not Found'}
          </h1>
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          <div className="space-x-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
            <Link to="/" className="text-primary hover:underline">
              Return to Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary" className="capitalize">{project.category}</Badge>
              <div className="flex items-center text-muted-foreground text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {project.date}
              </div>
              {project.featured && (
                <Badge className="bg-amber text-amber-foreground">Featured</Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {project.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              {project.description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              {project.github && (
                <Button asChild>
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4 mr-2" />
                    View Code
                  </a>
                </Button>
              )}
              {project.demo && (
                <Button variant="outline" asChild>
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="outline" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Project Image */}
          {project.image ? (
            <div className="mb-8">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg border border-border"
              />
            </div>
          ) : (
            <div className="mb-8">
              <div className="w-full h-64 md:h-96 bg-gradient-to-br from-primary/20 to-amber/20 rounded-lg border border-border flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">
                      {project.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <p className="text-muted-foreground">Project Preview</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Overview</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {project.fullDescription || project.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Technical Details</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {project.techDetails || `Built using ${project.technologies.slice(0, 3).join(', ')} and other modern technologies for optimal performance and scalability.`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Features */}
          {project.features && project.features.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Link to="/projects">
              <Button variant="outline">
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}