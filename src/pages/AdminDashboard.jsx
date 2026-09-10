import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { portfolioService } from '../services/portfolioService';
import { standardSkillCategories } from '../services/initialData';
import { Link, useNavigate } from 'react-router-dom';
import { ResumeModal } from '../components/common/ResumeModal';
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Award,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sun,
  Moon,
  Cloud,
  Database,
  Eye,
  Check,
  X,
  Upload,
  FileText,
  KeyRound,
  ShieldCheck,
  Download
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    currentUser,
    logout,
    isDemoMode,
    demoEmail,
    updateAdminEmail,
    updateAdminPassword
  } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Resume Modal Preview state
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Modals & Editing states
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'skill' | 'project' | 'certificate' | 'education'

  // Image Upload state inside modal
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Custom Category State in Skill Modal
  const [skillCategoryOption, setSkillCategoryOption] = useState('Programming Languages');
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Security Credentials Form States
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [securityStatus, setSecurityStatus] = useState({ loading: false, msg: null, error: null });

  // MongoDB Atlas & Cloudinary State
  const [mongoTestResult, setMongoTestResult] = useState(null);
  const [testingMongo, setTestingMongo] = useState(false);
  const [cloudinaryTestResult, setCloudinaryTestResult] = useState(null);
  const [testingCloudinary, setTestingCloudinary] = useState(false);
  const [seedingMongo, setSeedingMongo] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await portfolioService.getAllData({ fresh: true });
      setData(res);
      if (res.profile?.email) {
        setNewAdminEmail(res.profile.email);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading portfolio data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Profile Save (including Instagram)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData(e.target);
      const typingRaw = form.get('typingPhrases') || '';
      const typingPhrases = typingRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      let avatarUrl = form.get('avatarUrl') || data.profile?.avatarUrl;
      const avatarFile = form.get('avatarFile');
      if (avatarFile && avatarFile.size > 0) {
        avatarUrl = await portfolioService.uploadImage(avatarFile, 'avatars');
      }

      const updatedProfile = {
        name: form.get('name'),
        designation: form.get('designation'),
        tagline: form.get('tagline'),
        avatarUrl,
        resumeUrl: form.get('resumeUrl'),
        statusBadge: form.get('statusBadge'),
        email: form.get('email'),
        contactRecipientEmail: form.get('contactRecipientEmail') || form.get('email'),
        whatsapp: form.get('whatsapp') || '',
        location: form.get('location'),
        github: form.get('github'),
        linkedin: form.get('linkedin'),
        instagram: form.get('instagram') || '',
        twitter: form.get('twitter'),
        typingPhrases,
        bio: form.get('bio') || data.profile.bio,
        careerGoals: form.get('careerGoals') || data.profile.careerGoals,
      };

      await portfolioService.updateProfile(updatedProfile);
      setData((prev) => ({ ...prev, profile: updatedProfile }));
      showToast('Profile, social links, and contact settings saved!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // About & Bio Save
  const handleAboutSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData(e.target);
      const updatedProfile = {
        ...data.profile,
        bio: form.get('bio'),
        careerGoals: form.get('careerGoals'),
      };
      await portfolioService.updateProfile(updatedProfile);
      setData((prev) => ({ ...prev, profile: updatedProfile }));
      showToast('About information saved!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save about details', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Open Modal Helper
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setSelectedFile(null);
    setImagePreview(item?.imageUrl || '');
    if (type === 'skill') {
      if (item?.category && !standardSkillCategories.includes(item.category)) {
        setSkillCategoryOption('__custom__');
        setCustomCategoryInput(item.category);
      } else {
        setSkillCategoryOption(item?.category || standardSkillCategories[0]);
        setCustomCategoryInput('');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const localUrl = URL.createObjectURL(file);
      setImagePreview(localUrl);
    }
  };

  // Skills CRUD
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const resolvedCategory =
      skillCategoryOption === '__custom__'
        ? customCategoryInput.trim() || 'General'
        : skillCategoryOption;

    const skillData = {
      name: form.get('name'),
      category: resolvedCategory,
      level: parseInt(form.get('level'), 10) || 85,
    };

    setSaving(true);
    try {
      if (editingItem?.id) {
        await portfolioService.updateSkill(editingItem.id, skillData);
        showToast('Skill updated!');
      } else {
        await portfolioService.addSkill(skillData);
        showToast('Skill created!');
      }
      setModalType(null);
      setEditingItem(null);
      loadData();
    } catch (err) {
      showToast('Error saving skill', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await portfolioService.deleteSkill(id);
      showToast('Skill deleted');
      loadData();
    } catch (err) {
      showToast('Error deleting skill', 'error');
    }
  };

  // Projects CRUD
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const techRaw = form.get('technologies') || '';
    const technologies = techRaw.split(',').map((t) => t.trim()).filter(Boolean);

    setSaving(true);
    try {
      let finalImageUrl = imagePreview || editingItem?.imageUrl || '';
      if (selectedFile) {
        setUploadingImage(true);
        finalImageUrl = await portfolioService.uploadImage(selectedFile, 'projects');
      }

      const projectData = {
        title: form.get('title'),
        description: form.get('description'),
        category: form.get('category'),
        date: form.get('date'),
        imageUrl: finalImageUrl,
        githubUrl: form.get('githubUrl'),
        liveDemoUrl: form.get('liveDemoUrl'),
        technologies,
      };

      if (editingItem?.id) {
        await portfolioService.updateProject(editingItem.id, projectData);
        showToast('Project updated with image!');
      } else {
        await portfolioService.addProject(projectData);
        showToast('Project created with image!');
      }
      setModalType(null);
      setEditingItem(null);
      setSelectedFile(null);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error saving project image', 'error');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await portfolioService.deleteProject(id);
      showToast('Project removed');
      loadData();
    } catch (err) {
      showToast('Error deleting project', 'error');
    }
  };

  // Certificates CRUD
  const handleCertSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    setSaving(true);
    try {
      let finalImageUrl = imagePreview || editingItem?.imageUrl || '';
      if (selectedFile) {
        finalImageUrl = await portfolioService.uploadImage(selectedFile, 'certificates');
      }

      const certData = {
        title: form.get('title'),
        issuer: form.get('issuer'),
        issueDate: form.get('issueDate'),
        credentialId: form.get('credentialId'),
        credentialUrl: form.get('credentialUrl'),
        imageUrl: finalImageUrl,
      };

      if (editingItem?.id) {
        await portfolioService.updateCertificate(editingItem.id, certData);
        showToast('Certificate updated!');
      } else {
        await portfolioService.addCertificate(certData);
        showToast('Certificate created!');
      }
      setModalType(null);
      setEditingItem(null);
      setSelectedFile(null);
      loadData();
    } catch (err) {
      showToast('Error saving certificate', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await portfolioService.deleteCertificate(id);
      showToast('Certificate removed');
      loadData();
    } catch (err) {
      showToast('Error deleting certificate', 'error');
    }
  };

  // Education CRUD
  const handleEduSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const eduData = {
      degree: form.get('degree'),
      institution: form.get('institution'),
      department: form.get('department'),
      year: form.get('year'),
      achievements: form.get('achievements'),
    };

    setSaving(true);
    try {
      if (editingItem?.id) {
        await portfolioService.updateEducation(editingItem.id, eduData);
        showToast('Education updated!');
      } else {
        await portfolioService.addEducation(eduData);
        showToast('Education created!');
      }
      setModalType(null);
      setEditingItem(null);
      loadData();
    } catch (err) {
      showToast('Error saving education', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEdu = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      await portfolioService.deleteEducation(id);
      showToast('Education removed');
      loadData();
    } catch (err) {
      showToast('Error deleting education', 'error');
    }
  };

  // Messages CRUD
  const handleToggleMessageRead = async (id, currentState) => {
    try {
      await portfolioService.markMessageRead(id, !currentState);
      setData((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => (m.id === id ? { ...m, read: !currentState } : m)),
      }));
      showToast(currentState ? 'Marked as unread' : 'Marked as read');
    } catch (err) {
      showToast('Error updating message', 'error');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await portfolioService.deleteMessage(id);
      setData((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== id),
      }));
      showToast('Message deleted');
    } catch (err) {
      showToast('Error deleting message', 'error');
    }
  };

  // Change Admin Email
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setSecurityStatus({ loading: true, msg: null, error: null });
    try {
      await updateAdminEmail(newAdminEmail);
      setSecurityStatus({ loading: false, msg: 'Admin email updated successfully!', error: null });
      showToast('Admin email updated! Please use this email for future logins.');
    } catch (err) {
      setSecurityStatus({ loading: false, msg: null, error: err.message || 'Failed to update email.' });
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newAdminPassword !== confirmAdminPassword) {
      setSecurityStatus({ loading: false, msg: null, error: 'New password and confirmation do not match.' });
      return;
    }

    setSecurityStatus({ loading: true, msg: null, error: null });
    try {
      await updateAdminPassword(newAdminPassword);
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setSecurityStatus({ loading: false, msg: 'Admin password changed successfully!', error: null });
      showToast('Admin password updated! Please use your new password next time.');
    } catch (err) {
      setSecurityStatus({ loading: false, msg: null, error: err.message || 'Failed to change password.' });
    }
  };

  // Synchronize entire portfolio data directly to MongoDB Atlas
  const handleSeedMongo = async () => {
    setSeedingMongo(true);
    try {
      showToast('Syncing portfolio to MongoDB Atlas...', 'info');
      await portfolioService.syncMongoAtlas(data);
      showToast('All portfolio data synchronized to MongoDB Atlas! Public visitors will now see your updated content.');
      await handleTestMongo();
    } catch (err) {
      showToast(err.message || 'Syncing to MongoDB Atlas failed', 'error');
    } finally {
      setSeedingMongo(false);
    }
  };

  // Test MongoDB Atlas Connection
  const handleTestMongo = async () => {
    setTestingMongo(true);
    setMongoTestResult(null);
    try {
      const res = await portfolioService.testMongoConnection();
      setMongoTestResult(res);
      if (res.success) {
        showToast('MongoDB Atlas is connected and active!');
      } else {
        showToast(res.message || 'MongoDB connection check completed', 'error');
      }
    } catch (err) {
      setMongoTestResult({
        success: false,
        code: 'ERROR',
        message: err.message || 'Failed to connect to MongoDB Atlas'
      });
      showToast('MongoDB test failed', 'error');
    } finally {
      setTestingMongo(false);
    }
  };

  // Test Cloudinary Connection
  const handleTestCloudinary = async () => {
    setTestingCloudinary(true);
    setCloudinaryTestResult(null);
    try {
      const res = await portfolioService.testCloudinaryConnection();
      setCloudinaryTestResult(res);
      if (res.success) {
        showToast('Cloudinary connected and active!');
      } else {
        showToast(res.message || 'Cloudinary check completed');
      }
    } catch (err) {
      setCloudinaryTestResult({
        success: false,
        code: 'ERROR',
        message: err.message || 'Could not reach Cloudinary API'
      });
      showToast('Cloudinary test failed', 'error');
    } finally {
      setTestingCloudinary(false);
    }
  };

  // Factory Reset
  const handleResetDefaults = () => {
    if (!window.confirm('Reset all content to original initial demo data? Custom changes in local storage will be overwritten.')) return;
    const initial = portfolioService.resetToDefaults();
    setData(initial);
    showToast('Reset to default seed data');
  };

  // Export Portfolio JSON Backup
  const handleExportBackup = () => {
    try {
      const json = portfolioService.exportDataAsJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Portfolio backup file downloaded!');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  // Import Portfolio JSON Backup
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const result = portfolioService.importDataFromJson(evt.target.result);
        if (result.success) {
          setData(result.data);
          showToast('Portfolio restored from backup file successfully!');
        } else {
          showToast(result.error || 'Import failed', 'error');
        }
      } catch (err) {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const unreadCount = (data?.messages || []).filter((m) => !m.read).length;

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'hero', label: 'Hero & Profile', icon: User },
    { id: 'about', label: 'About & Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Sparkles, count: data?.skills?.length },
    { id: 'projects', label: 'Projects', icon: FolderGit2, count: data?.projects?.length },
    { id: 'certificates', label: 'Certificates', icon: Award, count: data?.certificates?.length },
    { id: 'messages', label: 'Contact Messages', icon: Mail, count: unreadCount },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl text-sm font-medium animate-fade-in">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Logo / Admin Header */}
          <div className="flex items-center justify-between px-3 py-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-black">
                A
              </span>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  Admin Panel
                </h1>
                <p className="text-[11px] text-slate-400">Content Manager</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions in Sidebar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Quick PDF Resume Generator */}
          <button
            onClick={() => setIsResumeModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>Resume PDF Studio</span>
            </div>
            <Download className="w-3.5 h-3.5" />
          </button>

          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Live Portfolio</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-6xl">
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Portfolio Dashboard Overview
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage your public portfolio content, project uploads, credentials, and auto-generated PDF resume.
                </p>
              </div>

              {/* Generate PDF Resume Shortcut */}
              <button
                onClick={() => setIsResumeModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors self-start"
              >
                <FileText className="w-4 h-4" />
                <span>Generate & Download Resume (PDF)</span>
              </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{data?.projects?.length || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <FolderGit2 className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technical Skills</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{data?.skills?.length || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Certificates</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{data?.certificates?.length || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unread Inquiries</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{unreadCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Quick Actions */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Quick Management Shortcuts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => openModal('project')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-all"
                  >
                    <Plus className="w-4 h-4 text-brand-600 dark:text-brand-400 mb-2" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Upload Project</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct file upload</p>
                  </button>

                  <button
                    onClick={() => openModal('skill')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-all"
                  >
                    <Plus className="w-4 h-4 text-brand-600 dark:text-brand-400 mb-2" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Add Skill</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Expanded categories</p>
                  </button>

                  <button
                    onClick={() => openModal('certificate')}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-all"
                  >
                    <Plus className="w-4 h-4 text-brand-600 dark:text-brand-400 mb-2" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Add Certificate</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Upload credential</p>
                  </button>
                </div>
              </div>

              {/* Data Engine Status */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Cloud & Security Status</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isDemoMode ? 'Demo / Local Storage Mode' : 'Cloud Firestore & Auth Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Form inquiries forward to: <strong className="text-brand-600 dark:text-brand-400">{data?.profile?.contactRecipientEmail || data?.profile?.email || 'admin@portfolio.com'}</strong>
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Manage Account & Database &rarr;
                  </button>
                </div>
              </div>

            </div>

            {/* Recent Inquiries Snippet */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Inquiries</h3>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  View All Messages
                </button>
              </div>

              {(data?.messages || []).length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No contact messages received yet.</p>
              ) : (
                <div className="space-y-3">
                  {(data?.messages || []).slice(0, 3).map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{msg.name}</p>
                          {!msg.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{msg.subject || 'No Subject'}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 flex-shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: HERO & PROFILE (Including Instagram) */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Hero Section & Personal Profile
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Edit hero details, dynamic typing titles, profile picture upload, and social channels (GitHub, LinkedIn, Instagram, Twitter/X).
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={data?.profile?.name || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    name="designation"
                    required
                    defaultValue={data?.profile?.designation || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Dynamic Typing Phrases (separated by comma)
                </label>
                <input
                  type="text"
                  name="typingPhrases"
                  defaultValue={(data?.profile?.typingPhrases || []).join(', ')}
                  placeholder="Full Stack Developer, Cloud Architect, Java Specialist"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">These cycle dynamically with typing animation on your Hero section.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tagline / Hero Short Intro
                </label>
                <textarea
                  name="tagline"
                  rows="2"
                  defaultValue={data?.profile?.tagline || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Profile Image with File Upload option */}
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Profile Avatar Picture
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                    <img
                      src={data?.profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      name="avatarFile"
                      accept="image/*"
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-brand-600 dark:file:bg-slate-700 dark:hover:file:bg-brand-500"
                    />
                    <input
                      type="url"
                      name="avatarUrl"
                      defaultValue={data?.profile?.avatarUrl || ''}
                      placeholder="Or enter image URL..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom Resume Link (Optional - PDF auto-generates if empty)
                  </label>
                  <input
                    type="text"
                    name="resumeUrl"
                    defaultValue={data?.profile?.resumeUrl || ''}
                    placeholder="Leave empty to use automatic PDF generator"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status Badge Text
                  </label>
                  <input
                    type="text"
                    name="statusBadge"
                    defaultValue={data?.profile?.statusBadge || 'Available for Hire'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Direct Email & Social Contact Configuration */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direct Contact & Social Media Channels</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure your direct social links, including Instagram, LinkedIn, GitHub, and WhatsApp.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Public Contact Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue={data?.profile?.email || ''}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Email (Where form messages are sent) *
                    </label>
                    <input
                      type="email"
                      name="contactRecipientEmail"
                      required
                      defaultValue={data?.profile?.contactRecipientEmail || data?.profile?.email || ''}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      defaultValue={data?.profile?.whatsapp || ''}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={data?.profile?.location || ''}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      name="linkedin"
                      defaultValue={data?.profile?.linkedin || ''}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      name="github"
                      defaultValue={data?.profile?.github || ''}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  {/* INSTAGRAM FIELD */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      name="instagram"
                      defaultValue={data?.profile?.instagram || ''}
                      placeholder="https://instagram.com/yourhandle"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Twitter / X URL</label>
                    <input
                      type="url"
                      name="twitter"
                      defaultValue={data?.profile?.twitter || ''}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 shadow transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Profile & Social Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: ABOUT & EDUCATION */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                About & Education
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your comprehensive introduction, career aspirations, and academic milestones.
              </p>
            </div>

            <form onSubmit={handleAboutSubmit} className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Professional Bio & Aspirations</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  About Me / Professional Introduction
                </label>
                <textarea
                  name="bio"
                  rows="4"
                  defaultValue={data?.profile?.bio || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Career Goals & Future Interests
                </label>
                <textarea
                  name="careerGoals"
                  rows="3"
                  defaultValue={data?.profile?.careerGoals || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save About Content</span>
                </button>
              </div>
            </form>

            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Education History</h3>
                <button
                  onClick={() => openModal('education')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.education || []).map((edu) => (
                  <div key={edu.id} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{edu.degree}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{edu.institution} &bull; {edu.year}</p>
                      {edu.achievements && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{edu.achievements}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openModal('education', edu)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEdu(edu.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Skills Management ({data?.skills?.length || 0})
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Organize technical skills across comprehensive categories with custom category support.
                </p>
              </div>
              <button
                onClick={() => openModal('skill')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Skill</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data?.skills || []).map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between group"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{skill.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                          {skill.category}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{skill.level}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openModal('skill', skill)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Projects Management ({data?.projects?.length || 0})
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Upload project screenshots directly as image files without typing URLs.
                </p>
              </div>
              <button
                onClick={() => openModal('project')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data?.projects || []).map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden relative group">
                      <img
                        src={project.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                        {project.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{project.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(project.technologies) ? project.technologies : []).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {project.liveDemoUrl && (
                        <a href={project.liveDemoUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                          Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline">
                          GitHub
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal('project', project)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit / Replace Image"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Certificates Management ({data?.certificates?.length || 0})
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Upload credentials and verification links directly.
                </p>
              </div>
              <button
                onClick={() => openModal('certificate')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certificate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data?.certificates || []).map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                      <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cert.title}</h4>
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">{cert.issuer}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{cert.issueDate} &bull; ID: {cert.credentialId}</p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {cert.credentialUrl ? (
                      <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1">
                        Verify <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span />}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal('certificate', cert)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCert(cert.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CONTACT MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Contact Inquiries ({data?.messages?.length || 0})
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Messages submitted through the portfolio contact form are dispatched to your email and saved here.
              </p>
            </div>

            {(data?.messages || []).length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-400">
                No contact inquiries yet.
              </div>
            ) : (
              <div className="space-y-4">
                {(data?.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      msg.read
                        ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80'
                        : 'bg-brand-50/40 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800/80 shadow-subtle'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{msg.name}</h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400">&lt;{msg.email}&gt;</span>
                          {!msg.read && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {msg.subject || 'No subject'}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {msg.message}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Portfolio Inquiry')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Reply via Email</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMessageRead(msg.id, msg.read)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {msg.read ? 'Mark as Unread' : 'Mark as Read'}
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SETTINGS & SECURITY */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Settings & Admin Security
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your administrator credentials, password changes, and Cloud Firestore integration.
              </p>
            </div>

            {/* Security Alerts */}
            {securityStatus.msg && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{securityStatus.msg}</span>
              </div>
            )}

            {securityStatus.error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{securityStatus.error}</span>
              </div>
            )}

            {/* Change Admin Email / Username */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Admin Email / Username</h3>
                  <p className="text-xs text-slate-500">Current login email: <strong>{currentUser?.email || demoEmail}</strong></p>
                </div>
              </div>

              <form onSubmit={handleChangeEmail} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Admin Login Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="newadmin@example.com"
                    className="w-full max-w-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={securityStatus.loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {securityStatus.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Update Admin Email</span>
                </button>
              </form>
            </div>

            {/* Change Admin Password */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Admin Password</h3>
                  <p className="text-xs text-slate-500">Choose a secure password of at least 6 characters.</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 pt-2 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={securityStatus.loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {securityStatus.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  <span>Change Admin Password</span>
                </button>
              </form>
            </div>

            {/* MongoDB Atlas & Cloudflare Connection Center Card */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">MongoDB Atlas & Cloudinary Center</h3>
                    <p className="text-xs text-slate-500">
                      Database: <strong className="text-emerald-500">MongoDB Atlas (Live Connected)</strong> &bull; Media Storage: <strong className="text-blue-500">Cloudinary</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleTestMongo}
                    disabled={testingMongo}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {testingMongo ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> : <Database className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>Test MongoDB</span>
                  </button>

                  <button
                    onClick={handleTestCloudinary}
                    disabled={testingCloudinary}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {testingCloudinary ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <Upload className="w-3.5 h-3.5 text-blue-500" />}
                    <span>Test Cloudinary</span>
                  </button>

                  <button
                    onClick={handleSeedMongo}
                    disabled={seedingMongo}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow disabled:opacity-50"
                    title="Seed all current portfolio items to MongoDB Atlas collections"
                  >
                    {seedingMongo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                    <span>Seed to MongoDB</span>
                  </button>

                  <button
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Download complete JSON backup"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-500" />
                    <span>Backup JSON</span>
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer" title="Restore portfolio data from a backup JSON">
                    <Upload className="w-3.5 h-3.5 text-brand-500" />
                    <span>Restore</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>
              </div>

              {/* MongoDB Diagnostic Alert */}
              {mongoTestResult && (
                <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  mongoTestResult.success
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {mongoTestResult.success ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>MongoDB Atlas Connected!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>MongoDB Atlas Status: {mongoTestResult.code || 'Notice'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs opacity-90">{mongoTestResult.message}</p>
                </div>
              )}

              {/* Cloudinary Diagnostic Alert */}
              {cloudinaryTestResult && (
                <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  cloudinaryTestResult.success
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {cloudinaryTestResult.success ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Cloudinary Connected!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-slate-500" />
                        <span>Cloudinary Status: {cloudinaryTestResult.code || 'Notice'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs opacity-90">{cloudinaryTestResult.message}</p>
                  {cloudinaryTestResult.help && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium pt-1">
                      💡 {cloudinaryTestResult.help}
                    </p>
                  )}
                </div>
              )}

              {/* Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    MongoDB Atlas Connected
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Live connection to <code className="font-mono text-[10px]">cluster0.5rcip6z.mongodb.net</code>. All projects, skills, education, and certificates are saved securely in your cloud database.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    Cloudinary Media Hosting
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    100% free cloud media hosting with zero credit card required. Upload project cover images directly and serve with global CDN speed.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
                    Smart Canvas Fallback
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Even before you enter Cloudinary keys, our built-in image compressor compresses project images to ~25KB so you can upload images immediately with zero setup.
                  </p>
                </div>
              </div>
            </div>

            {/* Factory Reset */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Demo Content</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Restores all projects, skills, education, and credentials to the original pre-seeded developer portfolio.
                </p>
              </div>
              <button
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* AUTOMATED RESUME PDF PREVIEW & DOWNLOAD MODAL */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        data={data}
      />

      {/* UNIVERSAL MODAL DIALOG FOR CRUD ITEMS */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit' : 'Add New'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h3>
              <button
                onClick={() => { setModalType(null); setEditingItem(null); setSelectedFile(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              
              {/* SKILL FORM WITH EXPANDED CATEGORIES */}
              {modalType === 'skill' && (
                <form onSubmit={handleSkillSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Skill Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingItem?.name || ''}
                      placeholder="e.g. React.js, Python, Docker"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Skill Category *</label>
                    <select
                      value={skillCategoryOption}
                      onChange={(e) => setSkillCategoryOption(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {standardSkillCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__custom__">+ Add Custom Category...</option>
                    </select>
                  </div>

                  {skillCategoryOption === '__custom__' && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Custom Category Name *</label>
                      <input
                        type="text"
                        required
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="e.g. Embedded Systems, Cybersecurity"
                        className="w-full px-3.5 py-2 rounded-xl border border-brand-500 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Proficiency Level (%)</label>
                    <input
                      type="number"
                      name="level"
                      min="10"
                      max="100"
                      defaultValue={editingItem?.level || 85}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                    >
                      {saving ? 'Saving...' : 'Save Skill'}
                    </button>
                  </div>
                </form>
              )}

              {/* PROJECT FORM WITH DIRECT FILE UPLOAD */}
              {modalType === 'project' && (
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editingItem?.title || ''}
                      placeholder="e.g. CloudPulse Monitor"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Project Cover Image *
                    </label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-brand-500 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
                      {imagePreview ? (
                        <div className="space-y-3">
                          <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload File</span>
                              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                            <button
                              type="button"
                              onClick={() => { setSelectedFile(null); setImagePreview(''); }}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center py-4 cursor-pointer">
                          <div className="p-3 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Click to upload image file</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP supported</p>
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Or Image URL:</span>
                      <input
                        type="url"
                        value={selectedFile ? '' : (imagePreview || '')}
                        onChange={(e) => {
                          setSelectedFile(null);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description *</label>
                    <textarea
                      name="description"
                      rows="3"
                      required
                      defaultValue={editingItem?.description || ''}
                      placeholder="Brief overview of what you built..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                      <input
                        type="text"
                        name="category"
                        defaultValue={editingItem?.category || 'Full Stack'}
                        placeholder="Full Stack, Web App, Mobile"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Year</label>
                      <input
                        type="text"
                        name="date"
                        defaultValue={editingItem?.date || '2024'}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      name="technologies"
                      defaultValue={(Array.isArray(editingItem?.technologies) ? editingItem.technologies : []).join(', ')}
                      placeholder="React, Node.js, Firebase, Tailwind"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">GitHub URL</label>
                      <input
                        type="url"
                        name="githubUrl"
                        defaultValue={editingItem?.githubUrl || ''}
                        placeholder="https://github.com/..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Live Demo URL</label>
                      <input
                        type="url"
                        name="liveDemoUrl"
                        defaultValue={editingItem?.liveDemoUrl || ''}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || uploadingImage}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                    >
                      {saving || uploadingImage ? 'Saving Image & Details...' : 'Save Project'}
                    </button>
                  </div>
                </form>
              )}

              {/* CERTIFICATE FORM */}
              {modalType === 'certificate' && (
                <form onSubmit={handleCertSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Certificate Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editingItem?.title || ''}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Certificate Image / Badge (Upload File)
                    </label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center bg-slate-50/50 dark:bg-slate-800/40">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img src={imagePreview} alt="Preview" className="h-28 mx-auto rounded-lg object-cover" />
                          <label className="inline-block px-3 py-1 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer">
                            <span>Change File</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer block py-2">
                          <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Click to upload certificate image</span>
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Issuing Organization *</label>
                      <input
                        type="text"
                        name="issuer"
                        required
                        defaultValue={editingItem?.issuer || ''}
                        placeholder="e.g. Amazon Web Services"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Issue Date</label>
                      <input
                        type="text"
                        name="issueDate"
                        defaultValue={editingItem?.issueDate || ''}
                        placeholder="e.g. Jan 2024"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Credential ID</label>
                    <input
                      type="text"
                      name="credentialId"
                      defaultValue={editingItem?.credentialId || ''}
                      placeholder="e.g. AWS-892102"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Verification URL</label>
                    <input
                      type="url"
                      name="credentialUrl"
                      defaultValue={editingItem?.credentialUrl || ''}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                    >
                      {saving ? 'Saving...' : 'Save Certificate'}
                    </button>
                  </div>
                </form>
              )}

              {/* EDUCATION FORM */}
              {modalType === 'education' && (
                <form onSubmit={handleEduSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Degree Title *</label>
                    <input
                      type="text"
                      name="degree"
                      required
                      defaultValue={editingItem?.degree || ''}
                      placeholder="e.g. B.S. in Computer Science"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Institution *</label>
                      <input
                        type="text"
                        name="institution"
                        required
                        defaultValue={editingItem?.institution || ''}
                        placeholder="e.g. State University"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Year / Duration *</label>
                      <input
                        type="text"
                        name="year"
                        required
                        defaultValue={editingItem?.year || ''}
                        placeholder="e.g. 2020 - 2024"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
                    <input
                      type="text"
                      name="department"
                      defaultValue={editingItem?.department || ''}
                      placeholder="e.g. Department of Computer Science & Engineering"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Academic Achievements</label>
                    <textarea
                      name="achievements"
                      rows="2"
                      defaultValue={editingItem?.achievements || ''}
                      placeholder="e.g. Graduated with Honors, Capstone Lead..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                    >
                      {saving ? 'Saving...' : 'Save Education'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
