export const standardSkillCategories = [
  "Programming Languages",
  "Frontend Development",
  "Backend Development",
  "Database & Storage",
  "Cloud & DevOps",
  "Mobile App Development",
  "UI/UX & Design",
  "AI & Machine Learning",
  "Core CS & Algorithms",
  "Tools & Utilities"
];

export const initialPortfolioData = {
  profile: {
    name: "Alex Morgan",
    designation: "Full Stack Software Engineer & Cloud Developer",
    tagline: "I build modern, scalable, and resilient web applications.",
    typingPhrases: [
      "Full Stack Developer",
      "Cloud Architect",
      "Java & TypeScript Specialist",
      "System Designer"
    ],
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    resumeUrl: "",
    bio: "Dedicated software engineer with a strong foundation in modern web technologies, scalable backend architectures, and cloud services. I thrive on translating complex requirements into clean, performant, and elegant digital products. With hands-on experience spanning frontend frameworks, microservices, and automated deployment pipelines, I continuously push for code quality and architectural clarity.",
    careerGoals: "My objective is to build high-impact, distributed software systems that scale effortlessly. I am passionate about cloud-native technologies, developer tooling, and modern full-stack frameworks, seeking opportunities to collaborate with ambitious engineering teams.",
    email: "alex.morgan.dev@gmail.com",
    contactRecipientEmail: "alex.morgan.dev@gmail.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    whatsapp: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    statusBadge: "Available for Hire"
  },

  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Science in Computer Science",
      institution: "State University of Science & Technology",
      department: "Department of Computer Science & Engineering",
      year: "2020 - 2024",
      achievements: "Graduated with High Honors (GPA: 3.89/4.0). Lead Developer for Capstone Project on Distributed Storage. Teaching Assistant for Data Structures & Algorithms course."
    },
    {
      id: "edu-2",
      degree: "Higher Secondary Certificate (Science & Mathematics)",
      institution: "National Science Academy",
      department: "Physical Sciences",
      year: "2018 - 2020",
      achievements: "Achieved Top 1% in State Board Examinations. Captain of Competitive Programming & Robotics Club."
    }
  ],

  skills: [
    { id: "skill-1", name: "Java (SE 17 / 21)", category: "Programming Languages", level: 90, icon: "Code" },
    { id: "skill-2", name: "TypeScript & JavaScript", category: "Programming Languages", level: 95, icon: "Code" },
    { id: "skill-3", name: "Python", category: "Programming Languages", level: 85, icon: "Code" },
    { id: "skill-4", name: "React.js & Next.js", category: "Frontend Development", level: 95, icon: "Layers" },
    { id: "skill-5", name: "HTML5, CSS3 & Tailwind", category: "Frontend Development", level: 95, icon: "Layout" },
    { id: "skill-6", name: "Node.js & Express.js", category: "Backend Development", level: 90, icon: "Server" },
    { id: "skill-7", name: "Spring Boot", category: "Backend Development", level: 85, icon: "Server" },
    { id: "skill-8", name: "RESTful & GraphQL APIs", category: "Backend Development", level: 92, icon: "Layers" },
    { id: "skill-9", name: "Cloud Firestore & Firebase", category: "Database & Storage", level: 92, icon: "Flame" },
    { id: "skill-10", name: "MongoDB & PostgreSQL", category: "Database & Storage", level: 88, icon: "Database" },
    { id: "skill-11", name: "Docker & Containerization", category: "Cloud & DevOps", level: 84, icon: "Cloud" },
    { id: "skill-12", name: "AWS & Google Cloud Basics", category: "Cloud & DevOps", level: 82, icon: "Cloud" },
    { id: "skill-13", name: "CI/CD & GitHub Actions", category: "Cloud & DevOps", level: 88, icon: "GitBranch" },
    { id: "skill-14", name: "Data Structures & Algorithms", category: "Core CS & Algorithms", level: 90, icon: "Cpu" },
    { id: "skill-15", name: "Object-Oriented Design (OOP)", category: "Core CS & Algorithms", level: 92, icon: "Box" },
    { id: "skill-16", name: "Git, GitHub & Version Control", category: "Tools & Utilities", level: 95, icon: "GitBranch" },
    { id: "skill-17", name: "Figma & Wireframing", category: "UI/UX & Design", level: 80, icon: "Palette" },
    { id: "skill-18", name: "PyTorch & Generative AI Basics", category: "AI & Machine Learning", level: 75, icon: "Cpu" }
  ],

  projects: [
    {
      id: "proj-1",
      title: "CloudPulse - Observability & Metrics Platform",
      description: "A comprehensive real-time system monitoring platform tracking CPU, RAM, and network throughput across distributed clusters with anomaly detection alerts.",
      technologies: ["React", "Node.js", "Firebase", "Tailwind CSS", "Chart.js"],
      githubUrl: "https://github.com",
      liveDemoUrl: "https://example.com/demo",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      category: "Full Stack",
      featured: true,
      date: "2024"
    },
    {
      id: "proj-2",
      title: "DevSprint - Agile Task & Kanban Workspace",
      description: "Collaborative project management dashboard supporting dynamic drag-and-drop task pipelines, sprint velocity burndown charts, and team role management.",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Firebase Firestore"],
      githubUrl: "https://github.com",
      liveDemoUrl: "https://example.com/demo",
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800",
      category: "Web App",
      featured: true,
      date: "2024"
    },
    {
      id: "proj-3",
      title: "NexusPay - Modern Multi-Currency Gateway",
      description: "Secure fintech dashboard and payment engine processing cross-border tokenized payments with fraud detection rules and automated invoice generation.",
      technologies: ["Java", "Spring Boot", "React", "PostgreSQL", "Tailwind"],
      githubUrl: "https://github.com",
      liveDemoUrl: "https://example.com/demo",
      imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800",
      category: "Full Stack",
      featured: false,
      date: "2023"
    },
    {
      id: "proj-4",
      title: "AlgoVisualizer - Interactive Algorithm Studio",
      description: "Educational visualization application animating sorting algorithms (QuickSort, MergeSort), graph traversals (Dijkstra, A*), and dynamic programming trees.",
      technologies: ["JavaScript", "HTML5 Canvas", "Tailwind CSS"],
      githubUrl: "https://github.com",
      liveDemoUrl: "https://example.com/demo",
      imageUrl: "https://images.unsplash.com/photo-1516116211227-bbc13c6041e0?auto=format&fit=crop&q=80&w=800",
      category: "Education",
      featured: false,
      date: "2023"
    }
  ],

  certificates: [
    {
      id: "cert-1",
      title: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services (AWS)",
      issueDate: "Jan 2024",
      credentialId: "AWS-SAA-8492041",
      credentialUrl: "https://aws.amazon.com/verification",
      imageUrl: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "cert-2",
      title: "Meta Full-Stack Engineer Professional Certificate",
      issuer: "Meta",
      issueDate: "Oct 2023",
      credentialId: "META-FS-910382",
      credentialUrl: "https://coursera.org/verify/meta-certificate",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "cert-3",
      title: "Oracle Certified Professional: Java SE 17 Developer",
      issuer: "Oracle Corporation",
      issueDate: "May 2023",
      credentialId: "OCP-JAVA-548192",
      credentialUrl: "https://oracle.com/certview",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600"
    }
  ],

  messages: [
    {
      id: "msg-1",
      name: "Sarah Jenkins",
      email: "sarah.j@techrecruiter.com",
      subject: "Senior Full Stack Engineering Opportunity",
      message: "Hi Alex, I was impressed by your CloudPulse project on GitHub. We are looking for a software engineer to join our cloud platform team. Would love to connect!",
      createdAt: "2024-09-08T10:15:00.000Z",
      read: false
    }
  ]
};
