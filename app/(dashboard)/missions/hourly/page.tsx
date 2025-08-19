'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/react'
import { db } from '@/firebaseConfig'
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore'
import { autoAssignHourlyMissions } from '@/utils/autoAssignHourlyMissions'
import { FiTrash2, FiEdit } from 'react-icons/fi'
import EditHourlyModal from '@/components/EditHourlyModal'

type Mission = {
  id: string
  title: string
  startHour: string
  endHour: string
  shiftDuration: string
  assignedTo?: { uid: string; requirementIndex: number }[]
}

type Warrior = {
  uid: string
  firstName: string
  lastName: string
  role: string
}

function addHoursToTime(time: string, hoursToAdd: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + hoursToAdd * 60
  const newH = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
  const newM = (totalMinutes % 60).toString().padStart(2, '0')
  return `${newH}:${newM}`
}

export default function HourlyMissionsPage() {
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>([])
  const [editMission, setEditMission] = useState<Mission | null>(null)
  const [warriors, setWarriors] = useState<Warrior[]>([])
  const [manualAssignments, setManualAssignments] = useState<{
    [missionId: string]: { [slotIndex: number]: string }
  }>({})

  const fetchMissions = async () => {
    const snapshot = await getDocs(collection(db, 'missions'))
    const data = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Mission))
      .filter(m => m.startHour && m.endHour && m.shiftDuration)
    setMissions(data)
  }

  const fetchWarriors = async () => {
    const snapshot = await getDocs(collection(db, 'worriors'))
    const data = snapshot.docs.map(doc => doc.data() as Warrior)
    setWarriors(data)
  }

  useEffect(() => {
    fetchMissions()
    fetchWarriors()
  }, [])

  const handleDeleteMission = async (missionId: string) => {
    const confirm = window.confirm('האם למחוק את המשימה?')
    if (!confirm) return

    try {
      await deleteDoc(doc(db, 'missions', missionId))
      setMissions(prev => prev.filter(m => m.id !== missionId))
    } catch (error) {
      console.error('שגיאה במחיקה:', error)
      alert('אירעה שגיאה בעת המחיקה')
    }
  }

  const handleAutoAssign = async () => {
    const assignments = await autoAssignHourlyMissions(
      missions.map(m => ({
        ...m,
        shiftDuration: m.shiftDuration.toString(),
        type: 'hourly'
      }))
    )

    // שמירת שיבוצים בפיירסטור
    for (const missionId in assignments) {
      const missionRef = doc(db, 'missions', missionId)
      await updateDoc(missionRef, { assignedTo: assignments[missionId] })
    }

    // עדכון dropdownים
    const updated: typeof manualAssignments = {}
    for (const missionId in assignments) {
      updated[missionId] = {}
      assignments[missionId].forEach((a: any) => {
        updated[missionId][a.requirementIndex] = a.uid
      })
    }
    setManualAssignments(updated)

    await fetchMissions()
    alert('שיבוץ אוטומטי בוצע בהצלחה!')
  }

  const handleManualSave = async (missionId: string) => {
    const slots = manualAssignments[missionId] || {}
    const result = Object.entries(slots).map(([i, uid]) => ({
      requirementIndex: Number(i),
      uid
    }))
    const ref = doc(db, 'missions', missionId)
    await updateDoc(ref, { assignedTo: result })
    alert('המשימה נשמרה')
    fetchMissions()
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">
          משימות שעתיות
        </h1>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <Button
            onClick={() => router.push('/missions/hourly/new')}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2"
          >
            ➕ צור משימה
          </Button>

          <Button
            onClick={handleAutoAssign}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2"
          >
            🤖 שיבוץ אוטומטי
          </Button>
        </div>

        {missions.length === 0 ? (
          <p className="text-center text-gray-500">אין משימות שעתיות</p>
        ) : (
          <ul className="space-y-6">
            {missions.map((mission) => {
              const shiftDuration = parseFloat(mission.shiftDuration)
              const start = mission.startHour
              const end = mission.endHour
              const startHour = parseInt(start.split(':')[0])
              const endHour = parseInt(end.split(':')[0])
              const numSlots = Math.floor((endHour - startHour) / shiftDuration)

              return (
                <li
                  key={mission.id}
                  className="border rounded-xl p-5 shadow flex flex-col gap-3 bg-gray-100"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <h2 className="text-xl font-semibold text-purple-700">
                      {mission.title}
                    </h2>
                    <span className="text-sm text-gray-700 font-medium">
                      🕒 <b>שעות:</b> {start} - {end} ({mission.shiftDuration})
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    {Array.from({ length: numSlots }).map((_, index) => {
                      const slotStart = addHoursToTime(start, index * shiftDuration)
                      const slotEnd = addHoursToTime(start, (index + 1) * shiftDuration)
                      const selectedUid = manualAssignments[mission.id]?.[index] || ''

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between px-4 py-2 bg-white rounded-xl border border-gray-300 shadow-sm text-gray-600"
                        >
                          <span>🕒 {slotStart} - {slotEnd}</span>
                          <select
                            className="border rounded-xl px-3 py-1 text-sm"
                            value={selectedUid}
                            onChange={(e) => {
                              const uid = e.target.value
                              setManualAssignments(prev => ({
                                ...prev,
                                [mission.id]: {
                                  ...prev[mission.id],
                                  [index]: uid
                                }
                              }))
                            }}
                          >
                            <option value="">לא שובץ</option>
                            {warriors.map(w => (
                              <option key={w.uid} value={w.uid}>
                                {w.firstName} {w.lastName} ({w.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      onClick={() => handleManualSave(mission.id)}
                      className="bg-purple-600 text-white rounded-full px-4 py-1"
                    >
                      💾 שמור
                    </Button>

                    <Button
                      onClick={() => setEditMission(mission)}
                      className="bg-blue-600 text-white rounded-full px-4 py-1 flex items-center gap-1"
                    >
                      <FiEdit />
                      ערוך
                    </Button>

                    <Button
                      onClick={() => handleDeleteMission(mission.id)}
                      className="bg-red-600 text-white rounded-full px-4 py-1 flex items-center gap-1"
                    >
                      <FiTrash2 />
                      מחק
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {editMission && (
          <EditHourlyModal
            mission={editMission}
            onClose={() => setEditMission(null)}
          />
        )}
      </div>
    </div>
  )
}
