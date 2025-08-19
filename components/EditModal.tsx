'use client'

import { useEffect, useState } from 'react'
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

type Assignment = {
  uid: string
  requirementIndex: number
}

export default function EditModal({
  mission,
  onClose,
}: {
  mission: any
  onClose: () => void
}) {
  const [assignedTo, setAssignedTo] = useState<Assignment[]>(mission.assignedTo || [])
  const [warriors, setWarriors] = useState<any[]>([])

  useEffect(() => {
    const fetchWarriors = async () => {
      const snapshot = await getDocs(collection(db, 'worriors'))
      const data = snapshot.docs.map(doc => doc.data())
      setWarriors(data)
    }
    fetchWarriors()
  }, [])

  const handleSave = async () => {
    await updateDoc(doc(db, 'missions', mission.id), {
      assignedTo,
    })
    alert('שובצו בהצלחה')
    onClose()
  }

  const replaceUid = (oldUid: string, newUid: string) => {
    setAssignedTo(prev =>
      prev.map(a => (a.uid === oldUid ? { ...a, uid: newUid } : a))
    )
  }

  return (
    <div className="fixed inset-0 bg-purple-300 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-2xl" dir="rtl">
        <h2 className="text-xl font-bold mb-6">החלף לוחמים</h2>

        {assignedTo.map((a, idx) => {
          const current = warriors.find(w => w.uid === a.uid)
          return (
            <div key={idx} className="mb-4">
              <label className="block mb-1 text-sm font-semibold">
                לוחם {idx + 1}, פק״ל: {current?.pakal || 'לא ידוע'}, תפקיד: {current?.role || 'לא ידוע'}
                </label>

              <select
                className="border rounded-xl px-3 py-2 w-full"
                value={a.uid}
                onChange={e => replaceUid(a.uid, e.target.value)}
              >
                <option value={a.uid}>
                  {current?.firstName} {current?.lastName} (נוכחי)
                </option>
                {warriors
                  .filter(w => w.uid !== a.uid)
                  .map(w => (
                    <option key={w.uid} value={w.uid}>
                      {w.firstName} {w.lastName}
                    </option>
                  ))}
              </select>
            </div>
          )
        })}

        <div className="flex justify-end gap-2 mt-6">
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
