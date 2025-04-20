"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import AuthCheck from "@/components/auth-check"
import MobileContainer from "@/components/mobile-container"
import BottomNav from "@/components/bottom-nav"
import type { DebtCredit } from "@/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Check, Edit, Loader2, Plus } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useAuth } from "@/components/auth-provider"
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

export default function DebtCreditPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("debt")
  const [isLoading, setIsLoading] = useState(true)
  const [records, setRecords] = useState<DebtCredit[]>([])
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false)
  const [isPayDrawerOpen, setIsPayDrawerOpen] = useState(false)
  const [newRecord, setNewRecord] = useState({
    amount: "",
    description: "",
    person: "",
    date: new Date(),
    dueDate: new Date(),
    type: "debt",
  })
  const [editingRecord, setEditingRecord] = useState<DebtCredit | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)
  const [recordToPay, setRecordToPay] = useState<string | null>(null)

  const fetchRecords = async () => {
    if (!user?.uid) return

    try {
      setIsLoading(true)
      const userId = user.uid

      const recordsQuery = query(
        collection(db, "debtCredit"),
        where("userId", "==", userId),
        where("type", "==", activeTab),
        orderBy("date", "desc"),
      )
      const snapshot = await getDocs(recordsQuery)
      const recordsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DebtCredit[]

      setRecords(recordsData)
    } catch (error) {
      console.error("Error fetching records:", error)
      toast({
        title: "Error",
        description: `Gagal memuat data ${activeTab === "debt" ? "hutang" : "piutang"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.uid) {
      fetchRecords()
    }
  }, [user, activeTab])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewRecord((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditingRecord((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setNewRecord((prev) => ({ ...prev, type: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid) return

    if (!newRecord.amount || !newRecord.description || !newRecord.person) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const amount = Number.parseFloat(newRecord.amount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Jumlah harus berupa angka positif",
          variant: "destructive",
        })
        return
      }

      await addDoc(collection(db, "debtCredit"), {
        amount,
        description: newRecord.description,
        person: newRecord.person,
        date: newRecord.date,
        dueDate: newRecord.dueDate,
        type: newRecord.type,
        status: "pending",
        userId: user.uid,
      })

      setNewRecord({
        amount: "",
        description: "",
        person: "",
        date: new Date(),
        dueDate: new Date(),
        type: activeTab,
      })

      setIsAddDrawerOpen(false)
      fetchRecords()

      toast({
        title: "Sukses",
        description: `${activeTab === "debt" ? "Hutang" : "Piutang"} berhasil ditambahkan`,
      })
    } catch (error) {
      console.error("Error adding record:", error)
      toast({
        title: "Error",
        description: `Gagal menambahkan ${activeTab === "debt" ? "hutang" : "piutang"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (record: DebtCredit) => {
    setEditingRecord(record)
    setIsEditDrawerOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid || !editingRecord) return

    if (!editingRecord.amount || !editingRecord.description || !editingRecord.person) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const amount = Number(editingRecord.amount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Jumlah harus berupa angka positif",
          variant: "destructive",
        })
        return
      }

      await updateDoc(doc(db, "debtCredit", editingRecord.id), {
        amount,
        description: editingRecord.description,
        person: editingRecord.person,
        dueDate: editingRecord.dueDate,
      })

      setIsEditDrawerOpen(false)
      fetchRecords()

      toast({
        title: "Sukses",
        description: `${activeTab === "debt" ? "Hutang" : "Piutang"} berhasil diperbarui`,
      })
    } catch (error) {
      console.error("Error updating record:", error)
      toast({
        title: "Error",
        description: `Gagal memperbarui ${activeTab === "debt" ? "hutang" : "piutang"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = (id: string) => {
    setRecordToDelete(id)
    setIsDeleteDrawerOpen(true)
  }

  const handleDelete = async () => {
    if (!user?.uid || !recordToDelete) return

    try {
      await deleteDoc(doc(db, "debtCredit", recordToDelete))
      fetchRecords()

      toast({
        title: "Sukses",
        description: `${activeTab === "debt" ? "Hutang" : "Piutang"} berhasil dihapus`,
      })
    } catch (error) {
      console.error("Error deleting record:", error)
      toast({
        title: "Error",
        description: `Gagal menghapus ${activeTab === "debt" ? "hutang" : "piutang"}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleteDrawerOpen(false)
      setRecordToDelete(null)
    }
  }

  const confirmPay = (id: string) => {
    setRecordToPay(id)
    setIsPayDrawerOpen(true)
  }

  const markAsPaid = async () => {
    if (!user?.uid || !recordToPay) return

    try {
      await updateDoc(doc(db, "debtCredit", recordToPay), {
        status: "paid",
      })

      fetchRecords()

      toast({
        title: "Sukses",
        description: `${activeTab === "debt" ? "Hutang" : "Piutang"} berhasil dilunasi`,
      })
    } catch (error) {
      console.error("Error updating record:", error)
      toast({
        title: "Error",
        description: `Gagal melunasi ${activeTab === "debt" ? "hutang" : "piutang"}`,
        variant: "destructive",
      })
    } finally {
      setIsPayDrawerOpen(false)
      setRecordToPay(null)
    }
  }

  return (
    <AuthCheck>
      <MobileContainer>
        <div className="flex flex-col p-4 pb-20">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Hutang & Piutang</h1>
            <Drawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
              <DrawerTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Tambah
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Tambah {activeTab === "debt" ? "Hutang" : "Piutang"}</DrawerTitle>
                </DrawerHeader>
                <div className="px-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipe</Label>
                      <Select
                        value={newRecord.type}
                        onValueChange={(value) => setNewRecord((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debt">Hutang (Saya berhutang)</SelectItem>
                          <SelectItem value="credit">Piutang (Orang berhutang ke saya)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Jumlah (Rp)</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="50000"
                        value={newRecord.amount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Input
                        id="description"
                        name="description"
                        placeholder="Pinjaman untuk..."
                        value={newRecord.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="person">Nama Orang</Label>
                      <Input
                        id="person"
                        name="person"
                        placeholder="Nama orang"
                        value={newRecord.person}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tanggal Jatuh Tempo</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(newRecord.dueDate, "PPP", { locale: id })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newRecord.dueDate}
                            onSelect={(date) => date && setNewRecord((prev) => ({ ...prev, dueDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="debt">Hutang</TabsTrigger>
              <TabsTrigger value="credit">Piutang</TabsTrigger>
            </TabsList>
            <TabsContent value="debt" className="mt-4">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {records.length > 0 ? (
                    <div className="space-y-3">
                      {records.map((record) => (
                        <Card key={record.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex items-center justify-between border-b p-3">
                              <div>
                                <p className="font-medium">{record.description}</p>
                                <p className="text-xs text-muted-foreground">Ke: {record.person}</p>
                              </div>
                              <p className="font-semibold text-red-500">{formatCurrency(record.amount)}</p>
                            </div>
                            <div className="flex items-center justify-between p-3">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Jatuh tempo: {record.dueDate ? formatDate(record.dueDate) : "Tidak ada"}
                                </p>
                                <p className="text-xs text-muted-foreground">Dibuat: {formatDate(record.date)}</p>
                              </div>
                              <div className="flex space-x-2">
                                {record.status === "pending" ? (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => confirmPay(record.id)}>
                                      <Check className="mr-1 h-4 w-4" />
                                      Lunasi
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(record)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Lunas
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg border">
                      <p className="text-center text-muted-foreground">Belum ada data hutang</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            <TabsContent value="credit" className="mt-4">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {records.length > 0 ? (
                    <div className="space-y-3">
                      {records.map((record) => (
                        <Card key={record.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex items-center justify-between border-b p-3">
                              <div>
                                <p className="font-medium">{record.description}</p>
                                <p className="text-xs text-muted-foreground">Dari: {record.person}</p>
                              </div>
                              <p className="font-semibold text-green-500">{formatCurrency(record.amount)}</p>
                            </div>
                            <div className="flex items-center justify-between p-3">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Jatuh tempo: {record.dueDate ? formatDate(record.dueDate) : "Tidak ada"}
                                </p>
                                <p className="text-xs text-muted-foreground">Dibuat: {formatDate(record.date)}</p>
                              </div>
                              <div className="flex space-x-2">
                                {record.status === "pending" ? (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => confirmPay(record.id)}>
                                      <Check className="mr-1 h-4 w-4" />
                                      Terima
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(record)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Lunas
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg border">
                      <p className="text-center text-muted-foreground">Belum ada data piutang</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit Drawer */}
        <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit {activeTab === "debt" ? "Hutang" : "Piutang"}</DrawerTitle>
            </DrawerHeader>
            {editingRecord && (
              <div className="px-4">
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-amount">Jumlah (Rp)</Label>
                    <Input
                      id="edit-amount"
                      name="amount"
                      type="number"
                      value={editingRecord.amount}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Deskripsi</Label>
                    <Input
                      id="edit-description"
                      name="description"
                      value={editingRecord.description}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-person">Nama Orang</Label>
                    <Input
                      id="edit-person"
                      name="person"
                      value={editingRecord.person}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Jatuh Tempo</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editingRecord.dueDate &&
                          typeof editingRecord.dueDate === "object" &&
                          "toDate" in editingRecord.dueDate
                            ? format(editingRecord.dueDate.toDate(), "PPP", { locale: id })
                            : typeof editingRecord.dueDate === "string"
                              ? format(new Date(editingRecord.dueDate), "PPP", { locale: id })
                              : editingRecord.dueDate instanceof Date
                                ? format(editingRecord.dueDate, "PPP", { locale: id })
                                : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            editingRecord.dueDate &&
                            typeof editingRecord.dueDate === "object" &&
                            "toDate" in editingRecord.dueDate
                              ? editingRecord.dueDate.toDate()
                              : typeof editingRecord.dueDate === "string"
                                ? new Date(editingRecord.dueDate)
                                : editingRecord.dueDate instanceof Date
                                  ? editingRecord.dueDate
                                  : undefined
                          }
                          onSelect={(date) =>
                            date && setEditingRecord((prev) => (prev ? { ...prev, dueDate: date } : null))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex justify-between space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        setIsEditDrawerOpen(false)
                        confirmDelete(editingRecord.id)
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
                Apakah Anda yakin ingin menghapus {activeTab === "debt" ? "hutang" : "piutang"} ini? Tindakan ini tidak
                dapat dibatalkan.
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

        {/* Pay Drawer */}
        <Drawer open={isPayDrawerOpen} onOpenChange={setIsPayDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Konfirmasi Pelunasan</DrawerTitle>
              <DrawerDescription>
                Apakah Anda yakin ingin menandai {activeTab === "debt" ? "hutang" : "piutang"} ini sebagai lunas?
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="flex-row justify-end space-x-2">
              <DrawerClose asChild>
                <Button variant="outline">Batal</Button>
              </DrawerClose>
              <Button onClick={markAsPaid}>{activeTab === "debt" ? "Lunasi Hutang" : "Terima Pembayaran"}</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <BottomNav />
      </MobileContainer>
    </AuthCheck>
  )
}
