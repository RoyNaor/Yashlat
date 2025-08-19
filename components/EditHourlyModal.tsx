'use client'

import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

type Mission = {
  id: string
  title: string
  startHour: string
  endHour: string
  shiftDuration: string
}

export default function EditHourlyModal({
  mission,
  onClose,
}: {
  mission: Mission
  onClose: () => void
}) {
  const [title, setTitle] = useState(mission.title)
  const [startHour, setStartHour] = useState(mission.startHour)
  const [endHour, setEndHour] = useState(mission.endHour)
  const [shiftDuration, setShiftDuration] = useState(mission.shiftDuration)

  const handleSave = async () => {
    await updateDoc(doc(db, 'missions', mission.id), {
      title,
      startHour,
      endHour,
      shiftDuration,
    })
    alert('המשימה עודכנה בהצלחה')
    onClose()
    window.location.reload() // לחלופין: לקרוא ל־fetchMissions אם זמין
  }

  return (
    <div className="fixed inset-0 bg-purple-300 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-2xl" dir="rtl">
        <h2 className="text-xl font-bold mb-6">עריכת משימה שעתית</h2>

        <label className="block mb-2 font-semibold">כותרת המשימה</label>
        <input
          className="w-full border rounded-xl px-3 py-2 mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block mb-2 font-semibold">שעת התחלה</label>
        <input
          type="time"
          className="w-full border rounded-xl px-3 py-2 mb-4"
          value={startHour}
          onChange={(e) => setStartHour(e.target.value)}
        />

        <label className="block mb-2 font-semibold">שעת סיום</label>
        <input
          type="time"
          className="w-full border rounded-xl px-3 py-2 mb-4"
          value={endHour}
          onChange={(e) => setEndHour(e.target.value)}
        />

        <label className="block mb-2 font-semibold">משך משמרת (בשעות)</label>
        <input
          type="text"
          className="w-full border rounded-xl px-3 py-2 mb-6"
          value={shiftDuration}
          onChange={(e) => setShiftDuration(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 rounded-full px-4 py-2"
          >
            בטל
          </button>
          <button
            onClick={handleSave}
            className="bg-purple-600 text-white rounded-full px-4 py-2"
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  )
}
