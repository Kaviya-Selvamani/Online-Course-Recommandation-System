import { useUiStore } from "../store/ui.js";
import { FiBell, FiCheckCircle, FiInfo, FiTrendingUp, FiAward, FiBook } from "react-icons/fi";
import { useState } from "react";

export default function Notifications() {
    const { notifs, markNotifRead, clearNotifs } = useUiStore();
    const [selectedNotif, setSelectedNotif] = useState(null);

    const getIcon = (icon) => {
        if (icon === "🎯") return <FiTarget color="var(--ac)" />;
        if (icon === "📈") return <FiTrendingUp color="#4ab8f5" />;
        if (icon === "🔔") return <FiBell color="#f0a030" />;
        if (icon === "✅") return <FiCheckCircle color="#18c98a" />;
        if (icon === "🏆") return <FiAward color="#f0a030" />;
        if (icon === "💡") return <FiInfo color="#4ab8f5" />;
        return <FiBell />;
    };

    const handleNotifClick = (n) => {
        markNotifRead(n.id);
        setSelectedNotif(n);
    };

    return (
        <div className="page anim">
            <div className="ph">
                <div className="pt">Notifications</div>
                <div className="ps">Stay updated with your learning progress and recommendations</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn bg bsm" onClick={clearNotifs}>Clear All</button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {notifs.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
                        <FiBell size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                        <div>No notifications yet</div>
                    </div>
                ) : (
                    notifs.map((n) => (
                        <div
                            key={n.id}
                            className={"cl-item " + (n.unread ? "unread-notif" : "")}
                            style={{
                                borderBottom: '1px solid var(--bd)',
                                margin: 0,
                                padding: '16px 20px',
                                cursor: 'pointer',
                                background: n.unread ? 'rgba(var(--ac-rgb), 0.03)' : 'transparent',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => handleNotifClick(n)}
                        >
                            <div className="cl-icon" style={{ background: n.bg, fontSize: 18 }}>
                                {n.icon}
                            </div>
                            <div className="cl-info">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="cl-name" style={{ fontWeight: n.unread ? 700 : 500 }}>{n.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>{n.time}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedNotif && (
                <div className="overlay" onClick={() => setSelectedNotif(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <div className="modal-hd">
                            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span className="cl-icon" style={{ background: selectedNotif.bg, width: 32, height: 32, fontSize: 16 }}>
                                    {selectedNotif.icon}
                                </span>
                                {selectedNotif.title}
                            </div>
                            <button className="modal-x" onClick={() => setSelectedNotif(null)}>×</button>
                        </div>
                        <div style={{ padding: '20px 0' }}>
                            <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                                {selectedNotif.desc}
                            </p>
                            <div style={{ marginTop: 24, fontSize: 12, color: 'var(--t3)' }}>
                                Received {selectedNotif.time}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                            <button className="btn bp" style={{ flex: 1 }} onClick={() => setSelectedNotif(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .unread-notif:hover {
          background: rgba(var(--ac-rgb), 0.06) !important;
        }
        .cl-item:hover {
          background: var(--bg-h);
        }
      `}</style>
        </div>
    );
}
