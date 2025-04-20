"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import AuthCheck from "@/components/auth-check"
import MobileContainer from "@/components/mobile-container"
import BottomNav from "@/components/bottom-nav"
import type { Transaction } from "@/types"
import TransactionItem from "@/components/transaction-item"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Plus, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { format, isAfter, isBefore, isEqual, isSameDay, startOfDay } from "date-fns"
import { id } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CategoryInput } from "@/components/ui/category-input"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export default function IncomePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    category: "",
  })
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  // Date filtering states
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [transactionDates, setTransactionDates] = useState<Date[]>([])
  const [firstTransactionDate, setFirstTransactionDate] = useState<Date | null>(null)
  const [totalInRange, setTotalInRange] = useState<number>(0)
  const [isFilterActive, setIsFilterActive] = useState(false)

  const fetchCategories = async () => {
    if (!user?.uid) return []

    try {
      const categoriesQuery = query(
        collection(db, "categories"),
        where("userId", "==", user.uid),
        where("type", "==", "income"),
      )
      const snapshot = await getDocs(categoriesQuery)
      return snapshot.docs.map((doc) => doc.data().name as string)
    } catch (error) {
      console.error("Error fetching categories:", error)
      return []
    }
  }

  const addCategory = async (categoryName: string) => {
    if (!user?.uid || !categoryName.trim() || categories.includes(categoryName)) return

    try {
      await addDoc(collection(db, "categories"), {
        name: categoryName,
        type: "income",
        userId: user.uid,
        createdAt: Timestamp.fromDate(new Date()),
      })

      // Update local categories
      setCategories((prev) => [...prev, categoryName])
      return true
    } catch (error) {
      console.error("Error adding category:", error)
      return false
    }
  }

  const fetchTransactions = async () => {
    if (!user?.uid) return

    try {
      setIsLoading(true)
      const userId = user.uid

      // Fetch categories first
      const fetchedCategories = await fetchCategories()
      setCategories(fetchedCategories)

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
      setFilteredTransactions(transactionsData)

      // Extract all transaction dates for the calendar highlighting
      const dates = transactionsData.map((transaction) => {
        if (typeof transaction.date === "object" && "toDate" in transaction.date) {
          return transaction.date.toDate()
        }
        return new Date(transaction.date)
      })

      setTransactionDates(dates)

      // Find the earliest transaction date
      if (dates.length > 0) {
        const earliest = new Date(Math.min(...dates.map((date) => date.getTime())))
        setFirstTransactionDate(earliest)
      }
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

  // Filter transactions when date range changes
  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      setIsFilterActive(true)

      const filtered = transactions.filter((transaction) => {
        let transactionDate: Date

        if (typeof transaction.date === "object" && "toDate" in transaction.date) {
          transactionDate = transaction.date.toDate()
        } else if (typeof transaction.date === "string") {
          transactionDate = new Date(transaction.date)
        } else {
          transactionDate = transaction.date as Date
        }

        const startOfTransactionDay = startOfDay(transactionDate)

        if (dateRange.from && dateRange.to) {
          return (
            (isAfter(startOfTransactionDay, startOfDay(dateRange.from)) ||
              isEqual(startOfTransactionDay, startOfDay(dateRange.from))) &&
            (isBefore(startOfTransactionDay, startOfDay(dateRange.to)) ||
              isEqual(startOfTransactionDay, startOfDay(dateRange.to)))
          )
        } else if (dateRange.from) {
          return (
            isAfter(startOfTransactionDay, startOfDay(dateRange.from)) ||
            isEqual(startOfTransactionDay, startOfDay(dateRange.from))
          )
        } else if (dateRange.to) {
          return (
            isBefore(startOfTransactionDay, startOfDay(dateRange.to)) ||
            isEqual(startOfTransactionDay, startOfDay(dateRange.to))
          )
        }

        return true
      })

      setFilteredTransactions(filtered)

      // Calculate total in range
      const total = filtered.reduce((sum, transaction) => sum + transaction.amount, 0)
      setTotalInRange(total)
    } else {
      setFilteredTransactions(transactions)
      setIsFilterActive(false)

      // Calculate total of all transactions
      const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
      setTotalInRange(total)
    }
  }, [dateRange, transactions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewTransaction((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditingTransaction((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleCategoryChange = (value: string) => {
    setNewTransaction((prev) => ({ ...prev, category: value }))
  }

  const handleEditCategoryChange = (value: string) => {
    setEditingTransaction((prev) => (prev ? { ...prev, category: value } : null))
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

      // Check if category exists, if not add it
      if (!categories.includes(newTransaction.category)) {
        await addCategory(newTransaction.category)
      }

      await addDoc(collection(db, "transactions"), {
        amount,
        description: newTransaction.description,
        category: newTransaction.category,
        type: "income",
        date: Timestamp.fromDate(new Date()),
        userId: user.uid,
      })

      setNewTransaction({
        amount: "",
        description: "",
        category: "",
      })

      setIsAddDrawerOpen(false)
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsEditDrawerOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid || !editingTransaction) return

    if (!editingTransaction.amount || !editingTransaction.description || !editingTransaction.category) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const amount = Number(editingTransaction.amount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Jumlah harus berupa angka positif",
          variant: "destructive",
        })
        return
      }

      // Check if category exists, if not add it
      if (!categories.includes(editingTransaction.category)) {
        await addCategory(editingTransaction.category)
      }

      await updateDoc(doc(db, "transactions", editingTransaction.id), {
        amount,
        description: editingTransaction.description,
        category: editingTransaction.category,
      })

      setIsEditDrawerOpen(false)
      fetchTransactions()

      toast({
        title: "Sukses",
        description: "Pemasukan berhasil diperbarui",
      })
    } catch (error) {
      console.error("Error updating transaction:", error)
      toast({
        title: "Error",
        description: "Gagal memperbarui pemasukan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = (id: string) => {
    setTransactionToDelete(id)
    setIsDeleteDrawerOpen(true)
  }

  const handleDelete = async () => {
    if (!user?.uid || !transactionToDelete) return

    try {
      await deleteDoc(doc(db, "transactions", transactionToDelete))
      fetchTransactions()

      toast({
        title: "Sukses",
        description: "Pemasukan berhasil dihapus",
      })
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus pemasukan",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDrawerOpen(false)
      setTransactionToDelete(null)
    }
  }

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined })
    setIsFilterActive(false)
  }

  // Function to determine if a date should be highlighted in the calendar
  const isDateWithTransaction = (date: Date) => {
    return transactionDates.some((transactionDate) => isSameDay(transactionDate, date))
  }

  return (
    <AuthCheck>
      <MobileContainer>
        <div className="flex flex-col p-4 pb-20">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pemasukan</h1>
            <Drawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
              <DrawerTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Tambah
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Tambah Pemasukan</DrawerTitle>
                </DrawerHeader>
                <div className="px-4">
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
                      <CategoryInput
                        id="category"
                        name="category"
                        categories={categories}
                        value={newTransaction.category}
                        onChange={handleCategoryChange}
                        placeholder="Masukkan kategori"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <DrawerClose asChild>
                        <Button variant="outline">Batal</Button>
                      </DrawerClose>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Date Range Filter */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Filter Berdasarkan Tanggal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP", { locale: id }) : <span>Dari Tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                        disabled={(date) => (firstTransactionDate ? isBefore(date, firstTransactionDate) : false)}
                        modifiers={{
                          highlighted: isDateWithTransaction,
                        }}
                        modifiersStyles={{
                          highlighted: { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP", { locale: id }) : <span>Sampai Tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                        disabled={(date) =>
                          (dateRange.from && isBefore(date, dateRange.from)) ||
                          (firstTransactionDate ? isBefore(date, firstTransactionDate) : false)
                        }
                        modifiers={{
                          highlighted: isDateWithTransaction,
                        }}
                        modifiersStyles={{
                          highlighted: { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center justify-between">
                  {isFilterActive && (
                    <Button variant="ghost" size="sm" onClick={clearDateFilter} className="h-8 px-2 text-xs">
                      <X className="mr-1 h-3 w-3" />
                      Reset Filter
                    </Button>
                  )}

                  {isFilterActive && (
                    <Badge variant="outline" className="ml-auto">
                      Total: {formatCurrency(totalInRange)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={() => handleEdit(transaction)}
                      onDelete={() => confirmDelete(transaction.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border">
                  <p className="text-center text-muted-foreground">
                    {isFilterActive
                      ? "Tidak ada data pemasukan dalam rentang tanggal yang dipilih"
                      : "Belum ada data pemasukan"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Drawer */}
        <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit Pemasukan</DrawerTitle>
            </DrawerHeader>
            {editingTransaction && (
              <div className="px-4">
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-amount">Jumlah (Rp)</Label>
                    <Input
                      id="edit-amount"
                      name="amount"
                      type="number"
                      value={editingTransaction.amount}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Deskripsi</Label>
                    <Input
                      id="edit-description"
                      name="description"
                      value={editingTransaction.description}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Kategori</Label>
                    <CategoryInput
                      id="edit-category"
                      name="category"
                      categories={categories}
                      value={editingTransaction.category}
                      onChange={handleEditCategoryChange}
                      placeholder="Masukkan kategori"
                      required
                    />
                  </div>
                  <div className="flex justify-between space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        setIsEditDrawerOpen(false)
                        confirmDelete(editingTransaction.id)
                      }}
                      disabled={isSubmitting}
                    >
                      Hapus
                    </Button>
                    <div className="flex space-x-2">
                      <DrawerClose asChild>
                        <Button variant="outline">Batal</Button>
                      </DrawerClose>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </DrawerContent>
        </Drawer>

        {/* Delete Drawer */}
        <Drawer open={isDeleteDrawerOpen} onOpenChange={setIsDeleteDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Konfirmasi Hapus</DrawerTitle>
              <DrawerDescription>
                Apakah Anda yakin ingin menghapus pemasukan ini? Tindakan ini tidak dapat dibatalkan.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="flex-row justify-end space-x-2">
              <DrawerClose asChild>
                <Button variant="outline">Batal</Button>
              </DrawerClose>
              <Button variant="destructive" onClick={handleDelete}>
                Hapus
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <BottomNav />
      </MobileContainer>
    </AuthCheck>
  )
}
