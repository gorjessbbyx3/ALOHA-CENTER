import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Payment, Patient } from "@shared/schema";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Payments() {
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("50.00"); // Default amount
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  
  // Fetch payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["/api/payments?appointmentId=all"],
    select: (data: Payment[]) => data,
  });
  
  // Fetch patients to join with payments
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
    select: (data: Patient[]) => data,
  });
  
  // Get selected payment details
  const selectedPayment = payments.find(p => p.id === selectedPaymentId);
  
  // Get patient for a payment
  const getPatientName = (patientId: number | null) => {
    if (!patientId) return "Unknown Patient";
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : "Unknown Patient";
  };
  
  // Analytics data preparation
  const getWeeklyPaymentData = () => {
    const today = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Initialize with zero values
    const weeklyData = daysOfWeek.map(day => ({ name: day, amount: 0 }));
    
    // Populate from actual data
    payments.forEach(payment => {
      if (payment.date) {
        const paymentDate = new Date(payment.date);
        const dayIndex = paymentDate.getDay();
        weeklyData[dayIndex].amount += Number(payment.amount);
      }
    });
    
    return weeklyData;
  };
  
  const getPaymentMethodData = () => {
    const methodCounts: Record<string, number> = {};
    
    payments.forEach(payment => {
      const method = payment.paymentMethod;
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    
    return Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
  };
  
  const paymentMethodColors = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b"];
  
  const handleViewPayment = (id: number) => {
    setSelectedPaymentId(id);
  };
  
  const handleClosePaymentDetails = () => {
    setSelectedPaymentId(null);
  };
  
  const handleOpenPaymentForm = () => {
    setShowPaymentForm(true);
  };
  
  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
  };
  
  const handleProcessPayment = () => {
    // Create a test patient and appointment if none exist
    if (patients.length === 0) {
      alert("Please create a patient first before processing a payment.");
      return;
    }
    
    // Use the first patient and appointment as an example
    const testPatientId = patients[0]?.id || 1;
    const testAppointmentId = 1; // Example appointment ID
    
    setSelectedPatientId(testPatientId);
    setSelectedAppointmentId(testAppointmentId);
    handleOpenPaymentForm();
  };
  
  const handleStripeCheckout = () => {
    if (!selectedPatientId || !selectedAppointmentId) {
      alert("Missing patient or appointment information.");
      return;
    }
    
    // Convert dollars to cents for Stripe
    const amountInCents = Math.round(parseFloat(paymentAmount) * 100);
    
    // Redirect to checkout page with query parameters
    window.location.href = `/checkout?amount=${amountInCents}&patientId=${selectedPatientId}&appointmentId=${selectedAppointmentId}`;
  };
  
  return (
    <AdminLayout 
      title="Payments" 
      subtitle="Track and manage patient payments"
      showExportBtn={true}
      onExport={() => alert("This would export payment data in a production environment")}
    >
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getWeeklyPaymentData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Amount']}
                />
                <Legend />
                <Bar dataKey="amount" name="Amount" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPaymentMethodData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPaymentMethodData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={paymentMethodColors[index % paymentMethodColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Payments</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="text-center py-4">Loading payments...</div>
              ) : payments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No payments found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium text-gray-500">ID</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Patient</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Amount</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Method</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Date</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-500">#{payment.id}</td>
                          <td className="py-3 px-4 font-medium">{getPatientName(payment.patientId)}</td>
                          <td className="py-3 px-4 font-medium">${Number(payment.amount).toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm capitalize">{payment.paymentMethod}</td>
                          <td className="py-3 px-4 text-sm">{payment.date ? format(new Date(payment.date), "MMM d, yyyy") : "N/A"}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              className={cn(
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              )}
                              variant="outline"
                            >
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" onClick={() => handleViewPayment(payment.id)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              {isLoading ? (
                <div className="text-center py-4">Loading payments...</div>
              ) : payments.filter(p => p.status === 'pending').length === 0 ? (
                <div className="text-center py-4 text-gray-500">No pending payments</div>
              ) : (
                <div className="space-y-4">
                  {payments
                    .filter(p => p.status === 'pending')
                    .map(payment => (
                      <div key={payment.id} className="border rounded-md p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{getPatientName(payment.patientId)}</p>
                          <p className="text-sm text-gray-500">
                            ${Number(payment.amount).toFixed(2)} • {format(new Date(payment.date), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Process</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleViewPayment(payment.id)}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {isLoading ? (
                <div className="text-center py-4">Loading payments...</div>
              ) : payments.filter(p => p.status === 'completed').length === 0 ? (
                <div className="text-center py-4 text-gray-500">No completed payments</div>
              ) : (
                <div className="space-y-4">
                  {payments
                    .filter(p => p.status === 'completed')
                    .map(payment => (
                      <div key={payment.id} className="border rounded-md p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{getPatientName(payment.patientId)}</p>
                          <p className="text-sm text-gray-500">
                            ${Number(payment.amount).toFixed(2)} • {format(new Date(payment.date), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleViewPayment(payment.id)}>
                          View
                        </Button>
                      </div>
                    ))
                  }
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={handleClosePaymentDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Transaction ID: {selectedPayment.transactionId || `#${selectedPayment.id}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p className="text-sm text-gray-900">{getPatientName(selectedPayment.patientId)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-sm font-medium text-primary-600">${Number(selectedPayment.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm text-gray-900">{format(new Date(selectedPayment.date), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge 
                    className={cn(
                      selectedPayment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedPayment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}
                    variant="outline"
                  >
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Appointment ID</p>
                  <p className="text-sm text-gray-900">#{selectedPayment.appointmentId}</p>
                </div>
                
                {selectedPayment.stripePaymentIntentId && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Stripe Payment ID</p>
                    <p className="text-sm text-gray-900">{selectedPayment.stripePaymentIntentId}</p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClosePaymentDetails}>Close</Button>
              {selectedPayment.status === 'completed' && (
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Receipt
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add "Process Payment" Button */}
      <div className="fixed bottom-8 right-8">
        <Button 
          size="lg" 
          className="shadow-lg"
          onClick={handleProcessPayment}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Process Payment
        </Button>
      </div>
      
      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={handleClosePaymentForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Process Payment with Stripe</DialogTitle>
            <DialogDescription>
              Enter payment details to proceed to Stripe checkout.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount ($)</Label>
              <Input
                id="amount"
                type="number" 
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Patient</Label>
              <p className="text-sm text-gray-700">{getPatientName(selectedPatientId || 0)}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePaymentForm}>Cancel</Button>
            <Button onClick={handleStripeCheckout}>
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
