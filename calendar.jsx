import { useState, useCallback } from "react";

const USERS = {
  연아: { color: "#6C63FF", light: "#EEF0FF", emoji: "🌙" },
  아린: { color: "#FF6B9D", light: "#FFF0F6", emoji: "✨" },
};

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7AM ~ 10PM

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function App() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [bookings, setBookings] = useState({});
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ user: "연아", startHour: 9, duration: 1 });
  const [conflict, setConflict] = useState(false);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDay(currentYear, currentMonth);

  const getDateKey = (day) => `${currentYear}-${currentMonth + 1}-${day}`;

  const getDayBookings = (day) => bookings[getDateKey(day)] || [];

  const hasBooking = (day) => getDayBookings(day).length > 0;

  const checkConflict = useCallback(
    (dayKey, user, startHour, duration, excludeId = null) => {
      const existing = bookings[dayKey] || [];
      const newEnd = startHour + duration;
      return existing.some((b) => {
        if (b.id === excludeId) return false;
        const bEnd = b.startHour + b.duration;
        return startHour < bEnd && newEnd > b.startHour;
      });
    },
    [bookings]
  );

  const openModal = (day) => {
    setSelectedDay(day);
    setForm({ user: "연아", startHour: 9, duration: 1 });
    setConflict(false);
    setModal("add");
  };

  const handleFormChange = (newForm) => {
    setForm(newForm);
    const dayKey = getDateKey(selectedDay);
    setConflict(checkConflict(dayKey, newForm.user, newForm.startHour, newForm.duration));
  };

  const handleBook = () => {
    const dayKey = getDateKey(selectedDay);
    if (checkConflict(dayKey, form.user, form.startHour, form.duration)) {
      setConflict(true);
      return;
    }
    setBookings((prev) => ({
      ...prev,
      [dayKey]: [
        ...(prev[dayKey] || []),
        { ...form, id: Date.now() },
      ],
    }));
    setModal(null);
  };

  const handleDelete = (dayKey, id) => {
    setBookings((prev) => ({
      ...prev,
      [dayKey]: prev[dayKey].filter((b) => b.id !== id),
    }));
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  const dayNames = ["일","월","화","수","목","금","토"];

  const selectedDayKey = selectedDay ? getDateKey(selectedDay) : null;
  const selectedBookings = selectedDay ? getDayBookings(selectedDay) : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0f0c29 100%)",
      fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
      color: "#f0eeff",
      padding: "0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* Header */}
      <div style={{
        width: "100%",
        maxWidth: 700,
        padding: "32px 24px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            background: "linear-gradient(135deg, #6C63FF, #FF6B9D)",
            borderRadius: 12,
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
            boxShadow: "0 0 16px #6C63FF88",
          }}>F</div>
          <div>
            <div style={{ fontSize: 13, color: "#a89ee0", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>FastCampus</div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>수강 시간 예약</div>
          </div>
        </div>
        {/* User badges */}
        <div style={{ display: "flex", gap: 10, marginTop: 16, marginBottom: 0 }}>
          {Object.entries(USERS).map(([name, u]) => (
            <div key={name} style={{
              display: "flex", alignItems: "center", gap: 7,
              background: u.light + "18",
              border: `1.5px solid ${u.color}55`,
              borderRadius: 20, padding: "5px 14px",
              fontSize: 13, fontWeight: 700, color: u.color,
            }}>
              <span style={{ fontSize: 15 }}>{u.emoji}</span> {name}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{
            fontSize: 12, color: "#a89ee0",
            display: "flex", alignItems: "center", gap: 4,
          }}>⚡ 동시접속 방지 적용 중</div>
        </div>
      </div>

      {/* Calendar */}
      <div style={{
        width: "100%", maxWidth: 700,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 20, margin: "20px 24px 0",
        padding: "20px 20px",
        backdropFilter: "blur(10px)",
      }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
            {currentYear}년 {monthNames[currentMonth]}
          </span>
          <button onClick={nextMonth} style={navBtn}>›</button>
        </div>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 6 }}>
          {dayNames.map((d, i) => (
            <div key={d} style={{
              textAlign: "center", fontSize: 11, fontWeight: 700,
              color: i === 0 ? "#FF7B7B" : i === 6 ? "#7BC8FF" : "#a89ee0",
              padding: "4px 0",
            }}>{d}</div>
          ))}
        </div>
        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dayBks = getDayBookings(day);
            const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
            const isSelected = selectedDay === day;
            const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <div
                key={day}
                onClick={() => !isPast && openModal(day)}
                style={{
                  borderRadius: 10,
                  padding: "7px 4px 6px",
                  minHeight: 52,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  cursor: isPast ? "default" : "pointer",
                  background: isSelected
                    ? "rgba(108,99,255,0.22)"
                    : isToday
                    ? "rgba(108,99,255,0.10)"
                    : "transparent",
                  border: isSelected
                    ? "1.5px solid #6C63FF"
                    : isToday
                    ? "1.5px solid #6C63FF55"
                    : "1.5px solid transparent",
                  opacity: isPast ? 0.32 : 1,
                  transition: "all 0.15s",
                }}
              >
                <span style={{
                  fontSize: 13, fontWeight: isToday ? 900 : 500,
                  color: isToday ? "#b8aaff" : "#e8e0ff",
                  marginBottom: 3,
                }}>{day}</span>
                {/* Booking dots */}
                <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                  {dayBks.slice(0, 3).map((b) => (
                    <div key={b.id} style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: USERS[b.user].color,
                      boxShadow: `0 0 5px ${USERS[b.user].color}88`,
                    }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div style={{
          width: "100%", maxWidth: 700,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 20, margin: "12px 24px 0",
          padding: "18px 20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>
              {currentMonth + 1}월 {selectedDay}일 예약 현황
            </span>
            <button
              onClick={() => openModal(selectedDay)}
              style={{
                background: "linear-gradient(135deg, #6C63FF, #9B5DE5)",
                border: "none", borderRadius: 10,
                color: "#fff", fontWeight: 700, fontSize: 13,
                padding: "7px 16px", cursor: "pointer",
                boxShadow: "0 0 12px #6C63FF55",
              }}
            >+ 예약 추가</button>
          </div>

          {selectedBookings.length === 0 ? (
            <div style={{ color: "#a89ee0", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
              예약된 시간이 없어요. 클릭해서 추가해보세요!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Timeline */}
              <div style={{ position: "relative", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 0, height: 28, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,0.06)" }}>
                  {HOURS.map((h) => {
                    const booking = selectedBookings.find(b => b.startHour <= h && b.startHour + b.duration > h);
                    return (
                      <div key={h} style={{
                        flex: 1,
                        background: booking ? USERS[booking.user].color + "bb" : "transparent",
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, color: booking ? "#fff" : "transparent",
                        transition: "background 0.2s",
                      }}>
                        {booking ? USERS[booking.user].emoji : ""}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, padding: "0 1px" }}>
                  {[7, 10, 13, 16, 19, 22].map(h => (
                    <span key={h} style={{ fontSize: 9, color: "#a89ee0" }}>{h}시</span>
                  ))}
                </div>
              </div>

              {selectedBookings.map((b) => (
                <div key={b.id} style={{
                  display: "flex", alignItems: "center",
                  background: USERS[b.user].color + "18",
                  border: `1px solid ${USERS[b.user].color}44`,
                  borderRadius: 10, padding: "10px 14px",
                }}>
                  <span style={{ fontSize: 18, marginRight: 10 }}>{USERS[b.user].emoji}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, color: USERS[b.user].color, fontSize: 14 }}>{b.user}</span>
                    <span style={{ color: "#c8c0f0", fontSize: 13, marginLeft: 10 }}>
                      {b.startHour}:00 ~ {b.startHour + b.duration}:00 ({b.duration}시간)
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedDayKey, b.id)}
                    style={{
                      background: "rgba(255,100,100,0.15)", border: "1px solid rgba(255,100,100,0.3)",
                      borderRadius: 7, color: "#ff8888", fontSize: 12,
                      padding: "4px 10px", cursor: "pointer", fontWeight: 600,
                    }}
                  >삭제</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal === "add" && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(10,8,30,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, backdropFilter: "blur(6px)",
          padding: 24,
        }} onClick={() => setModal(null)}>
          <div style={{
            background: "linear-gradient(145deg, #1a1040, #0f0c29)",
            border: "1px solid rgba(108,99,255,0.35)",
            borderRadius: 20, padding: "28px 28px",
            width: "100%", maxWidth: 380,
            boxShadow: "0 0 40px rgba(108,99,255,0.25)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20 }}>
              📅 {currentMonth + 1}월 {selectedDay}일 예약
            </div>

            {/* User select */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#a89ee0", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>수강자</div>
              <div style={{ display: "flex", gap: 8 }}>
                {Object.entries(USERS).map(([name, u]) => (
                  <button
                    key={name}
                    onClick={() => handleFormChange({ ...form, user: name })}
                    style={{
                      flex: 1, padding: "10px 0",
                      borderRadius: 10, border: `2px solid ${form.user === name ? u.color : "rgba(255,255,255,0.1)"}`,
                      background: form.user === name ? u.color + "22" : "transparent",
                      color: form.user === name ? u.color : "#a89ee0",
                      fontWeight: 700, fontSize: 14, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >{u.emoji} {name}</button>
                ))}
              </div>
            </div>

            {/* Start hour */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#a89ee0", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>시작 시간</div>
              <select
                value={form.startHour}
                onChange={(e) => handleFormChange({ ...form, startHour: Number(e.target.value) })}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#f0eeff", fontSize: 14, fontFamily: "inherit",
                  outline: "none",
                }}
              >
                {HOURS.map(h => <option key={h} value={h} style={{ background: "#1a1040" }}>{h}:00</option>)}
              </select>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#a89ee0", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>수강 시간</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleFormChange({ ...form, duration: d })}
                    style={{
                      flex: 1, padding: "9px 0",
                      borderRadius: 8, border: `1.5px solid ${form.duration === d ? USERS[form.user].color : "rgba(255,255,255,0.1)"}`,
                      background: form.duration === d ? USERS[form.user].color + "22" : "transparent",
                      color: form.duration === d ? USERS[form.user].color : "#a89ee0",
                      fontWeight: 700, fontSize: 13, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >{d}시간</button>
                ))}
              </div>
            </div>

            {/* Conflict warning */}
            {conflict && (
              <div style={{
                background: "rgba(255,100,100,0.12)", border: "1px solid rgba(255,100,100,0.35)",
                borderRadius: 10, padding: "10px 14px",
                color: "#ff8888", fontSize: 13, fontWeight: 600, marginBottom: 16,
                display: "flex", gap: 8, alignItems: "center",
              }}>
                ⚠️ 해당 시간대에 이미 예약이 있어요! 시간을 변경해주세요.
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setModal(null)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#a89ee0", fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
              >취소</button>
              <button
                onClick={handleBook}
                style={{
                  flex: 2, padding: "12px 0", borderRadius: 12,
                  background: conflict ? "rgba(108,99,255,0.3)" : `linear-gradient(135deg, ${USERS[form.user].color}, ${form.user === "연아" ? "#9B5DE5" : "#FF4D8D"})`,
                  border: "none", color: "#fff", fontWeight: 800, fontSize: 14,
                  cursor: conflict ? "not-allowed" : "pointer",
                  boxShadow: conflict ? "none" : `0 0 20px ${USERS[form.user].color}66`,
                  transition: "all 0.2s",
                }}
              >예약 확정 ✓</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 40 }} />
    </div>
  );
}

const navBtn = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, width: 36, height: 36,
  color: "#f0eeff", fontSize: 20, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontWeight: 300,
};
