'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

type Warrior = {
  uid: string
  firstName: string
  lastName: string
  pakal: string
  isAtBase: boolean
}

type Request = {
  uid: string
  status: string
}

function getGreeting(): string {
  const hour = new Date().getHours()

  if (hour >= 0 && hour < 7) return 'לילה טוב'
  if (hour >= 7 && hour < 12) return 'בוקר טוב'
  if (hour >= 12 && hour < 19) return 'צהריים טובים'
  return 'ערב טוב'
}



export default function HomePage() {
  const [totalSoldiers, setTotalSoldiers] = useState(0)
  const [atBase, setAtBase] = useState(0)
  const [atHome, setAtHome] = useState(0)
  const [newRequests, setNewRequests] = useState(0)
  const [inProgressRequests, setInProgressRequests] = useState(0)
  const [pakalCounts, setPakalCounts] = useState<{ [pakal: string]: number }>({})

  useEffect(() => {
    const fetchData = async () => {
      const warriorsSnapshot = await getDocs(collection(db, 'worriors'))
      const warriors = warriorsSnapshot.docs.map(doc => doc.data() as Warrior)

      const total = warriors.length
      const base = warriors.filter(w => w.isAtBase).length
      const home = total - base
      const pakalMap: { [pakal: string]: number } = {}

      for (const w of warriors) {
        pakalMap[w.pakal] = (pakalMap[w.pakal] || 0) + 1
      }

      setTotalSoldiers(total)
      setAtBase(base)
      setAtHome(home)
      setPakalCounts(pakalMap)

      const requestsSnapshot = await getDocs(collection(db, 'requests'))
      const requests = requestsSnapshot.docs.map(doc => doc.data() as Request)

      setNewRequests(requests.filter(r => r.status === 'חדש').length)
      setInProgressRequests(requests.filter(r => r.status === 'בטיפול').length)
    }

    fetchData()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-purple-700 mb-10">
            {getGreeting()} סגל אוה"ד 1
        </h1>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <StatCard title="סה״כ לוחמים" value={totalSoldiers} />
          <StatCard title="לוחמים בבסיס" value={atBase} />
          <StatCard title="לוחמים בבית" value={atHome} />
          <StatCard title="בקשות חדשות" value={newRequests} />
          <StatCard title="בקשות בטיפול" value={inProgressRequests} />
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-purple-700 mb-4">כמות לוחמים לפי פק״ל</h2>
          <ul className="space-y-2">
            {Object.entries(pakalCounts).map(([pakal, count]) => (
              <li key={pakal} className="flex justify-between border-b pb-1 text-gray-700">
                <span>{pakal}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string, value: number }) {
  return (
    <div className="bg-white shadow rounded-2xl p-6 flex flex-col items-center justify-center">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-purple-700">{value}</div>
    </div>
  )
}
