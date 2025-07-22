import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Cpu, Globe, Wrench } from "lucide-react";
import ApiService from "../services/api";

interface Skill {
  name: string;
  level: number;
  description: string;
}

interface SkillCategory {
  category: string;
  categoryTitle: string;
  categoryIcon: string;
  skills: Skill[];
  order: number;
}

interface SoftSkill {
  _id: string;
  name: string;
  order: number;
}

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("programming");
  const [skillCategories, setSkillCategories] = useState<{ [key: string]: any }>({});
  const [softSkills, setSoftSkills] = useState<SoftSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        
        // Fetch both technical skills and soft skills
        const [skillsResponse, softSkillsResponse] = await Promise.all([
          ApiService.getSkills(),
          ApiService.getSoftSkills()
        ]);

        // Transform skills data into the expected format
        const categoriesData: { [key: string]: any } = {};
        const skillsData = skillsResponse.skills || [];
        
        skillsData.forEach((category: SkillCategory) => {
          categoriesData[category.category] = {
            title: category.categoryTitle,
            icon: getIconComponent(category.categoryIcon),
            skills: category.skills
          };
        });

        setSkillCategories(categoriesData);
        setSoftSkills(softSkillsResponse.softSkills || []);

        // Set default active category if data exists
        if (Object.keys(categoriesData).length > 0 && !categoriesData[activeCategory]) {
          setActiveCategory(Object.keys(categoriesData)[0]);
        }

      } catch (err: any) {
        console.error('Error fetching skills:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Code,
      Globe,
      Cpu,
      Wrench
    };
    return iconMap[iconName] || Code;
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
                <div className="bg-muted rounded-lg h-96"></div>
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
            <p className="text-red-500">Error loading skills: {error}</p>
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

  const currentCategory = skillCategories[activeCategory];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              My <span className="text-primary">Skills</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A comprehensive skill set spanning hardware design, embedded programming, 
              and full-stack software development.
            </p>
          </div>

          {/* Skill Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {Object.entries(skillCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={key}
                  variant={activeCategory === key ? "default" : "outline"}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center space-x-2 ${
                    activeCategory === key 
                      ? "bg-primary text-primary-foreground shadow-glow" 
                      : "hover:bg-primary/10"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.title}</span>
                </Button>
              );
            })}
          </div>

          {/* Technical Skills */}
          {currentCategory && (
            <div className="mb-16">
              <Card className="bg-gradient-card border-border/20 shadow-glass">
                <CardContent className="p-8">
                  <div className="grid gap-6">
                    {currentCategory.skills.map((skill: Skill, index: number) => (
                      <div key={index} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-foreground">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground">{skill.description}</p>
                          </div>
                          <Badge variant="secondary" className="ml-4">
                            {skill.level}%
                          </Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Soft Skills */}
          {softSkills.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-center mb-8">
                Professional <span className="text-primary">Skills</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {softSkills.map((skill, index) => (
                  <Card 
                    key={skill._id || index} 
                    className="bg-gradient-card border-border/20 shadow-card hover:shadow-hover transition-all duration-300 group cursor-pointer"
                  >
                    <CardContent className="p-6 text-center">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {skill.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};