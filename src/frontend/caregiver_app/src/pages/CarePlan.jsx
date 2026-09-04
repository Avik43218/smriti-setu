import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Save,
  Heart,
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
  Bell,
  BellOff,
  HeartHandshake,
  Upload,
  ChevronDown,
  Check,
  Trash2,
  Volume2,
  Music,
} from 'lucide-react';
import { fetchFamilyMembers, addFamilyMember, saveCarePlan } from '../services/carePlanService';
import { fetchReminders, updateCategoryReminders, addCustomReminder } from '../services/reminderService';
import { TimePicker } from '../components/TimePicker';
import { StyledSelect } from '../components/StyledSelect';
import { SoundClipCard } from '../components/SoundClipCard';

export const CarePlan = () => {
  const { id: routePatientId } = useParams();
  const patientId = routePatientId || 'p1';
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
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [memoryFormError, setMemoryFormError] = useState('');
  const [isSubmittingMemory, setIsSubmittingMemory] = useState(false);

  // Modal 2: Edit Fixed Category (Medication / Hydration / Meals)
  const [editingCategory, setEditingCategory] = useState(null); // 'medication' | 'hydration' | 'meals'
  const [categoryDraft, setCategoryDraft] = useState(null);
  const [categoryFormError, setCategoryFormError] = useState('');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  // Modal 3: Add Custom Reminder
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customTime, setCustomTime] = useState('5:00 PM');
  const [customFrequency, setCustomFrequency] = useState('Daily');
  const [customFormError, setCustomFormError] = useState('');

  // Modal 4: Add Familiar Sound
  const [familiarSounds, setFamiliarSounds] = useState([
    {
      id: 'sound_demo_1',
      caption: "Sarah's Morning Greeting",
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg',
    },
  ]);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [soundCaption, setSoundCaption] = useState('');
  const [soundAudioUrl, setSoundAudioUrl] = useState('');
  const [soundFileName, setSoundFileName] = useState('');
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [soundFormError, setSoundFormError] = useState('');
  const [isSubmittingSound, setIsSubmittingSound] = useState(false);
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

  // Helper to validate and process memory image file
  const processImageFile = (file) => {
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

  // Handle Photo selection for Memory Gallery (click-to-browse)
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  };

  // Drag-and-drop handlers for photo selection area
  const handlePhotoDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingPhoto) setIsDraggingPhoto(true);
  };

  const handlePhotoDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(false);
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer?.files?.[0];
    processImageFile(file);
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
      setIsDraggingPhoto(false);
      setIsMemoryModalOpen(false);
    } catch (err) {
      setMemoryFormError(err.message || 'Failed to add family member.');
    } finally {
      setIsSubmittingMemory(false);
    }
  };

  // Process Audio File for Familiar Sounds
  const processAudioFile = (file) => {
    if (!file) return;
    setSoundFormError('');

    const validTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/wave',
      'audio/ogg',
      'audio/m4a',
      'audio/x-m4a',
      'audio/aac',
      'audio/webm',
    ];
    const isAudio = file.type.startsWith('audio/') || validTypes.includes(file.type.toLowerCase());
    if (!isAudio) {
      setSoundFormError('Please select a valid audio file (MP3, WAV, MPEG, M4A, OGG).');
      return;
    }

    // 10MB maximum limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setSoundFormError('Audio file is too large. Maximum allowed size is 10MB.');
      return;
    }

    setSoundFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSoundAudioUrl(reader.result);
    };
    reader.onerror = () => {
      setSoundFormError('Failed to read the audio file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-drop & browse handlers for audio
  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    processAudioFile(file);
  };

  const handleAudioDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingAudio) setIsDraggingAudio(true);
  };

  const handleAudioDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAudio(false);
  };

  const handleAudioDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAudio(false);
    const file = e.dataTransfer?.files?.[0];
    processAudioFile(file);
  };

  // Submit Familiar Sound
  const handleAddSoundSubmit = (e) => {
    e.preventDefault();
    setSoundFormError('');

    if (!soundAudioUrl) {
      setSoundFormError('Please upload an audio file.');
      return;
    }
    if (!soundCaption.trim()) {
      setSoundFormError('Please enter a caption describing what this sound is.');
      return;
    }

    setIsSubmittingSound(true);
    try {
      const newSound = {
        id: `sound_${Date.now()}`,
        caption: soundCaption.trim(),
        audioUrl: soundAudioUrl,
        fileName: soundFileName,
      };

      setFamiliarSounds((prev) => [...prev, newSound]);
      setIsSoundModalOpen(false);
      setSoundCaption('');
      setSoundAudioUrl('');
      setSoundFileName('');
      setSoundFormError('');
    } catch (err) {
      setSoundFormError('Failed to save sound clip.');
    } finally {
      setIsSubmittingSound(false);
    }
  };

  // Delete Familiar Sound
  const handleDeleteSound = (soundId) => {
    setFamiliarSounds((prev) => prev.filter((s) => s.id !== soundId));
  };

  // Open Edit Modal for a Category (Medication, Hydration, Meals)
  const openCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryFormError('');
    setIsTimePickerOpen(false);
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

    if (editingCategory === 'medication' || editingCategory === 'meals') {
      if (!categoryDraft || categoryDraft.length === 0) {
        setCategoryFormError(`Please add at least one ${editingCategory === 'medication' ? 'medication dose' : 'meal'}.`);
        return;
      }
      const hasEmptyLabel = categoryDraft.some((item) => !item.label || !item.label.trim());
      if (hasEmptyLabel) {
        setCategoryFormError('Please provide a label for every entry before saving.');
        return;
      }
    }

    setIsSubmittingCategory(true);
    try {
      await updateCategoryReminders(patientId, editingCategory, categoryDraft);
      setReminders((prev) => ({
        ...prev,
        [editingCategory]: categoryDraft,
      }));
      setEditingCategory(null);
      setCategoryDraft(null);
      setIsTimePickerOpen(false);
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

  /**
   * Parse a hydration schedule string like "8 AM – 8 PM" or "8:00 AM – 8:00 PM"
   * into [startTimeStr, endTimeStr].
   */
  const parseHydrationSchedule = (schedule) => {
    const parts = String(schedule ?? '').split('\u2013').map((s) => s.trim());
    if (parts.length === 2 && parts[0] && parts[1]) return parts;
    // Fallback for em-dash variants or plain hyphen
    const altParts = String(schedule ?? '').split(/[-—]/).map((s) => s.trim());
    if (altParts.length === 2 && altParts[0] && altParts[1]) return altParts;
    return ['8:00 AM', '8:00 PM'];
  };

  return (
    <div className="space-y-6">
      {/* Care Plan Header Card */}
      <section
        aria-label="Care Plan Overview"
        className="bg-surface dark:bg-ink-soft/20 border border-border/80 dark:border-ink-soft/40 rounded-card p-6 sm:p-8 shadow-sm transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-cream dark:bg-ink-soft/40 text-terracotta text-xs font-semibold uppercase tracking-wider mb-1">
              Personalized Protocol
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink dark:text-cream tracking-tight truncate">
              Care Plan & Customization
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft dark:text-cream/70 max-w-xl leading-relaxed">
              Personalize {patientName}&apos;s environment and daily schedule to support memory retention and ensure well-being.
            </p>
          </div>

          {/* Action Button: Save Changes */}
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-surface dark:bg-ink-soft/40 hover:bg-cream dark:hover:bg-ink-soft/60 border border-border dark:border-ink-soft/40 rounded-lg text-xs sm:text-sm font-semibold text-ink dark:text-cream transition-colors focus:outline-none focus:ring-1 focus:ring-terracotta disabled:opacity-60 disabled:cursor-not-allowed shadow-xs min-h-[44px] shrink-0 self-start sm:self-auto"
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
          <div className="flex items-center gap-4 border-b border-border/60 dark:border-ink-soft/30 pb-5">
            <div className="w-8 h-8 rounded-full bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 flex items-center justify-center text-terracotta shrink-0">
              <Heart className="w-4 h-4 fill-terracotta/20" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-ink dark:text-cream">
                Memory Gallery
              </h2>
              <p className="text-xs text-ink-soft dark:text-cream/70">
                Upload photos of loved ones to help with memory exercises.
              </p>
            </div>
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
                className="border-2 border-dashed border-border/80 dark:border-ink-soft/40 hover:border-terracotta bg-cream/30 dark:bg-ink-soft/10 hover:bg-cream/70 rounded-card p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[180px] outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta group"
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

          {/* Familiar Sounds Section */}
          <div className="pt-5 border-t border-border/60 dark:border-ink-soft/30 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 flex items-center justify-center text-terracotta shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-ink dark:text-cream truncate">
                    Familiar Sounds & Voices
                  </h3>
                  <p className="text-xs text-ink-soft dark:text-cream/70 truncate">
                    Voices and comforting sounds for {patientName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSoundModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream/80 dark:bg-ink-soft/30 hover:bg-cream dark:hover:bg-ink-soft/50 border border-border/80 dark:border-ink-soft/40 rounded-lg text-xs font-semibold text-ink dark:text-cream transition-colors outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-terracotta" />
                <span>Add Sound</span>
              </button>
            </div>

            {familiarSounds.length === 0 ? (
              <div className="p-5 bg-cream/30 dark:bg-ink-soft/10 border-2 border-dashed border-border/80 dark:border-ink-soft/40 rounded-card text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-surface dark:bg-ink-soft/30 border border-border/70 dark:border-ink-soft/30 mx-auto flex items-center justify-center text-terracotta/80">
                  <Music className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-ink-soft dark:text-cream/70 max-w-sm mx-auto">
                  Add familiar voices or songs to help with recognition and comfort.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSoundModalOpen(true)}
                  className="text-xs font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Upload your first sound clip</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {familiarSounds.map((sound) => (
                  <SoundClipCard
                    key={sound.id}
                    sound={sound}
                    onDelete={handleDeleteSound}
                  />
                ))}
              </div>
            )}
          </div>
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
                        className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
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
                        className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
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
                        className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
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
                    className="w-full border-2 border-dashed border-border/80 dark:border-ink-soft/40 hover:border-terracotta bg-cream/30 dark:bg-ink-soft/10 hover:bg-cream/70 rounded-card p-3 flex items-center justify-center gap-2 text-xs font-semibold text-ink dark:text-cream transition-colors cursor-pointer min-h-[44px] outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                  >
                    <Plus className="w-4 h-4 text-terracotta" />
                    <span>Add Custom Reminder</span>
                  </button>

                </div>
              )}
            </section>

          </div>
      {/* MODAL 1: ADD FAMILY MEMBER */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 dark:bg-ink/70 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-ink border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-md max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-200">
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
                  setIsDraggingPhoto(false);
                  setMemberName('');
                  setCustomRelation('');
                }}
                className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
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
                        setIsDraggingPhoto(false);
                      }}
                      className="absolute top-2 right-2 bg-surface/90 dark:bg-ink/90 hover:bg-surface border border-border p-1.5 rounded-full text-ink dark:text-cream transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    onDragOver={handlePhotoDragOver}
                    onDragEnter={handlePhotoDragOver}
                    onDragLeave={handlePhotoDragLeave}
                    onDrop={handlePhotoDrop}
                    className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[140px] outline-none focus-within:ring-1 focus-within:ring-terracotta ${
                      isDraggingPhoto
                        ? 'border-terracotta bg-terracotta/10 dark:bg-terracotta/15 scale-[1.01] shadow-xs'
                        : 'border-border/80 dark:border-ink-soft/40 hover:border-terracotta bg-cream/40 dark:bg-ink-soft/20 hover:bg-cream'
                    }`}
                  >
                    <ImageIcon className={`w-8 h-8 text-terracotta mb-2 transition-transform duration-150 ${isDraggingPhoto ? 'scale-110' : ''}`} />
                    <span className="text-xs font-semibold text-ink dark:text-cream">
                      {isDraggingPhoto ? 'Drop photo here to upload' : 'Click or drag photo to upload'}
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
                  className="w-full px-3.5 py-2.5 bg-cream/80 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/50 shadow-[inset_0_1px_2px_rgba(46,42,36,0.06)] dark:shadow-none outline-none focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all min-h-[44px]"
                />
              </div>

              <div>
                <label
                  htmlFor="memberRelation"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                >
                  Relation <span className="text-terracotta">*</span>
                </label>
                <StyledSelect
                  id="memberRelation"
                  value={memberRelation}
                  onChange={(val) => setMemberRelation(val)}
                  options={[
                    'Granddaughter',
                    'Son',
                    'Daughter',
                    'Spouse',
                    'Grandson',
                    'Caregiver',
                    'Friend',
                    'Other',
                  ]}
                />

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
                      className="w-full px-3.5 py-2.5 bg-cream/80 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/50 shadow-[inset_0_1px_2px_rgba(46,42,36,0.06)] dark:shadow-none outline-none focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all min-h-[44px]"
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
                    setIsDraggingPhoto(false);
                    setMemberName('');
                    setCustomRelation('');
                  }}
                  disabled={isSubmittingMemory}
                  className="px-4 py-2.5 bg-cream dark:bg-ink-soft/40 hover:bg-surface border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm font-medium text-ink dark:text-cream transition-colors min-h-[44px] outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingMemory}
                  className="px-4 py-2.5 bg-terracotta hover:bg-terracotta-dark text-surface rounded-lg text-sm font-medium transition-colors flex items-center gap-2 outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm min-h-[44px]"
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
        <div className="fixed inset-0 z-50 bg-ink/50 dark:bg-ink/70 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-ink border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-md max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-200">
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
                  setIsTimePickerOpen(false);
                }}
                className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
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

            {/* Scoped scrollbar styling matching TimePicker and StyledSelect */}
            <style>{`
              .modal-scrollbar::-webkit-scrollbar {
                width: 3px;
              }
              .modal-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .modal-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(181, 86, 47, 0.35);
                border-radius: 9999px;
              }
              .modal-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(181, 86, 47, 0.65);
              }
              .modal-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: rgba(181, 86, 47, 0.35) transparent;
              }
            `}</style>

            <form onSubmit={handleCategorySave} className="space-y-4">
              {/* Editing Medication List */}
              {editingCategory === 'medication' && Array.isArray(categoryDraft) && (
                <div className="space-y-3">
                  <div className={`space-y-3 max-h-[50vh] sm:max-h-[320px] ${isTimePickerOpen ? 'overflow-hidden' : 'overflow-y-auto'} modal-scrollbar pr-1 -mr-1`}>
                    {categoryDraft.map((item, idx) => (
                      <div key={item.id || idx} className="p-3 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-ink-soft dark:text-cream/70">
                            Medication Dose #{idx + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setCategoryDraft((prev) => prev.filter((_, i) => i !== idx))
                            }
                            aria-label={`Remove medication dose ${idx + 1}`}
                            className="p-1 text-ink-soft/70 hover:text-terracotta dark:text-cream/60 dark:hover:text-terracotta rounded-md hover:bg-cream dark:hover:bg-ink-soft/40 transition-colors outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryDraft((prev) => {
                              const updated = [...prev];
                              updated[idx] = { ...updated[idx], label: val };
                              return updated;
                            });
                          }}
                          placeholder="e.g. Morning Dose, BP Medicine"
                          className="w-full px-3.5 py-2.5 bg-cream/80 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/50 shadow-[inset_0_1px_2px_rgba(46,42,36,0.06)] dark:shadow-none outline-none focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all min-h-[44px]"
                        />

                        <label className="block text-xs font-semibold text-ink-soft dark:text-cream/70">
                          Scheduled Time
                        </label>
                        <TimePicker
                          value={item.time}
                          onOpenChange={setIsTimePickerOpen}
                          onChange={(val) =>
                            setCategoryDraft((prev) => {
                              const updated = [...prev];
                              updated[idx] = { ...updated[idx], time: val };
                              return updated;
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCategoryDraft((prev) => [
                        ...prev,
                        { id: `med_${Date.now()}`, label: '', time: '8:00 AM', active: true },
                      ])
                    }
                    className="w-full py-2.5 px-3 border border-dashed border-border/80 dark:border-ink-soft/40 hover:border-terracotta/60 dark:hover:border-terracotta/60 rounded-lg bg-cream/40 dark:bg-ink-soft/20 hover:bg-cream/80 dark:hover:bg-ink-soft/30 text-xs font-semibold text-ink-soft dark:text-cream/80 hover:text-terracotta dark:hover:text-terracotta flex items-center justify-center gap-1.5 transition-colors min-h-[40px] outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                  >
                    <Plus className="w-4 h-4 text-terracotta" />
                    <span>Add Medication Dose</span>
                  </button>
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
                      className="w-full px-3.5 py-2.5 bg-cream/80 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/50 shadow-[inset_0_1px_2px_rgba(46,42,36,0.06)] dark:shadow-none outline-none focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5">
                      Active Time Window
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-medium text-ink-soft dark:text-cream/60 mb-1">Start</p>
                        <TimePicker
                          value={parseHydrationSchedule(categoryDraft.schedule)[0]}
                          onChange={(val) =>
                            setCategoryDraft((prev) => ({
                              ...prev,
                              schedule: `${val} \u2013 ${parseHydrationSchedule(prev.schedule)[1]}`,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-ink-soft dark:text-cream/60 mb-1">End</p>
                        <TimePicker
                          value={parseHydrationSchedule(categoryDraft.schedule)[1]}
                          onChange={(val) =>
                            setCategoryDraft((prev) => ({
                              ...prev,
                              schedule: `${parseHydrationSchedule(prev.schedule)[0]} \u2013 ${val}`,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Editing Meals List */}
              {editingCategory === 'meals' && Array.isArray(categoryDraft) && (
                <div className="space-y-3">
                  <div className={`space-y-3 max-h-[50vh] sm:max-h-[320px] ${isTimePickerOpen ? 'overflow-hidden' : 'overflow-y-auto'} modal-scrollbar pr-1 -mr-1`}>
                    {categoryDraft.map((item, idx) => (
                      <div key={item.id || idx} className="p-3 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-ink-soft dark:text-cream/70">
                            Meal #{idx + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setCategoryDraft((prev) => prev.filter((_, i) => i !== idx))
                            }
                            aria-label={`Remove meal ${idx + 1}`}
                            className="p-1 text-ink-soft/70 hover:text-terracotta dark:text-cream/60 dark:hover:text-terracotta rounded-md hover:bg-cream dark:hover:bg-ink-soft/40 transition-colors outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryDraft((prev) => {
                              const updated = [...prev];
                              updated[idx] = { ...updated[idx], label: val };
                              return updated;
                            });
                          }}
                          placeholder="e.g. Breakfast, Lunch, Snack, Dinner"
                          className="w-full px-3.5 py-2.5 bg-cream/80 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/50 shadow-[inset_0_1px_2px_rgba(46,42,36,0.06)] dark:shadow-none outline-none focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all min-h-[44px]"
                        />

                        <label className="block text-xs font-semibold text-ink-soft dark:text-cream/70">
                          Scheduled Time
                        </label>
                        <TimePicker
                          value={item.time}
                          onOpenChange={setIsTimePickerOpen}
                          onChange={(val) =>
                            setCategoryDraft((prev) => {
                              const updated = [...prev];
                              updated[idx] = { ...updated[idx], time: val };
                              return updated;
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCategoryDraft((prev) => [
                        ...prev,
                        { id: `meal_${Date.now()}`, label: '', time: '12:00 PM', active: true },
                      ])
                    }
                    className="w-full py-2.5 px-3 border border-dashed border-border/80 dark:border-ink-soft/40 hover:border-terracotta/60 dark:hover:border-terracotta/60 rounded-lg bg-cream/40 dark:bg-ink-soft/20 hover:bg-cream/80 dark:hover:bg-ink-soft/30 text-xs font-semibold text-ink-soft dark:text-cream/80 hover:text-terracotta dark:hover:text-terracotta flex items-center justify-center gap-1.5 transition-colors min-h-[40px] outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                  >
                    <Plus className="w-4 h-4 text-terracotta" />
                    <span>Add Meal</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60 dark:border-ink-soft/30">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryDraft(null);
                    setIsTimePickerOpen(false);
                  }}
                  disabled={isSubmittingCategory}
                  className="px-4 py-2.5 bg-cream dark:bg-ink-soft/40 hover:bg-surface border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm font-medium text-ink dark:text-cream transition-colors min-h-[44px] outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCategory}
                  className="px-4 py-2.5 bg-terracotta hover:bg-terracotta-dark text-surface rounded-lg text-sm font-medium transition-colors flex items-center gap-2 outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm min-h-[44px]"
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
        <div className="fixed inset-0 z-50 bg-ink/50 dark:bg-ink/70 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-ink border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-md max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-200">
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
                className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
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
                  className="w-full px-3.5 py-2.5 bg-cream/80 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/50 shadow-[inset_0_1px_2px_rgba(46,42,36,0.06)] dark:shadow-none outline-none focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all min-h-[44px]"
                />
              </div>

              <div>
                <label
                  htmlFor="customTime"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                >
                  Time <span className="text-terracotta">*</span>
                </label>
                <TimePicker
                  id="customTime"
                  value={customTime}
                  onChange={setCustomTime}
                />
              </div>

              <div>
                <label
                  htmlFor="customFrequency"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                >
                  Repeat Frequency
                </label>
                <StyledSelect
                  id="customFrequency"
                  value={customFrequency}
                  onChange={(val) => setCustomFrequency(val)}
                  options={['Daily', 'Weekly', 'Monthly', 'As Needed']}
                />
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
                  className="px-4 py-2.5 bg-cream dark:bg-ink-soft/40 hover:bg-surface border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm font-medium text-ink dark:text-cream transition-colors min-h-[44px] outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCustom}
                  className="px-4 py-2.5 bg-terracotta hover:bg-terracotta-dark text-surface rounded-lg text-sm font-medium transition-colors flex items-center gap-2 outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm min-h-[44px]"
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

      {/* MODAL 4: ADD FAMILIAR SOUND */}
      {isSoundModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 dark:bg-ink/70 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-ink border border-border/80 dark:border-ink-soft/40 rounded-card p-6 shadow-md max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border/60 dark:border-ink-soft/30 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-terracotta" />
                <h3 className="text-lg font-bold text-ink dark:text-cream">
                  Add Familiar Sound
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSoundModalOpen(false);
                  setSoundFormError('');
                  setSoundAudioUrl('');
                  setSoundFileName('');
                  setSoundCaption('');
                  setIsDraggingAudio(false);
                }}
                className="p-1.5 text-ink-soft dark:text-cream/70 hover:text-ink dark:hover:text-cream rounded-lg hover:bg-cream dark:hover:bg-ink-soft/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {soundFormError && (
              <div className="p-3 bg-cream dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg flex items-center gap-2 text-xs font-medium text-terracotta">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{soundFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddSoundSubmit} className="space-y-4">
              {/* Audio Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5">
                  Audio File <span className="text-terracotta">*</span>
                </label>

                {soundAudioUrl ? (
                  <div className="p-3.5 bg-cream/70 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-card space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Music className="w-4 h-4 text-terracotta shrink-0" />
                        <span className="text-xs font-medium text-ink dark:text-cream truncate">
                          {soundFileName || 'Selected Audio Clip'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSoundAudioUrl('');
                          setSoundFileName('');
                        }}
                        className="text-[11px] font-semibold text-terracotta hover:underline shrink-0"
                      >
                        Change
                      </button>
                    </div>
                    <audio controls src={soundAudioUrl} className="w-full h-8 outline-none" preload="metadata" />
                  </div>
                ) : (
                  <label
                    onDragOver={handleAudioDragOver}
                    onDragEnter={handleAudioDragOver}
                    onDragLeave={handleAudioDragLeave}
                    onDrop={handleAudioDrop}
                    className={`border-2 border-dashed rounded-card p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDraggingAudio
                        ? 'border-terracotta bg-terracotta/10 dark:bg-terracotta/20 scale-[0.99]'
                        : 'border-border/80 dark:border-ink-soft/40 hover:border-terracotta/70 bg-cream/30 dark:bg-ink-soft/10 hover:bg-cream/60 dark:hover:bg-ink-soft/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-surface dark:bg-ink-soft/30 border border-border dark:border-ink-soft/40 flex items-center justify-center text-terracotta mb-2">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-ink dark:text-cream">
                      {isDraggingAudio ? 'Drop audio clip here to upload' : 'Click or drag audio file to upload'}
                    </span>
                    <span className="text-[11px] text-ink-soft dark:text-cream/60 mt-1">
                      MP3, WAV, MPEG up to 10MB (Required)
                    </span>
                    <input
                      type="file"
                      accept="audio/mp3, audio/mpeg, audio/wav, audio/ogg, audio/m4a, audio/aac"
                      onChange={handleAudioChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Caption field */}
              <div>
                <label
                  htmlFor="soundCaption"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink-soft dark:text-cream/70 mb-1.5"
                >
                  What&apos;s this sound? <span className="text-terracotta">*</span>
                </label>
                <input
                  id="soundCaption"
                  type="text"
                  value={soundCaption}
                  onChange={(e) => setSoundCaption(e.target.value)}
                  placeholder="e.g. Grandmother's voice, Favorite morning lullaby"
                  className="w-full px-3.5 py-2.5 bg-cream/80 dark:bg-ink-soft/30 border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm text-ink dark:text-cream placeholder:text-ink-soft/60 dark:placeholder:text-cream/50 shadow-[inset_0_1px_2px_rgba(46,42,36,0.06)] dark:shadow-none outline-none focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all min-h-[44px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60 dark:border-ink-soft/30">
                <button
                  type="button"
                  onClick={() => {
                    setIsSoundModalOpen(false);
                    setSoundFormError('');
                    setSoundAudioUrl('');
                    setSoundFileName('');
                    setSoundCaption('');
                    setIsDraggingAudio(false);
                  }}
                  disabled={isSubmittingSound}
                  className="px-4 py-2.5 bg-cream dark:bg-ink-soft/40 hover:bg-surface border border-border/80 dark:border-ink-soft/40 rounded-lg text-sm font-medium text-ink dark:text-cream transition-colors min-h-[44px] outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingSound}
                  className="px-4 py-2.5 bg-terracotta hover:bg-terracotta-dark text-surface rounded-lg text-sm font-medium transition-colors flex items-center gap-2 outline-none select-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm min-h-[44px]"
                >
                  {isSubmittingSound ? (
                    <>
                      <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Add Sound Clip</span>
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

