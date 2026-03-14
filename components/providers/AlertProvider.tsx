'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertOptions {
    title: string;
    message: string;
    type?: AlertType;
    confirmText?: string;
}

interface ConfirmOptions {
    title: string;
    message: string;
    type?: 'warning' | 'danger' | 'info';
    confirmText?: string;
    cancelText?: string;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => Promise<void>;
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}

interface AlertState {
    isOpen: boolean;
    isConfirm: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning' | 'danger';
    confirmText: string;
    cancelText: string;
    resolveRef: { current: ((value: boolean | void) => void) | null };
}

export function AlertProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AlertState>({
        isOpen: false,
        isConfirm: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'OK',
        cancelText: 'Batal',
        resolveRef: { current: null },
    });

    const showAlert = useCallback(({ title, message, type = 'info', confirmText = 'OK' }: AlertOptions): Promise<void> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                isConfirm: false,
                title,
                message,
                type,
                confirmText,
                cancelText: '',
                resolveRef: { current: resolve as (value: boolean | void) => void },
            });
        });
    }, []);

    const showConfirm = useCallback(({ title, message, type = 'warning', confirmText = 'Ya', cancelText = 'Batal' }: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                isConfirm: true,
                title,
                message,
                type,
                confirmText,
                cancelText,
                resolveRef: { current: resolve as (value: boolean | void) => void },
            });
        });
    }, []);

    const handleConfirm = () => {
        setState((prev) => ({ ...prev, isOpen: false }));
        if (state.resolveRef.current) {
            state.resolveRef.current(true);
        }
    };

    const handleCancel = () => {
        setState((prev) => ({ ...prev, isOpen: false }));
        if (state.resolveRef.current) {
            if (state.isConfirm) {
                 state.resolveRef.current(false);
            } else {
                 state.resolveRef.current();
            }
        }
    };

    const getIcon = () => {
        switch (state.type) {
            case 'success': return <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />;
            case 'error': return <AlertCircle className="w-12 h-12 text-red-500 mb-4" />;
            case 'danger': return <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />;
            case 'warning': return <AlertTriangle className="w-12 h-12 text-[#E78A00] mb-4" />;
            default: return <Info className="w-12 h-12 text-blue-500 mb-4" />;
        }
    };

    const getConfirmButtonClasses = () => {
        const baseClasses = "px-6 py-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 outline-none w-full sm:w-auto text-center";
        switch (state.type) {
            case 'danger':
            case 'error':
                return `${baseClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
            case 'warning':
                return `${baseClasses} bg-[#E78A00] hover:bg-yellow-600 text-white focus:ring-yellow-500`;
            case 'success':
                 return `${baseClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
            default:
                return `${baseClasses} bg-[#0F4C81] hover:bg-[#0c3e6a] text-white focus:ring-[#0F4C81]`;
        }
    };

    if (!state.isOpen) {
        return <AlertContext.Provider value={{ showAlert, showConfirm }}>{children}</AlertContext.Provider>;
    }

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop component */}
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                    onClick={state.isConfirm ? handleCancel : handleConfirm}
                />
                
                {/* Modal View */}
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col relative z-10 animate-in zoom-in-95 fade-in duration-200">
                    <button 
                        onClick={state.isConfirm ? handleCancel : handleConfirm}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="p-6 pt-10 flex flex-col items-center text-center">
                        {getIcon()}
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{state.title}</h2>
                        <p className="text-gray-600 mb-8">{state.message}</p>
                        
                        <div className="flex flex-col sm:flex-row w-full gap-3 sm:justify-center">
                            {state.isConfirm && (
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2 rounded-lg font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 outline-none w-full sm:w-auto"
                                >
                                    {state.cancelText}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className={getConfirmButtonClasses()}
                            >
                                {state.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AlertContext.Provider>
    );
}
