// Humorous and edgy copywriting for notifications and UI
// Stored in localization file for easy rotation and A/B testing

export const copywriting = {
  notifications: {
    overspending: [
      "You're spending like you're trying to win an award. Stop.",
      "Your wallet called. It's not having a good time.",
      "Remember when you said you'd stick to the budget? Yeah, neither do we.",
      "You're 90% through your eating-out budget. Maybe try your kitchen?",
    ],
    subscriptionReminder: [
      "Netflix wants your money again. You knew this day would come.",
      "Another subscription is knocking. Your bank account is not amused.",
      "Subscription alert: Your money is about to leave the building.",
      "Time to pay the subscription piper. Again.",
    ],
    savingsSuccess: [
      "You saved money. We're impressed. Truly.",
      "Look at you, being financially responsible. Who are you?",
      "Savings goal achieved! Now don't go spending it all at once.",
      "You actually saved money this month. Is this real life?",
    ],
    budgetWarning: [
      "You're 90% through your eating-out budget. Maybe try your kitchen?",
      "Budget limit approaching. Time to channel your inner frugal self.",
      "Your budget is crying. Just a heads up.",
      "You're about to break your budget. We're not mad, just disappointed.",
    ],
  },
  monthlyWrap: {
    subjects: [
      "Your money misadventures: summarized.",
      "You survived another month. Congrats?",
      "Let's review where your paycheck ran off to.",
      "Monthly financial autopsy: complete.",
      "Another month, another financial report card.",
    ],
    greetings: [
      "Well, well, well. Look who made it through another month.",
      "Time for your monthly financial reality check.",
      "Here's what your money did while you weren't looking.",
      "Another month in the books. Let's see how you did.",
    ],
  },
  annualWrap: {
    subjects: [
      "Your year in review: financially speaking.",
      "12 months of financial decisions. Let's talk.",
      "Annual wrap: where did all your money go?",
      "Year-end financial report: no judgment (okay, maybe a little).",
    ],
  },
  performanceScore: {
    excellent: [
      "Outstanding! You're basically a financial wizard.",
      "Excellent work. Your future self thanks you.",
      "You're crushing it. Keep it up!",
    ],
    stable: [
      "You're doing okay. Not great, not terrible.",
      "Stable performance. Room for improvement, but you're on track.",
      "You're managing. Could be better, could be worse.",
    ],
    riskZone: [
      "You're in the risk zone. Time to tighten those purse strings.",
      "Warning: Your financial health needs attention.",
      "Things are getting dicey. Maybe reconsider that subscription?",
    ],
    critical: [
      "Critical situation. Your finances need immediate attention.",
      "This is not a drill. Your spending is out of control.",
      "Emergency intervention required. Please review your budget.",
    ],
  },
  dashboard: {
    emptyState: {
      title: "No transactions yet",
      description: "Start tracking your spending to see your financial performance.",
    },
    welcome: [
      "Welcome back! Let's see how your money is doing.",
      "Time to check in on your financial life.",
      "Ready to face your financial reality?",
    ],
  },
}

export function getRandomCopy(category: keyof typeof copywriting, subcategory: string): string {
  const items = (copywriting[category] as any)[subcategory]
  if (!items || items.length === 0) return ""
  return items[Math.floor(Math.random() * items.length)]
}


