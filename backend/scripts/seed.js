const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { Blog, Project, Milestone, Skill, SoftSkill, Admin } = require('../models');

// Your existing data (extracted from components)
const blogPosts = [
  {
    title: "Advanced SLAM Techniques in Modern Robotics",
    slug: "advanced-slam-techniques",
    excerpt: "A comprehensive guide to implementing simultaneous localization and mapping for mobile robots using modern ROS 2 frameworks and best practices.",
    content: `<p>Simultaneous Localization and Mapping (SLAM) represents one of the most fundamental challenges in robotics...</p>`,
    category: "Robotics",
    tags: ["ROS 2", "SLAM", "Navigation", "Robotics"],
    featured: true,
    readTime: "8 min read",
    publishedAt: new Date("2024-01-15")
  },
  {
    title: "Optimization Strategies for Embedded Systems",
    slug: "embedded-systems-optimization",
    excerpt: "Learn how to maximize battery life in ESP32-based IoT devices through advanced power management techniques and deep sleep optimization strategies.",
    content: `<p>Embedded systems development requires a unique mindset where every byte of memory and every CPU cycle matters...</p>`,
    category: "Embedded",
    tags: ["ESP32", "IoT", "Power Management", "Embedded"],
    featured: false,
    readTime: "12 min read",
    publishedAt: new Date("2024-01-08")
  },
  {
    title: "IoT Security: Best Practices and Implementation",
    slug: "iot-security-best-practices",
    excerpt: "My complete workflow for taking electronic designs from initial concept through PCB design, prototyping, testing, and small-scale production.",
    content: `<p>As IoT devices proliferate across industries, security has become paramount...</p>`,
    category: "IoT",
    tags: ["IoT", "Security", "Cybersecurity", "Best Practices"],
    featured: true,
    readTime: "15 min read",
    publishedAt: new Date("2024-01-01")
  }
];

const projects = [
  {
    title: "Autonomous Mobile Robot Platform",
    slug: "autonomous-mobile-robot",
    description: "Modular indoor AMR with Dockerised ROS 2 integration, SLAM navigation, and real-time path planning for warehouse automation.",
    fullDescription: "This project represents a comprehensive approach to autonomous mobile robotics, implementing state-of-the-art SLAM algorithms within a containerized ROS 2 environment.",
    category: "robotics",
    technologies: ["ROS 2", "Docker", "SLAM", "Python", "C++", "OpenCV"],
    features: [
      "Real-time SLAM implementation using LiDAR and camera fusion",
      "Dockerized deployment for consistent environments",
      "Modular sensor integration architecture",
      "Path planning with dynamic obstacle avoidance",
      "Web-based monitoring and control interface"
    ],
    techDetails: "Built using ROS 2 Humble with custom navigation stack, OpenCV for computer vision, and PCL for point cloud processing.",
    github: "https://github.com/KiranGunathilaka",
    demo: "#",
    featured: true,
    date: "2024"
  },
  {
    title: "Team BB-Alr-8 Kobuki Rescue Robot",
    slug: "kobuki-rescue-robot",
    description: "Kinect-based object detection and manipulation system with Webots simulation environment for emergency response scenarios.",
    fullDescription: "Developed as part of a competitive robotics challenge, this rescue robot combines advanced computer vision with precise mechanical manipulation.",
    category: "robotics",
    technologies: ["Kinect", "Webots", "Computer Vision", "ROS", "C++"],
    features: [
      "Kinect-based 3D object recognition and tracking",
      "Precision robotic arm control for object manipulation",
      "Autonomous navigation in complex environments",
      "Real-time simulation in Webots environment"
    ],
    techDetails: "Utilizes Microsoft Kinect for depth sensing, integrated with ROS for sensor fusion and control.",
    github: "https://github.com/KiranGunathilaka",
    demo: "#",
    featured: true,
    date: "2023"
  },
  {
    title: "IoT Smart Bus Ticketing System",
    slug: "iot-bus-ticketing",
    description: "GPS/GPRS-enabled ticketing solution with real-time tracking, passenger analytics dashboard, and mobile payment integration.",
    fullDescription: "A complete IoT ecosystem designed to modernize public transportation through smart ticketing and fleet management.",
    category: "iot",
    technologies: ["ESP32", "GPS", "GPRS", "React", "Node.js", "MongoDB"],
    features: [
      "Real-time GPS tracking and route optimization",
      "GPRS-based communication for remote areas",
      "Contactless payment integration",
      "Fleet management dashboard"
    ],
    techDetails: "ESP32-based hardware with GPS/GPRS modules, React dashboard for monitoring, and cloud backend for data processing.",
    github: "https://github.com/KiranGunathilaka",
    demo: "#",
    featured: false,
    date: "2023"
  }
];

const milestones = [
  {
    type: "education",
    title: "B.Sc. Electronic & Telecommunication Engineering",
    institution: "University of Moratuwa",
    period: "2023 - 2027",
    status: "Current",
    gpa: "3.74",
    recentGPA: "SGPA 3.96, 3.91, 3.37",
    description: "Specializing in embedded systems, robotics, and communication technologies.",
    achievements: [
      "Dean's List recognition for academic excellence",
      "Active member of IEEE Student Branch",
      "Robotics team lead for competitive events",
      "Research involvement in autonomous systems"
    ],
    coursework: [
      "Digital Signal Processing",
      "Embedded Systems Design",
      "Control Systems Engineering",
      "Communication Networks"
    ],
    order: 1
  },
  {
    type: "certification",
    title: "ROS 2 Navigation and SLAM",
    issuer: "The Construct",
    date: "2024",
    certType: "Professional",
    description: "Advanced robotics certification focusing on ROS 2 navigation stack and SLAM implementation.",
    order: 1
  },
  {
    type: "certification",
    title: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services",
    date: "2023",
    certType: "Cloud",
    description: "Cloud computing fundamentals and AWS services certification.",
    order: 2
  }
];

const skillCategories = [
  {
    category: "programming",
    categoryTitle: "Programming Languages",
    categoryIcon: "Code",
    skills: [
      { name: "C/C++", level: 85, description: "Embedded systems, firmware development" },
      { name: "Python", level: 75, description: "AI/ML, automation, web backends" },
      { name: "JavaScript", level: 50, description: "Full-stack web development" },
      { name: "Java", level: 75, description: "Enterprise applications, Android" },
      { name: "MATLAB", level: 65, description: "Signal processing, simulation" }
    ],
    order: 1
  },
  {
    category: "frameworks",
    categoryTitle: "Frameworks & Libraries",
    categoryIcon: "Globe",
    skills: [
      { name: "ROS 2", level: 80, description: "Robotics middleware" },
      { name: "OpenCV", level: 75, description: "Computer vision applications" },
      { name: "NumPy/pandas", level: 80, description: "Data analysis and ML" },
      { name: "React/Next.js", level: 85, description: "Modern web applications" },
      { name: "Express.js", level: 70, description: "Backend API development" }
    ],
    order: 2
  }
];

const softSkills = [
  { name: "Leadership & Team Management", order: 1 },
  { name: "Technical Communication", order: 2 },
  { name: "Problem-Solving & Critical Thinking", order: 3 },
  { name: "Project Management", order: 4 },
  { name: "Cross-functional Collaboration", order: 5 },
  { name: "Mentoring & Knowledge Transfer", order: 6 }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Blog.deleteMany({}),
      Project.deleteMany({}),
      Milestone.deleteMany({}),
      Skill.deleteMany({}),
      SoftSkill.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await Admin.findOneAndUpdate(
      { email: 'admin@portfolio.com' },
      {
        username: 'admin',
        email: 'admin@portfolio.com',
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );
    console.log('Created default admin user');

    // Seed blogs
    await Blog.insertMany(blogPosts);
    console.log(`Seeded ${blogPosts.length} blog posts`);

    // Seed projects
    await Project.insertMany(projects);
    console.log(`Seeded ${projects.length} projects`);

    // Seed milestones
    await Milestone.insertMany(milestones);
    console.log(`Seeded ${milestones.length} milestones`);

    // Seed skills
    await Skill.insertMany(skillCategories);
    console.log(`Seeded ${skillCategories.length} skill categories`);

    // Seed soft skills
    await SoftSkill.insertMany(softSkills);
    console.log(`Seeded ${softSkills.length} soft skills`);

    console.log('\n✅ Database seeded successfully!');
    console.log('Default admin credentials:');
    console.log('Email: admin@portfolio.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();