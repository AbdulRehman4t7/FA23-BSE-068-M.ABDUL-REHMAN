"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  labelMap: Record<string, string>;
  registerLabel: (value: string, label: string) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
  triggerRef: { current: null },
  labelMap: {},
  registerLabel: () => {},
})

const Select = ({ children, onValueChange, defaultValue, value }: { children: React.ReactNode, onValueChange?: (val: string) => void, defaultValue?: string, value?: string }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value || "")
  const [isOpen, setIsOpen] = React.useState(false)
  const [labelMap, setLabelMap] = React.useState<Record<string, string>>({})
  
  const resolvedValue = value ?? internalValue

  const handleValueChange = (val: string) => {
    setInternalValue(val)
    if (onValueChange) {
      onValueChange(val)
    }
  }

  const registerLabel = React.useCallback((val: string, label: string) => {
    setLabelMap(prev => {
      if (prev[val] === label) return prev
      return { ...prev, [val]: label }
    })
  }, [])

  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node) && !(event.target as Element).closest(".select-content-wrapper")) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  return (
    <SelectContext.Provider value={{ value: resolvedValue, onValueChange: handleValueChange, isOpen, setIsOpen, triggerRef, labelMap, registerLabel }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  return (
    <button
      ref={context.triggerRef}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => context.setIsOpen(!context.isOpen)}
      {...props}
    >
      <div className="flex flex-1 items-center">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && typeof child.type !== 'string' && (child.type as any).displayName === 'SelectValue') {
            return child
          }
          if (React.isValidElement(child) && !child.props.children) {
             return React.cloneElement(child as React.ReactElement<any>, { value: context.value })
          }
          return child
        })}
      </div>
      <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, value }: { placeholder?: string, value?: string }) => {
  const context = React.useContext(SelectContext)
  const currentVal = value || context.value
  const displayValue = currentVal && context.labelMap[currentVal] ? context.labelMap[currentVal] : placeholder
  return <span className="truncate block w-full text-left flex-1">{displayValue || "Select an option"}</span>
}
SelectValue.displayName = "SelectValue"

const SelectContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const context = React.useContext(SelectContext)
  // We need to render children to get the labels even if closed, to avoid blinking placeholder initially, but that might be heavy or block UI. Let's just always render children but hidden.
  
  return (
    <div className={cn("absolute z-[9999] min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md top-[calc(100%+4px)] select-content-wrapper", className, !context.isOpen && "hidden")}>
      <div className="max-h-[300px] overflow-auto py-1 bg-background">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
             return React.cloneElement(child as React.ReactElement<any>, { onSelect: () => context.setIsOpen(false) })
          }
          return child
        })}
      </div>
    </div>
  )
}

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string, onSelect?: () => void }>(({ className, children, value, onSelect, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const isSelected = context.value === value

  // Register label
  React.useEffect(() => {
    if (typeof children === "string") {
      context.registerLabel(value, children)
    } else if (Array.isArray(children)) {
      context.registerLabel(value, children.join(''))
    }
  }, [value, children, context])

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent/50 text-accent-foreground font-medium",
        className
      )}
      onClick={() => {
        if (context.onValueChange) context.onValueChange(value)
        if (onSelect) onSelect()
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <span className="h-2 w-2 rounded-full bg-current" />}
      </span>
      <span className="relative z-10 block truncate">{children}</span>
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
