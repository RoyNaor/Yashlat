'use client'

import { useState } from 'react'
import { Button } from '@heroui/react'

type Soldier = {
  uid: string
  firstName: string
  lastName: string
}

export default function SoldierPickerModal({
  soldiers,
  onClose,
  onAssign
}: {
  soldiers: Soldier[]
  onClose: () => void
  onAssign: (uid: string, tourNumber: number) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [tour, setTour] = useState<number>(1)

  return (
    <div className="fixed inset-0 bg-purple-200 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-6 text-center text-purple-700">
          שיבוץ חייל לסבב
        </h3>

        <select
          value={selected ?? ''}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full mb-4 border rounded-xl px-4 py-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">בחר חייל</option>
          {soldiers.map((s) => (
            <option key={s.uid} value={s.uid}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>

        <select
          value={tour}
          onChange={(e) => setTour(Number(e.target.value))}
          className="w-full mb-6 border rounded-xl px-4 py-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value={1}>סבב 1</option>
          <option value={2}>סבב 2</option>
        </select>

        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="w-1/2 bg-gray-200 text-gray-700 font-semibold rounded-full py-2 hover:bg-gray-300 transition"
          >
            בטל
          </button>
          <button
            onClick={() => selected && onAssign(selected, tour)}
            disabled={!selected}
            className={`w-1/2 rounded-full py-2 font-semibold text-white transition 
              ${selected ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-300 cursor-not-allowed'}`}
          >
            אשר שיבוץ
          </button>
        </div>
      </div>
    </div>
  )
}
