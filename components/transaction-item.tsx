import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction } from "@/types"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

interface TransactionItemProps {
  transaction: Transaction
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncome = transaction.type === "income"

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center">
        <div className="mr-3 rounded-full bg-muted p-2">
          {isIncome ? (
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
          ) : (
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">
            {transaction.category} • {formatDate(transaction.date)}
          </p>
        </div>
      </div>
      <p className={`font-semibold ${isIncome ? "text-green-500" : "text-red-500"}`}>
        {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
      </p>
    </div>
  )
}
