import { getDocs, collection } from 'firebase/firestore'
import { db } from '@/firebaseConfig'

export type HourlyMission = {
  id: string
  title: string
  type: 'hourly'
  startHour: string // e.g., "08:15"
  endHour: string   // e.g., "12:45"
  shiftDuration: string // בשעות (e.g., "1.5")
  assignedTo?: { uid: string; requirementIndex: number }[]
}

export type Warrior = {
  uid: string
  firstName: string
  lastName: string
  isAtBase: boolean
}

function timeStrToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export async function autoAssignHourlyMissions(missions: HourlyMission[]) {
  const warriorsSnapshot = await getDocs(collection(db, 'worriors'))
  const allWarriors = warriorsSnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data(),
  })) as Warrior[]

  const missionsSnapshot = await getDocs(collection(db, 'missions'))
  const usedUids = new Set<string>()

  missionsSnapshot.forEach(doc => {
    const mission = doc.data()
    const assigned = mission.assignedTo || []
    assigned.forEach((a: { uid: string }) => usedUids.add(a.uid))
  })

  const availableWarriors = allWarriors.filter(w => w.isAtBase && !usedUids.has(w.uid))

  const assignments: Record<string, { uid: string; requirementIndex: number }[]> = {}
  let warriorIndex = 0

  for (const mission of missions) {
    assignments[mission.id] = []

    const start = timeStrToMinutes(mission.startHour)
    const end = timeStrToMinutes(mission.endHour)
    const duration = parseFloat(mission.shiftDuration) * 60 // hours → minutes
    const numSlots = Math.floor((end - start) / duration)

    for (let i = 0; i < numSlots; i++) {
      if (availableWarriors.length === 0) break

      const chosen = availableWarriors[warriorIndex % availableWarriors.length]
      assignments[mission.id].push({
        uid: chosen.uid,
        requirementIndex: i,
      })

      usedUids.add(chosen.uid)
      warriorIndex++
    }
  }

  return assignments
}
