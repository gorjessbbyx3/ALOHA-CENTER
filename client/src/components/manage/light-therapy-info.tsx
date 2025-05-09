
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Clock, Users, User, PawPrint } from "lucide-react";

export function LightTherapyInfo() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sun className="mr-2 h-5 w-5 text-amber-500" />
          Light Therapy Services
        </CardTitle>
        <CardDescription>
          Detailed information about our light therapy treatment options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="group">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="group">
              <Users className="mr-2 h-4 w-4" />
              Group Session
            </TabsTrigger>
            <TabsTrigger value="private">
              <User className="mr-2 h-4 w-4" />
              Private Session
            </TabsTrigger>
            <TabsTrigger value="pet">
              <PawPrint className="mr-2 h-4 w-4" />
              With Pet
            </TabsTrigger>
            <TabsTrigger value="reiki">
              <Sun className="mr-2 h-4 w-4" />
              Reiki
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="group" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">Group Light Therapy (2hr)</h3>
                <span className="font-bold">$60</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Our group light therapy sessions take place in our spacious community room. 
                Experience the benefits of light therapy in a relaxed group setting.
              </p>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Clock className="mr-2 h-4 w-4" />
                <span>Duration: 2 hours</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>Max Capacity: 8 people</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="private" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">Private Light Therapy (2hr)</h3>
                <span className="font-bold">$100</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enjoy a private light therapy session in one of our dedicated treatment rooms.
                Perfect for those seeking a more personalized experience.
              </p>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Clock className="mr-2 h-4 w-4" />
                <span>Duration: 2 hours</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                <span>Private room: 1-2 people</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="pet" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">Private Light Therapy with Pet (2hr)</h3>
                <span className="font-bold">$120</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enjoy all the benefits of private light therapy along with your pet. Our pet-friendly 
                private rooms are specially designed to accommodate you and your furry companion.
              </p>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Clock className="mr-2 h-4 w-4" />
                <span>Duration: 2 hours</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <PawPrint className="mr-2 h-4 w-4" />
                <span>Pet surcharge: +$20</span>
              </div>
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900">
                <p className="text-sm">
                  <strong>Note:</strong> Pet option available only in private rooms. All pets must be well-behaved and 
                  accompanied by their owner at all times. Please inform staff of any special requirements.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reiki" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">Reiki Session (30min)</h3>
                <span className="font-bold">$100</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Experience the healing energy of Reiki in a private session. Our certified Reiki 
                practitioners will help restore balance and harmony to your energy centers.
              </p>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Clock className="mr-2 h-4 w-4" />
                <span>Duration: 30 minutes</span>
              </div>
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900">
                <p className="text-sm">
                  <strong>Note:</strong> You can add setup and cleanup time when booking to ensure your 
                  practitioner has adequate time to prepare the room before your session and reset afterward.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
