
export function validateUuid(value: string | undefined): string | undefined {
    if (!value) return undefined;
    // eg:  d9d689d8-2d04-4c79-b0e7-854b83f6c88f
    if (!value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) return 'Invalid UUID';
    return undefined;
}

export function validateEmail(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (!value.match(/^([^@ ]+)@[^@. ]+(\.[^@. ]+)+$/)) return 'Invalid email address';
    return undefined;
}

export function validatePassword(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (value.length < 8) return 'Must be at least 8 characters long';
    if (!value.match(/[a-z]/)) return 'Must contain a lower-case letter';
    if (!value.match(/[A-Z]/)) return 'Must contain an upper-case letter';
    if (!value.match(/[0-9]/)) return 'Must contain a digit';
    return undefined;
}

export function validateIdentityCode(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (value.length < 3) return 'Too short';
    if (value.match(/ /)) return 'Spaces not allowed';
    if (!value.match(/^[-_a-z0-9]+$/i)) return `Only letters, digits, '_', and '-' allowed`;
    return undefined;
}

export function formatIdentityCode(value: string | undefined): string | undefined {
    if (!value) return undefined;
    value = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .replace(/--+/g, '-');
    return value;
}

export function validateFriendlyName(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (value.length < 3) return 'Too short';
    if (value.match(/  /)) return 'No double spaces';
    return undefined;
}

export function formatFriendlyName(value: string | undefined): string | undefined {
    if (!value) return undefined;
    value = value
        .trim()
        .replace(/  +/g, ' ');
    return value;
}

export function validateZazzleProductId(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (!value.match(/^\d{18}$/)) return 'Must be 18 digits';
    return undefined;
}

export function formatZazzleProductId(value: string | undefined): string | undefined {
    if (!value) return undefined;

    if (value.startsWith('http')) {
        let match = value.match(/(^|[^\d])(\d{18})([^\d]|$)/);
        if (match) value = match[2];
    }

    value = value
        .trim();
    return value;
}

export function validateZazzleStoreId(value: string | undefined): string | undefined {
    if (!value) return undefined;

    // Only letters, numbers and _ (underscore) are allowed in the store name, and it
    // must be between 6 and 20 characters long.

    if (value.length < 6) return 'Too short';
    if (value.length > 20) return 'Too long';
    if (value.match(/ /)) return 'Spaces not allowed';
    if (!value.match(/^[_a-z0-9]+$/i)) return `Only letters, digits, and '_' allowed`;
    return undefined;
}

export function formatZazzleStoreId(value: string | undefined): string | undefined {
    if (!value) return undefined;
    value = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/^_+/, '')
        .replace(/_+$/, '')
        .replace(/__+/g, '_');
    return value;
}

export function validateTags(value: string | undefined): string | undefined {
    value = formatTags(value);
    if (!value) return undefined;
    const tags = value.split(', ');
    const tagsFound: {[tag: string]: boolean} = {};
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (tag.length < 3) return `'${tag}' is too short`;
        const match = tag.match(/[^-_' A-Z0-9]/i);
        if (match) return `'${tag}' contains invalid character '${match[0]}'`;
        if (tagsFound[tag]) return `'${tag}' is a duplicate`;
        tagsFound[tag] = true;
    }
    return undefined;
}

export function formatTags(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const tags = value
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e !== '');
    if (!tags.length) return ''
    return tags.join(', ');
}
