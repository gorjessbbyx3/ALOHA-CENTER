import React, { useState } from "react";
import { HelpCircle, Book, X, ChevronRight, FileText, Coffee, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

export function HelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("quick-start");

  const filteredHelpContent = helpContent.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <HelpCircle className="mr-2 h-5 w-5" />
            Help & Documentation
          </DialogTitle>
          <DialogDescription>
            Learn how to use the Aloha Healing Center management system.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search help topics..."
            className="pl-8 mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery ? (
          <ScrollArea className="flex-1 pr-4">
            {filteredHelpContent.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Search Results</h3>
                <Accordion type="single" collapsible className="w-full">
                  {filteredHelpContent.map((item, index) => (
                    <AccordionItem key={index} value={`search-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-primary" />
                          {item.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">No results found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  We couldn't find any help topics matching "{searchQuery}". Try a different search term or browse the categories.
                </p>
              </div>
            )}
          </ScrollArea>
        ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="quick-start">
                <Coffee className="h-4 w-4 mr-2" />
                Quick Start
              </TabsTrigger>
              <TabsTrigger value="features">
                <ChevronRight className="h-4 w-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="user-guide">
                <Book className="h-4 w-4 mr-2" />
                User Guide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick-start" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="prose prose-sm max-w-none">
                  <h2>Getting Started with Aloha Healing Center</h2>
                  
                  <h3>Dashboard Overview</h3>
                  <p>The dashboard is your central hub for managing all aspects of your clinic. Here's a quick overview of each tile:</p>
                  
                  <ul>
                    <li><strong>Appointment Book</strong> - Schedule and manage patient appointments</li>
                    <li><strong>Management</strong> - Configure system settings, services, rooms, and staff</li>
                    <li><strong>POS (Point of Sale)</strong> - Process payments and transactions</li>
                    <li><strong>Services Menu</strong> - View and manage service offerings</li>
                    <li><strong>Upcoming Appointments</strong> - See today's scheduled appointments</li>
                    <li><strong>Analytics</strong> - View business performance metrics</li>
                    <li><strong>Sticky Notes</strong> - Quick notes and reminders</li>
                    <li><strong>Date & Time</strong> - Current date and time display</li>
                  </ul>
                  
                  <h3>Common Tasks</h3>
                  
                  <h4>Creating a New Appointment</h4>
                  <ol>
                    <li>Click the "+ New Appointment" button in the top right</li>
                    <li>Select a patient (or create a new one)</li>
                    <li>Choose the service type</li>
                    <li>Select date, time, and room</li>
                    <li>Add any notes</li>
                    <li>Click "Save" to create the appointment</li>
                  </ol>
                  
                  <h4>Adding a New Patient</h4>
                  <ol>
                    <li>Navigate to "Patients" in the main menu</li>
                    <li>Click "+ New Patient"</li>
                    <li>Fill in patient information</li>
                    <li>Click "Save" to create the patient record</li>
                  </ol>
                  
                  <h4>Processing a Payment</h4>
                  <ol>
                    <li>Click the "POS" tile on the dashboard</li>
                    <li>Select a patient</li>
                    <li>Add services or products</li>
                    <li>Select payment method</li>
                    <li>Complete the transaction</li>
                  </ol>
                  
                  <h3>Need More Help?</h3>
                  <p>For more detailed instructions, please refer to the User Guide tab or check the full documentation in the USER_GUIDE.md file.</p>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="features" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="dashboard">
                      <AccordionTrigger className="text-left">Dashboard Features</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Customizable dashboard layout</li>
                          <li>Interactive analytics tiles</li>
                          <li>Quick access to all system functions</li>
                          <li>Real-time appointment updates</li>
                          <li>Sticky notes for reminders</li>
                          <li>Today's appointment list</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="appointments">
                      <AccordionTrigger className="text-left">Appointment Management</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Drag-and-drop scheduling</li>
                          <li>Calendar views (day, week, month)</li>
                          <li>Room-based scheduling</li>
                          <li>Appointment reminders and confirmations</li>
                          <li>Patient check-in system</li>
                          <li>Recurring appointment setup</li>
                          <li>Context menu for quick actions</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="patients">
                      <AccordionTrigger className="text-left">Patient Management</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Comprehensive patient profiles</li>
                          <li>Medical history tracking</li>
                          <li>Treatment notes and documentation</li>
                          <li>Appointment history</li>
                          <li>Payment records</li>
                          <li>Document uploads and management</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="payments">
                      <AccordionTrigger className="text-left">Payment Processing</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Integrated Stripe payment processing</li>
                          <li>Multiple payment methods</li>
                          <li>Invoice generation</li>
                          <li>Receipt printing and emailing</li>
                          <li>Payment history and reporting</li>
                          <li>Refund processing</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="services">
                      <AccordionTrigger className="text-left">Services Management</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Categorized service listings</li>
                          <li>Pricing and duration management</li>
                          <li>Service descriptions</li>
                          <li>Service availability settings</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="rooms">
                      <AccordionTrigger className="text-left">Room Management</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Treatment room configuration</li>
                          <li>Room availability tracking</li>
                          <li>Room-specific appointment scheduling</li>
                          <li>Equipment and feature documentation</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="staff">
                      <AccordionTrigger className="text-left">Staff Management</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>User account management</li>
                          <li>Role-based permissions</li>
                          <li>Staff scheduling</li>
                          <li>Performance tracking</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="reporting">
                      <AccordionTrigger className="text-left">Reporting & Analytics</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Financial reports</li>
                          <li>Appointment statistics</li>
                          <li>Patient demographics</li>
                          <li>Revenue analysis</li>
                          <li>Staff productivity metrics</li>
                          <li>Exportable reports (PDF, CSV)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="user-guide" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="prose prose-sm max-w-none">
                  <h2>User Guide</h2>
                  <p>For the complete, detailed user guide, please refer to the USER_GUIDE.md file included with the application.</p>
                  
                  <h3>Key Sections of the User Guide:</h3>
                  <ul>
                    <li>Getting Started</li>
                    <li>Dashboard Overview</li>
                    <li>Appointment Management</li>
                    <li>Patient Management</li>
                    <li>Services Menu</li>
                    <li>Payment Processing (POS)</li>
                    <li>Rooms Management</li>
                    <li>Staff Management</li>
                    <li>Analytics and Reporting</li>
                    <li>System Settings</li>
                    <li>Tips and Tricks</li>
                  </ul>
                  
                  <p>Each section provides detailed instructions and screenshots to help you navigate and use the system effectively.</p>
                  
                  <h3>Quick Tips for New Users</h3>
                  
                  <h4>Navigation</h4>
                  <p>Use the dashboard tiles for quick access to key features. The main menu provides access to all system functions.</p>
                  
                  <h4>Keyboard Shortcuts</h4>
                  <ul>
                    <li><strong>Ctrl+N</strong> - New appointment</li>
                    <li><strong>Ctrl+P</strong> - New patient</li>
                    <li><strong>Ctrl+F</strong> - Search</li>
                    <li><strong>Ctrl+S</strong> - Save current form</li>
                    <li><strong>Esc</strong> - Close current dialog</li>
                  </ul>
                  
                  <h4>Getting Support</h4>
                  <p>If you need additional assistance:</p>
                  <ul>
                    <li>Email: support@alohahealingcenter.com</li>
                    <li>Phone: (555) 123-4567</li>
                  </ul>
                  
                  <h3>Documentation Files</h3>
                  <p>The following documentation files are available in the application directory:</p>
                  <ul>
                    <li><strong>README.md</strong> - General information and setup instructions</li>
                    <li><strong>USER_GUIDE.md</strong> - Comprehensive user manual</li>
                    <li><strong>QUICK_REFERENCE.md</strong> - Quick reference for common tasks</li>
                    <li><strong>WINDOWS_SETUP.md</strong> - Detailed Windows application setup guide</li>
                  </ul>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="flex items-center justify-between border-t pt-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Aloha Healing Center - Management System v1.0
          </div>
          <Button onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Sample help content
const helpContent = [
  {
    title: "Dashboard Overview",
    content: `
      <h3>Dashboard Overview</h3>
      <p>The dashboard is your central hub for clinic operations, providing quick access to all system features.</p>
      <p>Key tiles include:</p>
      <ul>
        <li><strong>Appointment Book</strong> - Schedule and manage appointments</li>
        <li><strong>Management</strong> - Configure system settings</li>
        <li><strong>POS (Point of Sale)</strong> - Process payments</li>
        <li><strong>Services Menu</strong> - View service offerings</li>
        <li><strong>Upcoming Appointments</strong> - Today's schedule</li>
        <li><strong>Analytics</strong> - Business performance metrics</li>
        <li><strong>Sticky Notes</strong> - Quick notes and reminders</li>
        <li><strong>Date & Time</strong> - Current date and time</li>
      </ul>
    `,
  },
  {
    title: "Scheduling Appointments",
    content: `
      <h3>Scheduling Appointments</h3>
      <p>To schedule a new appointment:</p>
      <ol>
        <li>Click the "+ New Appointment" button</li>
        <li>Select a patient (or create a new one)</li>
        <li>Choose the service type</li>
        <li>Select date, time, and room</li>
        <li>Add any notes</li>
        <li>Click "Save" to create the appointment</li>
      </ol>
      <p>You can also drag and drop existing appointments to reschedule them.</p>
    `,
  },
  {
    title: "Patient Management",
    content: `
      <h3>Patient Management</h3>
      <p>The patient management system helps you maintain comprehensive patient records.</p>
      <p>To add a new patient:</p>
      <ol>
        <li>Click the "+ New Patient" button</li>
        <li>Complete the patient information form</li>
        <li>Click "Save" to create the record</li>
      </ol>
      <p>Patient profiles include personal information, appointment history, treatment notes, payment history, and documents.</p>
    `,
  },
  {
    title: "Processing Payments",
    content: `
      <h3>Processing Payments</h3>
      <p>To process a payment:</p>
      <ol>
        <li>Click the "POS" tile on the dashboard</li>
        <li>Select a patient</li>
        <li>Add services or products to the cart</li>
        <li>Apply any discounts</li>
        <li>Select payment method</li>
        <li>Complete the transaction</li>
        <li>Print or email receipt</li>
      </ol>
    `,
  },
  {
    title: "Room Management",
    content: `
      <h3>Room Management</h3>
      <p>To manage treatment rooms:</p>
      <ol>
        <li>Click the Management tile</li>
        <li>Select the "Rooms" tab</li>
        <li>View, add, or edit rooms</li>
      </ol>
      <p>You can set room details like name, description, capacity, and active status.</p>
    `,
  },
  {
    title: "Staff and User Management",
    content: `
      <h3>Staff and User Management</h3>
      <p>To manage staff accounts:</p>
      <ol>
        <li>Click the Management tile</li>
        <li>Select the "Staff" tab</li>
        <li>Add new users or edit existing ones</li>
        <li>Set permissions and access levels</li>
      </ol>
      <p>Available permission levels include Administrator, Provider, Front Desk, and Billing.</p>
    `,
  },
  {
    title: "Using the Services Menu",
    content: `
      <h3>Using the Services Menu</h3>
      <p>The Services Menu allows you to view and manage all treatments offered by your clinic.</p>
      <p>To access services:</p>
      <ol>
        <li>Click the Services Menu tile on the dashboard</li>
        <li>Browse services organized by category</li>
        <li>Search for specific services using the search bar</li>
      </ol>
      <p>To manage services, use the Management tile and select the Services tab.</p>
    `,
  },
  {
    title: "Reports and Analytics",
    content: `
      <h3>Reports and Analytics</h3>
      <p>To generate reports:</p>
      <ol>
        <li>Click on "Reports" in the main navigation</li>
        <li>Select report type</li>
        <li>Set date range and filters</li>
        <li>Click "Generate Report"</li>
        <li>View on screen or export (PDF, CSV)</li>
      </ol>
      <p>The Analytics tile on the dashboard shows key business metrics like appointments, revenue, and patient statistics.</p>
    `,
  },
];