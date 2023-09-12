import { icons } from '@/lib/components/graphics/Icon';
import _toast from 'react-hot-toast';

type ToastType = 'Info' | 'Error' | 'Warning' | 'Success';

export function toast(type: ToastType, message: string): void {
    const typeName = type.toLowerCase();

    const iconStyle = {
        minWidth: 'max(23px, 1.6vh)',
        minHeight: 'max(23px, 1.6vh)',
        marginTop: -3,
        marginRight: 'max(0, .1vh)',
    }

    let icon = null;
    switch (type) {
        case 'Error':
            icon = <icons.FaExclamationTriangle style={iconStyle} />
            break;
        case 'Warning':
            icon = <icons.FaExclamationTriangle style={iconStyle} />
            break;
        case 'Success':
            icon = <icons.FaCheckCircle style={iconStyle} />
            break;
        default:
            icon = <icons.FaInfo style={iconStyle} />
            break;
    }

    _toast(message, {
        icon: icon,
        className: 'Toast ' + typeName,
    });
};
