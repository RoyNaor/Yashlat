'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useRouter } from 'next/navigation';

type Warrior = { uid: string; firstName: string; lastName: string; };
type RequestDoc = {
  id: string;
  uid: string;
  leaveDate: Timestamp;
  returnDate: Timestamp;
  reason: string;
  status: string;
  createdAt: Timestamp;
};

export default function RequestsPage() {
  const [warriorsMap, setWarriorsMap] = useState<Record<string, string>>({});
  const [requests, setRequests] = useState<RequestDoc[]>([]);
  const router = useRouter();

  // filters
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const statusOptions = ['חדש', 'בטיפול', 'אושר', 'לא אושר'];
  const statusClasses: Record<string, string> = {
    'חדש': 'bg-blue-100 text-blue-800',
    'בטיפול': 'bg-yellow-100 text-yellow-800',
    'אושר': 'bg-green-100 text-green-800',
    'לא אושר': 'bg-red-100 text-red-800',
  };

  const formatDate = (ts: Timestamp) => {
    const d = ts.toDate();
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const goToNewReq = () => {
    router.push(`/requests/new`);
  };

  useEffect(() => {
    (async () => {
      const [wSnap, rSnap] = await Promise.all([
        getDocs(collection(db, 'worriors')),
        getDocs(collection(db, 'requests')),
      ]);
      const wMap: Record<string, string> = {};
      wSnap.forEach((d) => {
        const w = d.data() as Warrior;
        wMap[w.uid] = `${w.firstName} ${w.lastName}`;
      });
      setWarriorsMap(wMap);
      setRequests(
        rSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<RequestDoc, 'id'>),
        }))
      );
    })();
  }, []);

  // apply filters
  const filtered = requests.filter((r) => {
    const name = warriorsMap[r.uid] || '';
    if (searchTerm && !name.toLowerCase().includes(searchTerm.trim().toLowerCase())) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    const lf = leaveFrom ? new Date(leaveFrom) : null;
    const lt = leaveTo ? new Date(leaveTo + 'T23:59:59') : null;
    const leave = r.leaveDate.toDate();
    if (lf && leave < lf) return false;
    if (lt && leave > lt) return false;
    return true;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-purple-700 text-center">בקשות יציאה</h1>

        {/* === Filter Bar === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {/* 1. New Request button */}
          <div className="flex items-end">
            <button
              onClick={goToNewReq}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
            >
              בקשה חדשה
            </button>
          </div>

          {/* 2. Search by name */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600">שם לוחם</label>
            <input
              type="text"
              placeholder="חפש..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm"
            />
          </div>

          {/* 3. Status filter */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600">סטטוס</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm bg-white"
            >
              <option value="">הכל</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* === Table === */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-center">
            <thead className="bg-purple-100 text-gray-700">
              <tr>
                <th className="p-4">שם לוחם</th>
                <th className="p-4">תאריך יציאה</th>
                <th className="p-4">תאריך חזרה</th>
                <th className="p-4">סיבה</th>
                <th className="p-4">סטטוס</th>
                <th className="p-4">נוצר</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t hover:bg-purple-50">
                  <td className="p-4 font-semibold">{warriorsMap[r.uid] || 'לא ידוע'}</td>
                  <td className="p-4">{formatDate(r.leaveDate)}</td>
                  <td className="p-4">{formatDate(r.returnDate)}</td>
                  <td className="p-4">{r.reason}</td>
                  <td className="p-4">
                    <select
                      value={r.status}
                      onChange={async (e) => {
                        const ns = e.target.value;
                        await updateDoc(doc(db, 'requests', r.id), { status: ns });
                        setRequests((ps) => ps.map((x) => (x.id === r.id ? { ...x, status: ns } : x)));
                      }}
                      className={`px-3 py-1 rounded-xl ${statusClasses[r.status]}`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-gray-500">
                    אין בקשות להצגה.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}