'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const loginWithEmail = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      const userEmail = userCred.user.email || '';
      const token = await userCred.user.getIdToken();

      sessionStorage.setItem("uid", uid);
      sessionStorage.setItem("email", userEmail);

      const snap = await getDoc(doc(db, "worriors", uid));
      const data = snap.data();
      const role = data?.role || "";
      sessionStorage.setItem("role", role);

      document.cookie = `accessToken=${token}; path=/; max-age=3600; secure`;

      if (role === 'לוחם') {
        router.push('/shibutz');
      } else {
        router.push('/home');
      }

    } catch (err: any) {
      setError('אימייל או סיסמה שגויים');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">

        {/* ✅ כותרת התחברות רגילה */}
        <h2 className="text-4xl font-bold text-center text-purple-600 mb-8">התחברות</h2>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 text-sm rounded p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); loginWithEmail(); }}
          className="space-y-5"
        >
          <TextInput label="אימייל" value={email} setValue={setEmail} type="email" />
          <TextInput label="סיסמה" value={password} setValue={setPassword} type="password" />

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full py-3 text-base transition-colors"
          >
            התחבר
          </button>
        </form>

        <p className="text-center text-sm mt-8 text-gray-600">
          אין לך חשבון?{" "}
          <a href="/register" className="text-purple-600 font-semibold hover:underline">
            לחץ כאן להרשמה
          </a>
        </p>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  setValue,
  type = "text"
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block mb-3 text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
        dir="rtl"
      />
    </div>
  );
}
