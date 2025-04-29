import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, Plus, Tags, Edit, Trash, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@shared/schema";

export const MenuTile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { toast } = useToast();
  
  // Form state for creating/editing services
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "30",
    price: ""
  });

  // Get services 
  const { data: services = [], isLoading, error, refetch } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    throwOnError: false,
  });

  const handleOpenEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      duration: service.duration.toString(),
      price: service.price
    });
    setIsEditing(true);
  };

  const handleOpenNewForm = () => {
    setSelectedService(null);
    setFormData({
      name: "",
      description: "",
      duration: "30",
      price: ""
    });
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price) {
      toast({
        title: "Missing information",
        description: "Please provide name and price for the service.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: selectedService ? "Service updated" : "Service added",
      description: `The service has been ${selectedService ? "updated" : "added"} successfully.`,
    });
    
    setIsEditing(false);
    // In a real app, we would call API here to save the service
  };

  // Group services by category (in this case we're using rough price ranges)
  const categorizedServices = {
    premium: services.filter(s => parseFloat(s.price) >= 100),
    standard: services.filter(s => parseFloat(s.price) >= 50 && parseFloat(s.price) < 100),
    basic: services.filter(s => parseFloat(s.price) < 50)
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg col-span-1 md:col-span-2 cursor-pointer flex items-center h-44 md:h-48 hover:opacity-90 transition-opacity">
            <div className="p-6 flex flex-col w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-white">Services Menu</h3>
                <Menu className="text-white" size={36} />
              </div>
              <p className="text-white/90 mb-2">Manage service offerings</p>
              <div className="mt-auto flex justify-between">
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white"
                  size="sm"
                >
                  View Menu
                </Button>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-white/80">Available services</span>
                  <span className="text-xl font-semibold text-white">{services.length}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Services Menu</DialogTitle>
            <DialogDescription>
              View, add, and manage service offerings for your clinic
            </DialogDescription>
          </DialogHeader>
          
          {isEditing ? (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-4">
                {selectedService ? "Edit Service" : "Add New Service"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Haircut, Massage, Consultation" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the service..." 
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input 
                        id="duration" 
                        name="duration" 
                        type="number" 
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="5"
                        step="5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input 
                        id="price" 
                        name="price" 
                        type="text" 
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g., 29.99" 
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedService ? "Update Service" : "Add Service"}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          ) : (
            <div className="flex flex-col-reverse md:flex-row gap-4 h-[calc(100vh-200px)]">
              <Tabs defaultValue="all" className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="all">All Services</TabsTrigger>
                    <TabsTrigger value="premium">Premium</TabsTrigger>
                    <TabsTrigger value="standard">Standard</TabsTrigger>
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                  </TabsList>
                  
                  <Button onClick={handleOpenNewForm} size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Add Service
                  </Button>
                </div>
                
                <TabsContent value="all" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {services.map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          onEdit={handleOpenEdit}
                        />
                      ))}
                      {services.length === 0 && (
                        <div className="text-center p-8 border border-dashed rounded-md">
                          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No services available</p>
                          <Button 
                            onClick={handleOpenNewForm} 
                            variant="secondary" 
                            className="mt-4"
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add Your First Service
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="premium" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {categorizedServices.premium.map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          onEdit={handleOpenEdit}
                        />
                      ))}
                      {categorizedServices.premium.length === 0 && (
                        <div className="text-center p-8 border border-dashed rounded-md">
                          <p className="text-muted-foreground">No premium services available</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="standard" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {categorizedServices.standard.map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          onEdit={handleOpenEdit}
                        />
                      ))}
                      {categorizedServices.standard.length === 0 && (
                        <div className="text-center p-8 border border-dashed rounded-md">
                          <p className="text-muted-foreground">No standard services available</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="basic" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {categorizedServices.basic.map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          onEdit={handleOpenEdit}
                        />
                      ))}
                      {categorizedServices.basic.length === 0 && (
                        <div className="text-center p-8 border border-dashed rounded-md">
                          <p className="text-muted-foreground">No basic services available</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
}

const ServiceCard = ({ service, onEdit }: ServiceCardProps) => {
  const price = parseFloat(service.price);
  let category = "Basic";
  let badgeVariant = "secondary";
  
  if (price >= 100) {
    category = "Premium";
    badgeVariant = "default";
  } else if (price >= 50) {
    category = "Standard";
    badgeVariant = "outline";
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{service.name}</h3>
              <Badge variant={badgeVariant as any}>{category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {service.description || "No description available"}
            </p>
            <div className="flex items-center gap-6 mt-2">
              <span className="text-sm flex items-center">
                <ClipboardList className="h-4 w-4 mr-1 text-muted-foreground" />
                {service.duration} minutes
              </span>
              <span className="font-medium">${parseFloat(service.price).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(service)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};