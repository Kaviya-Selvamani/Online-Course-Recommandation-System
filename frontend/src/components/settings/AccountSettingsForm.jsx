import SectionCard from "../common/SectionCard.jsx";

export default function AccountSettingsForm({
  name,
  email,
  avatarUrl,
  bio,
  onNameChange,
  onEmailChange,
  onAvatarChange,
  onBioChange,
  currentPassword,
  newPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onSaveProfile,
  onSaveEmail,
  onSavePassword,
  savingProfile,
  savingEmail,
  savingPassword,
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="Account Settings" subtitle="Manage your personal account details.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-200">
            Full Name
            <input
              className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Your name"
            />
          </label>
          <label className="text-sm text-slate-200">
            Bio
            <input
              className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
              value={bio}
              onChange={(event) => onBioChange(event.target.value)}
              placeholder="Short bio"
              maxLength={280}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[160px_1fr]">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-20 w-20 rounded-2xl border border-slate-700/60 bg-slate-800/70"
              style={
                avatarUrl
                  ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            />
            <input
              type="file"
              accept="image/*"
              className="text-xs text-slate-400"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    onAvatarChange(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">
              Profile Picture URL
              <input
                className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
                value={avatarUrl}
                onChange={(event) => onAvatarChange(event.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            className="rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            onClick={onSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Change Email" subtitle="Update the email used for login and notifications.">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="text-sm text-slate-200">
            Email Address
            <input
              className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </label>
          <div className="flex items-end">
            <button
              className="w-full rounded-xl border border-slate-700/70 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500/70 hover:bg-slate-800"
              onClick={onSaveEmail}
              disabled={savingEmail}
            >
              {savingEmail ? "Updating..." : "Update Email"}
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Change Password" subtitle="Keep your account secure with a strong password.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-200">
            Current Password
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
              value={currentPassword}
              onChange={(event) => onCurrentPasswordChange(event.target.value)}
            />
          </label>
          <label className="text-sm text-slate-200">
            New Password
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
              value={newPassword}
              onChange={(event) => onNewPasswordChange(event.target.value)}
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            className="rounded-xl border border-slate-700/70 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500/70 hover:bg-slate-800"
            onClick={onSavePassword}
            disabled={savingPassword}
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
