import { FiBookOpen, FiCheckCircle, FiTarget, FiTrendingUp } from "react-icons/fi";
import StatCard from "../common/StatCard.jsx";

export default function ProgressSummary({ enrolledCount, completedCount, inProgressCount, progressPercent, level, streakDays }) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <StatCard icon={<FiBookOpen />} label="Enrolled" value={enrolledCount} />
      <StatCard icon={<FiCheckCircle />} label="Completed" value={completedCount} />
      <StatCard icon={<FiTrendingUp />} label="In Progress" value={inProgressCount} />
      <StatCard icon={<FiTarget />} label="Progress" value={`${progressPercent}%`} />
      <StatCard icon={"🔥"} label="Level" value={`Lv ${level || 1}`} sub={`${streakDays || 0}d streak`} />
    </div>
  );
}
