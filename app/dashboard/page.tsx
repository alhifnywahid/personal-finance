"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AuthCheck from "@/components/auth-check"
import MobileContainer from "@/components/mobile-container"
import BottomNav from "@/components/bottom-nav"
import type { Transaction } from "@/types"
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react"
import TransactionItem from "@/components/transaction-item"
import { useAuth } from "@/components/auth-provider"

export default function DashboardPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalDebt: 0,
    totalCredit: 0,
    balance: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return

      try {
        setIsLoading(true)
        const userId = user.uid

        // Fetch income transactions
        const incomeQuery = query(
          collection(db, "transactions"),
          where("userId", "==", userId),
          where("type", "==", "income"),
        )
        const incomeSnapshot = await getDocs(incomeQuery)
        const totalIncome = incomeSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)

        // Fetch expense transactions
        const expenseQuery = query(
          collection(db, "transactions"),
          where("userId", "==", userId),
          where("type", "==", "expense"),
        )
        const expenseSnapshot = await getDocs(expenseQuery)
        const totalExpense = expenseSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)

        // Fetch debt records
        const debtQuery = query(
          collection(db, "debtCredit"),
          where("userId", "==", userId),
          where("type", "==", "debt"),
          where("status", "==", "pending"),
        )
        const debtSnapshot = await getDocs(debtQuery)
        const totalDebt = debtSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)

        // Fetch credit records
        const creditQuery = query(
          collection(db, "debtCredit"),
          where("userId", "==", userId),
          where("type", "==", "credit"),
          where("status", "==", "pending"),
        )
        const creditSnapshot = await getDocs(creditQuery)
        const totalCredit = creditSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0)

        // Fetch recent transactions
        const recentTransactionsQuery = query(
          collection(db, "transactions"),
          where("userId", "==", userId),
          orderBy("date", "desc"),
          limit(5),
        )
        const recentTransactionsSnapshot = await getDocs(recentTransactionsQuery)
        const recentTransactionsData = recentTransactionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[]

        setSummary({
          totalIncome,
          totalExpense,
          totalDebt,
          totalCredit,
          balance: totalIncome - totalExpense,
        })
        setRecentTransactions(recentTransactionsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.uid) {
      fetchData()
    }
  }, [user])

  return (
    <AuthCheck>
      <MobileContainer>
        <div className="flex flex-col p-4 pb-20">
          <h1 className="mb-4 text-2xl font-bold">Halo, {user?.displayName?.split(" ")[0] || "User"}</h1>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Saat Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(summary.balance)}</p>
                  <div className="mt-2 flex justify-between text-sm">
                    <div className="flex items-center">
                      <ArrowUpCircle className="mr-1 h-4 w-4 text-green-500" />
                      <span>Pemasukan: {formatCurrency(summary.totalIncome)}</span>
                    </div>
                    <div className="flex items-center">
                      <ArrowDownCircle className="mr-1 h-4 w-4 text-red-500" />
                      <span>Pengeluaran: {formatCurrency(summary.totalExpense)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Hutang & Piutang</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Hutang</p>
                      <p className="text-lg font-semibold text-red-500">{formatCurrency(summary.totalDebt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Piutang</p>
                      <p className="text-lg font-semibold text-green-500">{formatCurrency(summary.totalCredit)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold">Transaksi Terbaru</h2>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {recentTransactions.map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Belum ada transaksi</p>
                )}
              </div>
            </>
          )}
        </div>
        <BottomNav />
      </MobileContainer>
    </AuthCheck>
  )
}
