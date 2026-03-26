import { useEffect, useMemo, useState } from "react";
import { getSession } from "../services/authService.js";
import {
  clearLearningHistory,
  recalcRecommendations,
  resetRecommendationProfile,
  updateEmail,
  updateNotificationSettings,
  updatePassword,
  updateProfile,
} from "../services/authService.js";

import AccountSettingsForm from "../components/settings/AccountSettingsForm.jsx";
import LearningPreferencesForm from "../components/settings/LearningPreferencesForm.jsx";
import SystemControls from "../components/settings/SystemControls.jsx";
import NotificationSettings from "../components/settings/NotificationSettings.jsx";

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const CAREER_TARGET_OPTIONS = [
  "Machine Learning Engineer",
  "Data Scientist",
  "Backend Developer",
  "Cloud Engineer",
  "AI Researcher",
];

function parseInterests(input) {
  return String(input || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Settings() {
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);

  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState({});

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [bio, setBio] = useState(user.bio || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [interests, setInterests] = useState((user.interests || []).join(", "));
  const [skillLevel, setSkillLevel] = useState(
    user.learningPreferences?.preferredDifficultyLevel || user.skillLevel || "Intermediate"
  );
  const [careerGoal, setCareerGoal] = useState(
    user.careerTarget || user.careerGoal || "Machine Learning Engineer"
  );
  const [studyHours, setStudyHours] = useState(user.weeklyLearningHours ?? 4);

  const [emailNotifications, setEmailNotifications] = useState(
    user.notificationSettings?.emailNotifications ?? true
  );
  const [recommendationAlerts, setRecommendationAlerts] = useState(
    user.notificationSettings?.recommendationAlerts ?? true
  );

  useEffect(() => {
    setName(user.name || "");
    setEmail(user.email || "");
    setAvatarUrl(user.avatarUrl || "");
    setBio(user.bio || "");
    setInterests((user.interests || []).join(", "));
    setSkillLevel(user.learningPreferences?.preferredDifficultyLevel || user.skillLevel || "Intermediate");
    setCareerGoal(user.careerTarget || user.careerGoal || "Machine Learning Engineer");
    setStudyHours(user.weeklyLearningHours ?? 4);
    setEmailNotifications(user.notificationSettings?.emailNotifications ?? true);
    setRecommendationAlerts(user.notificationSettings?.recommendationAlerts ?? true);
  }, [user]);

  useEffect(() => {
    if (!status) return undefined;
    const timer = setTimeout(() => setStatus(null), 3200);
    return () => clearTimeout(timer);
  }, [status]);

  const setBusy = (key, value) =>
    setSaving((prev) => ({
      ...prev,
      [key]: value,
    }));

  const handleSaveProfile = async () => {
    setBusy("profile", true);
    try {
      await updateProfile({
        name,
        avatarUrl,
        bio,
      });
      setStatus({ type: "success", message: "Profile updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || "Failed to update profile." });
    } finally {
      setBusy("profile", false);
    }
  };

  const handleSaveEmail = async () => {
    setBusy("email", true);
    try {
      await updateEmail(email);
      setStatus({ type: "success", message: "Email updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || "Failed to update email." });
    } finally {
      setBusy("email", false);
    }
  };

  const handleSavePassword = async () => {
    setBusy("password", true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setStatus({ type: "success", message: "Password updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || "Failed to update password." });
    } finally {
      setBusy("password", false);
    }
  };

  const handleSavePreferences = async () => {
    setBusy("prefs", true);
    try {
      await updateProfile({
        interests: parseInterests(interests),
        skillLevel,
        careerTarget: careerGoal,
        careerGoal,
        weeklyLearningHours: Number(studyHours),
      });
      setStatus({ type: "success", message: "Preferences updated." });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || "Failed to update preferences." });
    } finally {
      setBusy("prefs", false);
    }
  };

  const handleSaveNotifications = async () => {
    setBusy("notifications", true);
    try {
      await updateNotificationSettings({ emailNotifications, recommendationAlerts });
      setStatus({ type: "success", message: "Notification settings saved." });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || "Failed to update notifications." });
    } finally {
      setBusy("notifications", false);
    }
  };

  const handleResetProfile = async () => {
    setBusy("system", true);
    try {
      await resetRecommendationProfile();
      setStatus({ type: "success", message: "Recommendation profile reset." });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || "Failed to reset recommendation profile." });
    } finally {
      setBusy("system", false);
    }
  };

  const handleRecalculate = async () => {
    setBusy("system", true);
    try {
      await recalcRecommendations();
      setStatus({ type: "success", message: "Recommendations refreshed." });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || "Failed to recalculate recommendations." });
    } finally {
      setBusy("system", false);
    }
  };

  const handleClearHistory = async () => {
    setBusy("system", true);
    try {
      await clearLearningHistory();
      setStatus({ type: "success", message: "Learning history cleared." });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || "Failed to clear history." });
    } finally {
      setBusy("system", false);
    }
  };

  return (
    <div className="page anim">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-slate-100">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6">
          <div className="text-2xl font-semibold">Settings</div>
          <div className="mt-1 text-sm text-slate-400">
            Update your account, learning preferences, and system controls.
          </div>
        </div>

        {status ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              status.type === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-rose-400/40 bg-rose-500/10 text-rose-200"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <AccountSettingsForm
          name={name}
          email={email}
          avatarUrl={avatarUrl}
          bio={bio}
          onNameChange={setName}
          onEmailChange={setEmail}
          onAvatarChange={setAvatarUrl}
          onBioChange={setBio}
          currentPassword={currentPassword}
          newPassword={newPassword}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onSaveProfile={handleSaveProfile}
          onSaveEmail={handleSaveEmail}
          onSavePassword={handleSavePassword}
          savingProfile={!!saving.profile}
          savingEmail={!!saving.email}
          savingPassword={!!saving.password}
        />

        <LearningPreferencesForm
          interests={interests}
          skillLevel={skillLevel}
          careerGoal={careerGoal}
          studyHours={studyHours}
          onInterestsChange={setInterests}
          onSkillLevelChange={setSkillLevel}
          onCareerGoalChange={setCareerGoal}
          onStudyHoursChange={setStudyHours}
          onSave={handleSavePreferences}
          saving={!!saving.prefs}
          skillOptions={DIFFICULTY_OPTIONS}
          careerOptions={CAREER_TARGET_OPTIONS}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <SystemControls
            onReset={handleResetProfile}
            onRecalculate={handleRecalculate}
            onClearHistory={handleClearHistory}
            working={!!saving.system}
          />

          <NotificationSettings
            emailNotifications={emailNotifications}
            recommendationAlerts={recommendationAlerts}
            onEmailChange={setEmailNotifications}
            onAlertChange={setRecommendationAlerts}
            onSave={handleSaveNotifications}
            saving={!!saving.notifications}
          />
        </div>
      </div>
    </div>
  );
}
