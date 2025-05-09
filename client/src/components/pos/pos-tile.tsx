import { useState, useEffect } from "react";
import { Check, ShoppingCart, Plus, Minus, Search, User, Box, Tag, CreditCard, Sparkles, Clock, DollarSign, Percent, X, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types for our data
type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string | null;
  duration?: number;
};

type Customer = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description?: string;
};

type CheckoutStage = "cart" | "payment" | "receipt";

export const PosTile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [discount, setDiscount] = useState(0);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [tip, setTip] = useState(0);
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>("cart");
  const [paymentMethod, setPaymentMethod] = useState<string>("credit");
  const [isTipPercentage, setIsTipPercentage] = useState(true);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch products from API
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError
  } = useQuery<Product[]>({ 
    queryKey: ['/api/pos/products'],
    queryFn: async () => {
      const res = await fetch('/api/pos/products');
      if (!res.ok) throw new Error('Failed to load products');
      return res.json();
    }
  });
  
  // Fetch customers from API
  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    error: customersError
  } = useQuery<Customer[]>({ 
    queryKey: ['/api/pos/customers'],
    queryFn: async () => {
      const res = await fetch('/api/pos/customers');
      if (!res.ok) throw new Error('Failed to load customers');
      return res.json();
    }
  });
  
  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async ({ amount, items, customerId }: { amount: number, items: CartItem[], customerId?: number }) => {
      const res = await apiRequest("POST", "/api/pos/create-payment-intent", {
        amount,
        items,
        customerId,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setPaymentIntentId(data.paymentIntentId);
      // In a real Stripe integration, we would use the clientSecret to confirm payment
      // For this simulation, we'll just proceed to the next step
      setCheckoutStage("receipt");
    },
    onError: (error: Error) => {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async ({ 
      paymentIntentId, 
      customerId, 
      amount, 
      items, 
      paymentMethod 
    }: { 
      paymentIntentId?: string, 
      customerId?: number, 
      amount: number, 
      items: CartItem[], 
      paymentMethod: string 
    }) => {
      const res = await apiRequest("POST", "/api/pos/record-payment", {
        paymentIntentId,
        customerId,
        amount,
        items,
        paymentMethod,
        status: "completed"
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment recorded",
        description: `Your transaction of $${getFinalTotal().toFixed(2)} has been completed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record payment",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map((item) => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };
  
  const decreaseQuantity = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      
      if (existingItem && existingItem.quantity === 1) {
        return prevCart.filter((item) => item.id !== productId);
      }
      
      return prevCart.map((item) => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      );
    });
  };
  
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const getDiscountAmount = () => {
    if (!applyDiscount) return 0;
    return getCartTotal() * (discount / 100);
  };
  
  const getTipAmount = () => {
    if (isTipPercentage) {
      return getCartTotal() * (tip / 100);
    }
    return tip;
  };
  
  const calculateTax = () => {
    return (getCartTotal() - getDiscountAmount()) * 0.08; // Assuming 8% tax
  };
  
  const getFinalTotal = () => {
    return getCartTotal() - getDiscountAmount() + calculateTax() + getTipAmount();
  };
  
  const handleCheckout = () => {
    if (checkoutStage === "cart") {
      setCheckoutStage("payment");
      return;
    }
    
    if (checkoutStage === "payment") {
      // Process payment via Stripe in a real implementation
      // For this version, we'll just create a payment intent via our API
      createPaymentIntentMutation.mutate({
        amount: getFinalTotal(),
        items: cart,
        customerId: selectedCustomer || undefined
      });
      return;
    }
    
    // If we're at the receipt stage, record the payment and reset
    if (checkoutStage === "receipt") {
      recordPaymentMutation.mutate({
        paymentIntentId: paymentIntentId || undefined,
        customerId: selectedCustomer || undefined,
        amount: getFinalTotal(),
        items: cart,
        paymentMethod
      });
      
      // Reset everything when done
      setCart([]);
      setSearchQuery("");
      setSelectedCustomer(null);
      setDiscount(0);
      setApplyDiscount(false);
      setTip(0);
      setCheckoutStage("cart");
      setPaymentMethod("credit");
      setPaymentIntentId(null);
      setIsOpen(false);
    }
  };
  
  const handleBack = () => {
    if (checkoutStage === "payment") {
      setCheckoutStage("cart");
    } else if (checkoutStage === "receipt") {
      setCheckoutStage("payment");
    }
  };
  
  const handleTipChange = (amount: number) => {
    setTip(amount);
  };
  
  const getSelectedCustomer = () => {
    if (!selectedCustomer) return null;
    return customers.find(c => c.id === selectedCustomer) || null;
  };
  
  const renderActionButton = () => {
    const isLoading = createPaymentIntentMutation.isPending || recordPaymentMutation.isPending;
    
    switch (checkoutStage) {
      case "cart":
        return (
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Proceed to Payment
          </Button>
        );
        
      case "payment":
        return (
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Check className="mr-2 h-5 w-5" />
            )}
            {isLoading ? "Processing..." : "Complete Sale"}
          </Button>
        );
        
      case "receipt":
        return (
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCheckout}
            variant="default"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Check className="mr-2 h-5 w-5" />
            )}
            {isLoading ? "Recording payment..." : "Done"}
          </Button>
        );
    }
  };
  
  const renderMainContent = () => {
    switch (checkoutStage) {
      case "cart":
        return (
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center mb-4 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products & services..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select 
                value={selectedCustomer?.toString() || ""} 
                onValueChange={(value) => setSelectedCustomer(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No customer</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isLoadingProducts ? (
              <div className="flex items-center justify-center h-[430px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : productsError ? (
              <div className="flex flex-col items-center justify-center h-[430px] text-center p-4">
                <X className="h-10 w-10 text-destructive mb-2" />
                <p className="text-destructive font-medium">Error loading products</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please try again later
                </p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start mb-4">
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  <TabsTrigger value="service">Services</TabsTrigger>
                  <TabsTrigger value="product">Products</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  <ScrollArea className="h-[430px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredProducts.map((product) => (
                        <Card 
                          key={product.id} 
                          className="cursor-pointer hover:bg-accent/10 transition-colors"
                          onClick={() => addToCart(product)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between mb-1">
                              <Badge variant={product.category === "service" ? "secondary" : "outline"}>
                                {product.category === "service" ? "Service" : "Product"}
                              </Badge>
                              <span className="font-bold text-primary">${product.price}</span>
                            </div>
                            <CardTitle className="text-base">{product.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 py-2">
                            <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                          </CardContent>
                          <CardFooter className="p-4 pt-2 flex justify-end">
                            <Button size="sm" variant="ghost" className="h-8 px-2">
                              <Plus className="h-4 w-4" /> Add
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="service" className="mt-0">
                  <ScrollArea className="h-[430px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredProducts
                        .filter((p) => p.category === "service")
                        .map((product) => (
                          <Card 
                            key={product.id} 
                            className="cursor-pointer hover:bg-accent/10 transition-colors"
                            onClick={() => addToCart(product)}
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between mb-1">
                                <Badge variant="secondary">Service</Badge>
                                <span className="font-bold text-primary">${product.price}</span>
                              </div>
                              <CardTitle className="text-base">{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 py-2">
                              <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-2 flex justify-end">
                              <Button size="sm" variant="ghost" className="h-8 px-2">
                                <Plus className="h-4 w-4" /> Add
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="product" className="mt-0">
                  <ScrollArea className="h-[430px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredProducts
                        .filter((p) => p.category === "product")
                        .map((product) => (
                          <Card 
                            key={product.id} 
                            className="cursor-pointer hover:bg-accent/10 transition-colors"
                            onClick={() => addToCart(product)}
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between mb-1">
                                <Badge variant="outline">Product</Badge>
                                <span className="font-bold text-primary">${product.price}</span>
                              </div>
                              <CardTitle className="text-base">{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 py-2">
                              <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-2 flex justify-end">
                              <Button size="sm" variant="ghost" className="h-8 px-2">
                                <Plus className="h-4 w-4" /> Add
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </div>
        );
        
      case "payment":
        return (
          <div className="flex-1 overflow-hidden">
            <div className="bg-muted/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Customer Information</h3>
              </div>
              
              {getSelectedCustomer() ? (
                <div className="flex items-center gap-3 p-3 bg-background rounded-md">
                  <Avatar>
                    <AvatarFallback>{getSelectedCustomer()?.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getSelectedCustomer()?.name}</p>
                    <p className="text-sm text-muted-foreground">{getSelectedCustomer()?.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelectedCustomer(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No customer selected. Sale will be processed as a guest.
                </div>
              )}
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Payment Method</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant={paymentMethod === "credit" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("credit")}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                >
                  <CreditCard className="h-6 w-6" />
                  <span>Credit Card</span>
                </Button>
                
                <Button 
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                >
                  <DollarSign className="h-6 w-6" />
                  <span>Cash</span>
                </Button>
                
                <Button 
                  variant={paymentMethod === "gift" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("gift")}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                >
                  <Tag className="h-6 w-6" />
                  <span>Gift Card</span>
                </Button>
                
                <Button 
                  variant={paymentMethod === "other" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("other")}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                >
                  <Box className="h-6 w-6" />
                  <span>Other</span>
                </Button>
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Additional Options</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="applyDiscount">Apply Discount</Label>
                    <p className="text-xs text-muted-foreground">Add a percentage discount to the total</p>
                  </div>
                  <Switch 
                    id="applyDiscount"
                    checked={applyDiscount}
                    onCheckedChange={setApplyDiscount}
                  />
                </div>
                
                {applyDiscount && (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">%</span>
                    <span className="ml-auto text-sm text-muted-foreground">
                      -${getDiscountAmount().toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="pt-3 border-t">
                  <Label>Add Tip</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button 
                      variant={tip === 15 && isTipPercentage ? "default" : "outline"} 
                      size="sm"
                      onClick={() => { setTip(15); setIsTipPercentage(true); }}
                      className="flex-1"
                    >
                      15%
                    </Button>
                    <Button 
                      variant={tip === 18 && isTipPercentage ? "default" : "outline"} 
                      size="sm"
                      onClick={() => { setTip(18); setIsTipPercentage(true); }}
                      className="flex-1"
                    >
                      18%
                    </Button>
                    <Button 
                      variant={tip === 20 && isTipPercentage ? "default" : "outline"} 
                      size="sm"
                      onClick={() => { setTip(20); setIsTipPercentage(true); }}
                      className="flex-1"
                    >
                      20%
                    </Button>
                    <div className="flex items-center gap-1 flex-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        value={isTipPercentage ? getTipAmount().toFixed(2) : tip}
                        onChange={(e) => { setTip(parseFloat(e.target.value) || 0); setIsTipPercentage(false); }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case "receipt":
        return (
          <div className="flex-1 overflow-hidden">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-green-800">Payment Successful</h2>
              <p className="text-green-600">Your transaction has been processed.</p>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Transaction Details</h3>
                </div>
                <Button variant="outline" size="sm">
                  Print Receipt
                </Button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium">{paymentIntentId || `TX-${Date.now().toString().substring(5, 13)}`}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">
                    {getSelectedCustomer()?.name || "Guest"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                </div>
                {applyDiscount && discount > 0 && (
                  <div className="flex justify-between py-1 border-b text-green-600">
                    <span>Discount ({discount}%):</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Tax (8%):</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                {tip > 0 && (
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Tip:</span>
                    <span className="font-medium">${getTipAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total:</span>
                  <span>${getFinalTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 mt-6 text-center">
              <p className="text-muted-foreground">Thank you for your business!</p>
              {getSelectedCustomer()?.email && (
                <Button variant="outline" size="sm">
                  Email Receipt to {getSelectedCustomer()?.email}
                </Button>
              )}
            </div>
          </div>
        );
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild id="pos-dialog-trigger">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg cursor-pointer flex items-center h-full hover:shadow-lg transition-shadow">
            <div className="p-6 flex flex-col w-full text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">Point of Sale</h3>
                <ShoppingCart size={36} />
              </div>
              <p className="text-white/90 mb-4">Process payments & sell products</p>
              <div className="mt-auto flex justify-between items-center">
                <Button 
                  variant="outline" 
                  className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
                >
                  Open POS
                </Button>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-white/80">Products in stock</span>
                  <span className="text-xl font-semibold text-white">{products.length}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] flex flex-col p-0 gap-0 rounded-xl overflow-hidden border-none shadow-2xl">
          <div className="bg-primary-900 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Point of Sale</h2>
                <p className="text-primary-200 text-sm">
                  {checkoutStage === "cart" && "Add items to cart"}
                  {checkoutStage === "payment" && "Payment details"}
                  {checkoutStage === "receipt" && "Transaction complete"}
                </p>
              </div>
              
              {checkoutStage !== "cart" && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  onClick={handleBack}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              )}
              
              {checkoutStage === "cart" && cart.length > 0 && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  onClick={clearCart}
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row h-[calc(95vh-140px)] bg-background">
            {/* Main Content Area */}
            {renderMainContent()}
            
            {/* Cart Section */}
            <div className="w-full md:w-[320px] flex flex-col border-l">
              <div className="p-4 bg-muted/30 border-b font-medium flex items-center justify-between">
                <span>Cart Summary</span>
                <Badge variant="outline" className="whitespace-nowrap">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </Badge>
              </div>
              
              <ScrollArea className="flex-1 p-3">
                {cart.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Add items by clicking on products or services
                    </p>
                  </div>
                )}
                
                {cart.map((item) => (
                  <div key={item.id} className="mb-3 p-3 border rounded-lg bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <Badge variant={item.category === "service" ? "secondary" : "outline"} className="mt-1">
                          {item.category === "service" ? "Service" : "Product"}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm">${item.price.toFixed(2)} × {item.quantity}</div>
                      <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              
              <div className="border-t p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                
                {applyDiscount && discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discount}%):</span>
                    <span>-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                
                {tip > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tip:</span>
                    <span>${getTipAmount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="pt-2 mt-2 border-t flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${getFinalTotal().toFixed(2)}</span>
                </div>
                
                <div className="pt-4">
                  {renderActionButton()}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};