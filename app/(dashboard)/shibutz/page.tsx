'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

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
  assignedTo?: Assignment[]
}

type Warrior = {
  uid: string
  firstName: string
  lastName: string
  role: string
  pakal: string
  exstraPakal: string
}

type ShavtacDoc = {
  date: string
  missions: Mission[]
}

// עוזר לחשב שעות לפי משך
function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutesToAdd
  const newH = Math.floor(total / 60).toString().padStart(2, '0')
  const newM = (total % 60).toString().padStart(2, '0')
  return `${newH}:${newM}`
}

export default function ShovtzuPage() {
  const [warriors, setWarriors] = useState<Warrior[]>([])
  const [shavtacDocs, setShavtacDocs] = useState<ShavtacDoc[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      const warriorsSnapshot = await getDocs(collection(db, 'worriors'))
      const warriorsData = warriorsSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as Warrior[]
      setWarriors(warriorsData)

      const shavtacSnapshot = await getDocs(collection(db, 'shavtac'))
      const data = shavtacSnapshot.docs.map(doc => doc.data()) as ShavtacDoc[]
      setShavtacDocs(data)
    }

    fetchData()
  }, [])

  const getWarriorByUid = (uid: string) => warriors.find(w => w.uid === uid)

  const selectedShavtac = shavtacDocs.find(doc => doc.date === selectedDate)

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-700 text-center mb-6">שבצ"ק</h1>

        <div className="text-center mb-8">
          <label className="block mb-2 text-lg font-medium text-gray-700">בחר תאריך:</label>
          <input
            type="date"
            className="border rounded px-4 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {selectedShavtac ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {selectedShavtac.missions.map(mission => (
              <div key={mission.id} className="bg-white p-6 shadow-md rounded-2xl border border-purple-300">
                <h2 className="text-2xl font-bold text-purple-800 mb-4">{mission.title}</h2>

                {mission.type === 'hourly' && (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      שעות: {mission.startHour} - {mission.endHour} | משמרת: {mission.shiftDuration} שעות
                    </p>

                    <div className="flex flex-col gap-2 mt-3">
                      {(() => {
                        const shiftMinutes = Math.round((mission.shiftDuration || 1) * 60)
                        const start = mission.startHour || '08:00'
                        const end = mission.endHour || '16:00'
                        const startMin = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1])
                        const endMin = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1])
                        const numSlots = Math.floor((endMin - startMin) / shiftMinutes)

                        return Array.from({ length: numSlots }).map((_, index) => {
                          const slotStart = addMinutesToTime(start, index * shiftMinutes)
                          const slotEnd = addMinutesToTime(start, (index + 1) * shiftMinutes)
                          const assigned = mission.assignedTo?.find(a => a.requirementIndex === index)
                          const w = assigned ? getWarriorByUid(assigned.uid) : null

                          return (
                            <div key={index} className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-xl border border-gray-300 text-sm">
                              <span>🕒 {slotStart} - {slotEnd}</span>
                              <span>
                                {w
                                  ? `${w.firstName} ${w.lastName}`
                                  : 'לא שובץ'}
                              </span>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </>
                )}

                {mission.type === 'daily' && (
                  <div className="flex flex-col gap-2 mt-3">
                    {mission.requirements?.map((req, idx) => {
                      const assignee = mission.assignedTo?.find(a => a.requirementIndex === idx)
                      const warrior = assignee ? getWarriorByUid(assignee.uid) : null

                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-xl border border-gray-300 text-sm"
                        >
                          <span className="text-gray-800 font-medium">
                           {req.role} - {req.pakal}
                          </span>
                          {warrior ? (
                            <span className="text-gray-700">
                              {warrior.firstName} {warrior.lastName} 
                            </span>
                          ) : (
                            <span className="text-red-500">לא שובץ</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          selectedDate && <p className="text-center text-gray-500">לא נמצא שבצ"ק לתאריך הנבחר.</p>
        )}
      </div>
    </div>
  )
}
