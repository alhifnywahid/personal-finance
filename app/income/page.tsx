"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import AuthCheck from "@/components/auth-check"
import MobileContainer from "@/components/mobile-container"
import BottomNav from "@/components/bottom-nav"
import type { Transaction } from "@/types"
import TransactionItem from "@/components/transaction-item"
import { Loader2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"

const incomeCategories = ["Gaji", "Bonus", "Hadiah", "Investasi", "Penjualan", "Lainnya"]

export default function IncomePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    category: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTransactions = async () => {
    if (!user?.uid) return

    try {
      setIsLoading(true)
      const userId = user.uid

      const transactionsQuery = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        where("type", "==", "income"),
        orderBy("date", "desc"),
      )
      const snapshot = await getDocs(transactionsQuery)
      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[]

      setTransactions(transactionsData)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data pemasukan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.uid) {
      fetchTransactions()
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewTransaction((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setNewTransaction((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid) return

    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const amount = Number.parseFloat(newTransaction.amount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Jumlah harus berupa angka positif",
          variant: "destructive",
        })
        return
      }

      await addDoc(collection(db, "transactions"), {
        amount,
        description: newTransaction.description,
        category: newTransaction.category,
        type: "income",
        date: new Date(),
        userId: user.uid,
      })

      setNewTransaction({
        amount: "",
        description: "",
        category: "",
      })

      setIsDialogOpen(false)
      fetchTransactions()

      toast({
        title: "Sukses",
        description: "Pemasukan berhasil ditambahkan",
      })
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast({
        title: "Error",
        description: "Gagal menambahkan pemasukan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCheck>
      <MobileContainer>
        <div className="flex flex-col p-4 pb-20">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pemasukan</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Pemasukan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah (Rp)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      placeholder="50000"
                      value={newTransaction.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Gaji bulan Mei"
                      value={newTransaction.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={newTransaction.category} onValueChange={handleCategoryChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {incomeCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border">
                  <p className="text-center text-muted-foreground">Belum ada data pemasukan</p>
                </div>
              )}
            </>
          )}
        </div>
        <BottomNav />
      </MobileContainer>
    </AuthCheck>
  )
}
