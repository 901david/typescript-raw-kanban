export const AutoBind = (
  _: any,
  _2: any,
  propertyDescriptor: PropertyDescriptor
) => {
  return {
    configurable: true,
    enumerable: true,
    get() {
      const origFN = propertyDescriptor.value;
      const boundFn = origFN.bind(this);
      return boundFn;
    },
  };
};
