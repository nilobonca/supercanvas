import { ActivePin } from '@/interfaces/utils/indexedDB';
import { MapPin, User, Ear, BookOpen } from 'lucide-react';

interface PinItemProps {
    pin: ActivePin;
    onContextMenu: (e: React.MouseEvent) => void;
    onSelect?: (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => void;
}

const PinItem: React.FC<PinItemProps> = ({ pin, onContextMenu, onSelect }) => {
    const Icon = pin.icon === 'person' ? User : pin.icon === 'ear' ? Ear : MapPin;

    const getContrastColor = (hexColor: string) => {
        const r = parseInt(hexColor.substring(1, 3), 16);
        const g = parseInt(hexColor.substring(3, 5), 16);
        const b = parseInt(hexColor.substring(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    };

    const pinColor = pin.color || '#ef4444';
    const strokeColor = getContrastColor(pinColor);

    return (
        <div
            className={`relative group cursor-grab active:cursor-grabbing flex flex-col items-center ${!pin.enabled ? 'opacity-50 grayscale' : ''}`}
            onContextMenu={onContextMenu}
            onClick={(e) => {
                if (onSelect) onSelect(e);
            }}
            style={{ opacity: pin.opacity !== undefined ? pin.opacity : 1 }}
        >
            {/* Label always visible */}
            <div className="absolute -top-8 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {pin.name}
            </div>

            <Icon
                size={48}
                className="drop-shadow-lg transition-colors"
                style={{
                    color: pin.enabled ? strokeColor : '#374151', // Dark Gray stroke for disabled
                    fill: pin.enabled ? pinColor : '#9ca3af', // Gray fill for disabled
                }}
            />

            {/* Linked Vault Note Indicator Badge */}
            {pin.linkedDocumentPath && (
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/vault?doc=${encodeURIComponent(pin.linkedDocumentPath!)}`, '_blank');
                    }}
                    className="absolute -bottom-1 -right-1 bg-violet-600 hover:bg-violet-500 text-white p-1 rounded-full shadow-lg border border-violet-300 cursor-pointer transition-transform hover:scale-110 z-10"
                    title={`Abrir nota vinculada: ${pin.linkedDocumentPath}`}
                >
                    <BookOpen size={12} />
                </div>
            )}
        </div>
    );
};

export default PinItem;
