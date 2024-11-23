import * as React from "react"

const Select = React.forwardRef(({ children, value, onValueChange, ...props }, ref) => (
  <div className="relative" ref={ref}>
    <select
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  </div>
))
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ children, placeholder, ...props }, ref) => (
  <span ref={ref} {...props}>
    {children || placeholder}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ children, value, ...props }, ref) => (
  <option value={value} ref={ref} {...props}>
    {children}
  </option>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }