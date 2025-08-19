'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]    = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]     = useState("");
  const [role, setRole]           = useState("");
  const [pakal, setPakal]         = useState("");
  const [pakalGil, setPakalGil]     = useState("");
  const [exstraPakal, setExstraPakal] = useState("");
  const [error, setError]         = useState("");
  const router                    = useRouter();

  const registerWithEmail = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      const userEmail = userCred.user.email || '';
      const token = await userCred.user.getIdToken(); // 🔐 Get Firebase token

      // 1. Save info in sessionStorage
      sessionStorage.setItem("uid", uid);
      sessionStorage.setItem("email", userEmail);
      sessionStorage.setItem("role", role);

      // 2. Write to Firestore
      await setDoc(doc(db, "worriors", uid), {
        uid,
        firstName,
        lastName,
        phone,
        email,
        role,
        pakal,
        pakalGil,
        exstraPakal,
        isAtBase: true, 
        createdAt: new Date(),
      });


      // 3. Save token in cookie
      document.cookie = `accessToken=${token}; path=/; max-age=3600; secure`;

      if (role === 'לוחם') {
        router.push('/requests/myRequests'); // 🔁 לעמוד הבקשות של החייל
      } else {
        router.push('/home'); // 🔁 מפקד ייכנס למסך הבית
      }
    } catch (err: any) {
      setError("אימייל לא תקין או סיסמה חלשה");
    }
}


  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="w-full max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">הרשמה</h1>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 text-sm rounded p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); registerWithEmail(); }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <TextInput  label="שם פרטי"        value={firstName}  setValue={setFirstName} />
          <TextInput  label="שם משפחה"       value={lastName}   setValue={setLastName} />
          <TextInput  label="מספר טלפון"      type="tel"       value={phone}      setValue={setPhone} />
          <TextInput  label="אימייל"          type="email"     value={email}      setValue={setEmail} />
          <TextInput  label="סיסמה"          type="password"  value={password}   setValue={setPassword} />
          <Dropdown   label="תפקיד"          value={role}       setValue={setRole}
                      options={["לוחם","מפקד"]} />
          <Dropdown   label="פק״ל"           value={pakal}      setValue={setPakal}
                      options={["רובאי","נגב","קלע","מטוליסט","חובש"]} />
          <Dropdown   label="פק״ל גיל"        value={pakalGil}   setValue={setPakalGil}
                      options={["גילן","תצפיתן","רחפניסט"]} />
          <Dropdown   label="פק״ל נוסף"       value={exstraPakal} setValue={setExstraPakal}
                      options={["נהג סוואנה","נהג אכזרית","נהג האמר","אין"]} />

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full py-3 text-base transition-colors"
            >
              הרשם
            </button>
          </div>
        </form>

        <p className="text-center text-sm mt-8 text-gray-600">
          כבר יש לך חשבון?{" "}
          <a href="/login" className="text-purple-600 font-semibold hover:underline">
            התחבר כאן
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
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        dir="rtl"
      />
    </div>
  );
}

function Dropdown({
  label,
  value,
  setValue,
  options
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        dir="rtl"
      >
        <option value="" disabled>בחר</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
