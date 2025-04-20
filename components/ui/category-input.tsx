"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CategoryInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  categories: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CategoryInput({
  categories,
  value,
  onChange,
  placeholder = "Kategori",
  className,
  ...props
}: CategoryInputProps) {
  const [filteredCategories, setFilteredCategories] = React.useState<string[]>([])

  React.useEffect(() => {
    if (value) {
      const filtered = categories.filter((category) => category.toLowerCase().includes(value.toLowerCase()))
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [value, categories])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const selectCategory = (category: string) => {
    onChange(category)
  }

  return (
    <div className="space-y-2">
      <Input value={value} onChange={handleInputChange} placeholder={placeholder} className={className} {...props} />
      <div className="flex flex-wrap gap-2">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <Badge
              key={category}
              variant={value === category ? "default" : "outline"}
              className={cn(
                "cursor-pointer hover:bg-primary hover:text-primary-foreground",
                value === category && "bg-primary text-primary-foreground",
              )}
              onClick={() => selectCategory(category)}
            >
              {category}
            </Badge>
          ))
        ) : categories.length > 0 && value ? (
          <span className="text-xs text-muted-foreground">Tidak ada kategori yang cocok</span>
        ) : categories.length === 0 ? (
          <span className="text-xs text-muted-foreground">Belum ada kategori</span>
        ) : null}
      </div>
    </div>
  )
}
