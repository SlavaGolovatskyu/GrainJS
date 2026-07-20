import { createContext, useContext } from '../index.js';

export const FormContext = createContext(null);

/**
 * Read the nearest FormProvider bag. Throws if missing.
 */
export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error(
      'useFormContext: no FormProvider found. Wrap your tree in <FormProvider>.'
    );
  }
  return ctx;
}
