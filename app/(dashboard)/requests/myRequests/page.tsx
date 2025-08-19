'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/firebaseConfig'
import { collection, getDocs, Timestamp } from 'firebase/firestore'

type Request = {
  reason: string
  leaveDate: Timestamp
  returnDate: Timestamp
  status: string
  createdAt: Timestamp
  uid: string
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [username, setUsername] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchRequests = async () => {
      const uid = sessionStorage.getItem('uid')
      const name = sessionStorage.getItem('username') || ''
      setUsername(name)

      if (!uid) return

      const snapshot = await getDocs(collection(db, 'requests'))
      const allRequests = snapshot.docs.map(doc => doc.data() as Request)
      const myRequests = allRequests.filter(r => r.uid === uid)

      setRequests(myRequests)
    }

    fetchRequests()
  }, [])

  const formatDate = (ts: Timestamp) => ts?.toDate().toLocaleDateString('he-IL')

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-700 mb-4 text-center">
          הבקשות שלי
        </h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              router.push('/requests/new') // 🔗 הפניה למסך בקשה חדשה
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full px-6 py-2 shadow"
          >
            בקשה חדשה
          </button>
        </div>

        {requests.length === 0 ? (
  <p className="text-center text-gray-600">אין בקשות להצגה.</p>
) : (
  <>
    {/* טבלה - תוצג רק במסכים בינוניים ומעלה */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full bg-white rounded-2xl shadow text-sm">
        <thead className="bg-purple-100 text-purple-800">
          <tr>
            <th className="px-4 py-2 text-right">תאריך יציאה</th>
            <th className="px-4 py-2 text-right">תאריך חזרה</th>
            <th className="px-4 py-2 text-right">סטטוס</th>
            <th className="px-4 py-2 text-right">סיבה</th>
            <th className="px-4 py-2 text-right">נוצר בתאריך</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {requests.map((r, idx) => (
            <tr key={idx} className="text-right border-t">
              <td className="px-4 py-2">{formatDate(r.leaveDate)}</td>
              <td className="px-4 py-2">{formatDate(r.returnDate)}</td>
              <td className="px-4 py-2">
                <StatusPill status={r.status} />
              </td>
              <td className="px-4 py-2">{r.reason}</td>
              <td className="px-4 py-2">{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* כרטיסיות - יוצגו רק במסכים קטנים */}
    <div className="block md:hidden space-y-4 mt-4">
      {requests.map((r, idx) => (
        <div
          key={idx}
          className="bg-white shadow rounded-xl p-4 flex flex-col space-y-2 text-sm"
        >
          <div className="flex justify-between">
            <span className="font-bold text-purple-700">תאריך יציאה:</span>
            <span>{formatDate(r.leaveDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-purple-700">תאריך חזרה:</span>
            <span>{formatDate(r.returnDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-purple-700">סטטוס:</span>
            <StatusPill status={r.status} />
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-purple-700">סיבה:</span>
            <span>{r.reason}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-purple-700">נוצר בתאריך:</span>
            <span>{formatDate(r.createdAt)}</span>
          </div>
        </div>
          ))}
        </div>
      </>
    )}

      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const base = 'px-3 py-1 rounded-full text-xs font-bold'
  if (status === 'אושר') return <span className={`${base} bg-green-100 text-green-700`}>אושר</span>
  if (status === 'לא אושר') return <span className={`${base} bg-red-100 text-red-700`}>לא אושר</span>
  return <span className={`${base} bg-yellow-100 text-yellow-700`}>בטיפול</span>
}
