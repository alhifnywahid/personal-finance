"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface ComboboxProps extends React.HTMLAttributes<HTMLDivElement> {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  (
    { className, options, value, onChange, placeholder, emptyMessage = "Tidak ada kategori ditemukan.", ...props },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState(value || "")

    React.useEffect(() => {
      setInputValue(value || "")
    }, [value])

    const handleSelect = (selectedValue: string) => {
      onChange(selectedValue)
      setOpen(false)
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("flex w-full justify-between", value ? "font-medium" : "text-muted-foreground", className)}
            {...props}
          >
            {value ? value : <>{placeholder}</>}
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput
              placeholder="Cari kategori..."
              value={inputValue}
              onValueChange={(value) => {
                setInputValue(value)
                // Don't update the actual value until selection
              }}
            />
            <CommandList>
              <CommandEmpty>
                {options.length === 0 ? (
                  "Belum ada kategori. Ketik untuk membuat baru."
                ) : (
                  <>
                    {emptyMessage}
                    {inputValue && (
                      <CommandItem
                        value={inputValue}
                        onSelect={() => handleSelect(inputValue)}
                        className="mt-2 border-t pt-2"
                      >
                        Gunakan "{inputValue}"
                        <CheckIcon className="ml-auto h-4 w-4 opacity-0" />
                      </CommandItem>
                    )}
                  </>
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option} value={option} onSelect={() => handleSelect(option)}>
                    {option}
                    <CheckIcon className={cn("ml-auto h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
                {inputValue && !options.includes(inputValue) && options.length > 0 && (
                  <CommandItem value={inputValue} onSelect={() => handleSelect(inputValue)} className="border-t">
                    Gunakan "{inputValue}"
                    <CheckIcon className="ml-auto h-4 w-4 opacity-0" />
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  },
)
Combobox.displayName = "Combobox"

export { Combobox }
