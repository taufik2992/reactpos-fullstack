import React from 'react';
import { Clock, Play, Square, AlertTriangle } from 'lucide-react';
import { useWorkShift } from '../../context/WorkShiftContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { Card } from './Card';

export const WorkShiftTimer: React.FC = () => {
  const { user } = useAuth();
  const {
    isShiftActive,
    shiftStartTime,
    elapsedTime,
    remainingTime,
    startShift,
    endShift,
    formatTime
  } = useWorkShift();

  if (user?.role !== 'cashier') {
    return null;
  }

  const isWarningTime = remainingTime <= 30 * 60; // Last 30 minutes
  const isCriticalTime = remainingTime <= 5 * 60; // Last 5 minutes

  return (
    <Card className={`transition-all duration-300 ${
      isCriticalTime 
        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
        : isWarningTime 
        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
        : 'border-green-500 bg-green-50 dark:bg-green-900/20'
    }`} padding="sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            isCriticalTime 
              ? 'bg-red-500' 
              : isWarningTime 
              ? 'bg-yellow-500'
              : 'bg-green-500'
          } text-white`}>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Shift Kerja
              </h3>
              {isShiftActive && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    AKTIF
                  </span>
                </div>
              )}
            </div>
            
            {isShiftActive ? (
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Berlalu: </span> {formatTime(elapsedTime)}
                  </div>
                  <div className={`text-xs sm:text-sm font-medium ${
                    isCriticalTime 
                      ? 'text-red-600 dark:text-red-400' 
                      : isWarningTime 
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    <span>Tersisa: </span> {formatTime(Math.max(0, remainingTime))}
                  </div>
                </div>
                
                {shiftStartTime && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Dimulai: {shiftStartTime.toLocaleTimeString()}
                  </div>
                )}
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCriticalTime 
                        ? 'bg-red-500' 
                        : isWarningTime 
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.max(0, (elapsedTime / (8 * 60 * 60)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Klik "Mulai Shift" untuk memulai periode kerja 8 jam Anda
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {!isShiftActive ? (
            <Button
              size="sm"
              onClick={startShift}
              icon={Play}
              className="text-xs whitespace-nowrap"
            >
              Mulai Shift
            </Button>
          ) : (
            <Button
              size="sm"
              variant="danger"
              onClick={endShift}
              icon={Square}
              className="text-xs whitespace-nowrap"
            >
              Berhenti Shift
            </Button>
          )}
          
          {isWarningTime && isShiftActive && (
            <div className="flex items-center justify-center">
              <AlertTriangle className={`w-4 h-4 ${
                isCriticalTime ? 'text-red-500' : 'text-yellow-500'
              }`} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};