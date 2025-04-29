import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ActivityItemProps {
  activity: Activity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  // Function to determine the appropriate icon and color based on activity type
  const getActivityStyles = (type: string) => {
    switch (true) {
      case type.includes('appointment.confirmed'):
        return { 
          color: 'bg-primary-600', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) 
        };
      case type.includes('patient.created'):
        return { 
          color: 'bg-secondary-600', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          ) 
        };
      case type.includes('payment.created'):
        return { 
          color: 'bg-success-600', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          ) 
        };
      case type.includes('appointment.canceled'):
        return { 
          color: 'bg-red-600', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) 
        };
      default:
        return { 
          color: 'bg-gray-600', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) 
        };
    }
  };
  
  const { color, icon } = getActivityStyles(activity.type);
  
  return (
    <div className="relative flex gap-4">
      <div className="flex h-6 items-center">
        <span className={`relative z-10 w-2.5 h-2.5 rounded-full ${color} flex-none`}></span>
        <span className="relative z-0 h-full w-0.5 -ml-px bg-gray-200 flex-none"></span>
      </div>
      <div className="flex-auto rounded-md p-3 -mt-2">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <p className="text-sm text-gray-900">{activity.description}</p>
          </div>
          <p className="flex-none text-xs text-gray-500">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed({ title = "Recent Activity" }: { title?: string }) {
  // Query activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["/api/activities"],
    select: (data: Activity[]) => data,
  });
  
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No recent activity</div>
        ) : (
          <div className="relative overflow-hidden">
            <div className="relative px-4 pt-5 pb-12">
              <div className="space-y-6">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
                {activities.length > 0 && (
                  <div className="relative flex gap-4">
                    <div className="flex h-6 items-center">
                      <span className="relative z-10 w-2.5 h-2.5 rounded-full bg-gray-300 flex-none"></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
