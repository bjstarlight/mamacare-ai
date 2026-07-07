export type PregnancyTip = {
  startWeek: number;
  endWeek: number;
  title: string;
  tips: string[];
};

export const pregnancyTips: PregnancyTip[] = [
  {
    startWeek: 1,
    endWeek: 12,
    title: "First Trimester",
    tips: [
      "Take folic acid every day.",
      "Attend your first antenatal visit.",
      "Avoid alcohol and smoking.",
      "Stay hydrated.",
      "Rest whenever you feel tired."
    ]
  },

  {
    startWeek: 13,
    endWeek: 27,
    title: "Second Trimester",
    tips: [
      "Begin light pregnancy exercises.",
      "Monitor fetal movements.",
      "Eat iron-rich foods.",
      "Attend anatomy scan appointments.",
      "Maintain healthy weight gain."
    ]
  },

  {
    startWeek: 28,
    endWeek: 40,
    title: "Third Trimester",
    tips: [
      "Count baby's kicks daily.",
      "Prepare your hospital bag.",
      "Know labour warning signs.",
      "Attend weekly antenatal appointments.",
      "Keep emergency contacts nearby."
    ]
  }
];