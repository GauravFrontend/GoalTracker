import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectBackground: (background: string) => void;
    onUploadRequest: () => void;
    currentStyle?: string;
}

const PRESET_GRADIENTS = [
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', // Soft Pink
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', // Baby Blue
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', // Mint
    'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)', // Sunset
    'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', // Lavender
    '#FF6B6B', // Solid Coral
    '#4ECDC4', // Solid Teal
    '#FFE66D', // Solid Yellow
];

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
    isOpen,
    onClose,
    onSelectBackground,
    onUploadRequest,
    currentStyle
}) => {
    if (!isOpen) return null;

    // Check if current style is an image
    const isImage = currentStyle && currentStyle.startsWith('url');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Customize Day</h3>
                    <button className="close-icon" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Preview Current Style */}
                {currentStyle && (
                    <div className="preview-section">
                        <span className="preview-label">Current Look:</span>
                        <div
                            className="preview-box"
                            style={isImage ? {
                                backgroundImage: currentStyle,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            } : {
                                background: currentStyle
                            }}
                        />
                    </div>
                )}

                <div className="options-grid">
                    {PRESET_GRADIENTS.map((bg, idx) => {
                        const isSelected = currentStyle === bg;
                        return (
                            <button
                                key={idx}
                                className={`option-swatch ${isSelected ? 'selected' : ''}`}
                                style={{ background: bg }}
                                onClick={() => {
                                    onSelectBackground(bg);
                                    onClose();
                                }}
                            />
                        );
                    })}

                    <button
                        className="option-upload"
                        onClick={() => {
                            onUploadRequest();
                            onClose();
                        }}
                    >
                        <ImageIcon size={24} color="#666" />
                        <span>Image</span>
                    </button>
                </div>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }
        
        .modal-content {
          background: white;
          width: 90%;
          max-width: 320px;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .preview-section {
           margin-bottom: 20px;
           display: flex;
           flex-direction: column;
           align-items: flex-start;
           gap: 10px;
           padding: 15px;
           background: #f9f9f9;
           border-radius: 12px;
           width: 100%;
        }
        .preview-label { font-size: 0.9rem; color: #555; font-weight: 600; }
        .preview-box {
           width: 100%;
           height: 150px;
           border-radius: 12px;
           box-shadow: 0 4px 12px rgba(0,0,0,0.1);
           border: 1px solid rgba(0,0,0,0.05);
        }
        
        .modal-header h3 {
           margin: 0;
           font-size: 1.1rem;
           color: #333;
        }
        
        .close-icon {
           background: none;
           border: none;
           cursor: pointer;
           padding: 4px;
           color: #999;
           border-radius: 50%;
        }
        .close-icon:hover { background: #f0f0f0; }

        .options-grid {
           display: grid;
           grid-template-columns: repeat(4, 1fr);
           gap: 12px;
        }
        
        .option-swatch {
           width: 100%;
           aspect-ratio: 1;
           border-radius: 12px;
           border: 2px solid white;
           box-shadow: 0 2px 8px rgba(0,0,0,0.1);
           cursor: pointer;
           transition: transform 0.2s;
           position: relative;
        }
        .option-swatch:hover { transform: scale(1.1); }
        .option-swatch.selected {
            border: 2px solid #333;
            transform: scale(0.95);
        }
        
        .option-upload {
           width: 100%;
           aspect-ratio: 1;
           border-radius: 12px;
           border: 2px dashed #ccc;
           background: #f9f9f9;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           gap: 4px;
           cursor: pointer;
           font-size: 0.7rem;
           color: #666;
           font-weight: 600;
        }
        .option-upload:hover { border-color: var(--primary); color: var(--primary); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
      `}</style>
        </div>
    );
};
