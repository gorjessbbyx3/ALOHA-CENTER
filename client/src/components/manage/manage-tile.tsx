import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Settings, Plus, Edit, Trash, 
  ClipboardList, Grid, UserPlus, 
  DoorOpen, Store, CalendarPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Service, Room } from "@shared/schema";

export const ManageTile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("services");
  const { toast } = useToast();
  
  // Fetch services data
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  
  // Fetch rooms data
  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const handleAction = (action: string, item?: any) => {
    toast({
      title: `${action} action`,
      description: `The ${action} action would be executed here in a production app.`,
    });
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-lg col-span-1 md:col-span-1 cursor-pointer flex items-center h-44 md:h-48 hover:opacity-90 transition-opacity">
            <div className="p-6 flex flex-col w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-white">Management</h3>
                <Settings className="text-white" size={36} />
              </div>
              <p className="text-white/90 mb-2">Configure and manage clinic settings</p>
              <div className="mt-auto flex justify-between">
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white"
                  size="sm"
                >
                  Manage
                </Button>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-white/80">Configurations</span>
                  <span className="text-xl font-semibold text-white">8</span>
                </div>
              </div>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Clinic Management</DialogTitle>
            <DialogDescription>
              Configure and manage various aspects of your clinic
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 h-[calc(80vh-120px)]">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="services">
                  <Store className="h-4 w-4 mr-2" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="rooms">
                  <DoorOpen className="h-4 w-4 mr-2" />
                  Rooms
                </TabsTrigger>
                <TabsTrigger value="staff">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Staff
                </TabsTrigger>
                <TabsTrigger value="schedule">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="general">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              {/* Services Tab */}
              <TabsContent value="services" className="h-full flex-1 flex flex-col">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Services Management</h3>
                  <Button size="sm" onClick={() => handleAction("add-service")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 border rounded-md p-4">
                  <div className="space-y-3">
                    {services.map((service) => (
                      <Card key={service.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-muted-foreground">${parseFloat(service.price).toFixed(2)} - {service.duration} mins</p>
                              <p className="text-xs text-muted-foreground mt-1">{service.description || "No description"}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => handleAction("edit", service)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction("delete", service)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {services.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40">
                        <ClipboardList className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No services available</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => handleAction("add-service")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Service
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {/* Rooms Tab */}
              <TabsContent value="rooms" className="h-full flex-1 flex flex-col">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Treatment Rooms</h3>
                  <Button size="sm" onClick={() => handleAction("add-room")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 border rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rooms.map((room) => (
                      <Card key={room.id} className={`overflow-hidden ${!room.isActive ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{room.name}</h4>
                                {room.isActive ? (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Inactive</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{room.description || "No description"}</p>
                              {room.capacity && (
                                <p className="text-xs text-muted-foreground mt-1">Capacity: {room.capacity}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => handleAction("edit", room)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-destructive" 
                                onClick={() => handleAction(room.isActive ? "deactivate" : "activate", room)}
                              >
                                {room.isActive ? (
                                  <Trash className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {rooms.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 col-span-2">
                        <DoorOpen className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No rooms available</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => handleAction("add-room")}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Room
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {/* Staff Tab */}
              <TabsContent value="staff" className="h-full flex-1 flex flex-col">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Staff Management</h3>
                  <Button size="sm" onClick={() => handleAction("add-staff")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
                
                <div className="flex-1 border rounded-md p-4 flex items-center justify-center">
                  <div className="text-center">
                    <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Staff Management</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Add, edit, and manage staff members, their schedules, and permissions.
                    </p>
                    <Button onClick={() => handleAction("setup-staff")}>
                      Set Up Staff Management
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Schedule Tab */}
              <TabsContent value="schedule" className="h-full flex-1 flex flex-col">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Business Hours</h3>
                  <Button size="sm" onClick={() => handleAction("edit-schedule")}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Hours
                  </Button>
                </div>
                
                <div className="flex-1 border rounded-md p-4 flex items-center justify-center">
                  <div className="text-center">
                    <CalendarPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Business Hours Management</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Set your clinic's regular business hours, holidays, and special operating hours.
                    </p>
                    <Button onClick={() => handleAction("configure-hours")}>
                      Configure Business Hours
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* General Settings Tab */}
              <TabsContent value="general" className="h-full flex-1 flex flex-col">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">General Settings</h3>
                  <Button size="sm" onClick={() => handleAction("save-settings")}>
                    Save Changes
                  </Button>
                </div>
                
                <div className="flex-1 border rounded-md p-4 flex items-center justify-center">
                  <div className="text-center">
                    <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Clinic Settings</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Configure your clinic's details, branding, notification preferences, and more.
                    </p>
                    <Button onClick={() => handleAction("configure-clinic")}>
                      Configure Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};