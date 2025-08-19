'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/react'
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { autoAssignMissions } from '@/utils/autoAssignMissions'
import EditModal from '../../../../components/EditModal'
import { FiTrash2, FiEdit } from 'react-icons/fi'


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

type Assignment = {
  uid: string
  requirementIndex: number
}

type Requirement = {
  role: string
  pakal: string
  pakalGil: string
  exstraPakal: string
}

type Mission = {
  id: string
  title: string
  requirements: Requirement[]
  assignedTo?: Assignment[]
  startHour?: string // רק לשעתיות
}

export default function DailyMissionsPage() {
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>([])
  const [warriors, setWarriors] = useState<Warrior[]>([])
  const [editMission, setEditMission] = useState<Mission | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)

  const handleDeleteMission = async (missionId: string) => {
  const confirm = window.confirm('האם אתה בטוח שברצונך למחוק את המשימה?')
  if (!confirm) return

  try {
    await deleteDoc(doc(db, 'missions', missionId))
    setMissions(prev => prev.filter(m => m.id !== missionId))
  } catch (err) {
    console.error('שגיאה במחיקה:', err)
    alert('שגיאה במחיקת המשימה')
  }
}


  const fetchData = async () => {
  const missionsSnap = await getDocs(collection(db, 'missions'))
  const allMissions = missionsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Mission[]

  const daily = allMissions.filter(m => m.requirements && !m.startHour)
  setMissions(daily)

  const warriorsSnap = await getDocs(collection(db, 'worriors'))
  const allWarriors = warriorsSnap.docs.map(doc => doc.data()) as Warrior[]
  setWarriors(allWarriors)
}

useEffect(() => {
  fetchData()
}, [])


  const handleAutoAssign = async () => {
    const assignments = await autoAssignMissions(missions)
    for (const missionId in assignments) {
      const missionRef = doc(db, 'missions', missionId)
      await updateDoc(missionRef, { assignedTo: assignments[missionId] })
    }
    alert('שיבוץ אוטומטי בוצע בהצלחה!')

    await fetchData()
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">
          משימות יומיות
        </h1>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <Button onClick={() => router.push('/missions/daily/new')} className="bg-purple-600 text-white rounded-full px-6 py-2">
            ➕ צור משימה
          </Button>

          {/* <Button onClick={() => setShowFavorites(true)} className="bg-yellow-500 text-white rounded-full px-6 py-2">
            ⭐ בחר ממועדפים
          </Button> */}

          <Button onClick={handleAutoAssign} className="bg-green-600 text-white rounded-full px-6 py-2">
            🤖 שיבוץ אוטומטי
          </Button>
        </div>

        {missions.length === 0 ? (
          <p className="text-center text-gray-500">אין משימות יומיות</p>
        ) : (
          <ul className="space-y-4">
            {missions.map((mission) => (
              <li key={mission.id} className="border rounded-xl p-4 shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">{mission.title}</h2>
                    <p className="text-sm text-gray-500">
                      {mission.requirements.length} דרישות
                    </p>

                    {mission.assignedTo?.length ? (
                      <ul className="mt-2 space-y-1 text-sm text-gray-700">
                        {mission.assignedTo.map((a, i) => {
                          const w = warriors.find(w => w.uid === a.uid)
                          return (
                            <li key={i}>
                              {w?.role}: {w?.firstName} {w?.lastName} (פק"ל: {w?.pakal || 'לא ידוע'})
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-red-500 mt-2"> עדיין לא שובצו לוחמים</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="bg-blue-600 text-white rounded-full px-4 py-1 flex items-center gap-1"
                      onClick={() => setEditMission(mission)}
                    >
                      <FiEdit />
                      ערוך
                    </Button>

                    <Button
                      className="bg-red-600 text-white rounded-full px-4 py-1 flex items-center gap-1"
                      onClick={() => handleDeleteMission(mission.id)}
                    >
                      <FiTrash2 />
                      הסר
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {editMission && (
          <EditModal mission={editMission} onClose={() => setEditMission(null)} />
        )}
      </div>
    </div>
  )
}
