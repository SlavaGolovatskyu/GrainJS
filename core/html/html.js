export function html(strings, ...values) {
  let htmlString = '';
  const functions = new Map();
  let funcIndex = 0;
  
  strings.forEach((str, i) => {
    htmlString += str;
    if (i < values.length) {
      const value = values[i];
      
      
      // Handle functions (event handlers)
      if (typeof value === 'function') {
        // Store function reference and use placeholder
        const funcId = `__func_${funcIndex}__`;
        functions.set(funcId, value);
        htmlString += funcId;
        funcIndex++;
      } 
      // Handle nested html template results (from nested template strings)
      else if (value && typeof value === 'object' && value.html) {
        
        // Ensure functions map exists
        if (!value.functions || !(value.functions instanceof Map)) {
          console.warn('[html] Nested template missing functions map!', value);
          htmlString += value.html;
        } else {
        
        // First, replace all placeholders in the nested HTML before merging
        let nestedHtml = value.html;
        value.functions.forEach((fn, key) => {
          const newKey = `__func_${funcIndex}__`;
          functions.set(newKey, fn);
          // Replace all occurrences of the old placeholder with the new one
          // Only replace if key !== newKey (to avoid unnecessary work and preserve if already correct)
          if (key !== newKey && nestedHtml.includes(key)) {
            nestedHtml = nestedHtml.split(key).join(newKey);
          } else if (key !== newKey && !nestedHtml.includes(key)) {
            // Key doesn't match and wasn't found - this is a problem
            console.warn(`[html] Placeholder "${key}" not found in nested HTML to replace with "${newKey}"!`, {
              nestedHtml,
              key,
              newKey
            });
          }
          // If key === newKey, no replacement needed - placeholder is already correct
          funcIndex++;
        });
          // Now merge the processed nested HTML
          htmlString += nestedHtml;
        }
      }
      else {
        // Handle other values (strings, numbers, etc.)
        htmlString += value;
      }
    }
  });
  
  // Return object with HTML string and function map
  return {
    html: htmlString,
    functions: functions
  };
}