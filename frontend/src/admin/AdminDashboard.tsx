import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Award,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Code,
  Cpu,
  Globe,
  Wrench,
  User,
  Key,
  Bell,
  Shield,
  Camera,
  Check,
  AlertCircle,
  Loader
} from 'lucide-react';
import ApiService from '../services/api';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  image?: string;
  readTime: string;
}

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

interface Skill {
  name: string;
  level: number;
  description: string;
}

interface SkillCategory {
  _id?: string;
  category: string;
  categoryTitle: string;
  categoryIcon: string;
  skills: Skill[];
  order: number;
}

interface SoftSkill {
  _id?: string;
  name: string;
  order: number;
}

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [softSkills, setSoftSkills] = useState<SoftSkill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: 'admin@portfolio.com',
    password: 'admin123'
  });

  // Status messages
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      loadCurrentUser();
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    try {
      if (ApiService.isAuthenticated()) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await ApiService.getCurrentAdmin();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [blogsRes, projectsRes, milestonesRes, skillsRes, softSkillsRes] = await Promise.all([
        ApiService.getAdminBlogs(),
        ApiService.getAdminProjects(),
        ApiService.getMilestones(),
        ApiService.getSkills(),
        ApiService.getSoftSkills()
      ]);

      setBlogs(blogsRes.blogs || []);
      setProjects(projectsRes.projects || []);
      setMilestones(milestonesRes.milestones || []);
      setSkillCategories(skillsRes.skills || []);
      setSoftSkills(softSkillsRes.softSkills || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      if (error.message.includes('Authentication')) {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await ApiService.login(loginForm.email, loginForm.password);
      setIsAuthenticated(true);
      setUploadStatus('Login successful!');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error: any) {
      setUploadStatus('Login failed: ' + error.message);
      setTimeout(() => setUploadStatus(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      setIsAuthenticated(false);
      setActiveTab('dashboard');
      setCurrentUser(null);
      setUploadStatus('Logged out successfully');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Logout error:', error);
      setIsAuthenticated(false);
      setActiveTab('dashboard');
      setCurrentUser(null);
    }
  };

  const openForm = (type: string, item: any = null) => {
    setFormType(type);
    setEditingItem(item);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormType('');
    setEditingItem(null);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (type === 'blogs') {
        await ApiService.deleteBlog(id);
      } else if (type === 'projects') {
        await ApiService.deleteProject(id);
      } else if (type === 'milestones') {
        await ApiService.deleteMilestone(id);
      }

      await loadDashboardData();
      setUploadStatus('Item deleted successfully');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error: any) {
      setUploadStatus('Error deleting item: ' + error.message);
      setTimeout(() => setUploadStatus(''), 5000);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Status Bar Component
  const StatusBar = () => {
    if (!uploadStatus) return null;

    return (
      <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg max-w-sm ${uploadStatus.includes('failed') || uploadStatus.includes('Error') || uploadStatus.includes('error')
          ? 'bg-red-500 text-white'
          : uploadStatus.includes('Uploading') || uploadStatus.includes('Saving')
            ? 'bg-blue-500 text-white'
            : 'bg-green-500 text-white'
        }`}>
        <div className="flex items-center gap-2">
          {uploadStatus.includes('Uploading') || uploadStatus.includes('Saving') ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : uploadStatus.includes('failed') || uploadStatus.includes('Error') || uploadStatus.includes('error') ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span className="text-sm">{uploadStatus}</span>
        </div>
      </div>
    );
  };

  // Blog Form Component
  const BlogForm = () => {
    const [formData, setFormData] = useState({
      title: editingItem?.title || '',
      slug: editingItem?.slug || '',
      excerpt: editingItem?.excerpt || '',
      content: editingItem?.content || '',
      category: editingItem?.category || 'Robotics',
      tags: editingItem?.tags?.join(', ') || '',
      featured: editingItem?.featured || false,
      published: editingItem?.published !== false,
      image: editingItem?.image || '',
      readTime: editingItem?.readTime || '5 min read'
    });

    const handleSubmit = async () => {
      try {
        setLoading(true);
        setUploadStatus('Saving blog post...');

        const data = {
          ...formData,
          slug: formData.slug || generateSlug(formData.title),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        };

        if (editingItem) {
          await ApiService.updateBlog(editingItem._id, data);
        } else {
          await ApiService.createBlog(data);
        }

        await loadDashboardData();
        closeForm();
        setUploadStatus(`Blog ${editingItem ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error: any) {
        setUploadStatus('Error saving blog: ' + error.message);
        setTimeout(() => setUploadStatus(''), 5000);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({
                ...formData,
                title: e.target.value,
                slug: generateSlug(e.target.value)
              })}
              className="w-full p-3 border rounded-lg bg-background"
              placeholder="Blog post title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-3 border rounded-lg bg-background"
              placeholder="url-friendly-slug"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Excerpt</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background h-20"
            placeholder="Brief description of the blog post"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content (HTML/Markdown supported)</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background h-32 font-mono text-sm"
            placeholder="<p>Your blog content here... You can use HTML tags</p>&#10;&#10;To embed images: <img src='YOUR_IMAGE_URL' alt='Description' class='w-full h-auto rounded-lg my-4' />"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 border rounded-lg bg-background"
            >
              <option value="Robotics">Robotics</option>
              <option value="IoT">IoT</option>
              <option value="Software">Software</option>
              <option value="Hardware">Hardware</option>
              <option value="AI/ML">AI/ML</option>
              <option value="DevOps">DevOps</option>
              <option value="Embedded">Embedded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Read Time</label>
            <input
              type="text"
              value={formData.readTime}
              onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
              className="w-full p-3 border rounded-lg bg-background"
              placeholder="5 min read"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background"
            placeholder="React, JavaScript, Tutorial"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Featured Image URL</label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background"
            placeholder="https://res.cloudinary.com/your-image-url"
          />
          {formData.image && (
            <div className="mt-2">
              <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded border" />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <span className="text-sm">Featured</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            />
            <span className="text-sm">Published</span>
          </label>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')} Blog
          </Button>
          <Button variant="outline" onClick={closeForm}>Cancel</Button>
        </div>
      </div>
    );
  };

  // Project Form Component
  const ProjectForm = () => {
    const [formData, setFormData] = useState({
      title: editingItem?.title || '',
      slug: editingItem?.slug || '',
      description: editingItem?.description || '',
      fullDescription: editingItem?.fullDescription || '',
      category: editingItem?.category || 'robotics',
      technologies: editingItem?.technologies?.join(', ') || '',
      features: editingItem?.features?.join('\n') || '',
      techDetails: editingItem?.techDetails || '',
      github: editingItem?.github || '',
      demo: editingItem?.demo || '',
      image: editingItem?.image || '',
      featured: editingItem?.featured || false,
      published: editingItem?.published !== false,
      date: editingItem?.date || new Date().getFullYear().toString()
    });

    const handleSubmit = async () => {
      try {
        setLoading(true);
        setUploadStatus('Saving project...');

        const data = {
          ...formData,
          slug: formData.slug || generateSlug(formData.title),
          technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(Boolean),
          features: formData.features.split('\n').map(feature => feature.trim()).filter(Boolean)
        };

        if (editingItem) {
          await ApiService.updateProject(editingItem._id, data);
        } else {
          await ApiService.createProject(data);
        }

        await loadDashboardData();
        closeForm();
        setUploadStatus(`Project ${editingItem ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error: any) {
        setUploadStatus('Error saving project: ' + error.message);
        setTimeout(() => setUploadStatus(''), 5000);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({
                ...formData,
                title: e.target.value,
                slug: generateSlug(e.target.value)
              })}
              className="w-full p-3 border rounded-lg bg-background"
              placeholder="Project title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-3 border rounded-lg bg-background"
              placeholder="url-friendly-slug"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Short Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background h-20"
            placeholder="Brief project description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Full Description (HTML supported)</label>
          <textarea
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background h-24 font-mono text-sm"
            placeholder="Detailed project description with HTML formatting&#10;&#10;To embed images: <img src='YOUR_IMAGE_URL' alt='Description' class='w-full h-auto rounded-lg my-4' />"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 border rounded-lg bg-background"
            >
              <option value="robotics">Robotics</option>
              <option value="iot">IoT</option>
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-3 border rounded-lg bg-background"
              placeholder="2024"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Technologies (comma separated)</label>
          <input
            type="text"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background"
            placeholder="React, Node.js, MongoDB"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Features (one per line)</label>
          <textarea
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background h-20"
            placeholder="Real-time updates&#10;Mobile responsive&#10;Secure authentication"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Technical Details</label>
          <textarea
            value={formData.techDetails}
            onChange={(e) => setFormData({ ...formData, techDetails: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background h-20"
            placeholder="Built using modern technologies with focus on performance..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">GitHub URL</label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              className="w-full p-3 border rounded-lg bg-background"
              placeholder="https://github.com/username/project"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Demo URL</label>
            <input
              type="url"
              value={formData.demo}
              onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
              className="w-full p-3 border rounded-lg bg-background"
              placeholder="https://project-demo.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Project Image URL</label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background"
            placeholder="https://res.cloudinary.com/your-image-url"
          />
          {formData.image && (
            <div className="mt-2">
              <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded border" />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <span className="text-sm">Featured</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            />
            <span className="text-sm">Published</span>
          </label>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')} Project
          </Button>
          <Button variant="outline" onClick={closeForm}>Cancel</Button>
        </div>
      </div>
    );
  };

  // Milestone Form Component - Updated section only
  const MilestoneForm = () => {
    const [formData, setFormData] = useState({
      type: editingItem?.type || 'education',
      title: editingItem?.title || '',
      institution: editingItem?.institution || '',
      issuer: editingItem?.issuer || '',
      period: editingItem?.period || '',
      date: editingItem?.date || '',
      status: editingItem?.status || '',
      grade: editingItem?.grade || '',
      gpa: editingItem?.gpa || '',
      recentGPA: editingItem?.recentGPA || '',
      description: editingItem?.description || '',
      achievements: editingItem?.achievements?.join('\n') || '',
      coursework: editingItem?.coursework?.join('\n') || '',
      certType: editingItem?.certType || '',
      order: editingItem?.order || 0
    });

    const handleSubmit = async () => {
      try {
        setLoading(true);
        setUploadStatus('Saving milestone...');

        const data = {
          ...formData,
          achievements: formData.achievements.split('\n').map(a => a.trim()).filter(Boolean),
          coursework: formData.coursework.split('\n').map(c => c.trim()).filter(Boolean),
          order: parseInt(formData.order.toString()) || 0
        };

        if (editingItem) {
          await ApiService.updateMilestone(editingItem._id, data);
        } else {
          await ApiService.createMilestone(data);
        }

        await loadDashboardData();
        closeForm();
        setUploadStatus(`Milestone ${editingItem ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error: any) {
        setUploadStatus('Error saving milestone: ' + error.message);
        setTimeout(() => setUploadStatus(''), 5000);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'education' | 'certification' })}
              className="w-full p-3 border rounded-lg bg-background"
            >
              <option value="education">Education</option>
              <option value="certification">Certification</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full p-3 border rounded-lg bg-background"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background"
            placeholder="Degree title or certification name"
          />
        </div>

        {formData.type === 'education' ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full p-3 border rounded-lg bg-background"
                  placeholder="University name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Period</label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full p-3 border rounded-lg bg-background"
                  placeholder="2020 - 2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <input
                  type="text"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-3 border rounded-lg bg-background"
                  placeholder="Current / Completed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">GPA</label>
                <input
                  type="text"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full p-3 border rounded-lg bg-background"
                  placeholder="3.74"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Recent GPA</label>
                <input
                  type="text"
                  value={formData.recentGPA}
                  onChange={(e) => setFormData({ ...formData, recentGPA: e.target.value })}
                  className="w-full p-3 border rounded-lg bg-background"
                  placeholder="SGPA 3.96, 3.91"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Coursework (one per line)</label>
              <textarea
                value={formData.coursework}
                onChange={(e) => setFormData({ ...formData, coursework: e.target.value })}
                className="w-full p-3 border rounded-lg bg-background h-20"
                placeholder="Digital Signal Processing&#10;Embedded Systems Design&#10;Control Systems"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Issuer</label>
                <input
                  type="text"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full p-3 border rounded-lg bg-background"
                  placeholder="Certification authority"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-3 border rounded-lg bg-background"
                  placeholder="2024"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Certification Type</label>
              <input
                type="text"
                value={formData.certType}
                onChange={(e) => setFormData({ ...formData, certType: e.target.value })}
                className="w-full p-3 border rounded-lg bg-background"
                placeholder="Professional / Technical / Cloud"
              />
            </div>
          </>
        )}

        {/* Dynamic Description/Credential URL field */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {formData.type === 'certification' ? 'Credential URL' : 'Description'}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background h-20"
            placeholder={
              formData.type === 'certification'
                ? "https://example.com/credential-verification"
                : "Brief description"
            }
          />
          {formData.type === 'certification' && (
            <p className="text-xs text-muted-foreground mt-1">
              Enter the full URL to the credential verification page. Users can click on the certification card to view it.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Achievements (one per line)</label>
          <textarea
            value={formData.achievements}
            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
            className="w-full p-3 border rounded-lg bg-background h-20"
            placeholder="Dean's List recognition&#10;IEEE Student Branch member&#10;Research involvement"
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')} Milestone
          </Button>
          <Button variant="outline" onClick={closeForm}>Cancel</Button>
        </div>
      </div>
    );
  };

  // Skills Form Component
  const SkillsForm = () => {
    const [activeSkillTab, setActiveSkillTab] = useState('technical');
    const [technicalSkills, setTechnicalSkills] = useState(skillCategories);
    const [softSkillsList, setSoftSkillsList] = useState(softSkills);

    const iconOptions = ['Code', 'Globe', 'Cpu', 'Wrench'];

    const addSkillCategory = () => {
      const newCategory: SkillCategory = {
        category: 'new-category',
        categoryTitle: 'New Category',
        categoryIcon: 'Code',
        skills: [],
        order: technicalSkills.length
      };
      setTechnicalSkills([...technicalSkills, newCategory]);
    };

    const updateSkillCategory = (index: number, field: string, value: any) => {
      const updated = [...technicalSkills];
      updated[index] = { ...updated[index], [field]: value };
      setTechnicalSkills(updated);
    };

    const addSkillToCategory = (categoryIndex: number) => {
      const updated = [...technicalSkills];
      updated[categoryIndex].skills.push({ name: '', level: 50, description: '' });
      setTechnicalSkills(updated);
    };

    const updateSkill = (categoryIndex: number, skillIndex: number, field: string, value: any) => {
      const updated = [...technicalSkills];
      updated[categoryIndex].skills[skillIndex] = {
        ...updated[categoryIndex].skills[skillIndex],
        [field]: value
      };
      setTechnicalSkills(updated);
    };

    const removeSkill = (categoryIndex: number, skillIndex: number) => {
      const updated = [...technicalSkills];
      updated[categoryIndex].skills.splice(skillIndex, 1);
      setTechnicalSkills(updated);
    };

    const removeSkillCategory = (index: number) => {
      const updated = [...technicalSkills];
      updated.splice(index, 1);
      setTechnicalSkills(updated);
    };

    const addSoftSkill = () => {
      setSoftSkillsList([...softSkillsList, { name: '', order: softSkillsList.length }]);
    };

    const updateSoftSkill = (index: number, field: string, value: any) => {
      const updated = [...softSkillsList];
      updated[index] = { ...updated[index], [field]: value };
      setSoftSkillsList(updated);
    };

    const removeSoftSkill = (index: number) => {
      const updated = [...softSkillsList];
      updated.splice(index, 1);
      setSoftSkillsList(updated);
    };

    const handleSubmit = async () => {
      try {
        setLoading(true);
        setUploadStatus('Saving skills...');

        await Promise.all([
          ApiService.updateSkills({ skills: technicalSkills }),
          ApiService.updateSoftSkills({ softSkills: softSkillsList })
        ]);

        await loadDashboardData();
        closeForm();
        setUploadStatus('Skills updated successfully!');
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error: any) {
        setUploadStatus('Error updating skills: ' + error.message);
        setTimeout(() => setUploadStatus(''), 5000);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="flex space-x-4 mb-4">
          <Button
            variant={activeSkillTab === 'technical' ? 'default' : 'outline'}
            onClick={() => setActiveSkillTab('technical')}
          >
            Technical Skills
          </Button>
          <Button
            variant={activeSkillTab === 'soft' ? 'default' : 'outline'}
            onClick={() => setActiveSkillTab('soft')}
          >
            Soft Skills
          </Button>
        </div>

        {activeSkillTab === 'technical' ? (
          <div className="space-y-6">
            {technicalSkills.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Category {categoryIndex + 1}</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeSkillCategory(categoryIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category Key</label>
                      <input
                        type="text"
                        value={category.category}
                        onChange={(e) => updateSkillCategory(categoryIndex, 'category', e.target.value)}
                        className="w-full p-2 border rounded bg-background"
                        placeholder="programming"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category Title</label>
                      <input
                        type="text"
                        value={category.categoryTitle}
                        onChange={(e) => updateSkillCategory(categoryIndex, 'categoryTitle', e.target.value)}
                        className="w-full p-2 border rounded bg-background"
                        placeholder="Programming Languages"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Icon</label>
                      <select
                        value={category.categoryIcon}
                        onChange={(e) => updateSkillCategory(categoryIndex, 'categoryIcon', e.target.value)}
                        className="w-full p-2 border rounded bg-background"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium">Skills</label>
                      <Button
                        size="sm"
                        onClick={() => addSkillToCategory(categoryIndex)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Skill
                      </Button>
                    </div>

                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateSkill(categoryIndex, skillIndex, 'name', e.target.value)}
                            className="w-full p-2 border rounded bg-background"
                            placeholder="Skill name"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={skill.level}
                            onChange={(e) => updateSkill(categoryIndex, skillIndex, 'level', parseInt(e.target.value))}
                            className="w-full p-2 border rounded bg-background"
                            placeholder="Level"
                          />
                        </div>
                        <div className="col-span-6">
                          <input
                            type="text"
                            value={skill.description}
                            onChange={(e) => updateSkill(categoryIndex, skillIndex, 'description', e.target.value)}
                            className="w-full p-2 border rounded bg-background"
                            placeholder="Description"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeSkill(categoryIndex, skillIndex)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}

            <Button onClick={addSkillCategory} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Soft Skills</h4>
              <Button onClick={addSoftSkill}>
                <Plus className="w-4 h-4 mr-2" />
                Add Soft Skill
              </Button>
            </div>

            {softSkillsList.map((skill, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-8">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSoftSkill(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded bg-background"
                    placeholder="Soft skill name"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={skill.order}
                    onChange={(e) => updateSoftSkill(index, 'order', parseInt(e.target.value))}
                    className="w-full p-2 border rounded bg-background"
                    placeholder="Order"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeSoftSkill(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Update Skills'}
          </Button>
          <Button variant="outline" onClick={closeForm}>Cancel</Button>
        </div>
      </div>
    );
  };

  // Settings Form Component
  const SettingsForm = () => {
    const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsStatus, setSettingsStatus] = useState('');
    const [localSettingsData, setLocalSettingsData] = useState({
      profile: {
        username: currentUser?.username || '',
        email: currentUser?.email || ''
      },
      password: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    });

    const handleProfileUpdate = async () => {
      try {
        setSettingsLoading(true);
        await ApiService.updateProfile(localSettingsData.profile);
        await loadCurrentUser();
        setSettingsStatus('Profile updated successfully!');
        setTimeout(() => setSettingsStatus(''), 3000);
      } catch (error: any) {
        setSettingsStatus('Error updating profile: ' + error.message);
        setTimeout(() => setSettingsStatus(''), 5000);
      } finally {
        setSettingsLoading(false);
      }
    };

    const handlePasswordChange = async () => {
      try {
        if (localSettingsData.password.newPassword !== localSettingsData.password.confirmPassword) {
          setSettingsStatus('New passwords do not match');
          setTimeout(() => setSettingsStatus(''), 5000);
          return;
        }

        if (localSettingsData.password.newPassword.length < 6) {
          setSettingsStatus('New password must be at least 6 characters');
          setTimeout(() => setSettingsStatus(''), 5000);
          return;
        }

        setSettingsLoading(true);
        await ApiService.changePassword(
          localSettingsData.password.currentPassword,
          localSettingsData.password.newPassword
        );

        setLocalSettingsData(prev => ({
          ...prev,
          password: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));

        setSettingsStatus('Password changed successfully!');
        setTimeout(() => setSettingsStatus(''), 3000);
      } catch (error: any) {
        setSettingsStatus('Error changing password: ' + error.message);
        setTimeout(() => setSettingsStatus(''), 5000);
      } finally {
        setSettingsLoading(false);
      }
    };

    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeSettingsTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveSettingsTab('profile')}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button
            variant={activeSettingsTab === 'security' ? 'default' : 'outline'}
            onClick={() => setActiveSettingsTab('security')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </Button>
        </div>

        {settingsStatus && (
          <div className={`p-3 rounded-lg ${settingsStatus.includes('Error') || settingsStatus.includes('error')
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
            <div className="flex items-center gap-2">
              {settingsStatus.includes('Error') || settingsStatus.includes('error') ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {settingsStatus}
            </div>
          </div>
        )}

        {activeSettingsTab === 'profile' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={localSettingsData.profile.username}
                  onChange={(e) => setLocalSettingsData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, username: e.target.value }
                  }))}
                  className="w-full p-3 border rounded-lg bg-background"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={localSettingsData.profile.email}
                  onChange={(e) => setLocalSettingsData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, email: e.target.value }
                  }))}
                  className="w-full p-3 border rounded-lg bg-background"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleProfileUpdate} disabled={settingsLoading}>
                <Save className="w-4 h-4 mr-2" />
                {settingsLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </div>
        )}

        {activeSettingsTab === 'security' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Change Password</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                value={localSettingsData.password.currentPassword}
                onChange={(e) => setLocalSettingsData(prev => ({
                  ...prev,
                  password: { ...prev.password, currentPassword: e.target.value }
                }))}
                className="w-full p-3 border rounded-lg bg-background"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={localSettingsData.password.newPassword}
                onChange={(e) => setLocalSettingsData(prev => ({
                  ...prev,
                  password: { ...prev.password, newPassword: e.target.value }
                }))}
                className="w-full p-3 border rounded-lg bg-background"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={localSettingsData.password.confirmPassword}
                onChange={(e) => setLocalSettingsData(prev => ({
                  ...prev,
                  password: { ...prev.password, confirmPassword: e.target.value }
                }))}
                className="w-full p-3 border rounded-lg bg-background"
                placeholder="Confirm new password"
              />
            </div>

            <div className="pt-4">
              <Button onClick={handlePasswordChange} disabled={settingsLoading}>
                <Key className="w-4 h-4 mr-2" />
                {settingsLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          <Button variant="outline" onClick={closeForm}>
            Close
          </Button>
        </div>
      </div>
    );
  };

  // Login component
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Admin Login</h1>
              <p className="text-muted-foreground">Access your portfolio dashboard</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full p-3 border rounded-lg bg-background"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full p-3 border rounded-lg bg-background"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <Button onClick={handleLogin} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </div>

            {/* <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Demo credentials:</p>
              <p className="text-sm">Email: admin@portfolio.com</p>
              <p className="text-sm">Password: admin123</p>
            </div> */}
          </CardContent>
        </Card>
        <StatusBar />
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'blogs', label: 'Blog Posts', icon: FileText },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'milestones', label: 'Milestones', icon: Award },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome back, {currentUser?.username || 'Admin'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last login: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blog Posts</p>
                <p className="text-2xl font-bold">{blogs.length}</p>
                <p className="text-xs text-green-600">
                  {blogs.filter(b => b.published).length} published
                </p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-green-600">
                  {projects.filter(p => p.published).length} published
                </p>
              </div>
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="text-2xl font-bold">{milestones.length}</p>
                <p className="text-xs text-blue-600">
                  {milestones.filter(m => m.type === 'education').length} education
                </p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skill Categories</p>
                <p className="text-2xl font-bold">{skillCategories.length}</p>
                <p className="text-xs text-purple-600">
                  {softSkills.length} soft skills
                </p>
              </div>
              <Settings className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Blog Posts</h3>
            <div className="space-y-3">
              {blogs.slice(0, 3).map(blog => (
                <div key={blog._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{blog.title}</p>
                    <p className="text-sm text-muted-foreground">{blog.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={blog.published ? 'default' : 'secondary'}>
                      {blog.published ? 'Published' : 'Draft'}
                    </Badge>
                    {blog.featured && (
                      <Badge className="bg-amber-500 text-white">Featured</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
            <div className="space-y-3">
              {projects.slice(0, 3).map(project => (
                <div key={project._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">{project.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={project.published ? 'default' : 'secondary'}>
                      {project.published ? 'Published' : 'Draft'}
                    </Badge>
                    {project.featured && (
                      <Badge className="bg-amber-500 text-white">Featured</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContentTable = (items: any[], type: string) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold capitalize">{type}</h2>
        <Button onClick={() => openForm(type)}>
          <Plus className="w-4 h-4 mr-2" />
          Add {type.slice(0, -1)}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{item.title}</td>
                    <td className="p-4">{item.category || item.institution || item.issuer || item.type}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.published !== false ? 'default' : 'secondary'}>
                          {item.published !== false ? 'Published' : 'Draft'}
                        </Badge>
                        {item.featured && (
                          <Badge className="bg-amber-500 text-white">Featured</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openForm(type, item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(type, item._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderForm = () => {
    if (!showForm) return null;

    let FormComponent;
    let title = '';

    switch (formType) {
      case 'blogs':
        FormComponent = BlogForm;
        title = `${editingItem ? 'Edit' : 'Add'} Blog Post`;
        break;
      case 'projects':
        FormComponent = ProjectForm;
        title = `${editingItem ? 'Edit' : 'Add'} Project`;
        break;
      case 'milestones':
        FormComponent = MilestoneForm;
        title = `${editingItem ? 'Edit' : 'Add'} Milestone`;
        break;
      case 'skills':
        FormComponent = SkillsForm;
        title = 'Manage Skills';
        break;
      case 'settings':
        FormComponent = SettingsForm;
        title = 'Settings';
        break;
      default:
        return null;
    }

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Button size="sm" variant="outline" onClick={closeForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <FormComponent />
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'blogs':
        return renderContentTable(blogs, 'blogs');
      case 'projects':
        return renderContentTable(projects, 'projects');
      case 'milestones':
        return renderContentTable(milestones, 'milestones');
      case 'skills':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Skills Management</h2>
              <Button onClick={() => openForm('skills')}>
                <Settings className="w-4 h-4 mr-2" />
                Manage Skills
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Technical Skills</h3>
                  <div className="space-y-2">
                    {skillCategories.map((category, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{category.categoryTitle}</span>
                        <Badge variant="secondary">{category.skills.length} skills</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Soft Skills</h3>
                  <div className="space-y-2">
                    {softSkills.slice(0, 6).map((skill, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{skill.name}</span>
                        <Badge variant="outline">Order: {skill.order}</Badge>
                      </div>
                    ))}
                    {softSkills.length > 6 && (
                      <p className="text-sm text-muted-foreground">
                        +{softSkills.length - 6} more...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Settings</h2>
              <Button onClick={() => openForm('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Manage Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium">{currentUser?.username || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{currentUser?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <Badge>{currentUser?.role || 'Admin'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">System Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Upload Service:</span>
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Database:</span>
                      <Badge variant="default" className="bg-green-500">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Last Backup:</span>
                      <span className="text-sm">N/A</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">Portfolio Admin</h1>
          {currentUser && (
            <p className="text-sm text-muted-foreground mt-1">
              Welcome, {currentUser.username}
            </p>
          )}
        </div>

        <nav className="mt-6 flex-1">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-muted/50 transition-colors ${activeTab === item.id ? 'bg-muted border-r-2 border-primary' : ''
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t">
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      {/* Form Modal */}
      {renderForm()}

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default AdminDashboard;