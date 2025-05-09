import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { MapPin, Plus } from "lucide-react";
import { LocationForm } from "@/components/location/location-form";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Location state management
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: "Main Clinic",
      address: "123 Healing Way, Honolulu, HI 96815",
      phone: "(808) 555-1234",
      isActive: true
    },
    {
      id: 2,
      name: "Waikiki Branch",
      address: "456 Beach Avenue, Honolulu, HI 96815",
      phone: "(808) 555-5678",
      isActive: true
    }
  ]);

  const toggleLocationStatus = (location) => {
    const updatedLocations = locations.map(loc => {
      if (loc.id === location.id) {
        return { ...loc, isActive: !loc.isActive };
      }
      return loc;
    });
    setLocations(updatedLocations);
    
    toast({
      title: location.isActive ? "Location deactivated" : "Location activated",
      description: `${location.name} has been ${location.isActive ? "deactivated" : "activated"}.`,
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };
  
  const handleSaveGeneral = () => {
    toast({
      title: "Clinic information saved",
      description: "Your clinic information has been updated.",
    });
  };
  
  const handleSavePaymentSettings = () => {
    toast({
      title: "Payment settings saved",
      description: "Your payment settings have been updated.",
    });
  };
  
  const handleSaveStripeSetting = () => {
    toast({
      title: "Stripe API keys saved",
      description: "Your Stripe API settings have been updated.",
    });
  };
  
  return (
    <AdminLayout 
      title="Settings" 
      subtitle="Manage your clinic and application settings"
      showExportBtn={false}
    >
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>
                Update your clinic's basic information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name</Label>
                    <Input id="clinicName" defaultValue="Aloha Light Center" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" defaultValue="contact@alohalightcenter.com" />
                  </div>
                </div>

                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="https://alohalightcenter.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" defaultValue="123 Aloha Way, Honolulu, HI 96815" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessHours">Business Hours</Label>
                  <Textarea id="businessHours" defaultValue="Monday-Friday: 8:00 AM - 5:00 PM&#10;Saturday: 9:00 AM - 1:00 PM&#10;Sunday: Closed" />
                </div>
              </div>
              
              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Location Management Tab */}
        <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <div>Clinic Locations</div>
                  <Button onClick={() => setIsLocationFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage multiple clinic locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLocationsLoading ? (
                  <div className="py-4 text-center animate-pulse">Loading locations...</div>
                ) : locations?.length === 0 ? (
                  <div className="py-8 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No locations found</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first clinic location to enable multi-location scheduling.
                    </p>
                    <Button onClick={() => setIsLocationFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {locations.map((location) => (
                      <div
                        key={location.id}
                        className="py-4 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{location.name}</h3>
                            {!location.isActive && (
                              <Badge variant="outline" className="ml-2">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {location.address}
                          </p>
                          {location.phone && (
                            <p className="text-sm text-muted-foreground">
                              {location.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLocation(location);
                              setIsLocationFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={location.isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleLocationStatus(location)}
                          >
                            {location.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive appointment and payment notifications via email
                    </p>
                  </div>
                  <Switch 
                    id="emailNotifications" 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive appointment reminders via text message
                    </p>
                  </div>
                  <Switch 
                    id="smsNotifications" 
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminderTiming">Appointment Reminder Timing</Label>
                  <Select defaultValue="24h">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour before</SelectItem>
                      <SelectItem value="3h">3 hours before</SelectItem>
                      <SelectItem value="12h">12 hours before</SelectItem>
                      <SelectItem value="24h">24 hours before</SelectItem>
                      <SelectItem value="48h">48 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailTemplate">Email Template</Label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Template</SelectItem>
                      <SelectItem value="minimal">Minimal Template</SelectItem>
                      <SelectItem value="branded">Branded Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure your payment providers and options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    <h3 className="text-lg font-medium">Stripe Integration</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                      <Input id="stripePublicKey" defaultValue="pk_test_..." />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                      <Input id="stripeSecretKey" type="password" defaultValue="sk_test_..." />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="testMode">Test Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Use Stripe in test mode for development
                        </p>
                      </div>
                      <Switch id="testMode" defaultChecked />
                    </div>
                    
                    <Button onClick={handleSaveStripeSetting}>Save Stripe Settings</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD - US Dollar</SelectItem>
                      <SelectItem value="eur">EUR - Euro</SelectItem>
                      <SelectItem value="gbp">GBP - British Pound</SelectItem>
                      <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Accepted Payment Methods</Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="creditCard" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="creditCard">Credit Card</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="insurance" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="insurance">Insurance</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="cash" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="cash">Cash</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="bankTransfer" className="rounded border-gray-300" />
                      <label htmlFor="bankTransfer">Bank Transfer</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSavePaymentSettings}>Save Payment Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Settings */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage staff accounts and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Staff Accounts</h3>
                  <Button variant="outline">Add New User</Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Name</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Email</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Role</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">Dr. Sarah Chen</td>
                        <td className="py-3 px-4">sarah.chen@medibook.com</td>
                        <td className="py-3 px-4">Admin</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">Dr. James Wilson</td>
                        <td className="py-3 px-4">james.wilson@medibook.com</td>
                        <td className="py-3 px-4">Doctor</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">Maria Garcia</td>
                        <td className="py-3 px-4">maria.garcia@medibook.com</td>
                        <td className="py-3 px-4">Receptionist</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="space-y-2 pt-4">
                  <h3 className="text-lg font-medium">Role Permissions</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure access permissions for each role in the system.
                  </p>
                  
                  <div className="border rounded-md p-4 mt-2">
                    <h4 className="font-medium mb-2">Admin</h4>
                    <p className="text-sm text-gray-500 mb-2">Full access to all features and settings</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="admin-patients" className="rounded border-gray-300" defaultChecked disabled />
                        <label htmlFor="admin-patients" className="text-sm">Patient Management</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="admin-appointments" className="rounded border-gray-300" defaultChecked disabled />
                        <label htmlFor="admin-appointments" className="text-sm">Appointment Management</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="admin-payments" className="rounded border-gray-300" defaultChecked disabled />
                        <label htmlFor="admin-payments" className="text-sm">Payment Management</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="admin-settings" className="rounded border-gray-300" defaultChecked disabled />
                        <label htmlFor="admin-settings" className="text-sm">System Settings</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
    
    {/* Location Form Modal */}
    {isLocationFormOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedLocation ? "Edit Location" : "Add New Location"}
            </h2>
            <LocationForm
              initialData={selectedLocation}
              onSubmit={(data) => {
                if (selectedLocation) {
                  // Update existing location
                  setLocations(prevLocations => 
                    prevLocations.map(loc => 
                      loc.id === selectedLocation.id ? { ...data, id: selectedLocation.id } : loc
                    )
                  );
                  toast({
                    title: "Location updated",
                    description: `${data.name} has been updated successfully.`,
                  });
                } else {
                  // Add new location
                  setLocations(prevLocations => [
                    ...prevLocations, 
                    { ...data, id: Date.now(), isActive: true }
                  ]);
                  toast({
                    title: "Location added",
                    description: `${data.name} has been added successfully.`,
                  });
                }
                setIsLocationFormOpen(false);
                setSelectedLocation(null);
              }}
              onCancel={() => {
                setIsLocationFormOpen(false);
                setSelectedLocation(null);
              }}
            />
          </div>
        </div>
      </div>
    )}
  );
}
