import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Save,
  Heart,
  Upload,
  Camera,
  X,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Activity,
  Pill,
  Droplets,
  Utensils,
  Pencil,
  Clock,
  Calendar,
  Sun,
  Moon,
  Users,
  TrendingUp,
  Bell,
  BellOff,
  HelpCircle,
  Settings,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';
import { fetchFamilyMembers, addFamilyMember, saveCarePlan } from '../services/carePlanService';
import { fetchReminders, updateCategoryReminders, addCustomReminder } from '../services/reminderService';

export const CarePlan = () => {
  const { id: routePatientId } = useParams();
  const patientId = routePatientId || 'p1';
  const { theme, toggleTheme } = useTheme();
  const { caregiver } = useAuth();

  // Patient display details mapping
  const patientNames = {
    p1: 'Arthur Miller',
    p2: 'Rohan Sharma',
    p101: 'Aarav Sharma',
    p102: 'Maya Sen',
  };
  const patientName = patientNames[patientId] || (patientId ? `Patient (${patientId})` : 'Arthur');

  // Memory Gallery State
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const [memoryError, setMemoryError] = useState('');

  // Reminders State
  const [reminders, setReminders] = useState({
    medication: [],
    hydration: { label: '', schedule: '', status: '' },
    meals: [],
    custom: [],
  });
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);
  const [reminderError, setReminderError] = useState('');

  // Overall Save status
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotification, setSaveNotification] = useState('');

  // Modal 1: Add Family Member
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRelation, setMemberRelation] = useState('Granddaughter');
  const [customRelation, setCustomRelation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [memoryFormError, setMemoryFormError] = useState('');
  const [isSubmittingMemory, setIsSubmittingMemory] = useState(false);

  // Modal 2: Edit Fixed Category (Medication / Hydration / Meals)
  const [editingCategory, setEditingCategory] = useState(null); // 'medication' | 'hydration' | 'meals'
  const [categoryDraft, setCategoryDraft] = useState(null);
  const [categoryFormError, setCategoryFormError] = useState('');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Modal 3: Add Custom Reminder
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customTime, setCustomTime] = useState('5:00 PM');
  const [customFrequency, setCustomFrequency] = useState('Daily');
  const [customFormError, setCustomFormError] = useState('');
  // Toggle Alarm Active status for a default or custom reminder
  const toggleAlarmStatus = (category, itemId = null) => {
    setReminders((prev) => {
      if (category === 'hydration') {
        const currentActive = prev.hydration?.active !== false;
        return {
          ...prev,
          hydration: {
            ...prev.hydration,
            active: !currentActive,
            status: !currentActive ? 'Active' : 'Muted',
          },
        };
      }

      if (category === 'medication' || category === 'meals' || category === 'custom') {
        return {
          ...prev,
          [category]: (prev[category] || []).map((item) => {
            if (itemId === null || item.id === itemId) {
              const currentActive = item.active !== false;
              return { ...item, active: !currentActive };
            }
            return item;
          }),
        };
      }

      return prev;
    });
  };

  // Load Memory Gallery & Health Reminders on mount / patientId change

  useEffect(() => {
    let isMounted = true;

    const loadAllData = async () => {
      setIsLoadingMemories(true);
      setIsLoadingReminders(true);
      setMemoryError('');
      setReminderError('');

      try {
        const [membersData, remindersData] = await Promise.all([
          fetchFamilyMembers(patientId),
          fetchReminders(patientId),
        ]);

        if (isMounted) {
          setFamilyMembers(membersData);
          setReminders(remindersData);
        }
      } catch (err) {
        if (isMounted) {
          setMemoryError(err.message || 'Failed to load page data.');
          setReminderError('Unable to load health reminders.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingMemories(false);
          setIsLoadingReminders(false);
        }
      }
    };

    loadAllData();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  // Handle Photo selection for Memory Gallery
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMemoryFormError('Please select a valid image file (JPG or PNG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMemoryFormError('Image size exceeds 5MB limit.');
      return;
    }

    setMemoryFormError('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setPhotoUrl(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Family Member Memory
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setMemoryFormError('');

    if (!photoUrl || !photoUrl.trim()) {
      setMemoryFormError('Photo upload is required. Every memory card must include a photo.');
      return;
    }
    if (!memberName.trim()) {
      setMemoryFormError('Please enter the family member\'s name.');
      return;
    }

    if (memberRelation === 'Other' && !customRelation.trim()) {
      setMemoryFormError('Please specify the relation (e.g. Cousin, Neighbor, Nephew).');
      return;
    }

    const finalRelation = memberRelation === 'Other' ? customRelation.trim() : memberRelation.trim();

    setIsSubmittingMemory(true);
    try {
      const newMember = await addFamilyMember({
        patientId,
        name: memberName.trim(),
        relation: finalRelation,
        photoUrl: photoUrl.trim(),
      });

      setFamilyMembers((prev) => [...prev, newMember]);
      setMemberName('');
      setMemberRelation('Granddaughter');
      setCustomRelation('');
      setPhotoUrl('');
      setPhotoPreview('');
      setIsMemoryModalOpen(false);
    } catch (err) {
      setMemoryFormError(err.message || 'Failed to add family member.');
    } finally {
      setIsSubmittingMemory(false);
    }
  };

  // Open Edit Modal for a Category (Medication, Hydration, Meals)
  const openCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryFormError('');
    if (category === 'medication') {
      setCategoryDraft(JSON.parse(JSON.stringify(reminders.medication)));
    } else if (category === 'hydration') {
      setCategoryDraft({ ...reminders.hydration });
    } else if (category === 'meals') {
      setCategoryDraft(JSON.parse(JSON.stringify(reminders.meals)));
    }
  };

  // Save Category Edit
  const handleCategorySave = async (e) => {
    e.preventDefault();
    setCategoryFormError('');

    setIsSubmittingCategory(true);
    try {
      await updateCategoryReminders(patientId, editingCategory, categoryDraft);
      setReminders((prev) => ({
        ...prev,
        [editingCategory]: categoryDraft,
      }));
      setEditingCategory(null);
      setCategoryDraft(null);
    } catch (err) {
      setCategoryFormError(err.message || 'Failed to update reminder settings.');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // Submit Custom Reminder
  const handleAddCustomSubmit = async (e) => {
    e.preventDefault();
    setCustomFormError('');

    if (!customLabel.trim()) {
      setCustomFormError('Please enter a reminder label.');
      return;
    }
    if (!customTime.trim()) {
      setCustomFormError('Please enter a time for the reminder.');
      return;
    }

    setIsSubmittingCustom(true);
    try {
      const newCustom = await addCustomReminder({
        patientId,
        label: customLabel.trim(),
        time: customTime.trim(),
        frequency: customFrequency,
      });

      setReminders((prev) => ({
        ...prev,
        custom: [...prev.custom, newCustom],
      }));

      setCustomLabel('');
      setCustomTime('5:00 PM');
      setCustomFrequency('Daily');
      setIsCustomModalOpen(false);
    } catch (err) {
      setCustomFormError(err.message || 'Failed to add custom reminder.');
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  // Global Save Changes handler
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveNotification('');
    try {
      await saveCarePlan(patientId, {
        familyMembersCount: familyMembers.length,
        reminders,
      });
      setSaveNotification('Care plan changes saved successfully!');
      setTimeout(() => setSaveNotification(''), 4000);
    } catch (err) {
      setSaveNotification('Failed to save care plan changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* MAIN LAYOUT GRID (LEFT SIDEBAR + MAIN CONTENT AREA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">


        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="lg:col-span-3 bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-5 shadow-sm space-y-6">
          {/* Active Patient Badge Box */}
          <div className="p-3.5 bg-cream dark:bg-ink-soft/30 border border-border/70 dark:border-ink-soft/40 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface dark:bg-ink-soft/50 border border-border flex items-center justify-center text-terracotta font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/60">
                Patient
              </p>
              <h3 className="text-sm font-bold text-ink dark:text-cream truncate">
                {patientName}
              </h3>
              <p className="text-[11px] text-ink-soft dark:text-cream/70 truncate">
                Memory Care Unit B
              </p>
            </div>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="space-y-1.5 font-medium text-sm">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream hover:bg-cream dark:hover:bg-ink-soft/30 transition-colors"
            >
              <Users className="w-4 h-4 text-ink-soft dark:text-cream/70" />
              <span>Patients</span>
            </Link>

            <Link
              to={`/patients/${patientId}/care-plan`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-sage/20 dark:bg-terracotta/20 text-terracotta dark:text-terracotta font-bold border border-terracotta/20 transition-all"
            >
              <Calendar className="w-4 h-4 text-terracotta" />
              <span>Care Plans</span>
            </Link>

            <Link
              to={`/patients/${patientId}/analytics`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream hover:bg-cream dark:hover:bg-ink-soft/30 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-ink-soft dark:text-cream/70" />
              <span>Analytics</span>
            </Link>
          </nav>

          {/* Action Button: + Add Reminder */}
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="w-full py-2.5 px-4 bg-terracotta hover:bg-terracotta-dark text-surface font-medium text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>

          {/* Sidebar Footer Links: SETTINGS & SUPPORT */}
          <div className="pt-4 border-t border-border/60 dark:border-ink-soft/30 space-y-2 text-xs font-semibold text-ink-soft dark:text-cream/60">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cream dark:hover:bg-ink-soft/30 text-left transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>SETTINGS (Theme: {theme.toUpperCase()})</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cream dark:hover:bg-ink-soft/30 text-left transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>SUPPORT</span>
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="lg:col-span-9 space-y-6">

          {/* Care Plan Header */}
          <section className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-cream tracking-tight">
                Care Plan & Customization
              </h1>
              <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70 max-w-xl leading-relaxed">
                Personalize {patientName}&apos;s environment and daily schedule to support memory retention and ensure well-being.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle option next to Save Changes */}
              <button
                type="button"
                onClick={toggleTheme}
                title="Toggle Light/Dark Theme"
                className="p-2.5 rounded-lg bg-cream dark:bg-ink-soft/40 border border-border/80 dark:border-ink-soft/40 text-ink dark:text-cream hover:bg-surface transition-all shadow-xs"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-terracotta" />}
              </button>

              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface dark:bg-ink-soft/40 hover:bg-cream dark:hover:bg-ink-soft/60 border border-border dark:border-ink-soft/40 rounded-lg text-xs font-semibold text-ink dark:text-cream transition-colors focus:outline-none focus:ring-1 focus:ring-terracotta disabled:opacity-60 disabled:cursor-not-allowed shadow-xs min-h-[44px]"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-ink dark:border-cream border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-terracotta" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {saveNotification && (
            <div className="p-3.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-xs font-medium text-ink dark:text-cream flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage" />
              <span>{saveNotification}</span>
            </div>
          )}

          {/* TWO-COLUMN GRID: MEMORY GALLERY & HEALTH & WELLNESS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* LEFT COLUMN — Memory Gallery Card */}
            <section className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-sm space-y-6 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 dark:border-ink-soft/30 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 flex items-center justify-center text-terracotta">
                      <Heart className="w-4 h-4 fill-terracotta/20" />
                    </div>
                    <h2 className="text-lg font-bold text-ink dark:text-cream">
                      Memory Gallery
                    </h2>
                  </div>
                  <p className="text-xs text-ink-soft dark:text-cream/70">
                    Upload photos of loved ones to help with memory exercises.
                  </p>
                </div>

                <button
                  onClick={() => setIsMemoryModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-sage/20 dark:bg-terracotta/20 hover:bg-sage/30 text-terracotta rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0 min-h-[40px]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
              </div>

              {memoryError && (
                <div className="p-3.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg flex items-center gap-2 text-xs text-ink dark:text-cream">
                  <AlertCircle className="w-4 h-4 text-terracotta shrink-0" />
                  <span>{memoryError}</span>
                </div>
              )}

              {isLoadingMemories ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-card p-3 animate-pulse space-y-3">
                      <div className="aspect-[4/3] w-full bg-border/40 dark:bg-ink-soft/40 rounded-lg" />
                      <div className="h-4 bg-border/50 dark:bg-ink-soft/40 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {familyMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-cream/60 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-card p-3 transition-all hover:shadow-sm flex flex-col justify-between group"
                    >
                      <div className="space-y-2.5">
                        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-surface border border-border/80 dark:border-ink-soft/40 relative">
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="px-0.5">
                          <h3 className="text-sm font-bold text-ink dark:text-cream truncate">
                            {member.name}
                          </h3>
                          <p className="text-xs text-ink-soft dark:text-cream/70 flex items-center gap-1 mt-0.5">
                            <Heart className="w-3.5 h-3.5 text-terracotta fill-terracotta/20 shrink-0" />
                            <span>{member.relation}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setIsMemoryModalOpen(true)}
                    className="border-2 border-dashed border-border/80 dark:border-ink-soft/40 hover:border-terracotta bg-cream/30 dark:bg-ink-soft/10 hover:bg-cream/70 rounded-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[180px] focus:outline-none focus:ring-1 focus:ring-terracotta group"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface dark:bg-ink-soft/30 border border-border dark:border-ink-soft/40 group-hover:border-terracotta flex items-center justify-center text-terracotta transition-colors mb-2">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-ink dark:text-cream group-hover:text-terracotta transition-colors">
                      Add Another Memory
                    </span>
                    <span className="text-[11px] text-ink-soft dark:text-cream/60 mt-1">
                      JPG, PNG up to 5MB
                    </span>
                  </button>
                </div>
              )}
            </section>

            {/* RIGHT COLUMN — Health & Wellness Card */}
            <section className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-sm space-y-6 transition-colors">
              {/* Card Header */}
              <div className="flex items-center gap-2 border-b border-border/60 dark:border-ink-soft/30 pb-5">
                <div className="w-8 h-8 rounded-full bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 flex items-center justify-center text-terracotta">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink dark:text-cream">
                    Health & Wellness
                  </h2>
                  <p className="text-xs text-ink-soft dark:text-cream/70 mt-0.5">
                    Daily schedules & medication reminders for {patientName}
                  </p>
                </div>
              </div>

              {reminderError && (
                <div className="p-3.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg flex items-center gap-2 text-xs text-ink dark:text-cream">
                  <AlertCircle className="w-4 h-4 text-terracotta shrink-0" />
                  <span>{reminderError}</span>
                </div>
              )}

              {isLoadingReminders ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-card p-4 h-24" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">

                  {/* PANEL 1: Medication */}
                  <div className="bg-cream/60 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-card p-4 space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-border/60 dark:border-ink-soft/30 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-terracotta" />
                        <h3 className="text-sm font-bold text-ink dark:text-cream">
                          Medication
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => openCategoryEdit('medication')}
                        aria-label="Edit Medication schedule"
                        className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-surface transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {reminders.medication.map((med) => {
                        const isAlarmActive = med.active !== false;
                        return (
                          <div
                            key={med.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-surface dark:bg-ink-soft/40 border border-border/80 dark:border-ink-soft/40 rounded-xl shadow-2xs hover:border-terracotta/30 transition-colors text-xs"
                          >
                            <span className="font-semibold text-ink dark:text-cream">• {med.label}</span>
                            <div className="flex items-center justify-between sm:justify-end gap-2.5">
                              <span className="px-2.5 py-1 bg-cream dark:bg-ink-soft/30 border border-border/60 dark:border-ink-soft/30 rounded-full font-bold text-ink-soft dark:text-cream/80 text-[11px]">
                                {med.time}
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleAlarmStatus('medication', med.id)}
                                aria-label={isAlarmActive ? 'Alarm is Active (Click to mute)' : 'Alarm is Off (Click to activate)'}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all cursor-pointer select-none active:scale-95 ${
                                  isAlarmActive
                                    ? 'bg-sage/20 border-sage/60 text-sage dark:bg-sage/30 dark:text-sage dark:border-sage/60 hover:bg-sage/30'
                                    : 'bg-cream dark:bg-ink-soft/40 border-border dark:border-ink-soft/50 text-ink-soft dark:text-cream/50 hover:bg-surface'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${isAlarmActive ? 'bg-sage animate-pulse' : 'bg-ink-soft/40'}`} />
                                <span className="flex items-center gap-1.5">
                                  {isAlarmActive ? (
                                    <>
                                      <Bell className="w-3.5 h-3.5 text-sage" />
                                      <span>Alarm Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <BellOff className="w-3.5 h-3.5 opacity-60" />
                                      <span>Alarm Off</span>
                                    </>
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PANEL 2: Hydration */}
                  <div className="bg-cream/60 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-card p-4 space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-border/60 dark:border-ink-soft/30 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-terracotta" />
                        <h3 className="text-sm font-bold text-ink dark:text-cream">
                          Hydration
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => openCategoryEdit('hydration')}
                        aria-label="Edit Hydration schedule"
                        className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-surface transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-surface dark:bg-ink-soft/40 border border-border/80 dark:border-ink-soft/40 rounded-xl shadow-2xs hover:border-terracotta/30 transition-colors text-xs">
                      <div>
                        <p className="font-semibold text-ink dark:text-cream">{reminders.hydration.label}</p>
                        <span className="text-[11px] font-semibold text-ink-soft dark:text-cream/70 block mt-0.5">{reminders.hydration.schedule}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleAlarmStatus('hydration')}
                          aria-label={reminders.hydration?.active !== false ? 'Alarm is Active' : 'Alarm is Off'}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all cursor-pointer select-none active:scale-95 ${
                            reminders.hydration?.active !== false
                              ? 'bg-sage/20 border-sage/60 text-sage dark:bg-sage/30 dark:text-sage dark:border-sage/60 hover:bg-sage/30'
                              : 'bg-cream dark:bg-ink-soft/40 border-border dark:border-ink-soft/50 text-ink-soft dark:text-cream/50 hover:bg-surface'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${reminders.hydration?.active !== false ? 'bg-sage animate-pulse' : 'bg-ink-soft/40'}`} />
                          <span className="flex items-center gap-1.5">
                            {reminders.hydration?.active !== false ? (
                              <>
                                <Bell className="w-3.5 h-3.5 text-sage" />
                                <span>Alarm Active</span>
                              </>
                            ) : (
                              <>
                                <BellOff className="w-3.5 h-3.5 opacity-60" />
                                <span>Alarm Off</span>
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PANEL 3: Meals */}
                  <div className="bg-cream/60 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-card p-4 space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-border/60 dark:border-ink-soft/30 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-terracotta" />
                        <h3 className="text-sm font-bold text-ink dark:text-cream">
                          Meals
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => openCategoryEdit('meals')}
                        aria-label="Edit Meals schedule"
                        className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-surface transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {reminders.meals.map((meal) => {
                        const isAlarmActive = meal.active !== false;
                        return (
                          <div
                            key={meal.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-surface dark:bg-ink-soft/40 border border-border/80 dark:border-ink-soft/40 rounded-xl shadow-2xs hover:border-terracotta/30 transition-colors text-xs"
                          >
                            <span className="font-semibold text-ink dark:text-cream">• {meal.label}</span>
                            <div className="flex items-center justify-between sm:justify-end gap-2.5">
                              <span className="px-2.5 py-1 bg-cream dark:bg-ink-soft/30 border border-border/60 dark:border-ink-soft/30 rounded-full font-bold text-ink-soft dark:text-cream/80 text-[11px]">
                                {meal.time}
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleAlarmStatus('meals', meal.id)}
                                aria-label={isAlarmActive ? 'Alarm is Active' : 'Alarm is Off'}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all cursor-pointer select-none active:scale-95 ${
                                  isAlarmActive
                                    ? 'bg-sage/20 border-sage/60 text-sage dark:bg-sage/30 dark:text-sage dark:border-sage/60 hover:bg-sage/30'
                                    : 'bg-cream dark:bg-ink-soft/40 border-border dark:border-ink-soft/50 text-ink-soft dark:text-cream/50 hover:bg-surface'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${isAlarmActive ? 'bg-sage animate-pulse' : 'bg-ink-soft/40'}`} />
                                <span className="flex items-center gap-1.5">
                                  {isAlarmActive ? (
                                    <>
                                      <Bell className="w-3.5 h-3.5 text-sage" />
                                      <span>Alarm Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <BellOff className="w-3.5 h-3.5 opacity-60" />
                                      <span>Alarm Off</span>
                                    </>
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Reminders List */}
                  {reminders.custom && reminders.custom.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/60 px-1">
                        Custom Reminders
                      </h4>
                      {reminders.custom.map((cust) => {
                        const isAlarmActive = cust.active !== false;
                        return (
                          <div
                            key={cust.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-cream/60 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-xl shadow-2xs hover:border-terracotta/30 transition-colors text-xs"
                          >
                            <div>
                              <p className="font-semibold text-ink dark:text-cream">{cust.label}</p>
                              <p className="text-[11px] text-ink-soft dark:text-cream/60">{cust.frequency}</p>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-2.5">
                              <span className="px-2.5 py-1 bg-surface dark:bg-ink-soft/40 border border-border/60 text-ink dark:text-cream font-bold rounded-full text-[11px]">
                                {cust.time}
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleAlarmStatus('custom', cust.id)}
                                aria-label={isAlarmActive ? 'Alarm is Active' : 'Alarm is Off'}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all cursor-pointer select-none active:scale-95 ${
                                  isAlarmActive
                                    ? 'bg-sage/20 border-sage/60 text-sage dark:bg-sage/30 dark:text-sage dark:border-sage/60 hover:bg-sage/30'
                                    : 'bg-cream dark:bg-ink-soft/40 border-border dark:border-ink-soft/50 text-ink-soft dark:text-cream/50 hover:bg-surface'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${isAlarmActive ? 'bg-sage animate-pulse' : 'bg-ink-soft/40'}`} />
                                <span className="flex items-center gap-1.5">
                                  {isAlarmActive ? (
                                    <>
                                      <Bell className="w-3.5 h-3.5 text-sage" />
                                      <span>Alarm Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <BellOff className="w-3.5 h-3.5 opacity-60" />
                                      <span>Alarm Off</span>
                                    </>
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Custom Reminder Dashed Button */}
                  <button
                    type="button"
                    onClick={() => setIsCustomModalOpen(true)}
                    className="w-full border-2 border-dashed border-border/80 dark:border-ink-soft/40 hover:border-terracotta bg-cream/30 dark:bg-ink-soft/10 hover:bg-cream/70 rounded-card p-3 flex items-center justify-center gap-2 text-xs font-semibold text-ink dark:text-cream transition-colors cursor-pointer min-h-[44px]"
                  >
                    <Plus className="w-4 h-4 text-terracotta" />
                    <span>Add Custom Reminder</span>
                  </button>

                </div>
              )}
            </section>

          </div>

        </main>
      </div>
      {/* MODAL 1: ADD FAMILY MEMBER */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 dark:bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-ink-soft/90 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-md max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border/60 dark:border-ink-soft/30 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-terracotta" />
                <h3 className="text-lg font-bold text-ink dark:text-cream">
                  Add Family Memory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMemoryModalOpen(false);
                  setMemoryFormError('');
                  setPhotoUrl('');
                  setPhotoPreview('');
                  setMemberName('');
                  setCustomRelation('');
                }}
                className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {memoryFormError && (
              <div className="p-3 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg flex items-center gap-2 text-xs font-medium text-terracotta">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{memoryFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5">
                  Family Photo <span className="text-terracotta">*</span>
                </label>

                {photoPreview ? (
                  <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-border dark:border-ink-soft/40 bg-cream dark:bg-ink-soft/30 group">
                    <img
                      src={photoPreview}
                      alt="Selected memory preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('');
                        setPhotoPreview('');
                      }}
                      className="absolute top-2 right-2 bg-surface/90 dark:bg-ink/90 hover:bg-surface border border-border p-1.5 rounded-full text-ink dark:text-cream transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border/80 dark:border-ink-soft/40 hover:border-terracotta bg-cream/40 dark:bg-ink-soft/20 hover:bg-cream rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[140px]">
                    <ImageIcon className="w-8 h-8 text-terracotta mb-2" />
                    <span className="text-xs font-semibold text-ink dark:text-cream">
                      Click or drag photo to upload
                    </span>
                    <span className="text-[11px] text-ink-soft dark:text-cream/60 mt-1">
                      JPG, PNG up to 5MB (Required)
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label
                  htmlFor="memberName"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                >
                  Name <span className="text-terracotta">*</span>
                </label>
                <input
                  id="memberName"
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                  className="w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors min-h-[44px]"
                />
              </div>

              <div>
                <label
                  htmlFor="memberRelation"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                >
                  Relation <span className="text-terracotta">*</span>
                </label>
                <select
                  id="memberRelation"
                  value={memberRelation}
                  onChange={(e) => setMemberRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors min-h-[44px]"
                >
                  <option value="Granddaughter">Granddaughter</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Grandson">Grandson</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>

                {/* Render custom relation text field if 'Other' is selected */}
                {memberRelation === 'Other' && (
                  <div className="mt-2.5 animate-in fade-in duration-200">
                    <label
                      htmlFor="customRelation"
                      className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                    >
                      Specify Relation <span className="text-terracotta">*</span>
                    </label>
                    <input
                      id="customRelation"
                      type="text"
                      value={customRelation}
                      onChange={(e) => setCustomRelation(e.target.value)}
                      placeholder="e.g. Nephew, Neighbor, Cousin"
                      className="w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors min-h-[44px]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60 dark:border-ink-soft/30">
                <button
                  type="button"
                  onClick={() => {
                    setIsMemoryModalOpen(false);
                    setMemoryFormError('');
                    setPhotoUrl('');
                    setPhotoPreview('');
                    setMemberName('');
                    setCustomRelation('');
                  }}
                  disabled={isSubmittingMemory}
                  className="px-4 py-2.5 bg-cream dark:bg-ink-soft/40 hover:bg-surface border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm font-medium text-ink dark:text-cream transition-colors min-h-[44px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingMemory}
                  className="px-4 py-2.5 bg-terracotta hover:bg-terracotta-dark text-surface rounded-lg text-sm font-medium transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-terracotta/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm min-h-[44px]"
                >
                  {isSubmittingMemory ? (
                    <>
                      <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Add Memory</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CATEGORY (Medication / Hydration / Meals) */}
      {editingCategory && categoryDraft && (
        <div className="fixed inset-0 z-50 bg-ink/40 dark:bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-ink-soft/90 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-md max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border/60 dark:border-ink-soft/30 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-terracotta" />
                <h3 className="text-lg font-bold text-ink dark:text-cream capitalize">
                  Edit {editingCategory} Schedule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryDraft(null);
                }}
                className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryFormError && (
              <div className="p-3 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg flex items-center gap-2 text-xs font-medium text-terracotta">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{categoryFormError}</span>
              </div>
            )}

            <form onSubmit={handleCategorySave} className="space-y-4">
              {/* Editing Medication List */}
              {editingCategory === 'medication' && Array.isArray(categoryDraft) && (
                <div className="space-y-3">
                  {categoryDraft.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg space-y-2">
                      <label className="block text-xs font-semibold text-ink-soft dark:text-cream/70">
                        Dose Label #{idx + 1}
                      </label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryDraft((prev) => {
                            const updated = [...prev];
                            updated[idx].label = val;
                            return updated;
                          });
                        }}
                        className="w-full px-3 py-2 bg-surface dark:bg-ink-soft/50 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream focus:outline-none focus:ring-1 focus:ring-terracotta min-h-[44px]"
                      />

                      <label className="block text-xs font-semibold text-ink-soft dark:text-cream/70">
                        Scheduled Time
                      </label>
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryDraft((prev) => {
                            const updated = [...prev];
                            updated[idx].time = val;
                            return updated;
                          });
                        }}
                        className="w-full px-3 py-2 bg-surface dark:bg-ink-soft/50 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream focus:outline-none focus:ring-1 focus:ring-terracotta min-h-[44px]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Editing Hydration Object */}
              {editingCategory === 'hydration' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5">
                      Schedule Label
                    </label>
                    <input
                      type="text"
                      value={categoryDraft.label}
                      onChange={(e) => setCategoryDraft((prev) => ({ ...prev, label: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream focus:outline-none focus:ring-1 focus:ring-terracotta min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5">
                      Active Time Window
                    </label>
                    <input
                      type="text"
                      value={categoryDraft.schedule}
                      onChange={(e) => setCategoryDraft((prev) => ({ ...prev, schedule: e.target.value }))}
                      placeholder="e.g. 8 AM – 8 PM"
                      className="w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream focus:outline-none focus:ring-1 focus:ring-terracotta min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              {/* Editing Meals List */}
              {editingCategory === 'meals' && Array.isArray(categoryDraft) && (
                <div className="space-y-3">
                  {categoryDraft.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-ink-soft dark:text-cream/70">
                          {item.label}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryDraft((prev) => {
                            const updated = [...prev];
                            updated[idx].time = val;
                            return updated;
                          });
                        }}
                        placeholder="e.g. 8:30 AM"
                        className="w-full px-3 py-2 bg-surface dark:bg-ink-soft/50 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream focus:outline-none focus:ring-1 focus:ring-terracotta min-h-[44px]"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60 dark:border-ink-soft/30">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryDraft(null);
                  }}
                  disabled={isSubmittingCategory}
                  className="px-4 py-2.5 bg-cream dark:bg-ink-soft/40 hover:bg-surface border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm font-medium text-ink dark:text-cream transition-colors min-h-[44px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCategory}
                  className="px-4 py-2.5 bg-terracotta hover:bg-terracotta-dark text-surface rounded-lg text-sm font-medium transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-terracotta/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm min-h-[44px]"
                >
                  {isSubmittingCategory ? (
                    <>
                      <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Schedule</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CUSTOM REMINDER */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 dark:bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-ink-soft/90 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-md max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border/60 dark:border-ink-soft/30 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-terracotta" />
                <h3 className="text-lg font-bold text-ink dark:text-cream">
                  Add Custom Reminder
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCustomModalOpen(false);
                  setCustomFormError('');
                  setCustomLabel('');
                }}
                className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {customFormError && (
              <div className="p-3 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg flex items-center gap-2 text-xs font-medium text-terracotta">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{customFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddCustomSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="customLabel"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                >
                  Reminder Description <span className="text-terracotta">*</span>
                </label>
                <input
                  id="customLabel"
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. Evening Walk & Stretch"
                  className="w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors min-h-[44px]"
                />
              </div>

              <div>
                <label
                  htmlFor="customTime"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                >
                  Time <span className="text-terracotta">*</span>
                </label>
                <input
                  id="customTime"
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="e.g. 5:00 PM"
                  className="w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors min-h-[44px]"
                />
              </div>

              <div>
                <label
                  htmlFor="customFrequency"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                >
                  Repeat Frequency
                </label>
                <select
                  id="customFrequency"
                  value={customFrequency}
                  onChange={(e) => setCustomFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream focus:outline-none focus:ring-1 focus:ring-terracotta transition-colors min-h-[44px]"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="As Needed">As Needed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60 dark:border-ink-soft/30">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomModalOpen(false);
                    setCustomFormError('');
                    setCustomLabel('');
                  }}
                  disabled={isSubmittingCustom}
                  className="px-4 py-2.5 bg-cream dark:bg-ink-soft/40 hover:bg-surface border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm font-medium text-ink dark:text-cream transition-colors min-h-[44px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCustom}
                  className="px-4 py-2.5 bg-terracotta hover:bg-terracotta-dark text-surface rounded-lg text-sm font-medium transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-terracotta/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm min-h-[44px]"
                >
                  {isSubmittingCustom ? (
                    <>
                      <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Reminder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CarePlan;

