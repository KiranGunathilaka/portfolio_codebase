// FIXED: Use import.meta.env for Vite instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.refreshPromise = null;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('admin_token');
  }

  // Set auth token
  setAuthToken(token) {
    localStorage.setItem('admin_token', token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('token_expires_at');
  }

  // Get token expiration
  getTokenExpiration() {
    return localStorage.getItem('token_expires_at');
  }

  // Set token expiration
  setTokenExpiration(expiresAt) {
    localStorage.setItem('token_expires_at', expiresAt);
  }

  // Get admin user data
  getAdminUser() {
    const userData = localStorage.getItem('admin_user');
    return userData ? JSON.parse(userData) : null;
  }

  // Set admin user data
  setAdminUser(user) {
    localStorage.setItem('admin_user', JSON.stringify(user));
  }

  // Check if token is expired
  isTokenExpired() {
    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) return true;
    
    return Date.now() >= new Date(expiresAt).getTime() - 5 * 60 * 1000; // 5 min buffer
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAuthToken();
    return token && !this.isTokenExpired();
  }

  // Refresh token
  async refreshToken() {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        this.setAuthToken(data.token);
        this.setTokenExpiration(data.expiresAt);
        this.setAdminUser(data.admin);
        
        return data.token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.removeAuthToken();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Generic request method with automatic token refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    let token = this.getAuthToken();

    // Check if token needs refresh
    if (token && this.isTokenExpired()) {
      try {
        token = await this.refreshToken();
      } catch (error) {
        // Redirect to login or handle auth failure
        window.location.href = '/admin';
        throw new Error('Authentication failed');
      }
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 errors (token expired/invalid)
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        
        // If token is expired or invalid, try to refresh once
        if (token && !this.refreshPromise) {
          try {
            const newToken = await this.refreshToken();
            
            // Retry the original request with new token
            const retryConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${newToken}`
              }
            };
            
            const retryResponse = await fetch(url, retryConfig);
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              throw new Error(retryData.error || 'Request failed after token refresh');
            }
            
            return retryData;
          } catch (refreshError) {
            console.error('Token refresh and retry failed:', refreshError);
            this.removeAuthToken();
            throw new Error('Authentication failed');
          }
        } else {
          this.removeAuthToken();
          throw new Error(errorData.error || 'Authentication required');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
      this.setTokenExpiration(response.expiresAt);
      this.setAdminUser(response.admin);
    }
    
    return response;
  }

  async logout() {
    try {
      // Notify server about logout (to blacklist token)
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Server logout failed:', error);
    } finally {
      // Always clear local storage
      this.removeAuthToken();
    }
  }

  async getCurrentAdmin() {
    return this.request('/auth/me');
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async updateProfile(userData) {
    const response = await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    
    // Update stored user data
    this.setAdminUser(response);
    return response;
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  // Blog methods
  async getBlogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/blogs?${queryString}`);
  }

  async getBlogBySlug(slug) {
    return this.request(`/blogs/${slug}`);
  }

  async getAdminBlogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/blogs/admin/all?${queryString}`);
  }

  async createBlog(blogData) {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  async updateBlog(id, blogData) {
    return this.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  }

  async deleteBlog(id) {
    return this.request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  }

  async getBlogCategories() {
    return this.request('/blogs/meta/categories');
  }

  // Project methods
  async getProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects?${queryString}`);
  }

  async getProjectBySlug(slug) {
    return this.request(`/projects/${slug}`);
  }

  async getAdminProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects/admin/all?${queryString}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjectCategories() {
    return this.request('/projects/meta/categories');
  }

  // Milestone methods
  async getMilestones(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/milestones?${queryString}`);
  }

  async createMilestone(milestoneData) {
    return this.request('/milestones', {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
  }

  async updateMilestone(id, milestoneData) {
    return this.request(`/milestones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(milestoneData),
    });
  }

  async deleteMilestone(id) {
    return this.request(`/milestones/${id}`, {
      method: 'DELETE',
    });
  }

  // Skills methods
  async getSkills() {
    return this.request('/skills');
  }

  async getSoftSkills() {
    return this.request('/skills/soft');
  }

  async updateSkills(skillsData) {
    return this.request('/skills', {
      method: 'PUT',
      body: JSON.stringify(skillsData),
    });
  }

  async updateSoftSkills(softSkillsData) {
    return this.request('/skills/soft', {
      method: 'PUT',
      body: JSON.stringify(softSkillsData),
    });
  }

  // File upload methods with better error handling
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = this.getAuthToken();
      
      // Check if token needs refresh before upload
      if (token && this.isTokenExpired()) {
        await this.refreshToken();
      }

      const response = await fetch(`${this.baseURL}/upload/image`, {
        method: 'POST',
        headers: {
          ...(this.getAuthToken() && { Authorization: `Bearer ${this.getAuthToken()}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files) {
    try {
      const formData = new FormData();
      
      // Add all files to form data
      Array.from(files).forEach((file, index) => {
        formData.append('images', file);
      });

      const token = this.getAuthToken();
      
      // Check if token needs refresh before upload
      if (token && this.isTokenExpired()) {
        await this.refreshToken();
      }

      const response = await fetch(`${this.baseURL}/upload/images`, {
        method: 'POST',
        headers: {
          ...(this.getAuthToken() && { Authorization: `Bearer ${this.getAuthToken()}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Multiple image upload error:', error);
      throw error;
    }
  }

  async deleteImage(publicId) {
    return this.request(`/upload/image/${encodeURIComponent(publicId)}`, {
      method: 'DELETE'
    });
  }

  async getUploadConfig() {
    return this.request('/upload/config');
  }

  async checkUploadHealth() {
    return this.request('/upload/health');
  }

  // Utility methods
  async healthCheck() {
    return fetch(`${this.baseURL}/health`)
      .then(res => res.json())
      .catch(error => ({
        status: 'ERROR',
        error: error.message
      }));
  }

  // File validation helper
  validateImageFile(file, maxSize = 10 * 1024 * 1024) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }
    
    return true;
  }

  // Helper to get readable file size
  getReadableFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

export default new ApiService();