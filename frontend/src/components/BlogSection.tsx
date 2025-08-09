import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, BookOpen, Code, Cpu, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import ApiService from "../services/api";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string[];
  tags: string[];
  featured: boolean;
  image?: string;
  readTime: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
}

export const BlogSection = () => {
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch more blogs to have enough for filtering
        const [blogsResponse, categoriesResponse] = await Promise.all([
          ApiService.getBlogs({ limit: 50, published: true }), // Increased limit
          ApiService.getBlogCategories()
        ]);

        setAllBlogPosts((blogsResponse.blogs || []).map((b: any) => ({
          ...b,
          category: Array.isArray(b.category) ? b.category : [b.category]
        })));
        setCategories(categoriesResponse || []);
      } catch (err: any) {
        console.error('Error fetching blog data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter posts whenever activeCategory or allBlogPosts changes
  useEffect(() => {
    let filtered = allBlogPosts;

    if (activeCategory) {
      filtered = allBlogPosts.filter(post =>
        Array.isArray(post.category)
          ? post.category.includes(activeCategory)
          : post.category === activeCategory
      );
    }

    // Sort all posts: featured first, then by published date
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    // Separate featured and non-featured posts
    const featured = filtered.filter(post => post.featured);
    const nonFeatured = filtered.filter(post => !post.featured);

    // Set featured posts (no limit, show all featured posts)
    setFeaturedPosts(featured);

    // Set recent posts (limit to 6)
    setRecentPosts(nonFeatured.slice(0, 6));

  }, [activeCategory, allBlogPosts]);

  const categoryIconMap: { [key: string]: any } = {
    "Robotics": Cpu,
    "Embedded": Cpu,
    "Hardware": Cpu,
    "DevOps": Cloud,
    "AI/ML": Code,
    "Software": Code,
    "IoT": Cpu
  };

  const categoryColorMap: { [key: string]: string } = {
    "Robotics": "bg-blue-500",
    "Embedded": "bg-green-500", 
    "Hardware": "bg-purple-500",
    "DevOps": "bg-orange-500",
    "AI/ML": "bg-red-500",
    "Software": "bg-cyan-500",
    "IoT": "bg-teal-500"
  };

  const getCategoryIcon = (category: string) => {
    return categoryIconMap[category] || BookOpen;
  };

  const getCategoryColor = (category: string) => {
    return categoryColorMap[category] || "bg-primary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null); // Clear filter if clicking the same category
    } else {
      setActiveCategory(category);
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
                <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
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
            <p className="text-red-500">Error loading blog content: {error}</p>
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

  const totalPosts = featuredPosts.length + recentPosts.length;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Technical <span className="text-primary">Blog</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sharing insights, tutorials, and deep-dives into robotics, embedded systems,
              and full-stack development. Learn from real-world project experiences.
            </p>
          </div>

          {/* Blog Categories Filter */}
          {categories.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6 text-center">
                Filter by <span className="text-primary">Category</span>
                {activeCategory && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({activeCategory})
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {/* All Categories Button */}
                <Button
                  variant={activeCategory === null ? "default" : "outline"}
                  onClick={() => setActiveCategory(null)}
                  className={`flex items-center space-x-2 ${activeCategory === null
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "hover:bg-primary/10"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>All Posts</span>
                </Button>

                {/* Category Filter Buttons */}
                {categories.map((category, index) => {
                  const IconComponent = getCategoryIcon(category);
                  return (
                    <Button
                      key={index}
                      variant={activeCategory === category ? "default" : "outline"}
                      onClick={() => handleCategoryClick(category)}
                      className={`flex items-center space-x-2 ${activeCategory === category
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "hover:bg-primary/10"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{category}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Posts Message */}
          {totalPosts === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No blog posts found {activeCategory ? `in "${activeCategory}"` : ''}.
              </p>
              {activeCategory && (
                <Button 
                  variant="outline" 
                  onClick={() => setActiveCategory(null)}
                  className="mt-4"
                >
                  View All Posts
                </Button>
              )}
            </div>
          )}

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-center">
                Featured <span className="text-primary">Articles</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post, index) => (
                  <Link to={`/blog/${post.slug}`} key={post._id} className="block">
                    <Card className="group bg-gradient-card border-border/20 shadow-glass hover:shadow-hover transition-all duration-500 overflow-hidden">
                      {/* Featured Image Placeholder */}
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-amber/20 overflow-hidden">
                        {post.image ? (
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className={`w-16 h-16 rounded-full ${getCategoryColor(post.category[0])}/20 mx-auto mb-2 flex items-center justify-center`}>
                                {(() => {
                                  const IconComponent = getCategoryIcon(post.category[0]);
                                  return <IconComponent className="w-8 h-8 text-primary" />;
                                })()}
                              </div>
                              <p className="text-xs text-muted-foreground">Featured Article</p>
                            </div>
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className={`${getCategoryColor(post.category[0])} text-white`}>
                            {post.category[0]}
                          </Badge>
                        </div>

                        {/* Featured Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary">
                            Featured
                          </Badge>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button size="sm">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Read Article
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Meta Information */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
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
            </div>
          )}

          {/* Recent Posts */}
          {recentPosts.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-center">
                {activeCategory ? `${activeCategory} Posts` : 'Recent Posts'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPosts.map((post, index) => (
                  <Link to={`/blog/${post.slug}`} key={post._id} className="block">
                    <Card className="group bg-gradient-card border-border/20 shadow-card hover:shadow-hover transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={`${getCategoryColor(post.category[0])} text-white text-xs`}>
                              {post.category[0]}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{post.readTime}</span>
                            </div>
                          </div>

                          <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 2).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Date and Read More */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
                            <span className="text-xs mr-1">Read</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gradient-card border-primary/20 shadow-glass">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Curious to read more?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Explore my blog for in-depth articles, tutorials, and insights into the latest trends in robotics, embedded systems, and software development.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button className="bg-gradient-primary hover:shadow-hover transition-all duration-300" asChild>
                    <Link to="/blog">
                      <BookOpen className="w-4 h-4 mr-2" />
                      View All Posts
                    </Link>
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