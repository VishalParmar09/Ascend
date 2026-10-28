// src/utils/trainingPlanGenerator.js

export const EXERCISE_DATABASE = {
    push: {
        gym: [
            { name: 'Barbell Bench Press', sets: 4, reps: '8 - 10', rest: '90s', stat: 'STR' },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Overhead Barbell Press', sets: 3, reps: '8 - 10', rest: '90s', stat: 'STR' },
            { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12 - 15', rest: '45s', stat: 'AGI' },
            { name: 'Tricep Rope Pushdown', sets: 3, reps: '12 - 15', rest: '45s', stat: 'STR' },
            { name: 'Chest Dips', sets: 3, reps: '8 - 12', rest: '60s', stat: 'STR' },
        ],
        dumbbell: [
            { name: 'Flat Dumbbell Press', sets: 4, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12 - 15', rest: '45s', stat: 'AGI' },
            { name: 'Overhead Dumbbell Tricep Extension', sets: 3, reps: '12 - 15', rest: '45s', stat: 'STR' },
        ],
        bodyweight: [
            { name: 'Standard Push-ups', sets: 4, reps: '15 - 20', rest: '60s', stat: 'STR' },
            { name: 'Diamond Push-ups (Triceps)', sets: 3, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Pike Push-ups (Shoulders)', sets: 3, reps: '8 - 10', rest: '60s', stat: 'AGI' },
            { name: 'Bench / Chair Dips', sets: 3, reps: '12 - 15', rest: '45s', stat: 'STR' },
            { name: 'Decline Feet-Elevated Push-ups', sets: 3, reps: '10 - 15', rest: '60s', stat: 'STR' },
        ],
    },
    pull: {
        gym: [
            { name: 'Barbell Deadlift / RDL', sets: 3, reps: '6 - 8', rest: '120s', stat: 'STR' },
            { name: 'Wide-Grip Lat Pulldown', sets: 4, reps: '10 - 12', rest: '60s', stat: 'AGI' },
            { name: 'Seated Cable Row', sets: 3, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Cable Face Pulls', sets: 4, reps: '12 - 15', rest: '45s', stat: 'AGI' },
            { name: 'Barbell / Incline Bicep Curls', sets: 3, reps: '10 - 12', rest: '45s', stat: 'STR' },
        ],
        dumbbell: [
            { name: 'Single-Arm Dumbbell Rows', sets: 4, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Dumbbell Shrugs', sets: 3, reps: '12 - 15', rest: '45s', stat: 'STR' },
            { name: 'Rear Delt Dumbbell Flyes', sets: 4, reps: '12 - 15', rest: '45s', stat: 'AGI' },
            { name: 'Dumbbell Hammer Curls', sets: 3, reps: '10 - 12', rest: '45s', stat: 'STR' },
        ],
        bodyweight: [
            { name: 'Pull-ups / Chin-ups', sets: 4, reps: '6 - 10', rest: '90s', stat: 'STR' },
            { name: 'Inverted Rows (Under table/bar)', sets: 4, reps: '10 - 12', rest: '60s', stat: 'AGI' },
            { name: 'Superman Floor Holds', sets: 3, reps: '30s hold', rest: '45s', stat: 'VIT' },
            { name: 'Doorframe Towel Rows', sets: 3, reps: '12 - 15', rest: '45s', stat: 'STR' },
        ],
    },
    legs: {
        gym: [
            { name: 'Barbell Back Squat', sets: 4, reps: '8 - 10', rest: '90s', stat: 'VIT' },
            { name: 'Leg Press', sets: 3, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Hamstring Leg Curls', sets: 3, reps: '10 - 12', rest: '45s', stat: 'AGI' },
            { name: 'Bulgarian Split Squats', sets: 3, reps: '10 each', rest: '60s', stat: 'AGI' },
            { name: 'Standing Calf Raises', sets: 4, reps: '15 - 20', rest: '45s', stat: 'VIT' },
        ],
        dumbbell: [
            { name: 'Goblet Squats', sets: 4, reps: '12 - 15', rest: '60s', stat: 'VIT' },
            { name: 'Dumbbell Walking Lunges', sets: 3, reps: '12 each', rest: '60s', stat: 'AGI' },
            { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '10 - 12', rest: '60s', stat: 'STR' },
            { name: 'Dumbbell Calf Raises', sets: 4, reps: '15 - 20', rest: '45s', stat: 'VIT' },
        ],
        bodyweight: [
            { name: 'Air Squats', sets: 4, reps: '20 - 25', rest: '45s', stat: 'VIT' },
            { name: 'Walking Lunges', sets: 3, reps: '15 each', rest: '45s', stat: 'AGI' },
            { name: 'Bulgarian Split Squats', sets: 3, reps: '10 each', rest: '60s', stat: 'AGI' },
            { name: 'Single-Leg Glute Bridges', sets: 3, reps: '15 each', rest: '45s', stat: 'VIT' },
            { name: 'Standing Calf Raises', sets: 4, reps: '25 reps', rest: '30s', stat: 'VIT' },
        ],
    },
};

/**
 * Generates an adaptive routine based on days committed (3, 4, 5, 6) and equipment
 */
export function generateWorkoutPlan(daysPerWeek = 4, equipment = 'gym') {
    const equip = ['gym', 'dumbbell', 'bodyweight'].includes(equipment) ? equipment : 'gym';
    const days = Number(daysPerWeek) || 4;

    // 3-Day Split: Full Body
    if (days === 3) {
        return {
            id: `plan-3day-${equip}`,
            name: `3-Day Full Body Protocol (${equip.toUpperCase()})`,
            daysPerWeek: 3,
            equipment: equip,
            schedule: [
                { dayName: 'Day 1: Full Body (Compound Foundations)', muscleGroup: 'Full Body', exercises: [EXERCISE_DATABASE.push[equip][0], EXERCISE_DATABASE.pull[equip][0], EXERCISE_DATABASE.legs[equip][0], EXERCISE_DATABASE.push[equip][3]] },
                { dayName: 'Day 2: Full Body (Hypertrophy & Mobility)', muscleGroup: 'Full Body', exercises: [EXERCISE_DATABASE.legs[equip][1], EXERCISE_DATABASE.pull[equip][1], EXERCISE_DATABASE.push[equip][2], EXERCISE_DATABASE.pull[equip][4]] },
                { dayName: 'Day 3: Full Body (Athletic Conditioning)', muscleGroup: 'Full Body', exercises: [EXERCISE_DATABASE.push[equip][1], EXERCISE_DATABASE.legs[equip][2], EXERCISE_DATABASE.pull[equip][2], EXERCISE_DATABASE.legs[equip][3]] },
            ]
        };
    }

    // 4-Day Split: Upper / Lower
    if (days === 4) {
        return {
            id: `plan-4day-${equip}`,
            name: `4-Day Upper / Lower Split (${equip.toUpperCase()})`,
            daysPerWeek: 4,
            equipment: equip,
            schedule: [
                { dayName: 'Day 1: Upper Body Power', muscleGroup: 'Upper', exercises: [...EXERCISE_DATABASE.push[equip].slice(0, 3), ...EXERCISE_DATABASE.pull[equip].slice(0, 2)] },
                { dayName: 'Day 2: Lower Body Power', muscleGroup: 'Lower', exercises: EXERCISE_DATABASE.legs[equip].slice(0, 5) },
                { dayName: 'Day 3: Upper Body Hypertrophy', muscleGroup: 'Upper', exercises: [...EXERCISE_DATABASE.push[equip].slice(2, 5), ...EXERCISE_DATABASE.pull[equip].slice(2, 5)] },
                { dayName: 'Day 4: Lower Body & Core', muscleGroup: 'Lower', exercises: EXERCISE_DATABASE.legs[equip].slice(1, 5) },
            ]
        };
    }

    // 5-Day Split: Hunter Body-Part Split
    if (days === 5) {
        return {
            id: `plan-5day-${equip}`,
            name: `5-Day Hunter Split (${equip.toUpperCase()})`,
            daysPerWeek: 5,
            equipment: equip,
            schedule: [
                { dayName: 'Day 1: Chest & Triceps', muscleGroup: 'Chest', exercises: [...EXERCISE_DATABASE.push[equip].slice(0, 3), EXERCISE_DATABASE.push[equip][4]] },
                { dayName: 'Day 2: Back & Biceps', muscleGroup: 'Back', exercises: [...EXERCISE_DATABASE.pull[equip].slice(0, 4), EXERCISE_DATABASE.pull[equip][4]] },
                { dayName: 'Day 3: Quads & Calves', muscleGroup: 'Legs', exercises: EXERCISE_DATABASE.legs[equip].slice(0, 4) },
                { dayName: 'Day 4: Shoulders & Arms', muscleGroup: 'Shoulders', exercises: [EXERCISE_DATABASE.push[equip][2], EXERCISE_DATABASE.push[equip][3], EXERCISE_DATABASE.pull[equip][3], EXERCISE_DATABASE.push[equip][4]] },
                { dayName: 'Day 5: Hamstrings & Posterior Chain', muscleGroup: 'Legs', exercises: [EXERCISE_DATABASE.legs[equip][2], EXERCISE_DATABASE.pull[equip][1], EXERCISE_DATABASE.legs[equip][3]] },
            ]
        };
    }

    // 6-Day Split: Push / Pull / Legs
    return {
        id: `plan-6day-${equip}`,
        name: `6-Day Push / Pull / Legs (${equip.toUpperCase()})`,
        daysPerWeek: 6,
        equipment: equip,
        schedule: [
            { dayName: 'Day 1: Push (Chest, Shoulders, Triceps)', muscleGroup: 'Push', exercises: EXERCISE_DATABASE.push[equip].slice(0, 5) },
            { dayName: 'Day 2: Pull (Back, Biceps, Rear Delts)', muscleGroup: 'Pull', exercises: EXERCISE_DATABASE.pull[equip].slice(0, 5) },
            { dayName: 'Day 3: Legs (Quads, Calves, Hamstrings)', muscleGroup: 'Legs', exercises: EXERCISE_DATABASE.legs[equip].slice(0, 5) },
            { dayName: 'Day 4: Push (Volume Focus)', muscleGroup: 'Push', exercises: EXERCISE_DATABASE.push[equip].slice(1, 6) },
            { dayName: 'Day 5: Pull (Hypertrophy Focus)', muscleGroup: 'Pull', exercises: EXERCISE_DATABASE.pull[equip].slice(1, 5) },
            { dayName: 'Day 6: Legs (Endurance & Athleticism)', muscleGroup: 'Legs', exercises: EXERCISE_DATABASE.legs[equip].slice(0, 4) },
        ]
    };
}