import { ParsedCurl, FieldMetadata } from '../types';

/**
 * Parse a CURL command into its components
 * @param curlCommand - The CURL command to parse
 * @returns A parsed object containing method, url, headers, and body
 */
export const parseCurlCommand = (curlCommand: string): ParsedCurl => {
  // Default values
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    body: null
  };
  
  try {
    // Remove 'curl' from the beginning if present and clean up line continuations
    curlCommand = curlCommand
      .trim()
      .replace(/\\\n\s*/g, '') // Remove line continuations
      .replace(/^\s*curl\s+/, ''); // Remove leading curl command
    
    // Split by spaces but preserve quoted content
    const parts: string[] = [];
    let currentPart = '';
    let inQuotes = false;
    let quoteChar = '';
    let escapeNext = false;
    
    for (let i = 0; i < curlCommand.length; i++) {
      const char = curlCommand[i];
      
      if (escapeNext) {
        if (char !== '\n') { // Skip escaped newlines
          currentPart += char;
        }
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if ((char === '"' || char === "'") && (!inQuotes || char === quoteChar)) {
        inQuotes = !inQuotes;
        if (inQuotes) quoteChar = char;
        continue;
      }
      
      if (char === ' ' && !inQuotes) {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = '';
        }
        continue;
      }
      
      currentPart += char;
    }
    
    if (currentPart) {
      parts.push(currentPart);
    }
    
    // Process parts
    let foundMethod = false;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // URL (without any flags)
      if (part.startsWith('http') && !part.startsWith('-')) {
        result.url = part;
        continue;
      }
      
      // Method
      if (part === '-X' || part === '--request') {
        if (i + 1 < parts.length) {
          result.method = parts[++i];
          foundMethod = true;
        }
        continue;
      }
      
      // If we have a URL but no explicit method and we find a data flag, assume it's a POST
      if (!foundMethod && result.url && (part === '-d' || part === '--data' || part === '--data-raw' || part === '--data-binary')) {
        result.method = 'POST';
        foundMethod = true;
      }
      
      // Location flag (common in modern curl commands)
      if (part === '--location' || part === '-L') {
        continue; // Skip as it's just a curl option
      }
      
      // Headers
      if (part === '-H' || part === '--header') {
        if (i + 1 < parts.length) {
          const header = parts[++i];
          const separatorIndex = header.indexOf(':');
          
          if (separatorIndex > 0) {
            const key = header.substring(0, separatorIndex).trim();
            const value = header.substring(separatorIndex + 1).trim();
            result.headers[key] = value;
            
            // Extract method from certain headers like X-HTTP-Method-Override if we haven't found a method yet
            if (!foundMethod && (key === 'X-HTTP-Method-Override' || key === 'X-Method-Override')) {
              result.method = value;
              foundMethod = true;
            }
          }
        }
        continue;
      }
      
      // Authorization header with bearer token
      if ((part === '--oauth2-bearer' || part === '-B') && i + 1 < parts.length) {
        const token = parts[++i];
        result.headers['Authorization'] = `Bearer ${token}`;
        continue;
      }
      
      // User and password (basic auth)
      if ((part === '-u' || part === '--user') && i + 1 < parts.length) {
        const credentials = parts[++i];
        const credBuffer = btoa(credentials);
        result.headers['Authorization'] = `Basic ${credBuffer}`;
        continue;
      }
      
      // Data
      if (part === '-d' || part === '--data' || part === '--data-raw' || part === '--data-binary') {
        if (i + 1 < parts.length) {
          const data = parts[++i].replace(/^'|'$/g, '').replace(/^"|"$/g, '');
          
          try {
            // Try to parse as JSON, ensuring proper handling of boolean values
            const parsedData = JSON.parse(data);
            
            // Post-process the parsed data to ensure proper boolean types and handle indexed fields
            const processObject = (obj: Record<string, unknown>) => {
              // First pass: identify indexed keys (like relations.0, relations.1)
              const indexedFieldsMap: Record<string, unknown[]> = {};
              
              // First, handle specific field formats required by the API
              if ('validateEmail' in obj) {
                // validateEmail must be a boolean
                if (typeof obj.validateEmail === 'string') {
                  // If it looks like an email, treat it as a request to validate (true)
                  if (obj.validateEmail.includes('@')) {
                    obj.validateEmail = true;
                  }
                  // Otherwise check for string boolean values
                  else {
                    obj.validateEmail = obj.validateEmail === 'true' || 
                                        obj.validateEmail === '1' || 
                                        obj.validateEmail === 'yes';
                  }
                }
                // Ensure it's a boolean type even if it was a non-string
                else if (typeof obj.validateEmail !== 'boolean') {
                  obj.validateEmail = Boolean(obj.validateEmail);
                }
              }
              
              // Handle additionalEmails array - ensure items are objects
              if ('additionalEmails' in obj && Array.isArray(obj.additionalEmails)) {
                // If the array is empty, ensure it stays empty
                if (obj.additionalEmails.length === 0) {
                  obj.additionalEmails = [];
                } 
                // Special case: array with a single empty string - convert to array with an empty object
                else if (obj.additionalEmails.length === 1 && 
                        (obj.additionalEmails[0] === '' || obj.additionalEmails[0] === null)) {
                  obj.additionalEmails = [{}];
                }
                else {
                  obj.additionalEmails = (obj.additionalEmails as unknown[]).map(item => {
                    if (item === null || item === '') {
                      return {}; // Empty object if empty string
                    }
                    if (typeof item === 'string' && item.includes('@')) {
                      // If it's an email string, convert to required object format
                      return { email: item, isPrimary: false };
                    }
                    return typeof item === 'object' ? item : { email: String(item), isPrimary: false };
                  });
                }
              }
              
              // Handle additionalPhones array - ensure items are objects
              if ('additionalPhones' in obj && Array.isArray(obj.additionalPhones)) {
                // If the array is empty, ensure it stays empty
                if (obj.additionalPhones.length === 0) {
                  obj.additionalPhones = [];
                }
                // Special case: array with a single empty string - convert to array with an empty object
                else if (obj.additionalPhones.length === 1 && 
                        (obj.additionalPhones[0] === '' || obj.additionalPhones[0] === null)) {
                  obj.additionalPhones = [{}];
                }
                else {
                  obj.additionalPhones = (obj.additionalPhones as unknown[]).map(item => {
                    if (item === null || item === '') {
                      return {}; // Empty object if empty string
                    }
                    if (typeof item === 'string') {
                      // If it's a phone string, convert to required object format
                      return { number: item, type: 'mobile' };
                    }
                    return typeof item === 'object' ? item : { number: String(item), type: 'mobile' };
                  });
                }
              }
              
              Object.keys(obj).forEach(key => {
                const match = /^(.+)\.(\d+)/.exec(key);
                if (match) {
                  const arrayName = match[1];
                  const index = parseInt(match[2]);
                  
                  if (!indexedFieldsMap[arrayName]) {
                    indexedFieldsMap[arrayName] = [];
                  }
                  
                  // Ensure the array is large enough
                  while (indexedFieldsMap[arrayName].length <= index) {
                    indexedFieldsMap[arrayName].push({});
                  }
                }
              });
              
              // Second pass: update values, handle booleans, and process indexed fields
              const keysToDelete: string[] = [];
              Object.entries(obj).forEach(([key, value]) => {
                // Check if this is an indexed field
                const match = /^(.+)\.(\d+)\.?(.*)$/.exec(key);
                if (match) {
                  const arrayName = match[1];
                  const index = parseInt(match[2]);
                  const fieldName = match[3];
                  
                  // If the array has been created in the first pass
                  if (indexedFieldsMap[arrayName]) {
                    const arrItem = indexedFieldsMap[arrayName][index];
                    
                    // If the indexed property has a field name (x.0.name), set that field
                    if (fieldName && typeof arrItem === 'object' && !Array.isArray(arrItem)) {
                      // Special handling for nested fields (x.0.address.street)
                      if (fieldName.includes('.')) {
                        const nestedParts = fieldName.split('.');
                        let current = arrItem as Record<string, unknown>;
                        
                        // Build the nested structure
                        for (let i = 0; i < nestedParts.length - 1; i++) {
                          const part = nestedParts[i];
                          if (!current[part] || typeof current[part] !== 'object') {
                            current[part] = {};
                          }
                          current = current[part] as Record<string, unknown>;
                        }
                        
                        // Set the leaf value (with type conversion if needed)
                        const leafProp = nestedParts[nestedParts.length - 1];
                        if (typeof value === 'string') {
                          if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                            current[leafProp] = value.toLowerCase() === 'true';
                          } else if (!isNaN(Number(value)) && value.trim() !== '') {
                            current[leafProp] = Number(value);
                          } else {
                            current[leafProp] = value;
                          }
                        } else {
                          current[leafProp] = value;
                        }
                      } else {
                        // Direct field - convert type if needed
                        if (typeof value === 'string') {
                          if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                            (arrItem as Record<string, unknown>)[fieldName] = value.toLowerCase() === 'true';
                          } else if (!isNaN(Number(value)) && value.trim() !== '') {
                            (arrItem as Record<string, unknown>)[fieldName] = Number(value);
                          } else {
                            (arrItem as Record<string, unknown>)[fieldName] = value;
                          }
                        } else {
                          (arrItem as Record<string, unknown>)[fieldName] = value;
                        }
                      }
                    }
                    // Otherwise, set the whole item
                    else if (!fieldName) {
                      indexedFieldsMap[arrayName][index] = value;
                    }
                    
                    // Mark this key for deletion
                    keysToDelete.push(key);
                  }
                }
                // Handle regular values with type conversions
                else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  processObject(value as Record<string, unknown>);
                } else if (
                  (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) ||
                  key.toLowerCase().includes('is') || 
                  key.toLowerCase().includes('has') || 
                  key.toLowerCase().includes('can') ||
                  key.toLowerCase().includes('enable') ||
                  key.toLowerCase().includes('allow') ||
                  key.toLowerCase().includes('unique') ||
                  key.toLowerCase().includes('flag')
                ) {
                  // Convert string 'true'/'false' to actual booleans
                  if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
                    obj[key] = value.toLowerCase() === 'true';
                  }
                } else if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
                  // Convert numeric strings to numbers
                  obj[key] = Number(value);
                }
              });
              
              // Remove the original indexed fields
              keysToDelete.forEach(key => {
                delete obj[key];
              });
              
              // Add the constructed arrays to the object
              Object.entries(indexedFieldsMap).forEach(([arrayName, values]) => {
                // Special handling for relations array to ensure objects
                if (arrayName === 'relations') {
                  obj[arrayName] = values.map(item => {
                    if (typeof item !== 'object' || Array.isArray(item)) {
                      return { 
                        associationId: `TASK_${Math.random().toString(36).substring(2, 10).toUpperCase()}_ASSOCIATION`,
                        recordId: Math.random().toString(36).substring(2, 24)
                      };
                    }
                    
                    // Ensure the relation has both associationId and recordId if they're missing
                    const relation = item as Record<string, unknown>;
                    if (!relation.associationId) {
                      relation.associationId = `TASK_${Math.random().toString(36).substring(2, 10).toUpperCase()}_ASSOCIATION`;
                    }
                    if (!relation.recordId) {
                      relation.recordId = Math.random().toString(36).substring(2, 24);
                    }
                    
                    return relation;
                  });
                } else {
                  obj[arrayName] = values;
                }
              });
              
              // Special processing for object structures in the request
              if ('properties' in obj && typeof obj.properties === 'object' && obj.properties !== null) {
                // Ensure completed is properly boolean in properties
                const props = obj.properties as Record<string, unknown>;
                if ('completed' in props && typeof props.completed === 'string') {
                  props.completed = props.completed.toLowerCase() === 'true';
                }
              }
              
              // Handle config.recurringTask if present
              if ('config' in obj && typeof obj.config === 'object' && obj.config !== null) {
                const config = obj.config as Record<string, unknown>;
                
                if ('recurringTask' in config && typeof config.recurringTask === 'object' && config.recurringTask !== null) {
                  const recurringTask = config.recurringTask as Record<string, unknown>;
                  
                  // Ensure contactIds is an array of strings
                  if ('contactIds' in recurringTask && Array.isArray(recurringTask.contactIds)) {
                    // No transformation needed if already array
                  } else if ('contactIds' in recurringTask && recurringTask.contactIds) {
                    // Convert to array if not already
                    recurringTask.contactIds = [String(recurringTask.contactIds)];
                  }
                  
                  // Ensure owners is an array
                  if ('owners' in recurringTask && !Array.isArray(recurringTask.owners)) {
                    recurringTask.owners = [];
                  }
                  
                  // Ensure ignoreTaskCreation is boolean
                  if ('ignoreTaskCreation' in recurringTask && typeof recurringTask.ignoreTaskCreation === 'string') {
                    recurringTask.ignoreTaskCreation = recurringTask.ignoreTaskCreation.toLowerCase() === 'true';
                  }
                  
                  // Process rruleOptions
                  if ('rruleOptions' in recurringTask && typeof recurringTask.rruleOptions === 'object' && recurringTask.rruleOptions !== null) {
                    const rruleOptions = recurringTask.rruleOptions as Record<string, unknown>;
                    
                    // Convert numeric strings to numbers
                    if ('interval' in rruleOptions && typeof rruleOptions.interval === 'string') {
                      const numValue = Number(rruleOptions.interval);
                      if (!isNaN(numValue)) {
                        rruleOptions.interval = numValue;
                      }
                    }
                    
                    // Convert dueAfterSeconds to number
                    if ('dueAfterSeconds' in rruleOptions && typeof rruleOptions.dueAfterSeconds === 'string') {
                      const numValue = Number(rruleOptions.dueAfterSeconds);
                      if (!isNaN(numValue)) {
                        rruleOptions.dueAfterSeconds = numValue;
                      }
                    }
                  }
                }
              }
            };
            
            if (typeof parsedData === 'object' && parsedData !== null) {
              processObject(parsedData);
            }
            
            result.body = parsedData;
          } catch {
            // If not JSON, treat as raw string
            result.body = data;
          }
        }
        continue;
      }
    }
    
    // If URL is missing or invalid
    if (!result.url) {
      throw new Error('URL not found in CURL command');
    }
    
    return result;
  } catch (error) {
    return {
      ...result,
      error: error instanceof Error ? error.message : 'Failed to parse CURL command'
    };
  }
};

/**
 * Extract field structure from parsed CURL
 * @param parsedCurl - The parsed CURL object
 * @returns An object containing field names, their types, and original values
 */
export const extractFieldsFromParsedCurl = (parsedCurl: ParsedCurl): Record<string, FieldMetadata> => {
  const fields: Record<string, FieldMetadata> = {};
  
  if (!parsedCurl.body) {
    return fields;
  }
  
  const extractFields = (obj: Record<string, unknown>, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === null) {
        fields[fullKey] = { type: 'null', originalValue: null };
      } else if (Array.isArray(value)) {
        fields[fullKey] = { type: 'array', originalValue: value };
      } else if (typeof value === 'object') {
        // Handle the special case of properties object
        if (key === 'properties' && value && !Array.isArray(value)) {
          extractFields(value as Record<string, unknown>, key);
        } else {
          extractFields(value as Record<string, unknown>, fullKey);
        }
      } else {
        fields[fullKey] = { 
          type: typeof value, 
          originalValue: value
        };
      }
    });
  };
  
  if (typeof parsedCurl.body === 'object') {
    extractFields(parsedCurl.body as Record<string, unknown>);
  } else if (typeof parsedCurl.body === 'string') {
    try {
      // Try to parse as JSON
      const jsonBody = JSON.parse(parsedCurl.body);
      
      if (typeof jsonBody === 'object' && jsonBody !== null) {
        extractFields(jsonBody as Record<string, unknown>);
      }
    } catch {
      // If string can't be parsed as JSON, try form data format
      const formParts = parsedCurl.body.split('&');
      formParts.forEach(part => {
        const [key, value] = part.split('=');
        if (key) {
          fields[key] = { 
            type: value ? typeof value : 'string',
            originalValue: value || ''
          };
        }
      });
    }
  }
  
  return fields;
};