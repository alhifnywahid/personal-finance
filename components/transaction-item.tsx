"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction } from "@/types"
import { ArrowDownCircle, ArrowUpCircle, Edit, Trash } from "lucide-react"
import { Button } from "./ui/button"

interface TransactionItemProps {
  transaction: Transaction
  onEdit?: () => void
  onDelete?: () => void
}

export default function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === "income"

  return (
    <div className="flex flex-col rounded-lg border">
      <div className="flex items-center justify-between p-3">
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

      {(onEdit || onDelete) && (
        <div className="flex justify-end border-t p-2">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-2">
              <Edit className="h-4 w-4" />
              <span className="ml-1">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 px-2 text-destructive hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
              <span className="ml-1">Hapus</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
