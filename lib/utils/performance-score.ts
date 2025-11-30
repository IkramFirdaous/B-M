import { Database } from '@/lib/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row']
type Budget = Database['public']['Tables']['budgets']['Row']
type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']
type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']

export interface PerformanceScoreInputs {
  budgetAdherence: number // 0-1, percentage of budgets not exceeded
  savingsProgress: number // 0-1, percentage of savings goals achieved
  spendingTrend: number // -1 to 1, negative is better (spending less)
  recurringExpenseCoverage: number // 0-1, percentage of recurring expenses covered by income
  emergencySavingsProgress?: number // 0-1, optional emergency fund progress
}

export interface PerformanceScoreResult {
  score: number // 0-100
  tier: 'excellent' | 'stable' | 'riskZone' | 'critical'
  breakdown: {
    budgetAdherence: number
    savingsProgress: number
    spendingTrend: number
    recurringExpenseCoverage: number
    emergencySavingsProgress?: number
  }
  insights: string[]
}

/**
 * Calculate Performance Score (0-100)
 * 
 * Inputs:
 * - Budget adherence (40%)
 * - Savings progress (30%)
 * - Spending trend vs previous months (10%)
 * - Recurring expense coverage (10%)
 * - Emergency savings progress (optional) (10%)
 */
export function calculatePerformanceScore(inputs: PerformanceScoreInputs): PerformanceScoreResult {
  // Normalize spending trend (negative is better, so we invert it)
  const normalizedSpendingTrend = Math.max(0, 1 - (inputs.spendingTrend + 1) / 2)
  
  // Calculate weighted score
  let score = 
    inputs.budgetAdherence * 40 +
    inputs.savingsProgress * 30 +
    normalizedSpendingTrend * 10 +
    inputs.recurringExpenseCoverage * 10
  
  // Add emergency savings if provided
  if (inputs.emergencySavingsProgress !== undefined) {
    score += inputs.emergencySavingsProgress * 10
  } else {
    // If not provided, redistribute the 10% proportionally
    score = score * (100 / 90)
  }
  
  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score))
  
  // Determine tier
  let tier: 'excellent' | 'stable' | 'riskZone' | 'critical'
  if (score >= 80) {
    tier = 'excellent'
  } else if (score >= 60) {
    tier = 'stable'
  } else if (score >= 40) {
    tier = 'riskZone'
  } else {
    tier = 'critical'
  }
  
  // Generate insights
  const insights: string[] = []
  if (inputs.budgetAdherence < 0.5) {
    insights.push('Budget adherence needs improvement')
  }
  if (inputs.savingsProgress < 0.3) {
    insights.push('Savings goals are behind schedule')
  }
  if (inputs.spendingTrend > 0.2) {
    insights.push('Spending is trending upward')
  }
  if (inputs.recurringExpenseCoverage < 0.8) {
    insights.push('Recurring expenses may be too high relative to income')
  }
  
  return {
    score: Math.round(score),
    tier,
    breakdown: {
      budgetAdherence: inputs.budgetAdherence,
      savingsProgress: inputs.savingsProgress,
      spendingTrend: inputs.spendingTrend,
      recurringExpenseCoverage: inputs.recurringExpenseCoverage,
      emergencySavingsProgress: inputs.emergencySavingsProgress,
    },
    insights,
  }
}

/**
 * Calculate performance score from raw data
 */
export async function calculatePerformanceScoreFromData(
  userId: string,
  currentMonth: number,
  currentYear: number,
  transactions: Transaction[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  recurringTransactions: RecurringTransaction[],
  previousMonthsTransactions: Transaction[]
): Promise<PerformanceScoreResult> {
  // 1. Budget Adherence (40%)
  const budgetAdherence = calculateBudgetAdherence(
    transactions,
    budgets,
    currentMonth,
    currentYear
  )
  
  // 2. Savings Progress (30%)
  const savingsProgress = calculateSavingsProgress(
    transactions,
    savingsGoals
  )
  
  // 3. Spending Trend (10%)
  const spendingTrend = calculateSpendingTrend(
    transactions,
    previousMonthsTransactions
  )
  
  // 4. Recurring Expense Coverage (10%)
  const recurringExpenseCoverage = calculateRecurringExpenseCoverage(
    transactions,
    recurringTransactions
  )
  
  // 5. Emergency Savings (optional, 10%)
  // This would require a specific emergency savings goal or calculation
  
  return calculatePerformanceScore({
    budgetAdherence,
    savingsProgress,
    spendingTrend,
    recurringExpenseCoverage,
  })
}

function calculateBudgetAdherence(
  transactions: Transaction[],
  budgets: Budget[],
  month: number,
  year: number
): number {
  if (budgets.length === 0) return 1 // No budgets = perfect adherence
  
  const relevantBudgets = budgets.filter(b => b.month === month && b.year === year)
  if (relevantBudgets.length === 0) return 1
  
  let totalAdherence = 0
  for (const budget of relevantBudgets) {
    const categorySpending = transactions
      .filter(t => 
        t.category_id === budget.category_id &&
        t.type === 'expense'
      )
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const adherence = Math.max(0, 1 - (categorySpending / Number(budget.amount)))
    totalAdherence += adherence
  }
  
  return totalAdherence / relevantBudgets.length
}

function calculateSavingsProgress(
  transactions: Transaction[],
  savingsGoals: SavingsGoal[]
): number {
  if (savingsGoals.length === 0) return 1 // No goals = perfect progress
  
  let totalProgress = 0
  for (const goal of savingsGoals) {
    // Calculate contributions to this goal (simplified - would need goal tracking)
    const contributions = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    // Simplified: assume some percentage goes to savings
    // In reality, you'd track which transactions contribute to which goals
    const progress = Math.min(1, contributions / Number(goal.target_amount))
    totalProgress += progress
  }
  
  return totalProgress / savingsGoals.length
}

function calculateSpendingTrend(
  currentTransactions: Transaction[],
  previousTransactions: Transaction[]
): number {
  const currentSpending = currentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  
  const previousSpending = previousTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  
  if (previousSpending === 0) return 0
  
  // Positive = spending more, negative = spending less
  return (currentSpending - previousSpending) / previousSpending
}

function calculateRecurringExpenseCoverage(
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[]
): number {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  
  const totalRecurringExpenses = recurringTransactions
    .filter(rt => rt.is_subscription || rt.frequency === 'monthly')
    .reduce((sum, rt) => sum + Number(rt.amount), 0)
  
  if (totalIncome === 0) return 0
  
  // Coverage = 1 if expenses are fully covered, decreases as expenses exceed income
  return Math.min(1, totalIncome / (totalRecurringExpenses || 1))
}

