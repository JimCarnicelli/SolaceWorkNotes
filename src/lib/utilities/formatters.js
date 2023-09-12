
export function zeroPad(digits, value) {
    if (!value && value !== 0) return null;
    return ('' + value).padStart(digits, '0');
}

/**
 * Parses the given string representation of a number and returns it as a number
 */
export function parseDecimal(value, decimalPlaces) {
    if (value === null || value === Infinity || value === -Infinity) return value;
    value = ('' + value).replace(/,/g, '') - 0;
    if (isNaN(value)) return value;
    if (decimalPlaces === null) return value;
    return value.toFixed(decimalPlaces) - 0;
}

/**
 * Formats the given number for human-friendly reading
 */
export function formatDecimal(value, decimalPlaces, zeroPadDecimal) {
    let Halves, Text, Whole, Decimal, Prefix;

    // Force it to become a number if it's not already.
    value = parseDecimal(value, decimalPlaces);

    if (value === null || isNaN(value) || value === Infinity || value === -Infinity) return value;

    if (decimalPlaces === null) decimalPlaces = 0;

    if (decimalPlaces <= 0) {
        Text = Math.round(value);
    } else {
        Text = value.toFixed(decimalPlaces);  // Also zero-pads the decimal
        // Note that .toFixed() has an undesirable quality: it doesn't 
        // always round up when the digits being trimmed are 5 or greater.
    }
    Text = '' + Text;

    Prefix = '';
    if (Text.substring(0, 1) === '-') {
        Prefix = '-';
        Text = Text.substring(1);
    }

    Halves = Text.split('.');
    Whole = Halves[0];
    if (Halves.length > 1) {
        Decimal = Halves[1];
    } else {
        Decimal = '';
    }

    Text = '';
    while (Whole.length > 3) {
        Text = ',' + Whole.substring(Whole.length - 3) + Text;
        Whole = Whole.substring(0, Whole.length - 3);
    }
    Text = Whole + Text;

    // If we don't want zero-padding, let's ditch the trailing zeroes
    if (!zeroPadDecimal) {
        while (Decimal.substring(Decimal.length - 1) === '0') {
            Decimal = Decimal.substring(0, Decimal.length - 1);
        }
    }

    if (Decimal === '') {
        return Prefix + Text;
    } else {
        return Prefix + Text + '.' + Decimal;
    }
}

/**
 * Formats a number like '17', '152.6 m', '8.25 k'
 */
export function toSummaryNumber(value, decimalPlaces = 1) {
    if (value === 0) return '0';
    if (!value) return null;
    if (isNaN(value)) return 'NaN';
    if (value > 1000000000000) {
        return formatDecimal(value / 1000000000000, decimalPlaces) + ' t';
    } else if (value > 1000000000) {
        return formatDecimal(value / 1000000000, decimalPlaces) + ' b';
    } else if (value > 1000000) {
        return formatDecimal(value / 1000000, decimalPlaces) + ' m';
    } else if (value > 1000) {
        return formatDecimal(value / 1000, decimalPlaces) + ' k';
    } else {
        return formatDecimal(value, decimalPlaces);
    }
}

/**
 * Transform an integer value into a file-size shorthand (eg '5.6 MB' or '123.0 KB')
 */
export function toFileSize(bytes, decimalPlaces = 1) {
    if (bytes !== 0 && !bytes) return null;
    bytes = bytes - 0;  // Convert string to numeric
    if (Math.abs(bytes) < 1024) {
        return bytes + ' B';
    }

    const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] ;
    let unitIndex = -1;
    const r = 10 ** decimalPlaces;

    do {
        bytes /= 1024;
        unitIndex++;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= 1024 &&
        unitIndex < units.length - 1
    );

    return bytes.toFixed(decimalPlaces) + ' ' + units[unitIndex];
}

/**
 * Given a textual representation of a file size (eg '5.6 MB' or '123gb'), 
 * returns an integer value (eg 5,872,026 or 132,070,244,352)
 */
export function fromFileSize(text) {
    if (!text || text === '') return null;
    text = '' + text;  // Make sure it's a string

    const match = text.match(/^\s*(-?\d+(,\d+)*(\.\d+)?)\s*(B|[A-Z]{2})?\s*$/i);
    if (!match) return NaN;

    let number = match[1].replace(/,/g, '') - 0;
    if (!match[4]) return number;
    const unit = match[4].toUpperCase();
    if (unit === 'B') return number;

    const units = {
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4,
        PB: 1024 ** 5,
        EB: 1024 ** 6,
        ZB: 1024 ** 7,
        YB: 1024 ** 8,
    }
    number = number * units[unit];
    return number;
}

/**
 * Given a pascal-cased identifier (eg 'FirstName') to a human-friend label 
 * (eg 'First Name')
 */
export function identifierToLabel(text) {
    if (!text) return text;
    const match = ('' + text).match(/^[a-z]+|[A-Z][a-z]+|[0-9]+/g);
    if (!match) return text;
    if (match.join('') !== text) return text;  // Oddball characters? Leave it as-is.
    let label = match[0];
    label = label.substring(0, 1).toUpperCase() + label.substring(1);  // Capitalize first letter
    for (let i = 1; i < match.length; i++) {
        if (match[i]) label += ' ' + match[i];
    }
    return label;
}
