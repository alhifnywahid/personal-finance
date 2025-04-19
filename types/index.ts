export interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  date: Date | string
  type: "income" | "expense"
  userId: string
}

export interface DebtCredit {
  id: string
  amount: number
  description: string
  person: string
  date: Date | string
  dueDate?: Date | string
  type: "debt" | "credit" // debt = hutang (you owe), credit = piutang (they owe you)
  status: "pending" | "paid"
  userId: string
}
