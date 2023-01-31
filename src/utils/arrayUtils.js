export function equalArrays(a = [], b = []) {
    if (a.length != b.length) return false;

    for (var i = 0; i < b.length; i++)
        if (!a.includes(b[i])) return false;

    return true;
}

export function intersectArrays(a, b) {
    console.log(a, b);
    for (var i = 0; i < a.length; ++i) {
        if (b.includes(a[i])) return true;
    }
    return false;
}

export function intersectArraysPositions(a, b) {
    for (var i = 0; i < a.length; ++i) {
        if (b.includes(a[i].position)) return true;
    }
    return false;
}
  
export function mapValue(object, iteratee) {
    object = Object(object);
    const result = {}

    Object.keys(object).forEach((key) => {
        result[key] = iteratee(object[key], key, object)
    })
    return result
}