import Tag from "../common/Tag.jsx";

export default function ProfileHeader({ name, email, avatarUrl, joinedDate, bio, skillLevel, careerTarget, level, xp, onEdit }) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-5">
        <div
          className="h-20 w-20 rounded-2xl border border-slate-700/60 bg-slate-800/60"
          style={
            avatarUrl
              ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!avatarUrl ? (
            <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-200">
              {name?.[0] || "U"}
            </div>
          ) : null}
        </div>
        <div className="flex-1">
          <div className="text-2xl font-semibold text-slate-100">{name}</div>
          <div className="mt-1 text-sm text-slate-400">{email}</div>
          {bio ? <div className="mt-2 text-sm text-slate-300">{bio}</div> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {skillLevel ? <Tag>{skillLevel}</Tag> : null}
            {careerTarget ? <Tag>{careerTarget}</Tag> : null}
            {level ? <Tag>Level {level} · {xp} XP</Tag> : null}
            {joinedDate ? <Tag>Joined {joinedDate}</Tag> : null}
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500/70 hover:bg-slate-800"
          onClick={onEdit}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
