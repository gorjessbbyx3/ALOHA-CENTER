import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { Award, Coins, Gift, Check, CreditCard, Calendar, Clock, Star, User, DollarSign } from 'lucide-react';
import { Badge } from '../ui/badge';
import { api } from '../../lib/api';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';

interface LoyaltyCardProps {
  patientId: number;
  onPointsUpdated?: () => void;
}

export default function LoyaltyCard({ patientId, onPointsUpdated }: LoyaltyCardProps) {
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRedeemDialog, setOpenRedeemDialog] = useState(false);
  const [openSubscribeDialog, setOpenSubscribeDialog] = useState(false);
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('basic');
  const { toast } = useToast();

  // Fetch loyalty data
  React.useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/patients/${patientId}/loyalty`);
        setLoyaltyData(data);

        // Fetch transactions
        const transactionsData = await api.get(`/patients/${patientId}/loyalty/transactions`);
        setTransactions(transactionsData);
      } catch (error: any) {
        if (error.response?.status === 404) {
          // No loyalty account yet, that's okay
          setLoyaltyData({ points: 0, level: 'none' });
        } else {
          toast({
            title: "Error",
            description: "Failed to load loyalty data",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, [patientId, toast]);

  const handleAddPoints = async () => {
    if (!points || isNaN(Number(points))) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of points",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post(`/patients/${patientId}/loyalty/add`, {
        points: Number(points),
        type: "earned",
        source: "manual",
        description: description || "Points added manually"
      });

      toast({
        title: "Points Added",
        description: `${points} points have been added to the patient's account`,
      });

      // Refresh data
      const data = await api.get(`/patients/${patientId}/loyalty`);
      setLoyaltyData(data);

      // Refresh transactions
      const transactionsData = await api.get(`/patients/${patientId}/loyalty/transactions`);
      setTransactions(transactionsData);

      // Reset form
      setPoints('');
      setDescription('');
      setOpenAddDialog(false);

      // Notify parent component
      if (onPointsUpdated) {
        onPointsUpdated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add loyalty points",
        variant: "destructive",
      });
    }
  };

  const handleRedeemPoints = async () => {
    if (!points || isNaN(Number(points))) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of points",
        variant: "destructive",
      });
      return;
    }

    if (Number(points) > (loyaltyData?.points || 0)) {
      toast({
        title: "Insufficient Points",
        description: "Patient doesn't have enough points to redeem",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post(`/patients/${patientId}/loyalty/redeem`, {
        points: Number(points),
        description: description || "Points redeemed manually"
      });

      toast({
        title: "Points Redeemed",
        description: `${points} points have been redeemed from the patient's account`,
      });

      // Refresh data
      const data = await api.get(`/patients/${patientId}/loyalty`);
      setLoyaltyData(data);

      // Refresh transactions
      const transactionsData = await api.get(`/patients/${patientId}/loyalty/transactions`);
      setTransactions(transactionsData);

      // Reset form
      setPoints('');
      setDescription('');
      setOpenRedeemDialog(false);

      // Notify parent component
      if (onPointsUpdated) {
        onPointsUpdated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to redeem loyalty points",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async () => {
    try {
      const subscriptionData = {
        planType: subscriptionType,
        monthlyFee: subscriptionType === 'basic' ? 150 : 250,
        includedSessions: subscriptionType === 'basic' ? 3 : 4,
        includesReiki: subscriptionType === 'premium',
        includesPetAddOn: subscriptionType === 'premium',
        startDate: new Date().toISOString(),
      };

      await api.post(`/patients/${patientId}/loyalty/subscription`, subscriptionData);

      toast({
        title: "Subscription Created",
        description: `Patient has been subscribed to the ${subscriptionType} plan`,
      });

      // Refresh loyalty data to include the new subscription
      const data = await api.get(`/patients/${patientId}/loyalty`);
      setLoyaltyData(data);

      // Reset form and close dialog
      setSubscriptionType('basic');
      setOpenSubscribeDialog(false);

      // Notify parent component
      if (onPointsUpdated) {
        onPointsUpdated();
      }
    } catch (error: any) {
      if (error.response?.data?.message === "Patient already has an active subscription") {
        toast({
          title: "Subscription Error",
          description: "Patient already has an active subscription",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create subscription",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelSubscription = async () => {
    try {
      if (!loyaltyData?.subscription?.id) {
        toast({
          title: "Error",
          description: "No active subscription found",
          variant: "destructive",
        });
        return;
      }

      await api.post(`/loyalty/subscriptions/${loyaltyData.subscription.id}/cancel`, {
        reason: "Cancelled by staff"
      });

      toast({
        title: "Subscription Cancelled",
        description: "The subscription has been cancelled",
      });

      // Refresh loyalty data
      const data = await api.get(`/patients/${patientId}/loyalty`);
      setLoyaltyData(data);

      // Notify parent component
      if (onPointsUpdated) {
        onPointsUpdated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platinum':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'silver':
        return 'bg-gray-200 text-gray-800 border-gray-400';
      case 'bronze':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <Plus className="h-3 w-3 text-green-500" />;
      case 'redeemed':
        return <Minus className="h-3 w-3 text-red-500" />;
      case 'expired':
        return <Clock className="h-3 w-3 text-gray-500" />;
      case 'referral':
        return <User className="h-3 w-3 text-blue-500" />;
      case 'birthday':
        return <Gift className="h-3 w-3 text-pink-500" />;
      case 'subscription_started':
        return <CreditCard className="h-3 w-3 text-purple-500" />;
      default:
        return <Coins className="h-3 w-3 text-orange-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
          <CardDescription>Loading loyalty data...</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Loyalty Program
          </span>
          {loyaltyData?.level && loyaltyData.level !== 'none' && (
            <Badge className={`ml-2 ${getLevelColor(loyaltyData.level)}`}>
              {loyaltyData.level.charAt(0).toUpperCase() + loyaltyData.level.slice(1)}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Manage patient loyalty points & subscriptions</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <Tabs defaultValue="points">
          <TabsList className="mb-4">
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="points">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{loyaltyData?.points || 0}</div>
                  <div className="text-sm text-muted-foreground">Available Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{loyaltyData?.totalEarned || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Redemption Options</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Card className="p-3">
                    <div className="font-medium text-sm">50 points</div>
                    <div className="text-muted-foreground text-xs">$5 off next session</div>
                  </Card>
                  <Card className="p-3">
                    <div className="font-medium text-sm">200 points</div>
                    <div className="text-muted-foreground text-xs">Free group session</div>
                  </Card>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Program Rules</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-1">
                    <Coins className="h-3 w-3" /> Earn 1 point per $1 spent
                  </li>
                  <li className="flex items-center gap-1">
                    <User className="h-3 w-3" /> Refer a new client = $20 credit
                  </li>
                  <li className="flex items-center gap-1">
                    <Gift className="h-3 w-3" /> Birthday Bonus: 25 free points during birthday month
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            {transactions.length === 0 ? (
              <div className="text-center py-6">
                <Coins className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-sm font-medium">No Transactions</h3>
                <p className="text-xs text-muted-foreground">
                  No loyalty point transactions found.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between border-b pb-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {tx.type === 'earned' || tx.type === 'referral' || tx.type === 'birthday' || tx.type === 'subscription_started' ? (
                            <span className="text-green-600">+{tx.points}</span>
                          ) : (
                            <span className="text-red-600">-{tx.points}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.description || tx.type}
                        </div>
                        {tx.dollarsSpent && (
                          <div className="text-xs text-muted-foreground">
                            ${tx.dollarsSpent} spent
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscription">
            {loyaltyData?.subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={loyaltyData.subscription.status === 'active' ? 'default' : 'outline'}>
                    {loyaltyData.subscription.status.charAt(0).toUpperCase() + loyaltyData.subscription.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">
                    {loyaltyData.subscription.planType.charAt(0).toUpperCase() + loyaltyData.subscription.planType.slice(1)} Plan
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Fee:</span>
                    <span className="font-medium">${Number(loyaltyData.subscription.monthlyFee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessions:</span>
                    <span className="font-medium">{loyaltyData.subscription.includedSessions} per month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{format(new Date(loyaltyData.subscription.startDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Billing:</span>
                    <span className="font-medium">
                      {loyaltyData.subscription.nextBillingDate ? 
                        format(new Date(loyaltyData.subscription.nextBillingDate), 'MMM d, yyyy') : 
                        'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Includes:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" /> {loyaltyData.subscription.includedSessions} sessions per month
                    </li>
                    {loyaltyData.subscription.includesReiki && (
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" /> Reiki add-on included
                      </li>
                    )}
                    {loyaltyData.subscription.includesPetAddOn && (
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" /> Pet add-on included
                      </li>
                    )}
                    <li className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" /> Priority booking
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full" 
                    onClick={handleCancelSubscription}
                    disabled={loyaltyData.subscription.status !== 'active'}
                  >
                    {loyaltyData.subscription.status === 'active' ? 'Cancel Subscription' : 'Subscription Inactive'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-sm font-medium">No Active Subscription</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Patient does not have an active wellness subscription.
                  </p>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setOpenSubscribeDialog(true)}
                  >
                    Subscribe to Wellness Pass
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Subscription Plans</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="p-3">
                      <div className="font-medium text-sm">Basic Plan</div>
                      <div className="text-muted-foreground text-xs">$150/month</div>
                      <div className="text-muted-foreground text-xs">3 sessions + add-on</div>
                    </Card>
                    <Card className="p-3">
                      <div className="font-medium text-sm">Premium Plan</div>
                      <div className="text-muted-foreground text-xs">$250/month</div>
                      <div className="text-muted-foreground text-xs">4 sessions + extras</div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Gift className="w-4 h-4 mr-2" /> Add Points
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Loyalty Points</DialogTitle>
              <DialogDescription>
                Add loyalty points to the patient's account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="Enter number of points"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for adding points"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPoints}>Add Points</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openRedeemDialog} onOpenChange={setOpenRedeemDialog}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              <Check className="w-4 h-4 mr-2" /> Redeem Points
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redeem Loyalty Points</DialogTitle>
              <DialogDescription>
                Redeem points from the patient's account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="redeemPoints">Points to Redeem</Label>
                <Input
                  id="redeemPoints"
                  type="number"
                  min="1"
                  max={loyaltyData?.points || 0}
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="Enter number of points"
                />
                <div className="text-sm text-muted-foreground">
                  Available points: {loyaltyData?.points || 0}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="redeemDescription">Description (optional)</Label>
                <Input
                  id="redeemDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are the points being redeemed for?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenRedeemDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRedeemPoints}>Redeem Points</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openSubscribeDialog} onOpenChange={setOpenSubscribeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subscribe to Wellness Pass</DialogTitle>
              <DialogDescription>
                Choose a monthly subscription plan for this patient.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subscriptionType">Subscription Plan</Label>
                <Select
                  value={subscriptionType}
                  onValueChange={(value) => setSubscriptionType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Plan ($150/month)</SelectItem>
                    <SelectItem value="premium">Premium Plan ($250/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">
                  {subscriptionType === 'basic' ? 'Basic Plan Details' : 'Premium Plan Details'}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Fee:</span>
                    <span className="font-medium">${subscriptionType === 'basic' ? '150.00' : '250.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Included Sessions:</span>
                    <span className="font-medium">{subscriptionType === 'basic' ? '3' : '4'} per month</span>
                  </div>
                  <Separator className="my-2" />
                  <div>
                    <h4 className="text-xs font-medium mb-1">Includes:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" /> 
                        {subscriptionType === 'basic' ? '3 group sessions' : '4 private sessions'}
                      </li>
                      {subscriptionType === 'basic' ? (
                        <li className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" /> 1 Reiki or pet add-on
                        </li>
                      ) : (
                        <>
                          <li className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-500" /> Reiki sessions included
                          </li>
                          <li className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-500" /> Pet add-ons included
                          </li>
                        </>
                      )}
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" /> Priority booking
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" /> Exclusive program invites
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenSubscribeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubscribe}>
                Subscribe
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}