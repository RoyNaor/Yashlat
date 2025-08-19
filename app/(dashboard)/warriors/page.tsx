'use client'

import { useEffect, useState } from 'react'
import { db } from '@/firebaseConfig'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

type Warrior = {
  uid: string
  firstName: string
  lastName: string
  phone: string
  email: string
  role: string
  pakal: string
  pakalGil: string
  exstraPakal: string
  isAtBase: boolean
}

const FILTER_KEYS: { [K in keyof Warrior]?: string } = {
  role: 'תפקיד',
  pakal: 'פק״ל',
  pakalGil: 'פק״ל גיל',
  exstraPakal: 'פק״ל נוסף',
  isAtBase: 'האם בבסיס',
}

export default function MyWarriorsPage() {
  const [warriors, setWarriors] = useState<Warrior[]>([])
  const [search, setSearch] = useState('')
  const [filterKey, setFilterKey] = useState<keyof Warrior | ''>('')
  const [filterValue, setFilterValue] = useState('')
  const router = useRouter()

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, 'worriors'))
    const data: Warrior[] = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data()
    })) as Warrior[]
    setWarriors(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getUniqueValues = (key: keyof Warrior) => {
    if (key === 'isAtBase') {
      return ['כן', 'לא']
    }
    const values = warriors.map((w) => w[key]).filter(Boolean)
    return Array.from(new Set(values))
  }

  const filteredWarriors = warriors.filter((w) => {
    const matchesSearch = Object.values(w).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )

    let matchesFilter = true
    if (filterKey && filterValue) {
      if (filterKey === 'isAtBase') {
        const expected = filterValue === 'כן'
        matchesFilter = w.isAtBase === expected
      } else {
        matchesFilter = w[filterKey] === filterValue
      }
    }

    return matchesSearch && matchesFilter
  })

  const handleBaseChange = async (uid: string, value: string) => {
    const newValue = value === 'כן'
    try {
      await updateDoc(doc(db, 'worriors', uid), { isAtBase: newValue })
      setWarriors(prev =>
        prev.map(w => w.uid === uid ? { ...w, isAtBase: newValue } : w)
      )
    } catch (err) {
      console.error("שגיאה בעדכון האם בבסיס:", err)
      alert("אירעה שגיאה בעת עדכון הלוחם.")
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-purple-700 text-center">הלוחמים שלי</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600">סנן לפי</label>
            <select
              value={filterKey}
              onChange={(e) => {
                setFilterKey(e.target.value as keyof Warrior)
                setFilterValue('')
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm bg-white"
            >
              <option value="">ללא</option>
              {Object.entries(FILTER_KEYS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {filterKey && (
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600">ערך</label>
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm bg-white"
              >
                <option value="">הכל</option>
                {getUniqueValues(filterKey).map((val) => (
                  <option key={val?.toString()} value={val?.toString()}>
                    {val?.toString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-gray-600">חיפוש כללי</label>
            <input
              type="text"
              placeholder="חפש..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-center">
            <thead className="bg-purple-100 text-gray-700">
              <tr>
                <th className="p-4">שם מלא</th>
                <th className="p-4">טלפון</th>
                <th className="p-4">אימייל</th>
                <th className="p-4">תפקיד</th>
                <th className="p-4">פק״ל</th>
                <th className="p-4">פק״ל גיל</th>
                <th className="p-4">פק״ל נוסף</th>
                <th className="p-4">האם בבסיס</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarriors.map((w) => (
                <tr
                  key={w.uid}
                  className="border-t hover:bg-purple-50"
                >
                  <td
                    className="p-4 font-semibold cursor-pointer"
                    onClick={() => router.push(`/warriors/editWarrior?uid=${w.uid}`)}
                  >
                    {w.firstName} {w.lastName}
                  </td>
                  <td className="p-4">{w.phone}</td>
                  <td className="p-4">{w.email}</td>
                  <td className="p-4">{w.role}</td>
                  <td className="p-4">{w.pakal}</td>
                  <td className="p-4">{w.pakalGil}</td>
                  <td className="p-4">{w.exstraPakal}</td>
                  <td className="p-4">
                    <select
                      value={w.isAtBase ? 'כן' : 'לא'}
                      onClick={e => e.stopPropagation()}
                      onChange={(e) => handleBaseChange(w.uid, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 bg-white text-sm"
                    >
                      <option value="כן">כן</option>
                      <option value="לא">לא</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredWarriors.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-gray-500">לא נמצאו לוחמים.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
