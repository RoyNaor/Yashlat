'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditWarriorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');

  const [form, setForm] = useState({
    uid: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: '',
    pakal: '',
    pakalGil: '',
    exstraPakal: '',
    isAtBase: false, // 🆕
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarrior = async () => {
      if (!uid) return router.push('/warriors');
      const docRef = doc(db, 'worriors', uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return router.push('/warriors');
      setForm(snap.data() as typeof form);
      setLoading(false);
    };
    fetchWarrior();
  }, [uid]);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const ref = doc(db, 'worriors', form.uid);
    await updateDoc(ref, form);
    router.push('/warriors');
  };

  const handleCancel = () => {
    router.push('/warriors');
  };

  if (loading) return <div className="text-center p-10">טוען...</div>;

  return (
    <>
      <title>עריכת לוחם</title>
      <div dir="rtl" className="fixed inset-0 bg-purple-200 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
          <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">עריכת לוחם</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <input
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="שם פרטי"
              className="border p-2 rounded"
            />
            <input
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="שם משפחה"
              className="border p-2 rounded"
            />
            <input
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="מספר טלפון"
              className="border p-2 rounded"
            />
            <input
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="אימייל"
              className="border p-2 rounded"
            />
            <input
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="תפקיד"
              className="border p-2 rounded"
            />
            <input
              value={form.pakal}
              onChange={(e) => handleChange('pakal', e.target.value)}
              placeholder="פק״ל"
              className="border p-2 rounded font-bold"
            />
            <input
              value={form.pakalGil}
              onChange={(e) => handleChange('pakalGil', e.target.value)}
              placeholder="פק״ל גיל"
              className="border p-2 rounded font-bold"
            />
            <input
              value={form.exstraPakal}
              onChange={(e) => handleChange('exstraPakal', e.target.value)}
              placeholder="פק״ל נוסף"
              className="border p-2 rounded font-bold"
            />

            {/* ✅ isAtBase dropdown */}
            <div className="col-span-2">
              <label className="block mb-1 text-sm text-gray-600">האם בבסיס</label>
              <select
                value={form.isAtBase ? 'yes' : 'no'}
                onChange={(e) => handleChange('isAtBase', e.target.value === 'yes')}
                className="w-full border p-2 rounded bg-white"
              >
                <option value="yes">כן</option>
                <option value="no">לא</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-sm px-4 py-2 rounded"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded"
            >
              שמירה
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
