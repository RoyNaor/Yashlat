'use client'

import { useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { Button } from '@heroui/react'
import { FiX } from 'react-icons/fi'
import SoldierPickerModal from './SoldierPickerModal'

type Soldier = {
  uid: string
  firstName: string
  lastName: string
}

type Tours = {
  tour1: string[]
  tour2: string[]
}

export default function ToursPage() {
  const [soldiers, setSoldiers] = useState<Soldier[]>([])
  const [tours, setTours] = useState<Tours>({ tour1: [], tour2: [] })
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const soldiersSnap = await getDocs(collection(db, 'worriors'))
    const soldiersData: Soldier[] = soldiersSnap.docs.map(doc => {
      const d = doc.data()
      return { uid: d.uid, firstName: d.firstName, lastName: d.lastName }
    })
    setSoldiers(soldiersData)

    const tourSnap = await getDoc(doc(db, 'tours', 'main'))
    if (tourSnap.exists()) {
      const d = tourSnap.data()
      setTours({
        tour1: d.tour1 || [],
        tour2: d.tour2 || [],
      })
    }
  }

  const getName = (uid: string) => {
    const s = soldiers.find(s => s.uid === uid)
    return s ? `${s.firstName} ${s.lastName}` : uid
  }

  const handleAssign = async (uid: string, tourNumber: number) => {
    const tourKey = `tour${tourNumber}` as 'tour1' | 'tour2'

    const newTours: Tours = {
      tour1: [...tours.tour1],
      tour2: [...tours.tour2],
    }

    newTours.tour1 = newTours.tour1.filter(id => id !== uid)
    newTours.tour2 = newTours.tour2.filter(id => id !== uid)

    newTours[tourKey].push(uid)

    await setDoc(doc(db, 'tours', 'main'), newTours)
    setTours(newTours)
    setShowModal(false)
  }

  const handleRemove = async (uid: string) => {
    const newTours: Tours = {
      tour1: tours.tour1.filter(id => id !== uid),
      tour2: tours.tour2.filter(id => id !== uid),
    }

    await setDoc(doc(db, 'tours', 'main'), newTours)
    setTours(newTours)
  }

  const assigned = new Set([...tours.tour1, ...tours.tour2])
  const unassigned = soldiers.filter(s => !assigned.has(s.uid))

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-700 mb-8 text-center">סבבי יציאות</h1>

        {/* Styled Button ABOVE cards */}
        {typeof window !== 'undefined' && sessionStorage.getItem('role') === 'מפקד' && (
        <div className="text-center mb-10">
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow transition"
          >
            שבץ חייל לסבב
          </button>
        </div>
      )}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {[1, 2].map(num => (
            <div key={num} className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-bold text-purple-700 mb-1 text-center">
                סבב {num}
              </h2>
              <p className="text-center text-sm text-gray-500 mb-4">
                {tours[`tour${num}` as 'tour1' | 'tour2'].length} חיילים משובצים
              </p>
              <ul className="space-y-2">
                {tours[`tour${num}` as 'tour1' | 'tour2'].map(uid => (
                  <li
                    key={uid}
                    className="flex justify-between items-center border rounded-xl p-2 px-4"
                  >
                    <span>{getName(uid)}</span>
                    <button onClick={() => handleRemove(uid)} title="הסר מהסבב">
                      <FiX className="text-red-500 hover:text-red-700" size={20} />
                    </button>
                  </li>
                ))}
                {tours[`tour${num}` as 'tour1' | 'tour2'].length === 0 && (
                  <p className="text-gray-500 text-center mt-4">אין חיילים בסבב זה</p>
                )}
              </ul>
            </div>
          ))}
        </div>

        {showModal && (
          <SoldierPickerModal
            soldiers={unassigned}
            onClose={() => setShowModal(false)}
            onAssign={handleAssign}
          />
        )}
      </div>
    </div>
  )
}
