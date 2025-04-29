import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

export const DateTimeTile = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(timer);
  }, []);
  
  const formattedDate = format(currentTime, "EEEE, MMMM d, yyyy");
  const formattedTime = format(currentTime, "h:mm:ss a");
  
  return (
    <div className="bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg col-span-1 h-44 md:h-48 flex items-center cursor-default">
      <div className="p-6 flex flex-col w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-white">Current Time</h3>
          <div className="flex">
            <Calendar className="text-white mr-2" size={20} />
            <Clock className="text-white" size={20} />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-white/90 mb-2">{formattedDate}</p>
            <p className="text-white text-3xl font-bold tracking-wider">{formattedTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};