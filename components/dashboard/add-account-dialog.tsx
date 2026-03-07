'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    domain: string
    industry?: string
    employee_count?: string
    notes?: string
  }) => Promise<void>
}

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Media',
  'Education',
  'Real Estate',
  'Transportation',
  'Energy',
  'Other'
]

const EMPLOYEE_COUNTS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10000+'
]

export function AddAccountDialog({ open, onOpenChange, onSubmit }: AddAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    employee_count: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.domain.trim()) return
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
        domain: formData.domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''),
        industry: formData.industry || undefined,
        employee_count: formData.employee_count || undefined,
        notes: formData.notes.trim() || undefined
      })
      setFormData({ name: '', domain: '', industry: '', employee_count: '', notes: '' })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>
            Add a new account to your book of business for signal monitoring.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              placeholder="Acme Corp"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="domain">Domain *</Label>
            <Input
              id="domain"
              placeholder="acme.com"
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employee_count">Employees</Label>
              <Select 
                value={formData.employee_count} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, employee_count: value }))}
              >
                <SelectTrigger id="employee_count">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_COUNTS.map((count) => (
                    <SelectItem key={count} value={count}>
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any relevant context about this account..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name || !formData.domain}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Adding...
                </>
              ) : (
                'Add Account'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
