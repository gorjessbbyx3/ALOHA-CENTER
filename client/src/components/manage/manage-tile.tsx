import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Settings, Plus, Edit, Trash, 
  ClipboardList, Grid, UserPlus, 
  DoorOpen, Store, CalendarPlus,
  Palette, Type, LayoutGrid, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Service, Room } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const ManageTile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("services");
  const { toast } = useToast();
  
  // Welcome text and dashboard options state
  const [welcomeText, setWelcomeText] = useState("Welcome back, Dr. Sarah Chen");
  const [dashboardTitle, setDashboardTitle] = useState("Welcome to Your Clinic Dashboard");
  
  // Dashboard display options
  const [showAppointmentTile, setShowAppointmentTile] = useState(true);
  const [showPosTile, setShowPosTile] = useState(true);
  const [showMenuTile, setShowMenuTile] = useState(true);
  const [showUpcomingAppointments, setShowUpcomingAppointments] = useState(true);
  const [showAnalyticsTile, setShowAnalyticsTile] = useState(true);
  const [showStickyNotes, setShowStickyNotes] = useState(true);
  const [showTimeClockTile, setShowTimeClockTile] = useState(true);
  const [showDateTimeTile, setShowDateTimeTile] = useState(true);
  
  // Fetch services data
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  
  // Fetch rooms data
  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const handleAction = (action: string, item?: any) => {
    // Handle welcome text and dashboard options saving
    if (action === "save-appearance") {
      // In a real app, this would be saved to the database
      // For now, we'll just show a toast message
      toast({
        title: "Appearance settings saved",
        description: "Your dashboard appearance preferences have been updated.",
      });
      
      // In a real implementation, we would update this in a global state or context
      // so that other components can access the updated values
      window.localStorage.setItem('welcomeText', welcomeText);
      window.localStorage.setItem('dashboardTitle', dashboardTitle);
      window.localStorage.setItem('dashboardOptions', JSON.stringify({
        showAppointmentTile,
        showPosTile,
        showMenuTile,
        showUpcomingAppointments,
        showAnalyticsTile,
        showStickyNotes,
        showTimeClockTile,
        showDateTimeTile
      }));
      
      // We're not closing the dialog in this case to let users continue editing
    } else {
      toast({
        title: `${action} action`,
        description: `The ${action} action would be executed here in a production app.`,
      });
      setIsOpen(false);
    }
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
              <TabsList className="grid grid-cols-6 mb-4">
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
                <TabsTrigger value="appearance">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
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
                  <h3 className="text-lg font-medium">Staff & User Management</h3>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAction("add-staff")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Staff
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsCreateUserOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">System Users</h3>
                        <div className="space-y-4 mt-4 text-left">
                          <div className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                            <div>
                              <p className="font-medium">webmaster808</p>
                              <p className="text-sm text-muted-foreground">Dr. Sarah Chen (Admin)</p>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                            <div>
                              <p className="font-medium">reception</p>
                              <p className="text-sm text-muted-foreground">Front Desk (Receptionist)</p>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                            <div>
                              <p className="font-medium">technician1</p>
                              <p className="text-sm text-muted-foreground">John Smith (Technician)</p>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button className="mt-4" size="sm" variant="outline" onClick={() => setIsCreateUserOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add New User
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">Staff Management</h3>
                        <p className="text-muted-foreground mb-4">
                          Manage staff members, schedules, and availability.
                        </p>
                        <div className="flex justify-center">
                          <Button onClick={() => handleAction("setup-staff")}>
                            Set Up Staff Management
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* User Permissions Section */}
                <div className="flex-1">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">User Permissions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Appointments</h4>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 text-xs rounded-full mr-2">Admin</span>
                              <span className="text-sm">Create, Edit, Delete</span>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded-full mr-2">Reception</span>
                              <span className="text-sm">Create, Edit</span>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 text-xs rounded-full mr-2">Tech</span>
                              <span className="text-sm">View only</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Patients</h4>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 text-xs rounded-full mr-2">Admin</span>
                              <span className="text-sm">Full Access</span>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded-full mr-2">Reception</span>
                              <span className="text-sm">Create, View, Edit</span>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 text-xs rounded-full mr-2">Tech</span>
                              <span className="text-sm">View Basic Info</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Billing</h4>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 text-xs rounded-full mr-2">Admin</span>
                              <span className="text-sm">Full Access</span>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded-full mr-2">Reception</span>
                              <span className="text-sm">Process Payments</span>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 text-xs rounded-full mr-2">Tech</span>
                              <span className="text-sm">No Access</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button className="mt-4" variant="outline" onClick={() => handleAction("manage-permissions")}>
                        Manage Role Permissions
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Create User Dialog */}
                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>
                        Add a new user to the system with specific permissions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
                        <Input
                          id="username"
                          placeholder="Enter username"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter full name"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Set password"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <div className="col-span-3">
                          <select 
                            id="role"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a role</option>
                            <option value="admin">Administrator</option>
                            <option value="doctor">Doctor/Provider</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="technician">Technician</option>
                            <option value="billing">Billing Staff</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mt-2">
                        <h4 className="text-sm font-medium">Permissions</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="perm-appointments"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor="perm-appointments"
                              className="text-sm font-medium leading-none"
                            >
                              Manage Appointments
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="perm-patients"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor="perm-patients"
                              className="text-sm font-medium leading-none"
                            >
                              Manage Patients
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="perm-billing"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor="perm-billing"
                              className="text-sm font-medium leading-none"
                            >
                              Access Billing
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="perm-reports"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor="perm-reports"
                              className="text-sm font-medium leading-none"
                            >
                              View Reports
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="perm-services"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor="perm-services"
                              className="text-sm font-medium leading-none"
                            >
                              Manage Services
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="perm-system"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor="perm-system"
                              className="text-sm font-medium leading-none"
                            >
                              System Settings
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" onClick={() => {
                        toast({
                          title: "User created",
                          description: "New user has been added to the system.",
                        });
                        setIsCreateUserOpen(false);
                      }}>
                        Create User
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
              
              {/* Appearance Tab */}
              <TabsContent value="appearance" className="h-full flex-1 flex flex-col">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Dashboard Appearance</h3>
                  <Button size="sm" onClick={() => handleAction("save-appearance")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 border rounded-md p-5">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-base font-medium flex items-center">
                        <Type className="h-4 w-4 mr-2" />
                        Text Customization
                      </h4>
                      <Separator />
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dashboardTitle">Dashboard Title</Label>
                          <Input 
                            id="dashboardTitle" 
                            value={dashboardTitle}
                            onChange={(e) => setDashboardTitle(e.target.value)}
                            placeholder="Enter dashboard title"
                          />
                          <p className="text-xs text-muted-foreground">This appears at the top of the dashboard.</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="welcomeText">Welcome Message</Label>
                          <Input 
                            id="welcomeText" 
                            value={welcomeText}
                            onChange={(e) => setWelcomeText(e.target.value)}
                            placeholder="Enter welcome message"
                          />
                          <p className="text-xs text-muted-foreground">This appears beneath the dashboard title.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <h4 className="text-base font-medium flex items-center">
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Dashboard Tiles Display
                      </h4>
                      <Separator />
                      
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="showAppointmentTile">Appointment Book Tile</Label>
                            <p className="text-xs text-muted-foreground">Links to the main appointment calendar.</p>
                          </div>
                          <Switch 
                            id="showAppointmentTile" 
                            checked={showAppointmentTile}
                            onCheckedChange={setShowAppointmentTile}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="showPosTile">Point of Sale (POS) Tile</Label>
                            <p className="text-xs text-muted-foreground">For handling payments and transactions.</p>
                          </div>
                          <Switch 
                            id="showPosTile" 
                            checked={showPosTile}
                            onCheckedChange={setShowPosTile}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="showMenuTile">Services Menu Tile</Label>
                            <p className="text-xs text-muted-foreground">Displays available services.</p>
                          </div>
                          <Switch 
                            id="showMenuTile" 
                            checked={showMenuTile}
                            onCheckedChange={setShowMenuTile}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="showUpcomingAppointments">Upcoming Appointments Tile</Label>
                            <p className="text-xs text-muted-foreground">Shows the next appointments scheduled.</p>
                          </div>
                          <Switch 
                            id="showUpcomingAppointments" 
                            checked={showUpcomingAppointments}
                            onCheckedChange={setShowUpcomingAppointments}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="showAnalyticsTile">Analytics Tile</Label>
                            <p className="text-xs text-muted-foreground">Displays key performance metrics.</p>
                          </div>
                          <Switch 
                            id="showAnalyticsTile" 
                            checked={showAnalyticsTile}
                            onCheckedChange={setShowAnalyticsTile}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="showStickyNotes">Sticky Notes Tile</Label>
                            <p className="text-xs text-muted-foreground">For quick reminders and notes.</p>
                          </div>
                          <Switch 
                            id="showStickyNotes" 
                            checked={showStickyNotes}
                            onCheckedChange={setShowStickyNotes}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="showTimeClockTile">Time Clock Tile</Label>
                            <p className="text-xs text-muted-foreground">For staff check-in and time tracking.</p>
                          </div>
                          <Switch 
                            id="showTimeClockTile" 
                            checked={showTimeClockTile}
                            onCheckedChange={setShowTimeClockTile}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="showDateTimeTile">Date & Time Tile</Label>
                            <p className="text-xs text-muted-foreground">Displays current date and time.</p>
                          </div>
                          <Switch 
                            id="showDateTimeTile" 
                            checked={showDateTimeTile}
                            onCheckedChange={setShowDateTimeTile}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
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