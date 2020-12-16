export class ObjectUtils {
  public static compare(obj1: object, obj2: object): boolean {
    for (const key of Object.keys(obj1)) {
      if (!Object.prototype.hasOwnProperty.call(obj2, key) || obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  }
}
