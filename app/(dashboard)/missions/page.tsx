'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { Button } from '@heroui/react'

type Requirement = {
  role: string
  pakal: string
  pakalGil: string
  exstraPakal: string
}

type Assignment = {
  uid: string
  requirementIndex: number
}

type Mission = {
  id: string
  title: string
  type: 'daily' | 'hourly'
  startHour?: string
  endHour?: string
  shiftDuration?: number
  requirements?: Requirement[]
  assignedTo: Assignment[]
}

type Warrior = {
  uid: string
  firstName: string
  lastName: string
  role: string
  pakal: string
  pakalGil: string
  exstraPakal: string
  isAtBase: boolean
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [warriors, setWarriors] = useState<Warrior[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const missionsSnap = await getDocs(collection(db, 'missions'))
      const missionsData = missionsSnap.docs.map(doc => {
        const data = doc.data() as Partial<Mission>
        return {
          id: doc.id,
          ...data,
          assignedTo: Array.isArray(data.assignedTo) ? data.assignedTo : []
        } as Mission
      })
      setMissions(missionsData)

      const warriorsSnap = await getDocs(collection(db, 'worriors'))
      setWarriors(
        warriorsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as Warrior[]
      )
    }

    fetchData()
  }, [])

  const handlePublish = async () => {
    if (!selectedDate) return alert('בחר תאריך קודם')

    try {
      // שמירה ל־shavtac לפי תאריך
      await addDoc(collection(db, 'shavtac'), {
        date: selectedDate,
        missions,
      })

      // מחיקת כל המשימות מ־missions
      const missionsSnap = await getDocs(collection(db, 'missions'))
      const deletePromises = missionsSnap.docs.map(d => deleteDoc(doc(db, 'missions', d.id)))
      await Promise.all(deletePromises)

      // מעבר לעמוד שבצ"ק
      alert('שבצ"ק פורסם בהצלחה!')
      router.push('/shibutz')
    } catch (error) {
      console.error('שגיאה בפרסום השבצ״ק:', error)
      alert('אירעה שגיאה בעת הפרסום')
    }
  }

  return (
    <div dir="rtl" className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">ניהול משימות</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="rounded-lg border border-gray-300 p-2"
        />
        <Button className="bg-green-600 text-white px-6 rounded-lg" onClick={handlePublish}>
          פרסם שבצ״ק
        </Button>
        <Button className="bg-purple-600 text-white px-6 rounded-lg" onClick={() => router.push('/missions/daily')}>
           משימות יומיות
        </Button>
        <Button className="bg-blue-600 text-white px-6 rounded-lg" onClick={() => router.push('/missions/hourly')}>
           משימות שעתיות
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {missions.map(m => (
          <div key={m.id} className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-purple-700 mb-2">{m.title}</h2>
            {m.type === 'hourly' && (
              <p className="text-sm text-gray-600">
                שעות: {m.startHour} - {m.endHour} | משמרת: {m.shiftDuration} שעות
              </p>
            )}

            {Array.isArray(m.assignedTo) && m.assignedTo.length > 0 && (
              <div className="text-sm text-gray-600 mt-3">
                <span className="font-semibold">שובצו:</span>
                <ul className="list-disc list-inside">
                  {m.assignedTo.map((a, idx) => {
                    const w = warriors.find(w => w.uid === a.uid)
                    return (
                      <li key={idx}>
                        {w ? `${w.role}: ${w.firstName} ${w.lastName} (${w.pakal})` : `uid: ${a.uid}`}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
