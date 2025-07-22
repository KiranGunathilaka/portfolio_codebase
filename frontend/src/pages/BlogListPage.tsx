import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, BookOpen, Code, Cpu, Cloud, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import ApiService from "../services/api";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  image?: string;
  readTime: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
}

export const BlogListPage = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getBlogs({ 
          limit: 50, 
          published: true 
        });
        setBlogPosts(response.blogs || []);
      } catch (err: any) {
        console.error('Error fetching blogs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const categories = [
    { name: "Robotics", icon: Cpu, color: "bg-blue-500" },
    { name: "Embedded", icon: Cpu, color: "bg-green-500" },
    { name: "Hardware", icon: Cpu, color: "bg-purple-500" },
    { name: "DevOps", icon: Cloud, color: "bg-orange-500" },
    { name: "AI/ML", icon: Code, color: "bg-red-500" },
    { name: "Software", icon: Code, color: "bg-cyan-500" },
    { name: "IoT", icon: Cpu, color: "bg-teal-500" }
  ];

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.name === category);
    return categoryData?.icon || BookOpen;
  };

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(cat => cat.name === category);
    return categoryData?.color || "bg-primary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <h1 className="text-4xl font-bold mb-4">Error Loading Blogs</h1>
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
              All <span className="text-primary">Articles</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore all my technical articles covering robotics, embedded systems,
              IoT, and software development insights.
            </p>
          </div>

          {/* No posts message */}
          {blogPosts.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Articles Found</h2>
              <p className="text-muted-foreground">Check back later for new content!</p>
            </div>
          )}

          {/* All Posts Grid */}
          {blogPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, index) => (
                <Link to={`/blog/${post.slug}`} key={post._id} className="block">
                  <Card className="group bg-gradient-card border-border/20 shadow-card hover:shadow-hover transition-all duration-300 h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${getCategoryColor(post.category)} text-white text-xs`}>
                            {post.category}
                          </Badge>
                          {post.featured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
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