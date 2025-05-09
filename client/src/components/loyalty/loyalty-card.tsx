
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { BadgeCheck, Award, Gift, CreditCard, TrendingUp, Star } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type LoyaltyCardProps = {
  patientId: number;
  patientName: string;
};

export function LoyaltyCard({ patientId, patientName }: LoyaltyCardProps) {
  const queryClient = useQueryClient();
  const [points, setPoints] = useState("100");
  const [description, setDescription] = useState("");
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(50);
  const [redeemNotes, setRedeemNotes] = useState("");

  // Fetch loyalty data
  const { data: loyaltyData, isLoading } = useQuery({
    queryKey: [`/api/patients/${patientId}/loyalty`],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/loyalty`);
      if (!response.ok) {
        if (response.status === 404) {
          return { points: 0, totalEarned: 0, level: "none" };
        }
        throw new Error("Failed to fetch loyalty data");
      }
      return response.json();
    },
  });

  // Fetch loyalty transactions
  const { data: transactions = [] } = useQuery({
    queryKey: [`/api/patients/${patientId}/loyalty/transactions`],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/loyalty/transactions`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    enabled: !!loyaltyData && loyaltyData.level !== "none",
  });

  // Add points mutation
  const addPointsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/loyalty/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points: parseInt(points),
          type: "earned",
          source: "manual",
          description: description || "Manual points addition",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add points");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Points added",
        description: `${points} points added to ${patientName}'s account.`,
      });
      
      queryClient.invalidateQueries({ 
        queryKey: [`/api/patients/${patientId}/loyalty`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/patients/${patientId}/loyalty/transactions`] 
      });
      
      setPoints("100");
      setDescription("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redeem points mutation
  const redeemPointsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/loyalty/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points: redeemPoints,
          description: redeemNotes || "Points redeemed for discount",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to redeem points");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Points redeemed",
        description: `${redeemPoints} points redeemed from ${patientName}'s account.`,
      });
      
      queryClient.invalidateQueries({ 
        queryKey: [`/api/patients/${patientId}/loyalty`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/patients/${patientId}/loyalty/transactions`] 
      });
      
      setIsRedeemOpen(false);
      setRedeemPoints(50);
      setRedeemNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get loyalty tier icon and color
  const getLoyaltyTierInfo = (level: string) => {
    switch (level) {
      case "platinum":
        return { 
          icon: <BadgeCheck className="h-6 w-6 text-purple-500" />, 
          color: "bg-purple-100 text-purple-800",
          name: "Platinum" 
        };
      case "gold":
        return { 
          icon: <Award className="h-6 w-6 text-amber-500" />, 
          color: "bg-amber-100 text-amber-800",
          name: "Gold" 
        };
      case "silver":
        return { 
          icon: <Star className="h-6 w-6 text-gray-500" />, 
          color: "bg-gray-100 text-gray-800",
          name: "Silver" 
        };
      default:
        return { 
          icon: <Award className="h-6 w-6 text-emerald-500" />, 
          color: "bg-emerald-100 text-emerald-800",
          name: "Bronze" 
        };
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "redeemed":
        return <Gift className="h-4 w-4 text-amber-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-pulse">Loading loyalty information...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierInfo = getLoyaltyTierInfo(loyaltyData?.level || "bronze");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <span>Loyalty Program</span>
            {loyaltyData?.level !== "none" && (
              <Badge className={`ml-2 ${tierInfo.color}`}>{tierInfo.name}</Badge>
            )}
          </div>
          {tierInfo.icon}
        </CardTitle>
        <CardDescription>
          {loyaltyData?.level !== "none"
            ? `${patientName}'s loyalty status and rewards`
            : `${patientName} is not yet enrolled in the loyalty program`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loyaltyData?.level !== "none" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Current Points</div>
                <div className="text-2xl font-bold">{loyaltyData?.points || 0}</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Earned</div>
                <div className="text-2xl font-bold">{loyaltyData?.totalEarned || 0}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recent Activity</h4>
              {transactions.length > 0 ? (
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-4 space-y-3">
                    {transactions.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-start justify-between border-b pb-2"
                      >
                        <div className="flex space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <div className="text-sm font-medium">
                              {transaction.type === "earned" ? "Earned" : "Redeemed"}{" "}
                              {transaction.points} points
                            </div>
                            {transaction.description && (
                              <div className="text-xs text-muted-foreground">
                                {transaction.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No loyalty activity yet
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsRedeemOpen(true)}
                disabled={
                  !loyaltyData?.points || loyaltyData.points < 50 || redeemPointsMutation.isPending
                }
              >
                Redeem Points
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="mb-4">
              Enroll {patientName} in the loyalty program by adding points.
            </p>
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-2">Add Points</h4>
          <div className="flex space-x-2">
            <Input
              type="number"
              min="1"
              step="1"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Points to add"
            />
            <Button
              onClick={() => addPointsMutation.mutate()}
              disabled={addPointsMutation.isPending}
            >
              {addPointsMutation.isPending ? "Adding..." : "Add Points"}
            </Button>
          </div>
          <Input
            className="mt-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Reason for adding points (optional)"
          />
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          Bronze: 0-199 points, Silver: 200-499 points, Gold: 500-999 points, Platinum:
          1000+ points
        </p>
      </CardFooter>

      {/* Redeem Points Dialog */}
      <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Loyalty Points</DialogTitle>
            <DialogDescription>
              {patientName} currently has {loyaltyData?.points || 0} points available to
              redeem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Points to Redeem</label>
              <Input
                type="number"
                min="1"
                max={loyaltyData?.points || 0}
                value={redeemPoints}
                onChange={(e) => setRedeemPoints(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Redemption Notes</label>
              <Input
                value={redeemNotes}
                onChange={(e) => setRedeemNotes(e.target.value)}
                placeholder="e.g., $10 discount on services"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRedeemOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => redeemPointsMutation.mutate()}
              disabled={
                redeemPointsMutation.isPending ||
                !redeemPoints ||
                redeemPoints <= 0 ||
                (loyaltyData && redeemPoints > loyaltyData.points)
              }
            >
              {redeemPointsMutation.isPending ? "Processing..." : "Redeem Points"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
