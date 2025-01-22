/**
 * @method isEmpty
 * @param {String | number | Object} value
 * @returns {Boolean} true & false.
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
    if (value === null)
        return true
    else if (typeof value !== 'number' && value === '')
        return true
    else if (typeof value === 'undefined' || value === undefined )
        return true
    else return value !== null && typeof value === 'object' && 'object' && !Object.keys(value).length;
}