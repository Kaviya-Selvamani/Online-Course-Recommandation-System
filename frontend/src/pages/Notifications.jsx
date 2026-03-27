import { useMemo, useState } from "react";
import { FiBell, FiCheckCircle, FiClock, FiTarget, FiTrendingUp, FiZap } from "react-icons/fi";
import { motion as Motion } from "framer-motion";
import { useUiStore } from "../store/ui.js";

function getIcon(icon) {
  if (icon === "🎯") return <FiTarget />;
  if (icon === "🏁") return <FiTrendingUp />;
  if (icon === "⏳") return <FiClock />;
  if (icon === "✅") return <FiCheckCircle />;
  return <FiZap />;
}

export default function Notifications() {
  const notifs = useUiStore((state) => state.notifs);
  const markNotifRead = useUiStore((state) => state.markNotifRead);
  const markAllNotifsRead = useUiStore((state) => state.markAllNotifsRead);
  const clearNotifs = useUiStore((state) => state.clearNotifs);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const { unread, earlier } = useMemo(() => {
    return {
      unread: notifs.filter((notif) => notif.unread),
      earlier: notifs.filter((notif) => !notif.unread),
    };
  }, [notifs]);

  const openNotification = (notif) => {
    markNotifRead(notif.id);
    setSelectedNotif(notif);
  };

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Notifications</div>
        <div className="ps">Inactivity alerts, fresh recommendations, and progress milestones all in one place.</div>
      </div>

      <div className="mb-5 flex flex-wrap justify-end gap-3">
        <button className="btn bg bsm" onClick={markAllNotifsRead}>Mark All Read</button>
        <button className="btn bg bsm" onClick={clearNotifs}>Clear All</button>
      </div>

      {notifs.length === 0 ? (
        <div className="rounded-[28px] border border-slate-800/70 bg-slate-900/70 p-10 text-center text-slate-400">
          <FiBell size={36} style={{ marginBottom: 12, opacity: 0.65 }} />
          <div>No notifications yet. CourseIQ will surface activity, recommendation, and milestone alerts here.</div>
        </div>
      ) : (
        <div className="space-y-6">
          {[
            ["Unread", unread],
            ["Earlier", earlier],
          ].map(([label, items]) =>
            items.length ? (
              <div key={label}>
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
                <div className="grid gap-4">
                  {items.map((notif, index) => (
                    <Motion.button
                      key={notif.id}
                      type="button"
                      className="w-full rounded-[24px] border border-slate-800/70 bg-slate-900/80 p-5 text-left"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      whileHover={{ y: -2 }}
                      onClick={() => openNotification(notif)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
                            style={{ background: notif.bg || "rgba(74, 184, 245, 0.12)" }}
                          >
                            {getIcon(notif.icon)}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-base font-semibold text-white">{notif.title}</div>
                              {notif.unread ? (
                                <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] font-semibold text-emerald-200">
                                  New
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 text-sm leading-6 text-slate-300">{notif.desc}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">{notif.time || "Today"}</div>
                      </div>
                    </Motion.button>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}

      {selectedNotif ? (
        <div className="overlay" onClick={() => setSelectedNotif(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-hd">
              <div className="modal-title">{selectedNotif.title}</div>
              <button className="modal-x" onClick={() => setSelectedNotif(null)}>×</button>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5">
              <div className="mb-3 flex items-center gap-3 text-slate-200">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: selectedNotif.bg || "rgba(74, 184, 245, 0.12)" }}
                >
                  {getIcon(selectedNotif.icon)}
                </span>
                <span className="text-sm text-slate-400">{selectedNotif.time || "Today"}</span>
              </div>
              <p style={{ color: "var(--t2)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                {selectedNotif.desc}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="btn bp" style={{ flex: 1 }} onClick={() => setSelectedNotif(null)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
