import React, { useState, useEffect } from "react";
import { StickyNote, Plus, X, Save, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  content: string;
  color: string;
  createdAt: Date;
}

export const StickyNotesTile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => {
    // Load notes from localStorage on initial render
    const savedNotes = localStorage.getItem("stickyNotes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [newNote, setNewNote] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FEF68A"); // Default yellow color
  const { toast } = useToast();

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (newNote.trim() === "") {
      toast({
        title: "Note cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      color: selectedColor,
      createdAt: new Date(),
    };

    setNotes([...notes, note]);
    setNewNote("");
    toast({
      title: "Note added",
      description: "Your note has been saved",
    });
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    toast({
      title: "Note deleted",
      variant: "destructive",
    });
  };

  const colorOptions = [
    { value: "#FEF68A", name: "Yellow" },
    { value: "#D4F8E8", name: "Green" },
    { value: "#FFCBCB", name: "Red" },
    { value: "#BAEAF9", name: "Blue" },
    { value: "#FCD8FF", name: "Purple" },
    { value: "#FFDEAD", name: "Orange" },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg col-span-1 md:col-span-1 cursor-pointer flex items-center h-36 hover:opacity-90 transition-opacity">
            <div className="p-4 flex flex-col w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Sticky Notes</h3>
                <StickyNote className="text-white" size={28} />
              </div>
              <p className="text-white/90 text-sm mb-2">Quick reminders & notes</p>
              <div className="mt-auto flex justify-between">
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white"
                  size="sm"
                >
                  View Notes
                </Button>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-white/80">Notes</span>
                  <span className="text-xl font-semibold text-white">{notes.length}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Sticky Notes</DialogTitle>
            <DialogDescription>
              Manage your quick notes and reminders
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4 h-[calc(80vh-140px)]">
            {/* Add new note form */}
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">Add New Note</h3>
              <div className="space-y-3">
                <Textarea 
                  placeholder="Type your note here..." 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
                
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Color:</span>
                    <div className="flex space-x-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedColor(color.value)}
                          className={`w-6 h-6 rounded-full ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="flex items-center mt-2 sm:mt-0 sm:ml-auto" 
                    onClick={addNote}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Notes Grid */}
            <ScrollArea className="flex-1 h-[calc(80vh-320px)]">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <StickyNote className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-1">No notes yet</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Add your first note above to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2">
                  {notes.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-4 rounded-md shadow-md border-t-[12px] relative min-h-[180px] flex flex-col"
                      style={{ 
                        backgroundColor: note.color,
                        borderColor: note.color 
                      }}
                    >
                      <div className="absolute top-2 right-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full hover:bg-black/10"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-3 font-mono whitespace-pre-wrap text-sm flex-1">
                        {note.content}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-4 pt-2 border-t border-black/10">
                        {new Date(note.createdAt).toLocaleDateString()} at{" "}
                        {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};