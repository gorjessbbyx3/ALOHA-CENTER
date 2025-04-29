import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Patient } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PatientItemProps {
  patient: Patient;
}

function PatientItem({ patient }: PatientItemProps) {
  return (
    <li>
      <div className="px-4 py-4 flex items-center sm:px-6">
        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="flex text-sm">
              <p className="font-medium text-primary-600 truncate">{patient.name}</p>
              <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                #{patient.patientId}
              </p>
            </div>
            <div className="mt-2 flex">
              <div className="flex items-center text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>Last visit: {patient.lastVisit ? format(new Date(patient.lastVisit), 'MMM dd, yyyy') : 'No visits yet'}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex-shrink-0 sm:mt-0">
            <div className="flex overflow-hidden">
              <Badge 
                variant="outline"
                className={cn(
                  patient.status === 'active' ? 'bg-green-100 text-green-800' :
                  patient.status === 'follow-up' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                )}
              >
                {patient.status === 'active' ? 'Active' : 
                 patient.status === 'follow-up' ? 'Follow-up' : 
                 patient.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export function PatientList({ title = "Recent Patients", limit = 3 }: { title?: string, limit?: number }) {
  // Query patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
    select: (data: Patient[]) => data.slice(0, limit),
  });
  
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">{title}</CardTitle>
        <a href="/patients" className="text-sm font-medium text-primary-600 hover:text-primary-500">View all</a>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No patients found</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <PatientItem key={patient.id} patient={patient} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
