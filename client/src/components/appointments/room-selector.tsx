import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Room } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoomSelectorProps {
  onRoomSelected: (roomId: number) => void;
  selectedRoomId?: number;
}

export function RoomSelector({ onRoomSelected, selectedRoomId }: RoomSelectorProps) {
  const { data: rooms = [], isLoading, error } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
    throwOnError: false,
  });

  // Select the first room by default if no room is selected
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      onRoomSelected(rooms[0].id);
    }
  }, [rooms, selectedRoomId, onRoomSelected]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive p-4">
        Error loading rooms. Please try again later.
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Treatment Rooms</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-auto">
          <div className="flex flex-wrap gap-2">
            {rooms.map((room: Room) => (
              <Button
                key={room.id}
                variant={selectedRoomId === room.id ? "default" : "outline"}
                onClick={() => onRoomSelected(room.id)}
                className="flex-grow"
              >
                <div className="flex flex-col items-center">
                  <span>{room.name}</span>
                  {room.isActive ? (
                    <Badge variant="secondary" className="mt-1 text-xs">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1 text-xs">Inactive</Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}