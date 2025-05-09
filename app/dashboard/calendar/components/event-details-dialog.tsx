/**
 * Event Details Dialog component for viewing, editing, and deleting calendar events.
 * Displays event details and provides options to update or remove events.
 * Handles both AI-generated and manually created events.
 */
"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Trash2 } from "lucide-react"
import { useCalendarStore, CalendarEvent } from "@/store/calendar-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { cn } from "@/lib/utils"
import * as z from "zod"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface EventDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent
}

const colorOptions = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
]

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  startDate: z.date({ required_error: "A date is required" }),
  color: z.string().optional(),
})

export function EventDetailsDialog({
  open,
  onOpenChange,
  event,
}: EventDetailsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const { updateEvent, deleteEvent } = useCalendarStore()
  
  // Initialize form with the event data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate),
      color: event.color || "blue",
    },
  })
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!event.id) {
      toast({
        title: "Error",
        description: "Event ID is missing",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await updateEvent(event.id, {
        title: values.title,
        description: values.description,
        startDate: values.startDate.toISOString(),
        color: values.color,
      })
      
      toast({
        title: "Event updated",
        description: "Your content calendar event has been updated",
      })
      
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    if (!event.id) return
    
    setIsSubmitting(true)
    
    try {
      await deleteEvent(event.id)
      
      toast({
        title: "Event deleted",
        description: "Your content calendar event has been deleted",
      })
      
      onOpenChange(false)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEdit = () => {
    setIsEditing(true)
  }
  
  const handleCancel = () => {
    setIsEditing(false)
    form.reset({
      title: event.title,
      description: event.description,
      startDate: new Date(event.startDate),
      color: event.color || "blue",
    })
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Event Details</span>
              <Badge 
                variant={event.source === 'ai' ? 'secondary' : 'default'}
                className="capitalize"
              >
                {event.source}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              View and manage your content calendar event.
            </DialogDescription>
          </DialogHeader>
          
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Video title or content name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the content" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <div className="flex items-center gap-2">
                              <div className={cn("h-4 w-4 rounded-full", 
                                colorOptions.find(c => c.value === field.value)?.class || "bg-blue-500"
                              )} />
                              <SelectValue placeholder="Select a color" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className={cn("h-4 w-4 rounded-full", color.class)} />
                                <span>{color.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                  <p className="mt-1 text-lg">{event.title}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <div className="mt-2">
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-a:text-primary">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Override components to apply appropriate styles
                          p: ({node, ...props}) => <p className="my-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2" {...props} />,
                          li: ({node, ...props}) => <li className="my-1" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-bold my-2" {...props} />,
                          a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />
                        }}
                      >
                        {event.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <p className="mt-1">{format(new Date(event.startDate), "PPP")}</p>
                </div>
                
                {event.color && (
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Color</h3>
                    <div className={cn("h-4 w-4 rounded-full", 
                      colorOptions.find(c => c.value === event.color)?.class || "bg-blue-500"
                    )} />
                    <p className="capitalize">{event.color}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <p className="mt-1 text-sm">{format(new Date(event.createdAt), "PPP p")}</p>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                  <Button onClick={handleEdit}>
                    Edit
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this event
              from your calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}