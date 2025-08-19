import { db } from '@/firebaseConfig'
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore'

// טיפוסים ----------------------------

export type Requirement = {
  role: string
  pakal: string
  pakalGil: string
  exstraPakal: string
}

export type Assignment = {
  uid: string
  requirementIndex: number
}

export type Mission = {
  id: string
  title: string
  requirements: Requirement[]
}

export type Warrior = {
  uid: string
  firstName: string
  lastName: string
  role: string
  pakal: string
  exstraPakal: string
  isAtBase: boolean
  lastAssigned?: string
}

// פונקציית בדיקה אם שדה דרוש או לא
const isUnrestricted = (val: string): boolean =>
  val.trim() === '' || val === 'ללא דרישה' || val === 'אין'

// פונקציית שיבוץ ----------------------

export const autoAssignMissions = async (
  missions: Mission[],
  warriorsFromProps?: Warrior[]
) => {
  const warriors: Warrior[] = warriorsFromProps || await getAllWarriors()
  const result: { [missionId: string]: Assignment[] } = {}
  const usedUIDs = new Set<string>()
  const today = new Date().toISOString().split('T')[0]

  for (const mission of missions) {
    const assigned: Assignment[] = []

    mission.requirements.forEach((req, index) => {
      const candidates = warriors.filter(w =>
        w.isAtBase &&
        w.role === req.role &&
        (isUnrestricted(req.pakal) || w.pakal === req.pakal) &&
        (isUnrestricted(req.exstraPakal) || w.exstraPakal === req.exstraPakal) &&
        !usedUIDs.has(w.uid)
      )

      candidates.sort((a, b) => {
        const aDate = a.lastAssigned || '0000-00-00'
        const bDate = b.lastAssigned || '0000-00-00'
        return aDate.localeCompare(bDate)
      })

      const match = candidates[0]
      if (match) {
        assigned.push({ uid: match.uid, requirementIndex: index })
        usedUIDs.add(match.uid)
        match.lastAssigned = today // עדכון בזיכרון
      }
    })

    result[mission.id] = assigned
  }

  return result
}

// שליפת לוחמים ------------------------

const getAllWarriors = async (): Promise<Warrior[]> => {
  const snapshot = await getDocs(collection(db, 'worriors'))
  const warriors = snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  })) as Warrior[]
  return warriors
}
