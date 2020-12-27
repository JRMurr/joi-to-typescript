/**
 * Applies the mapper over each element in the list.
 * If the mapper returns undefined it will not show up in the result
 *
 * @param list - array to filter + map
 * @param mapper - mapper func to apply to each element
 */
export function filterMap<T, K>(list: T[], mapper: (t: T) => K | undefined): K[] {
  return list.reduce((res: K[], val: T) => {
    const mappedVal = mapper(val);
    if (mappedVal !== undefined) {
      res.push(mappedVal);
    }
    return res;
  }, []);
}

/**
 * Applies the mapper over each key value pair in the object.
 * If the mapper returns undefined that key will not appear in the returned object.
 * @param obj - the object to filter + map
 * @param mapper - mapper func to apply to each key value pair
 */
export function filterMapObject<T extends object, K, U extends keyof T>(
  obj: T,
  mapper: (key: string, value: T[U]) => K | undefined
): Partial<Record<string, K>> {
  const newObj = {} as Partial<Record<string, K>>;
  Object.entries(obj).forEach(([key, value]) => {
    const mappedVal = mapper(key, value);
    if (mappedVal !== undefined) {
      newObj[key] = mappedVal;
    }
  });
  return newObj;
}
