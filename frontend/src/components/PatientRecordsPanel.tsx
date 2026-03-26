import React from 'react';
import { useAppStore } from '../store';
import { Microscope, Users } from 'lucide-react';

/**
 * Patient Records and Lab Reports Display
 */
export const PatientRecordsPanel: React.FC = () => {
  const records = useAppStore((state) => state.patientRecords);

  return (
    <div className="space-y-4">
      <div className="text-gray-400 text-xs uppercase tracking-widest font-bold">
        Lab Reports & Patient Records
      </div>

      {records.length === 0 ? (
        <div className="sci-fi-border rounded-lg p-4 bg-sci-fi-dark/50 text-center text-gray-500 flex items-center justify-center gap-2">
          <Microscope size={16} />
          Waiting for lab data...
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {records.slice(0, 20).map((record) => (
            <div
              key={record.id}
              className="sci-fi-border rounded-lg p-3 text-sm bg-sci-fi-dark/50 hover:bg-sci-fi-dark/70 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Microscope size={14} className="text-sci-fi-blue flex-shrink-0" />
                    <div className="font-bold text-gray-200 uppercase text-xs truncate">
                      {record.testType}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs ml-6">
                    Ward: <span className="text-sci-fi-blue">{record.wardName}</span>
                  </div>
                  <div className="text-gray-400 text-xs ml-6">
                    Patient ID: <span className="text-gray-300">{record.patientId}</span>
                  </div>
                  <div className="text-gray-400 text-xs ml-6">
                    Result: <span className="text-sci-fi-green">{record.result}</span>
                  </div>
                  <div className="text-gray-500 text-xs ml-6 mt-1">
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
