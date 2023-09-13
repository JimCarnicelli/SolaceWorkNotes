export const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export const weekDayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const weekDayNamesPlural = [
    'Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays',
];

/**
 * Converts the given representation of a date/time value into a new Date object
 */
export function toDate(value) {
    if (!value) return null;
    if (value instanceof Date) return new Date(value);
    const timeAsInt = Date.parse(value);
    if (isNaN(timeAsInt)) {
        throw new Error('Not a valid date/time value: ' + value);
    }
    return new Date(timeAsInt);
}

/**
 * Accepts a wider variety of representations of date/time values than toDate(). Returns a null, 
 * a new Date object, or a string with a validation error message.
 */
export function parseDateTime(text) {
    if (typeof text !== 'string') return toDate(text);
    if (text.replace(/\s*/, '') === '') return null;

    let now = getNow();
    let match;
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();
    let hour = 0;
    let minute = 0;
    let second = 0;

    function toHour(hour, amPm) {
        amPm = amPm.toLowerCase().substring(0, 1);
        if (hour < 1) return 'Min hour is 1';
        if (hour > 12) return 'Max hour is 12';
        if (hour === 12 && amPm === 'a') return 0;
        if (hour === 12 && amPm === 'p') return 12;
        if (amPm === 'a') return hour;
        return 12 + hour;
    }

    match = text.match(/^\s*((\d{1,2})\s*\/\s*(\d{1,2})(\s*\/\s*(\d{4}|\d{2})?)?)?\s*((\d{1,2})(\s*:\s*(\d{1,2})(\s*:\s*(\d{1,2}))?)?\s*(am|pm|a|p)?)?\s*$/);
    const timeOffset = 7;
    if (match && (match[1] !== undefined || match[timeOffset] !== undefined)) {

        // Optional date part. Eg '5/1', '5 / 1 / 21', '5/1/ 2021'.
        if (match[1] !== undefined) {
            if (match[5] === undefined) {
                year = now.getFullYear();
            } else {
                year = match[5] - 0;
                if (year < 100) {
                    // Decide whether to put it in this century or the previous one
                    const thisCentury = (('' + now.getFullYear()).substring(0, 2) + '00') - 0;
                    const goingBack = thisCentury - 100 + year;
                    const goingForward = thisCentury + year;
                    // Moving Y2K window. Choose whichever year is closer to this year.
                    if (now.getFullYear() - goingBack < goingForward - now.getFullYear()) {
                        year = goingBack;
                    } else {
                        year = goingForward;
                    }
                }
            }
            month = match[2] - 1;
            day = match[3] - 0;
        }

        // Optional time part. Eg '14' (2pm), '14:30', '2:30 P', '1:2:3' (1:02:03am).
        if (match[timeOffset] !== undefined) {
            hour = match[timeOffset] - 0;
            minute = match[timeOffset + 2] ? match[timeOffset + 2] - 0 : 0;
            second = match[timeOffset + 4] ? match[timeOffset + 4] - 0 : 0;
            if (match[timeOffset + 5]) {
                hour = toHour(hour, match[timeOffset + 5]);
            } else {
                if (hour > 23) return 'Max hour is 23';
            }
            if (typeof hour === 'string') return hour;
            if (minute > 59) return 'Max minute is 59';
            if (second > 59) return 'Max second is 59';
        }

        return new Date(year, month, day, hour, minute, second);
    }

    return 'Invalid date/time';
}

/**
 * Returns the same date value but at midnight that day
 */
export function dateOnly(value) {
    let time = toDate(value);
    if (!time) return null;
    time = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    return time;
}

/**
 * Returns the same date value but at 11:59:59 pm that night
 * 
 * @param value
 * @param toTheSecond If true then the time will be 11:59:59. Otherwise 11:59:00.
 */
export function endOfDay(value, toTheSecond = true) {
    let time = toDate(value);
    if (!time) return null;
    time = new Date(
        time.getFullYear(), time.getMonth(), time.getDate(),
        23, 59, (toTheSecond ? 59 : 0)
    );
    return time;
}

/**
 * Returns the same time value but for 1/1/2000
 */
export function timeOnly(value) {
    let time = toDate(value);
    if (!time) return null;
    time = new Date(2000, 0, 1, time.getHours(), time.getMinutes(), time.getSeconds());
    return time;
}

/**
 * Returns January 1st in which the given date occurs
 */
export function yearOf(value, plusYears = 0) {
    let time = toDate(value);
    if (!time) return null;
    return new Date(time.getFullYear() + plusYears, 0, 1);
}

/**
 * Returns the first of the month in which the given date occurs
 */
export function monthOf(value, plusMonths = 0) {
    let time = toDate(value);
    if (!time) return null;
    return new Date(time.getFullYear(), time.getMonth() + plusMonths, 1);
}

/**
 * Returns the same date and time minus the minutes and seconds
 */
export function hourOf(value, plusHours = 0) {
    let time = toDate(value);
    if (!time) return null;
    return new Date(
        time.getFullYear(), time.getMonth(), time.getDate(),
        time.getHours() + plusHours, 0, 0
    );
}

/**
 * Adds hours to (or subtracts from) the given date/time value
 */
export function addDays(toValue, days) {
    days = Math.round(days);
    let time = toDate(toValue);
    if (!time) return null;
    // This is a bit complicated. Adding a full day isn't simply a matter of adding 24 hours 
    // because of daylight saving time. So we'll start from around midday on the source date 
    // and roll forward or backward to midday plus or minus an hour thanks to DST. Then we'll 
    // fashion a new date by combining the target date and the source time.
    let midday = addHours(dateOnly(time), 12);
    let newTime = new Date(midday.getTime() + days * 24 * 60 * 60 * 1000);
    newTime = combineDateAndTime(newTime, time);
    return newTime;
}

/**
 * Adds hours to (or subtracts from) the given date/time value
 */
export function addHours(toValue, hours) {
    let time = toDate(toValue);
    if (!time) return null;
    const newTime = new Date(time.getTime() + hours * 60 * 60 * 1000);
    return newTime;
}

/**
 * Adds minutes to (or subtracts from) the given date/time value
 */
export function addMinutes(toValue, minutes) {
    let time = toDate(toValue);
    if (!time) return null;
    const newTime = new Date(time.getTime() + minutes * 60 * 1000);
    return newTime;
}

/**
 * Adds seconds to (or subtracts from) the given date/time value
 */
export function addSeconds(toValue, seconds) {
    let time = toDate(toValue);
    if (!time) return null;
    const newTime = new Date(time.getTime() + seconds * 1000);
    return newTime;
}

/**
 * Takes the date from one value and the time from another and 
 * returns a new date/time value from them
 */
export function combineDateAndTime(dateValue, timeValue) {
    let date = toDate(dateValue);
    let time = toDate(timeValue);
    if (!date || !time) return null;
    const newDateTime = new Date(
        date.getFullYear(), date.getMonth(), date.getDate(),
        time.getHours(), time.getMinutes(), time.getSeconds()
    );
    return newDateTime;
}

/**
 * Given a date within some week, returns midnight at the beginning (Sunday) of that week
 */
export function sundayOfWeek(value) {
    let time = dateOnly(value);
    if (!time) return null;
    time = addDays(time, -time.getDay());
    return time;
}

/**
 * Calculates the decimal or whole number of days between the two date/time values
 */
export function daysBetween(fromValue, toValue, wholeNumber = false) {
    fromValue = toDate(fromValue);
    toValue = toDate(toValue);
    if (!fromValue || !toValue) return null;
    let diff = toValue.getTime() - fromValue.getTime();
    diff = diff / (24 * 60 * 60 * 1000);
    if (wholeNumber) return Math.floor(diff);
    return diff;
}

/**
 * Calculates the decimal or whole number of hours between the two date/time values
 */
export function hoursBetween(fromValue, toValue, wholeNumber = false) {
    fromValue = toDate(fromValue);
    toValue = toDate(toValue);
    if (!fromValue || !toValue) return null;
    let diff = toValue.getTime() - fromValue.getTime();
    diff = diff / (60 * 60 * 1000);
    if (wholeNumber) return Math.floor(diff);
    return diff;
}

/**
 * Calculates the decimal or whole number of minutes between the two date/time values
 */
export function minutesBetween(fromValue, toValue, wholeNumber = false) {
    fromValue = toDate(fromValue);
    toValue = toDate(toValue);
    if (!fromValue || !toValue) return null;
    let diff = toValue.getTime() - fromValue.getTime();
    diff = diff / (60 * 1000);
    if (wholeNumber) return Math.floor(diff);
    return diff;
}

/**
 * Calculates the decimal or whole number of seconds between the two date/time values
 */
export function secondsBetween(fromValue, toValue, wholeNumber = false) {
    fromValue = toDate(fromValue);
    toValue = toDate(toValue);
    if (!fromValue || !toValue) return null;
    let diff = toValue.getTime() - fromValue.getTime();
    diff = diff / 1000;
    if (wholeNumber) return Math.floor(diff);
    return diff;
}

/**
 * Returns whichever date is the earlier of the two
 */
export function earlierDate(value1, value2) {
    value1 = toDate(value1);
    value2 = toDate(value2);
    if (!value1 || !value2) return null;
    if (value2 < value1) return value2;
    return value1;
}

/**
 * Returns whichever date is the later of the two
 */
export function laterDate(value1, value2) {
    value1 = toDate(value1);
    value2 = toDate(value2);
    if (!value1 || !value2) return null;
    if (value2 > value1) return value2;
    return value1;
}

/**
 * Checks to see if the two date/time values are equal
 */
export function sameDateTime(a, b) {
    return toIsoDateTime(a, true) === toIsoDateTime(b, true);
}

/**
 * Checks to see if the two date values are equal, regardless of their times
 */
export function sameDateOnly(a, b) {
    return toIsoDateTime(dateOnly(a)) === toIsoDateTime(dateOnly(b));
}

/**
 * Checks to see if the two time values are equal, regardless of their dates
 */
export function sameTimeOnly(a, b) {
    return toIsoDateTime(timeOnly(a), true) === toIsoDateTime(timeOnly(b), true);
}

/**
 * Returns the current date and time
 */
export function getNow() {
    return new Date();
}

/**
 * Returns midnight on the current date
 */
export function getToday() {
    return dateOnly(new Date());
}

/**
 * Converts the given date/time value into an ISO 8601 string 
 * representation (eg '2011-10-05T14:48:00Z')
 */
export function toIsoDateTime(value, withMilliseconds = false, noTimeZone = false) {
    const time = toDate(value);
    if (!time) return null;
    let text = time.toISOString(false);
    if (noTimeZone) text = text.substring(0, text.length - 1);  // Trim the trailing 'Z'
    if (withMilliseconds) return text;
    text = text.replace(/\.\d+/, '');
    return text;
}

/**
 * Formats the date/time value like '8/2/2021 4:30:00 pm'
 */
export function toFullDateTime(value, shortDate = false) {
    const time = toDate(value);
    if (!time) return null;
    let text = shortDate
        ? toShortDate(time) + ' ' + toFullTime(time)
        : toFullDate(time) + ' ' + toFullTime(time);
    return text;
}

/**
 * Formats the date/time value like '8/2/21 4:30 pm'
 */
export function toShortDateTime(value) {
    const time = toDate(value);
    if (!time) return null;
    let text = toShortDate(time) + ' ' + toShortTime(time);
    return text;
}

/**
 * Formats the date/time value like '8/2/2021'
 */
export function toFullDate(value) {
    const time = toDate(value);
    if (!time) return null;
    let text =
        (time.getMonth() + 1) + '/' +
        time.getDate() + '/' +
        time.getFullYear();
    return text;
}

/**
 * Formats the date/time value like '8/2/21'
 */
export function toShortDate(value) {
    const time = toDate(value);
    if (!time) return null;
    let text =
        (time.getMonth() + 1) + '/' +
        time.getDate() + '/' +
        ('' + time.getFullYear()).substring(2);
    return text;
}

/**
 * Formats the date/time value like '8/2'
 */
export function toDateNoYear(value) {
    const time = toDate(value);
    if (!time) return null;
    let text =
        (time.getMonth() + 1) + '/' +
        time.getDate();
    return text;
}

/**
 * Returns the 2-digit representation of a year (eg 21 for 2021)
 */
export function shortYear(value) {
    const time = toDate(value);
    if (!time) return null;
    let text = ('' + time.getFullYear()).substring(2);
    return text;
}

/**
 * Returns the name of the given month, optionally truncated in length (eg 'Feb')
 */
export function monthName(value, trimToLength = -1) {
    const time = toDate(value);
    if (!time) return null;
    const name = monthNames[time.getMonth()];
    if (trimToLength <= 0) return name;
    return name.substring(0, trimToLength);
}

/**
 * Returns the name of the week day, optionally truncated in length (eg 'Wed')
 */
export function weekDayName(value, trimToLength = -1) {
    const time = toDate(value);
    if (!time) return null;
    const name = weekDayNames[time.getDay()];
    if (trimToLength <= 0) return name;
    return name.substring(0, trimToLength);
}

/**
 * Formats the date/time value like '4:30:00 pm'
 */
export function toFullTime(value) {
    const time = toDate(value);
    if (!time) return null;

    let hour = time.getHours();
    let amPm = hour >= 12 ? 'pm' : 'am';
    if (hour === 0) {
        hour = 12;
    } else if (hour > 12) {
        hour -= 12;
    }

    let text =
        hour + ':' +
        ('' + time.getMinutes()).padStart(2, '0') + ':' +
        ('' + time.getSeconds()).padStart(2, '0') + ' ' +
        amPm;
    return text;
}

/**
 * Formats the date/time value like '16:30:00'
 */
export function toFullTime24Hour(value) {
    const time = toDate(value);
    if (!time) return null;
    let text =
        ('' + time.getHours()).padStart(2, '0') + ':' +
        ('' + time.getMinutes()).padStart(2, '0') + ':' +
        ('' + time.getSeconds()).padStart(2, '0');
    return text;
}

/**
 * Formats the date/time value like '4:30 pm'
 */
export function toShortTime(value) {
    const time = toDate(value);
    if (!time) return null;

    let hour = time.getHours();
    let amPm = hour >= 12 ? 'pm' : 'am';
    if (hour === 0) {
        hour = 12;
    } else if (hour > 12) {
        hour -= 12;
    }

    let text =
        hour + ':' +
        ('' + time.getMinutes()).padStart(2, '0') + ' ' +
        amPm;
    return text;
}

/**
 * Formats the date/time value like '4pm'
 */
export function toTimeHourOnly(value) {
    const time = toDate(value);
    if (!time) return null;

    let hour = time.getHours();
    let amPm = hour >= 12 ? 'pm' : 'am';
    if (hour === 0) {
        hour = 12;
    } else if (hour > 12) {
        hour -= 12;
    }

    let text = hour + amPm;
    return text;
}

export function formatTimeSpan(seconds, includeSeconds = false) {
    if (!seconds) return null;
    let text = '';
    seconds = Math.round(seconds - 0);

    let days = Math.floor(seconds / (24 * 60 * 60));
    seconds -= days * 24 * 60 * 60;
    let hours = Math.floor(seconds / (60 * 60));
    seconds -= hours * 60 * 60;
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    if (!includeSeconds && seconds >= 30) {
        minutes++;
        if (minutes === 60) {
            hours++;
            minutes = 0;
        }
        if (hours === 24) {
            days++;
            hours = 0;
        }
        seconds = 0;
    }

    if (hours) text += text !== ''
        ? ':' + ('' + hours).padStart(2, '0')
        : hours;
    text += text !== ''
        ? ':' + ('' + minutes).padStart(2, '0')
        : minutes;
    if (includeSeconds) {
        text += ':' + ('' + seconds).padStart(2, '0');
    } else {
        text += 'm';
    }

    if (days) {
        text = days + 'd ' + text;
    }

    return text;
}

export function formatDateForInput(value) {
    value = toDate(value);
    if (!value) return '';
    return ('' + value.getFullYear()) + '-' + ('' + (value.getMonth() + 1)).padStart(2, '0') + '-' + ('' + value.getDate()).padStart(2, '0');
}

export function formatTimeForInput(value) {
    value = toDate(value);
    if (!value) return '';
    return ('' + value.getHours()).padStart(2, '0') + ':' + ('' + value.getMinutes()).padStart(2, '0');
}
