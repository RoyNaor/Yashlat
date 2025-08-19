'use client'

import { useState } from 'react'
import { Button, Input } from '@heroui/react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { useRouter } from 'next/navigation'

const pakalOptions = ['רובאי', 'נגב', 'קלע', 'מטוליסט', 'חובש']
const extraPakalOptions = ['נהג סוואנה', 'נהג אקדרית', 'נהג האמר', 'אין']
const roleOptions = ['לוחם', 'מפקד']

type Requirement = {
  role: string
  pakal: string
  exstraPakal: string
}

export default function CreateMissionPage() {
  const [title, setTitle] = useState('')
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const router = useRouter()

  const addRequirement = () => {
    setRequirements(prev => [...prev, { role: '', pakal: '', exstraPakal: '' }])
  }

  const updateRequirement = (index: number, field: keyof Requirement, value: string) => {
    const updated = [...requirements]
    updated[index][field] = value
    setRequirements(updated)
  }

  const removeRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title || requirements.length === 0) {
      alert('נא למלא כותרת ודרישה אחת לפחות')
      return
    }

    const newMission = {
      title,
      type: 'daily',
      requirements,
      assignedTo: []
    }

    try {
      await addDoc(collection(db, 'missions'), newMission)
      alert('המשימה נוצרה בהצלחה!')
      setTitle('')
      setRequirements([])
      router.push('/missions/daily')
    } catch (err) {
      console.error('שגיאה בשמירה:', err)
      alert('אירעה שגיאה בשמירת המשימה')
    }
  }

  const saveAsFavorite = async () => {
    if (!title || requirements.length === 0) {
      alert('נא למלא כותרת ודרישה אחת לפחות')
      return
    }

    const favoriteMission = {
      title,
      type: 'daily',
      requirements
    }

    try {
      await addDoc(collection(db, 'favorites_daily_missions'), favoriteMission)
      alert('המשימה נשמרה במועדפים!')
    } catch (err) {
      console.error('שגיאה בשמירה למועדפים:', err)
      alert('אירעה שגיאה בשמירת המשימה למועדפים')
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-purple-700 text-center mb-8">יצירת משימה חדשה</h1>

        <div className="relative mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="כותרת המשימה"
            className="w-full text-right px-4 py-7 border rounded-xl shadow-sm placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            id="title"
          />
          <label
            htmlFor="title"
            className="absolute right-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-purple-600"
          >
            כותרת משימה
          </label>
        </div>

        {requirements.map((req, idx) => (
          <div
            key={idx}
            className="bg-gray-100 rounded-xl p-4 mb-4 border border-gray-200 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={req.role}
                onChange={(e) => updateRequirement(idx, 'role', e.target.value)}
                className="rounded-xl px-4 py-2 border border-gray-300 focus:ring-purple-500"
              >
                <option value="">בחר תפקיד</option>
                {roleOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <select
                value={req.pakal}
                onChange={(e) => updateRequirement(idx, 'pakal', e.target.value)}
                className="rounded-xl px-4 py-2 border border-gray-300 focus:ring-purple-500"
              >
                <option value="">בחר פק"ל</option>
                <option value="ללא דרישה">ללא דרישה</option>
                {pakalOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              <select
                value={req.exstraPakal}
                onChange={(e) => updateRequirement(idx, 'exstraPakal', e.target.value)}
                className="rounded-xl px-4 py-2 border border-gray-300 focus:ring-purple-500"
              >
                <option value="">בחר תוספת</option>
                <option value="ללא דרישה">ללא דרישה</option>
                {extraPakalOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="text-left mt-4">
              <Button
                onClick={() => removeRequirement(idx)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-1 text-sm"
              >
                הסר דרישה
              </Button>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 flex-wrap">
          <Button onClick={addRequirement} className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-2">
            ➕ הוסף דרישה
          </Button>
          <Button onClick={handleSubmit} className="rounded-full bg-green-600 hover:bg-green-700 text-white px-6 py-2">
            ✅ צור משימה
          </Button>
          <Button onClick={saveAsFavorite} className="rounded-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2">
            ⭐ שמור במועדפים
          </Button>
        </div>
      </div>
    </div>
  )
}
