import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Store, Search, Tag, Filter, ArrowUpDown, Scissors } from "lucide-react";
import { Service } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const MenuTile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch services data
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  
  const filteredServices = services.filter((service) => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group services by type (we'll use a simple approach here since category isn't in the schema)
  const groupedServices: Record<string, Service[]> = {};
  
  // Helper function to guess a category from the service name or set a default
  const getCategoryFromService = (service: Service): string => {
    const name = service.name.toLowerCase();
    if (name.includes('consult') || name.includes('exam')) return 'Consultations';
    if (name.includes('therapy') || name.includes('treatment')) return 'Treatments';
    if (name.includes('massage')) return 'Massage';
    if (name.includes('facial')) return 'Facials';
    // Default category based on price range
    const price = parseFloat(service.price);
    if (price < 50) return 'Basic Services';
    if (price >= 100) return 'Premium Services';
    return 'General Services';
  };
  
  filteredServices.forEach((service) => {
    const category = getCategoryFromService(service);
    if (!groupedServices[category]) {
      groupedServices[category] = [];
    }
    groupedServices[category].push(service);
  });
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg col-span-1 md:col-span-1 cursor-pointer flex items-center h-44 md:h-48 hover:opacity-90 transition-opacity">
            <div className="p-6 flex flex-col w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-white">Services Menu</h3>
                <Store className="text-white" size={36} />
              </div>
              <p className="text-white/90 mb-2">View and manage service offerings</p>
              <div className="mt-auto flex justify-between">
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white"
                  size="sm"
                >
                  View Menu
                </Button>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-white/80">Services</span>
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
              Browse and search through all services offered by the clinic
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-2 my-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="h-[calc(80vh-180px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Store className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No services found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchQuery ? "Try a different search term or clear the search" : "No services have been added yet"}
                </p>
              </div>
            ) : (
              <Table>
                <TableCaption>All services offered by the clinic</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedServices).map(([category, services]) => (
                    <React.Fragment key={category}>
                      <TableRow>
                        <TableCell colSpan={3} className="bg-muted/30">
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium">{category}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="flex flex-col">
                            <div className="flex items-center">
                              <Scissors className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="font-medium">{service.name}</span>
                            </div>
                            {service.description && (
                              <span className="text-xs text-muted-foreground mt-1 ml-6">
                                {service.description}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{service.duration} mins</TableCell>
                          <TableCell className="text-right">${parseFloat(service.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};