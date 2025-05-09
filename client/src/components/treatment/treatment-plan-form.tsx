
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  patientId: z.number(),
  name: z.string().min(1, "Treatment plan name is required"),
  description: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  status: z.string().default("active"),
  goals: z.string().optional(),
  notes: z.string().optional(),
  progress: z.string().optional(),
});

type TreatmentPlanFormValues = z.infer<typeof formSchema>;

type TreatmentPlanFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  initialData?: any;
};

export function TreatmentPlanForm({
  open,
  onOpenChange,
  patientId,
  initialData,
}: TreatmentPlanFormProps) {
  const queryClient = useQueryClient();
  const [goals, setGoals] = useState<string[]>(
    initialData?.goals ? JSON.parse(initialData.goals) : []
  );
  const [newGoal, setNewGoal] = useState("");

  const form = useForm<TreatmentPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId,
      name: initialData?.name || "",
      description: initialData?.description || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      status: initialData?.status || "active",
      goals: initialData?.goals || "",
      notes: initialData?.notes || "",
      progress: initialData?.progress || "",
    },
  });

  const treatmentPlanMutation = useMutation({
    mutationFn: async (values: TreatmentPlanFormValues) => {
      // Format the goals as a JSON string
      values.goals = JSON.stringify(goals);

      const url = initialData
        ? `/api/treatment-plans/${initialData.id}`
        : "/api/treatment-plans";
      const method = initialData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to save treatment plan");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: initialData ? "Treatment plan updated" : "Treatment plan created",
        description: initialData
          ? "The treatment plan has been updated successfully."
          : "A new treatment plan has been created.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: [`/api/patients/${patientId}/treatment-plans`] 
      });
      
      // Close the dialog
      onOpenChange(false);
      
      // Reset form
      form.reset();
      setGoals([]);
      setNewGoal("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const handleRemoveGoal = (index: number) => {
    const updatedGoals = [...goals];
    updatedGoals.splice(index, 1);
    setGoals(updatedGoals);
  };

  const onSubmit = (values: TreatmentPlanFormValues) => {
    treatmentPlanMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Treatment Plan" : "Create Treatment Plan"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Pain Management Plan" {...field} />
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
                      placeholder="Comprehensive plan to address chronic back pain"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
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
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
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
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Goals</FormLabel>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a treatment goal"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGoal();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddGoal}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 mt-2">
                {goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted p-3 rounded-md"
                  >
                    <span>{goal}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveGoal(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about the treatment plan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes on patient progress"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={treatmentPlanMutation.isPending}>
                {treatmentPlanMutation.isPending ? "Saving..." : "Save Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface TreatmentPackageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  onPlanCreated?: () => void;
}

export function TreatmentPackageForm({ 
  open, 
  onOpenChange, 
  patientId,
  onPlanCreated
}: TreatmentPackageFormProps) {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const form = useForm({
    defaultValues: {
      patientId,
      packageId: null as number | null,
      startDate: new Date(),
      endDate: null as Date | null,
      notes: "",
    }
  });
  
  // Fetch treatment packages
  useEffect(() => {
    if (open) {
      const fetchPackages = async () => {
        try {
          const response = await fetch('/api/treatment-packages');
          const data = await response.json();
          setPackages(data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching treatment packages:", error);
          setLoading(false);
        }
      };
      
      fetchPackages();
    }
  }, [open]);
  
  // When package is selected, calculate end date based on duration
  useEffect(() => {
    if (selectedPackage) {
      const startDate = form.getValues('startDate') || new Date();
      let endDate: Date | null = null;
      
      // Parse the duration (e.g., "4 weeks (2x per week)")
      if (selectedPackage.duration) {
        const weekMatch = selectedPackage.duration.match(/(\d+)\s*weeks?/i);
        if (weekMatch && weekMatch[1]) {
          const weeks = parseInt(weekMatch[1]);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + (weeks * 7));
        }
      }
      
      form.setValue('endDate', endDate);
      
      // Set the name based on the package display name
      form.setValue('name', selectedPackage.displayName);
      
      // Set description from package focus
      form.setValue('description', selectedPackage.focus || '');
      
      // Set goals from package idealFor
      if (selectedPackage.idealFor) {
        form.setValue('goals', JSON.stringify([selectedPackage.idealFor]));
      }
    }
  }, [selectedPackage, form]);
  
  const createTreatmentPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/treatment-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create treatment plan');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Treatment Plan Created",
        description: "The treatment plan has been created successfully."
      });
      onOpenChange(false);
      onPlanCreated?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create treatment plan: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: any) => {
    // Create the treatment plan with package info
    const treatmentPlanData = {
      ...data,
      patientId: parseInt(data.patientId.toString()),
      packageId: data.packageId ? parseInt(data.packageId.toString()) : null,
      totalSessions: selectedPackage?.sessionCount || null,
      sessionsCompleted: 0,
      status: "active",
    };
    
    createTreatmentPlanMutation.mutate(treatmentPlanData);
  };
  
  // Group packages by category
  const groupedPackages = useMemo(() => {
    if (!packages.length) return {};
    
    return packages.reduce((acc: any, pkg: any) => {
      const category = pkg.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(pkg);
      return acc;
    }, {});
  }, [packages]);
  
  const displayCategory = (category: string) => {
    // Convert snake_case to Title Case
    const words = category.split('_');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Treatment Package</DialogTitle>
          <DialogDescription>
            Choose a treatment package for this patient to create a structured treatment plan.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading packages...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem hidden>
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Treatment Packages</h3>
                
                {Object.keys(groupedPackages).length === 0 ? (
                  <div className="text-center py-6 border rounded-lg">
                    <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Treatment Packages</h3>
                    <p className="text-muted-foreground">
                      No treatment packages are currently available.
                    </p>
                  </div>
                ) : (
                  <Tabs defaultValue={Object.keys(groupedPackages)[0]}>
                    <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
                      {Object.keys(groupedPackages).map((category) => (
                        <TabsTrigger key={category} value={category} className="px-3 py-1.5">
                          {displayCategory(category)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {Object.keys(groupedPackages).map((category) => (
                      <TabsContent key={category} value={category} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedPackages[category].map((pkg: any) => (
                            <Card 
                              key={pkg.id} 
                              className={`cursor-pointer transition-all ${
                                selectedPackage?.id === pkg.id ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => {
                                setSelectedPackage(pkg);
                                form.setValue('packageId', pkg.id);
                              }}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex justify-between items-center">
                                  {pkg.displayName}
                                  {pkg.totalCost && (
                                    <Badge className="text-sm">${pkg.totalCost}</Badge>
                                  )}
                                </CardTitle>
                                <CardDescription>{pkg.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="pb-4 space-y-2">
                                {pkg.focus && (
                                  <div className="text-sm">
                                    <span className="font-medium">Focus:</span> {pkg.focus}
                                  </div>
                                )}
                                {pkg.duration && (
                                  <div className="text-sm">
                                    <span className="font-medium">Duration:</span> {pkg.duration}
                                  </div>
                                )}
                                {pkg.sessionType && (
                                  <div className="text-sm">
                                    <span className="font-medium">Session Type:</span> {pkg.sessionType}
                                  </div>
                                )}
                                {pkg.bonuses && (
                                  <div className="text-sm">
                                    <span className="font-medium">Bonus:</span> {pkg.bonuses}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </div>
              
              {selectedPackage && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Plan Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Treatment Plan Name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="packageId"
                      render={({ field }) => (
                        <FormItem hidden>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="hidden" 
                              value={field.value || ''} 
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full pl-3 text-left font-normal"
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
                                onSelect={(date) => {
                                  field.onChange(date);
                                  // Recalculate end date if selected package has duration
                                  if (selectedPackage && selectedPackage.duration && date) {
                                    const weekMatch = selectedPackage.duration.match(/(\d+)\s*weeks?/i);
                                    if (weekMatch && weekMatch[1]) {
                                      const weeks = parseInt(weekMatch[1]);
                                      const endDate = new Date(date);
                                      endDate.setDate(endDate.getDate() + (weeks * 7));
                                      form.setValue('endDate', endDate);
                                    }
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full pl-3 text-left font-normal"
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
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Description of the treatment plan"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Any additional notes for this treatment plan"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!selectedPackage || createTreatmentPlanMutation.isPending}
                >
                  {createTreatmentPlanMutation.isPending ? "Creating..." : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
