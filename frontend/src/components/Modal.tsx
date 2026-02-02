import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    type?: 'default' | 'success' | 'danger';
}

export function Modal({ isOpen, onClose, title, children, actions, type = 'default' }: ModalProps) {
    if (!isOpen) return null;

    let headerColor = 'var(--text-main)';
    if (type === 'success') headerColor = '#10b981'; // Green-500
    if (type === 'danger') headerColor = '#ef4444';  // Red-500

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ color: headerColor }}>{title}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

                {actions && (
                    <div className="modal-footer">
                        {actions}
                    </div>
                )}
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    background: white;
                    width: 90%;
                    max-width: 400px;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    overflow: hidden;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }

                .modal-header {
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f0f0f0;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .modal-header .close-btn {
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .modal-header .close-btn:hover {
                    background: #f5f5f5;
                    color: #333;
                }

                .modal-body {
                    padding: 24px;
                    font-size: 1rem;
                    color: #555;
                    line-height: 1.5;
                }

                .modal-footer {
                    padding: 16px 24px;
                    background: #fafafa;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* Mobile Optimization */
                @media (max-width: 480px) {
                    .modal-content {
                        width: 95%;
                        bottom: 0;
                        margin-bottom: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
