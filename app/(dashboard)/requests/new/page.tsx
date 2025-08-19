'use client';

import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '@/firebaseConfig';

export default function NewRequestModal() {
  const router = useRouter();

  const [leaveDate, setLeaveDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string>('');

  const isDateValid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!leaveDate || !returnDate || !reason.trim()) {
      setError('אנא מלא/י את כל השדות');
      return;
    }

    if (!isDateValid(leaveDate) || !isDateValid(returnDate)) {
      setError('פורמט תאריך לא תקין');
      return;
    }

    const leave = new Date(leaveDate);
    const ret = new Date(returnDate);
    leave.setHours(0, 0, 0, 0);
    ret.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (leave < today) {
      setError('תאריך יציאה חייב להיות היום או מאוחר יותר');
      return;
    }

    if (ret < leave) {
      setError('תאריך חזרה לא יכול להיות לפני תאריך יציאה');
      return;
    }

    const uid = sessionStorage.getItem('uid');
    if (!uid) {
      setError('משתמש לא מזוהה');
      return;
    }

    try {
      await addDoc(collection(db, 'requests'), {
        uid,
        leaveDate: Timestamp.fromDate(leave),
        returnDate: Timestamp.fromDate(ret),
        reason: reason.trim(),
        status: 'חדש',
        createdAt: Timestamp.now(),
      });

      const role = sessionStorage.getItem('role') || ''
      router.push(role === 'לוחם' ? 'requests/myRequests' : '/requests')

    } catch (err) {
      console.error(err);
      setError('שגיאה בשמירה, נסה שוב');
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 bg-purple-200 bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-purple-700 text-center">
          בקשה חדשה
        </h2>

        {error && (
          <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
        )}

        <div>
          <label className="block mb-1 font-medium text-gray-700">תאריך יציאה</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={leaveDate}
            onChange={(e) => setLeaveDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">תאריך חזרה</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-xl px-4 py-3"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">סיבה</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none"
            rows={3}
            placeholder="סיבה"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => router.push('/requests')} // ✅ cancel action
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
            שליחה
          </button>
        </div>
      </form>
    </div>
  );
}
