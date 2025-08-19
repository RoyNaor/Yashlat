'use client'

import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { Button } from '@heroui/react'

export default function NewHourlyMissionPage() {
  const [title, setTitle] = useState('')
  const [startHour, setStartHour] = useState('08:00')
  const [endHour, setEndHour] = useState('16:00')
  const [shiftDuration, setShiftDuration] = useState('0.5')
  const [customDuration, setCustomDuration] = useState('')
  const [useCustomDuration, setUseCustomDuration] = useState(false)

  const handleSave = async () => {
    const duration = useCustomDuration ? customDuration : shiftDuration
    const newMission = {
      title,
      type: 'hourly',
      startHour,
      endHour,
      shiftDuration: duration,
      assignedTo: [],
    }
    await addDoc(collection(db, 'missions'), newMission)
    alert('משימה נשמרה בהצלחה')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-purple-700 mb-6 text-center">משימה שעתית חדשה</h1>

        <label className="block mb-2 font-semibold">כותרת המשימה</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded-xl px-3 py-2 w-full mb-4"
        />

        <label className="block mb-2 font-semibold">שעת התחלה</label>
        <input
          type="time"
          value={startHour}
          onChange={e => setStartHour(e.target.value)}
          className="border rounded-xl px-3 py-2 w-full mb-4"
        />

        <label className="block mb-2 font-semibold">שעת סיום</label>
        <input
          type="time"
          value={endHour}
          onChange={e => setEndHour(e.target.value)}
          className="border rounded-xl px-3 py-2 w-full mb-4"
        />

        <label className="block mb-2 font-semibold">משך משמרת</label>
        <select
          className="border rounded-xl px-3 py-2 w-full mb-2"
          value={useCustomDuration ? 'other' : shiftDuration}
          onChange={e => {
            if (e.target.value === 'other') {
              setUseCustomDuration(true)
              setShiftDuration('0')
            } else {
              setUseCustomDuration(false)
              setShiftDuration(e.target.value)
            }
          }}
        >
          {[...Array(6)].map((_, i) => {
            const val = (i + 1) * 0.5
            return (
              <option key={val} value={val.toString()}>{val} שעות</option>
            )
          })}
          <option value="other">אחר...</option>
        </select>

        {useCustomDuration && (
          <input
            type="text"
            placeholder="כתוב משך בדקות למשל: 45"
            value={customDuration}
            onChange={e => setCustomDuration(e.target.value)}
            className="border rounded-xl px-3 py-2 w-full mb-4"
          />
        )}

        <div className="flex justify-center gap-4 mt-6">
          <Button
            onClick={handleSave}
            className="bg-purple-600 text-white w-full rounded-full py-2"
          >
            ✅ שמור משימה
          </Button>
        </div>
      </div>
    </div>
  )
}
