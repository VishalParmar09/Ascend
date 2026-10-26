// src/utils/calibrationMath.js

/**
 * Calculates personalized Hunter attributes and BMI based on Awakening survey answers.
 * 
 * @param {Object} answers - User answers from the calibration modal
 * @param {string} answers.pushups - 'beginner' | 'intermediate' | 'advanced' | 'elite'
 * @param {string} answers.cardio - 'sedentary' | 'moderate' | 'runner' | 'athlete'
 * @param {string} answers.mentalFocus - 'low' | 'moderate' | 'high' | 'scholar'
 * @param {number} answers.height - Height in centimeters (e.g. 175)
 * @param {number} answers.weight - Weight in kilograms (e.g. 70)
 * @returns {Object} { stats, bmi, bmiCategory }
 */
// src/utils/calibrationMath.js

export function calculateAwakenedStats(answers) {
  // 1. Calculate STR based on push-ups
  const strengthMap = {
    beginner: 8,
    intermediate: 13,
    advanced: 18,
    elite: 24,
  };
  let strength = strengthMap[answers.pushups] || 10;

  // 2. Calculate VIT & AGI based on cardio
  const cardioMap = {
    sedentary: { vit: 8, agi: 8 },
    moderate: { vit: 12, agi: 12 },
    runner: { vit: 17, agi: 16 },
    athlete: { vit: 23, agi: 21 },
  };
  const { vit: baseVit, agi: baseAgi } = cardioMap[answers.cardio] || { vit: 10, agi: 10 };
  let vitality = baseVit;
  let agility = baseAgi;

  // 3. Calculate INT & PER based on mental focus
  const mentalMap = {
    low: { int: 9, per: 9 },
    moderate: { int: 13, per: 12 },
    high: { int: 18, per: 16 },
    scholar: { int: 23, per: 20 },
  };
  const { int: baseInt, per: basePer } = mentalMap[answers.mentalFocus] || { int: 10, per: 10 };
  let intelligence = baseInt;
  let perception = basePer;

  // 4. Subtle Goal Modifiers (Specializes starting stats)
  if (answers.goal === 'aesthetic') {
    agility += 1;
    strength += 1;
  } else if (answers.goal === 'strength') {
    strength += 2;
  } else if (answers.goal === 'fatloss') {
    vitality += 2;
  }

  // 5. Standardize Metric units for BMI calculation
  let heightInCm = Number(answers.height);
  if (answers.heightUnit === 'ft') {
    // Convert feet to cm: 1 ft = 30.48 cm
    heightInCm = Number(answers.height) * 30.48;
  }

  let weightInKg = Number(answers.weight);
  if (answers.weightUnit === 'lbs') {
    // Convert lbs to kg: 1 lb = 0.453592 kg
    weightInKg = Number(answers.weight) * 0.453592;
  }

  let bmi = null;
  let bmiCategory = 'Normal';

  if (heightInCm > 0 && weightInKg > 0) {
    const heightInMeters = heightInCm / 100;
    bmi = Number((weightInKg / (heightInMeters * heightInMeters)).toFixed(1));

    if (bmi < 18.5) bmiCategory = 'Lean Build';
    else if (bmi < 25) bmiCategory = 'Athletic / Normal';
    else if (bmi < 30) bmiCategory = 'Heavy Build';
    else bmiCategory = 'High Mass';
  }

  return {
    stats: {
      strength,
      agility,
      vitality,
      intelligence,
      perception,
    },
    profile: {
      gender: answers.gender || 'male',
      goal: answers.goal || 'aesthetic',
      height: Math.round(heightInCm),
      weight: Math.round(weightInKg),
      bmi,
      bmiCategory,
    }
  };
}