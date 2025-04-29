import { useState } from "react";
import { Check, ShoppingCart, Plus, Minus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Sample product data - in a real app, this would come from an API
const sampleProducts = [
  { id: 1, name: "Haircut", price: 45, category: "service" },
  { id: 2, name: "Color", price: 85, category: "service" },
  { id: 3, name: "Styling", price: 35, category: "service" },
  { id: 4, name: "Shampoo Bottle", price: 18, category: "product" },
  { id: 5, name: "Conditioner", price: 22, category: "product" },
  { id: 6, name: "Styling Gel", price: 15, category: "product" },
  { id: 7, name: "Hair Spray", price: 12, category: "product" },
  { id: 8, name: "Hair Mask", price: 25, category: "product" },
];

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
};

export const PosTile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  const addToCart = (product: typeof sampleProducts[0]) => {
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
  
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleCheckout = () => {
    toast({
      title: "Checkout completed",
      description: `Processed payment of $${getCartTotal().toFixed(2)} for ${cart.length} items.`
    });
    setCart([]);
    setIsOpen(false);
  };
  
  const calculateTax = () => {
    return getCartTotal() * 0.08; // Assuming 8% tax
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="bg-secondary rounded-lg col-span-1 md:col-span-2 cursor-pointer flex items-center h-44 md:h-48 hover:opacity-90 transition-opacity">
            <div className="p-6 flex flex-col w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-secondary-foreground">Point of Sale</h3>
                <ShoppingCart className="text-secondary-foreground" size={36} />
              </div>
              <p className="text-secondary-foreground/80 mb-2">Process payments & sell products</p>
              <div className="mt-auto flex justify-between">
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-secondary-foreground"
                  size="sm"
                >
                  Open POS
                </Button>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-secondary-foreground/70">Products in stock</span>
                  <span className="text-xl font-semibold text-secondary-foreground">8</span>
                </div>
              </div>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Point of Sale</DialogTitle>
            <DialogDescription>
              Process transactions and sell products to customers
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
            {/* Products Section */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="service">Services</TabsTrigger>
                  <TabsTrigger value="product">Products</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-2 gap-3">
                      {sampleProducts.map((product) => (
                        <Card 
                          key={product.id} 
                          className="cursor-pointer hover:bg-accent/10"
                          onClick={() => addToCart(product)}
                        >
                          <CardHeader className="p-4">
                            <CardTitle className="text-base">{product.name}</CardTitle>
                            <CardDescription className="flex justify-between">
                              <Badge variant="outline">{product.category}</Badge>
                              <span className="font-bold">${product.price}</span>
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="service" className="mt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-2 gap-3">
                      {sampleProducts
                        .filter(p => p.category === "service")
                        .map((product) => (
                          <Card 
                            key={product.id} 
                            className="cursor-pointer hover:bg-accent/10"
                            onClick={() => addToCart(product)}
                          >
                            <CardHeader className="p-4">
                              <CardTitle className="text-base">{product.name}</CardTitle>
                              <CardDescription className="flex justify-between">
                                <Badge variant="outline">{product.category}</Badge>
                                <span className="font-bold">${product.price}</span>
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="product" className="mt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-2 gap-3">
                      {sampleProducts
                        .filter(p => p.category === "product")
                        .map((product) => (
                          <Card 
                            key={product.id} 
                            className="cursor-pointer hover:bg-accent/10"
                            onClick={() => addToCart(product)}
                          >
                            <CardHeader className="p-4">
                              <CardTitle className="text-base">{product.name}</CardTitle>
                              <CardDescription className="flex justify-between">
                                <Badge variant="outline">{product.category}</Badge>
                                <span className="font-bold">${product.price}</span>
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Cart Section */}
            <div className="w-full md:w-[300px] flex flex-col border rounded-md overflow-hidden">
              <div className="p-3 bg-muted font-medium">
                Current Cart
              </div>
              
              <ScrollArea className="flex-1 p-3">
                {cart.length === 0 && (
                  <div className="text-center text-muted-foreground p-4">
                    Your cart is empty
                  </div>
                )}
                
                {cart.map((item) => (
                  <div key={item.id} className="mb-3 p-2 border rounded flex flex-col">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span>{item.quantity}</span>
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
                  </div>
                ))}
              </ScrollArea>
              
              <div className="border-t p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${(getCartTotal() + calculateTax()).toFixed(2)}</span>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Complete Sale
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};