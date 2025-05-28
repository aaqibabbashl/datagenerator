import Chance from 'chance';
import { ParsedCurl, FieldConfig, ApiResult, RandomDataType, FieldMetadata, GenerationMethod } from '../types';

const chance = new Chance();

/**
 * Identify field type from field name and sample value
 * @param fieldName - Name of the field
 * @param fieldType - Type of the field
 * @returns The guessed data type for generation
 */
export const identifyFieldType = (fieldName: string, fieldType: string): string => {
  const name = fieldName.toLowerCase();
  
  // Check field name first
  if (/id$|^id$|_id$/.test(name)) return 'id';
  if (/email|e-mail/.test(name)) return 'email';
  if (/name$/.test(name)) return 'name';
  if (/first[_-]?name/.test(name)) return 'firstName';
  if (/last[_-]?name/.test(name)) return 'lastName';
  if (/phone|mobile|cell/.test(name)) return 'phone';
  if (/address/.test(name)) return 'address';
  if (/city/.test(name)) return 'city';
  if (/state|province/.test(name)) return 'state';
  if (/country/.test(name)) return 'country';
  if (/zip|postal/.test(name)) return 'zip';
  if (/date|time/.test(name)) return 'date';
  if (/age/.test(name)) return 'age';
  if (/gender|sex/.test(name)) return 'gender';
  if (/url|website|site/.test(name)) return 'url';
  if (/description|desc|summary|text|content/.test(name)) return 'text';
  if (/price|cost|amount/.test(name)) return 'price';
  if (/image|picture|avatar|photo/.test(name)) return 'image';
  if (/color|colour/.test(name)) return 'color';
  if (/boolean|bool|flag|is[A-Z]/.test(name)) return 'boolean';
  
  // Additional number detection patterns
  if (/limit|max|min|count|num|quantity|total|amount|length|size|value|sum|percent|rate|ratio|weight|height|width|depth|distance|duration|interval|order|index|level|priority|score|rank/.test(name)) return 'number';
  
  // If field name doesn't give us a clue, use the field type
  if (fieldType === 'string') return 'string';
  if (fieldType === 'number') return 'number';
  if (fieldType === 'boolean') return 'boolean';
  if (fieldType === 'array') return 'array';
  if (fieldType === 'object') return 'object';
  
  // Default fallback
  return 'string';
};

/**
 * Generate random data based on field type
 * @param fieldType - The identified field type
 * @param config - Optional field configuration for static values
 * @returns A random or static value appropriate for the field type
 */
export const generateValueForField = (
  fieldType: string,
  config?: FieldConfig
): unknown => {
  // Return static value if configured
  if (config?.isStatic && config.staticValue !== undefined) {
    // Check if this should be a number by field type or its name
    const fieldName = config.fieldName || '';
    const isNumericType = 
      fieldType === 'number' || 
      config?.randomType === RandomDataType.Number || 
      config?.randomType === RandomDataType.Price ||
      config?.randomType === RandomDataType.Age ||
      config?.randomType === RandomDataType.ID ||
      fieldType === 'id' ||
      /limit|max|min|count|num|quantity|total|amount|length|size|value|sum|percent|rate|ratio|weight|height|width|depth|distance|duration|interval|order|index|level|priority|score|rank/.test(fieldName.toLowerCase());
    
    // Special handling for validateEmail - it should always be a boolean
    if (fieldName === 'validateEmail') {
      return config.staticValue.toLowerCase() === 'true';
    }
    // Check if this is a boolean field
    else if (fieldType === 'boolean' || config?.randomType === RandomDataType.Boolean ||
             /^is|^has|^can|^enable|^allow|^flag/.test(fieldName.toLowerCase())) {
      return config.staticValue.toLowerCase() === 'true';
    }
    else if (isNumericType) {
      const numValue = Number(config.staticValue);
      return isNaN(numValue) ? config.staticValue : numValue;
    } 
    else if (fieldName === 'additionalEmails' || fieldName === 'additionalPhones' || 
             /^additional.*s$|^contacts$|^relationships$|^relations$/.test(fieldName.toLowerCase())) {
      // Special handling for additionalEmails and additionalPhones arrays to ensure they contain objects
      try {
        let values;
        
        // Handle empty values or empty arrays
        if (!config.staticValue || config.staticValue.trim() === '[]' || config.staticValue.trim() === '') {
          return [];
        }
        
        // Try to parse as JSON if it looks like an array
        if (config.staticValue.trim().startsWith('[') && config.staticValue.trim().endsWith(']')) {
          values = JSON.parse(config.staticValue);
          
          // Handle case of array with a single empty string
          if (values.length === 1 && (values[0] === '' || values[0] === null)) {
            return [{}];
          }
        } else {
          // Otherwise, treat as comma-separated values
          values = config.staticValue.split(',').map(item => item.trim());
        }
        
        // Transform each value to an object if not already
        return values.map((item: unknown) => {
          if (typeof item === 'string' && item.trim() === '') {
            // Empty string becomes empty object for these fields
            return {};
          }
          else if (typeof item === 'string' && !item.startsWith('{') && !item.startsWith('[')) {
            // Simple string becomes an object with value property
            if (fieldName === 'additionalEmails') {
              return { email: item, isPrimary: false };
            } 
            else if (fieldName === 'additionalPhones') {
              return { number: item, type: 'mobile' };
            }
            else {
              return { value: item };
            }
          }
          return item;
        });
      } catch {
        // Fallback to array with single empty object if there's an issue
        return [{}];
      }
    } 
    else if (fieldType === 'array' || /s$|list$|array$|items$|collection$|relations?$/.test(fieldName.toLowerCase())) {
      // Convert string to array for array fields
      try {
        // Try to parse as JSON if it looks like an array
        if (config.staticValue.trim().startsWith('[') && config.staticValue.trim().endsWith(']')) {
          return JSON.parse(config.staticValue);
        } else {
          // Otherwise, treat as comma-separated values
          return config.staticValue.split(',').map(item => item.trim());
        }
      } catch {
        // Fallback to array with single value
        return [config.staticValue];
      }
    } else if (fieldType === 'object' || /^props|^options|^config|^settings|^attributes|^metadata|^data$/.test(fieldName.toLowerCase())) {
      // Try to parse as JSON if it's an object or named like it might be an object
      try {
        if (config.staticValue.trim().startsWith('{') && config.staticValue.trim().endsWith('}')) {
          return JSON.parse(config.staticValue);
        } else {
          return config.staticValue;
        }
      } catch {
        return config.staticValue;
      }
    } else {
      return config.staticValue;
    }
  }

  // Use the random type from config if available, otherwise use the field type
  const typeToGenerate = config?.randomType && config.randomType !== RandomDataType.Default 
    ? config.randomType 
    : fieldType;
    
  // Pre-define variables that may be used in switch cases
  const fieldName = config?.fieldName?.toLowerCase() || '';
  const objFieldName = fieldName; // Same value but separate for clarity in different cases

  // Special handling for validateEmail - it should always return a boolean
  if (config?.fieldName === 'validateEmail') {
    return chance.bool();
  }

  switch (typeToGenerate) {
    // ID types
    case RandomDataType.ID:
    case 'id':
      return chance.natural({ min: 1000, max: 100000 });
    case RandomDataType.GUID:
    case 'guid':
      return chance.guid();

    // Name types
    case RandomDataType.Name:
    case 'name':
      return chance.name();
    case RandomDataType.FirstName:
    case 'firstName':
      return chance.first();
    case RandomDataType.LastName:
    case 'lastName':
      return chance.last();
    
    // Contact types
    case RandomDataType.Email:
    case 'email':
      return chance.email();
    case RandomDataType.Phone:
    case 'phone':
      return chance.phone();
    
    // Address types
    case RandomDataType.Address:
    case 'address':
      return chance.address();
    case RandomDataType.City:
    case 'city':
      return chance.city();
    case RandomDataType.State:
    case 'state':
      return chance.state();
    case RandomDataType.Country:
    case 'country':
      return chance.country();
    case RandomDataType.ZipCode:
    case 'zip':
      return chance.zip();
    
    // Date and time
    case RandomDataType.Date:
    case 'date':
      return chance.date().toISOString();
    
    // Personal attributes
    case RandomDataType.Age:
    case 'age':
      return chance.age();
    case RandomDataType.Gender:
    case 'gender':
      return chance.gender();
    
    // Web and content
    case RandomDataType.URL:
    case 'url':
      return chance.url();
    case RandomDataType.Text:
    case 'text':
      return chance.paragraph();
    
    // Business and financial
    case RandomDataType.Price:
    case 'price':
      return parseFloat(chance.dollar().replace('$', ''));
    case RandomDataType.CompanyName:
      return chance.company();
    case RandomDataType.JobTitle:
      return chance.profession();
    
    // Credentials
    case RandomDataType.Username:
      return chance.twitter().substring(1); // removes @ symbol
    case RandomDataType.Password:
      return chance.string({ length: 12, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*' });
    case RandomDataType.CreditCardNumber:
      return chance.cc();
    case RandomDataType.CreditCardType:
      return chance.cc_type();
    
    // Media
    case RandomDataType.Image:
    case 'image':
      return `https://picsum.photos/id/${chance.integer({ min: 1, max: 1000 })}/200/200`;
    case RandomDataType.Color:
    case 'color':
      return chance.color();
    
    // Basic types
    case RandomDataType.Boolean:
    case 'boolean':
      return chance.bool();
    case RandomDataType.Number:
    case 'number':
      return chance.floating({ min: 0, max: 1000, fixed: 2 });
    case 'string':
      return chance.string({ length: 10 });
    case 'array':
      // Special handling for additionalEmails and additionalPhones
      if (fieldName.includes('additionalemail')) {
        const count = chance.integer({ min: 1, max: 3 });
        return Array.from({ length: count }, () => ({ 
          email: chance.email(),
          isPrimary: false
        }));
      } else if (fieldName.includes('additionalphone')) {
        const count = chance.integer({ min: 1, max: 3 });
        return Array.from({ length: count }, () => ({ 
          number: chance.phone(),
          type: chance.pickone(['mobile', 'home', 'work'])
        }));
      } 
      // Special handling for relations array in task format
      else if (fieldName === 'relations') {
        const count = chance.integer({ min: 1, max: 2 });
        return Array.from({ length: count }, () => ({
          associationId: `TASK_${chance.string({ length: 8, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' })}_ASSOCIATION`,
          recordId: chance.string({ length: 20, pool: 'abcdefghijklmnopqrstuvwxyz0123456789' })
        }));
      }
      // Generate appropriate arrays based on field name if available
      else if (fieldName.includes('email')) {
        return Array.from({ length: chance.integer({ min: 1, max: 3 }) }, () => chance.email());
      } else if (fieldName.includes('phone')) {
        return Array.from({ length: chance.integer({ min: 1, max: 3 }) }, () => chance.phone());
      } else if (fieldName.includes('address')) {
        return Array.from({ length: chance.integer({ min: 1, max: 3 }) }, () => chance.address());
      } else if (fieldName.includes('name')) {
        return Array.from({ length: chance.integer({ min: 1, max: 3 }) }, () => chance.name());
      } else if (fieldName.includes('id')) {
        return Array.from({ length: chance.integer({ min: 1, max: 5 }) }, () => chance.natural({ min: 1000, max: 100000 }));
      } else {
        return Array.from({ length: chance.integer({ min: 1, max: 3 }) }, () => chance.word());
      }
    case 'object':
      // Generate appropriate objects based on field name if available
      if (objFieldName.includes('address')) {
        return {
          street: chance.street(),
          city: chance.city(),
          state: chance.state(),
          zip: chance.zip(),
          country: chance.country()
        };
      } else if (objFieldName.includes('contact')) {
        return {
          email: chance.email(),
          phone: chance.phone()
        };
      } else if (objFieldName.includes('user') || objFieldName.includes('person')) {
        return {
          id: chance.natural({ min: 1000, max: 9999 }),
          name: chance.name(),
          email: chance.email()
        };
      } 
      // Handle task properties object
      else if (objFieldName === 'properties') {
        return {
          title: chance.sentence({ words: 3 }),
          description: chance.paragraph({ sentences: 1 }),
          dueDate: new Date(Date.now() + 86400000 * chance.integer({ min: 1, max: 14 })).toISOString(),
          completed: chance.bool()
        };
      }
      // Handle config object for tasks
      else if (objFieldName === 'config') {
        return {
          recurringTask: {
            title: chance.sentence({ words: 3 }),
            description: chance.paragraph({ sentences: 1 }),
            owners: [],
            contactIds: [chance.string({ length: 20, pool: 'abcdefghijklmnopqrstuvwxyz0123456789' })],
            ignoreTaskCreation: chance.bool(),
            rruleOptions: {
              interval: chance.integer({ min: 1, max: 5 }),
              intervalType: chance.pickone(['daily', 'weekly', 'monthly']),
              startDate: new Date().toISOString(),
              dueAfterSeconds: 60 * 60 * chance.integer({ min: 1, max: 24 }),
              count: null,
              endDate: null
            }
          }
        };
      }
      else {
        return { key: chance.word(), value: chance.word() };
      }
    
    default:
      return chance.word();
  }
};

/**
 * Generate data entries based on the parsed CURL
 * @param parsedCurl - The parsed CURL object
 * @param count - Number of entries to generate
 * @param fieldConfigs - Optional field configurations
 * @param runApi - Whether to run API requests
 * @param expectedStatus - Expected HTTP status code
 * @param generationMethod - Method to use for generating data
 * @returns Object containing generated data and optional API results
 */
export const generateDataFromCurl = async (
  parsedCurl: ParsedCurl,
  count: number,
  fieldConfigs: Record<string, FieldConfig> = {},
  runApi = false,
  expectedStatus = 200,
  generationMethod: GenerationMethod = GenerationMethod.Loop
): Promise<{ entries: Record<string, unknown>[], apiResults?: ApiResult[] }> => {
  const fields = extractFieldsFromParsedCurl(parsedCurl);
  
  if (generationMethod === GenerationMethod.ParallelPromises) {
    return generateDataParallel(parsedCurl, fields, count, fieldConfigs, runApi, expectedStatus);
  } else {
    return generateDataLoop(parsedCurl, fields, count, fieldConfigs, runApi, expectedStatus);
  }
};

/**
 * Generate data using sequential loop method (original implementation)
 */
const generateDataLoop = async (
  parsedCurl: ParsedCurl,
  fields: Record<string, FieldMetadata>,
  count: number,
  fieldConfigs: Record<string, FieldConfig>,
  runApi: boolean,
  expectedStatus: number
): Promise<{ entries: Record<string, unknown>[], apiResults?: ApiResult[] }> => {
  const entries: Record<string, unknown>[] = [];
  const apiResults: ApiResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const entry = generateEntry(fields, fieldConfigs);
    entries.push(entry);
    
    if (runApi) {
      const apiResult = await makeApiRequest(parsedCurl, entry, expectedStatus);
      apiResults.push(apiResult);
    }
  }
  
  return { entries, ...(runApi && { apiResults }) };
};

/**
 * Generate data using parallel promises method
 */
const generateDataParallel = async (
  parsedCurl: ParsedCurl,
  fields: Record<string, FieldMetadata>,
  count: number,
  fieldConfigs: Record<string, FieldConfig>,
  runApi: boolean,
  expectedStatus: number
): Promise<{ entries: Record<string, unknown>[], apiResults?: ApiResult[] }> => {
  // Generate all entries in parallel
  const entryPromises = Array.from({ length: count }, () => 
    Promise.resolve(generateEntry(fields, fieldConfigs))
  );
  
  const entries = await Promise.all(entryPromises);
  
  if (runApi) {
    // Make all API requests in parallel
    const apiPromises = entries.map(entry => 
      makeApiRequest(parsedCurl, entry, expectedStatus)
    );
    
    const apiResults = await Promise.all(apiPromises);
    return { entries, apiResults };
  }
  
  return { entries };
};

/**
 * Make a single API request
 */
const makeApiRequest = async (
  parsedCurl: ParsedCurl,
  entry: Record<string, unknown>,
  expectedStatus: number
): Promise<ApiResult> => {
  try {
    const method = parsedCurl.method.toUpperCase();
    const isGetOrHead = method === 'GET' || method === 'HEAD';
    
    let url = parsedCurl.url;
    const requestOptions: RequestInit = {
      method: parsedCurl.method,
      headers: parsedCurl.headers,
    };
    
    // For GET/HEAD methods, append query parameters to URL instead of using body
    if (isGetOrHead && entry) {
      const queryParams = new URLSearchParams();
      Object.entries(entry).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      // Append query parameters to URL
      const hasExistingParams = url.includes('?');
      url = `${url}${hasExistingParams ? '&' : '?'}${queryParams.toString()}`;
    } else {
      // Check if the entry contains a properties field which should be an object
      const entryForRequest = { ...entry };
      if (entry.properties && typeof entry.properties === 'object') {
        // Ensure properties is treated as an object, not a dotted path
        entryForRequest.properties = entry.properties;
      }
      
      // For other methods, include the body as JSON
      requestOptions.body = JSON.stringify(entryForRequest);
    }
    
    const response = await fetch(url, requestOptions);
    
    const result: ApiResult = {
      status: response.status,
      success: response.status === expectedStatus
    };
    
    try {
      result.response = await response.json();
    } catch {
      // Response might not be JSON
      result.response = await response.text();
    }
    
    return result;
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to make API request'
    };
  }
};

/**
 * Generate a single entry based on field definitions
 * @param fields - Field definitions
 * @param fieldConfigs - Field configurations
 * @returns Generated entry object
 */
const generateEntry = (
  fields: Record<string, FieldMetadata>,
  fieldConfigs: Record<string, FieldConfig>
): Record<string, unknown> => {
  const entry: Record<string, unknown> = {};
  
  // First, identify and process any indexed arrays (relations.0, relations.1, etc.)
  const indexedArrays: Record<string, unknown[]> = {};
  
  Object.keys(fields).forEach(fieldName => {
    const match = /^(.+)\.(\d+)$/.exec(fieldName);
    if (match) {
      const arrayName = match[1];
      const index = parseInt(match[2]);
      
      // Initialize array if needed
      if (!indexedArrays[arrayName]) {
        indexedArrays[arrayName] = [];
      }
      
      // Ensure array has enough slots
      while (indexedArrays[arrayName].length <= index) {
        indexedArrays[arrayName].push({});
      }
    }
  });
  
  // Group fields by their nested path structure
  const fieldGroups: Record<string, Record<string, FieldMetadata>> = {
    '': {} // Root level fields
  };
  
  // Organize fields into nested groups
  Object.entries(fields).forEach(([fieldName, metadata]) => {
    // Skip indexed array fields as they'll be handled separately
    if (/^.+\.\d+$/.test(fieldName) && !fieldName.includes('.', fieldName.indexOf('.') + 1)) {
      return;
    }
    
    const parts = fieldName.split('.');
    if (parts.length === 1) {
      // Root level field
      fieldGroups[''][fieldName] = metadata;
    } else {
      // Nested field
      const parentPath = parts.slice(0, -1).join('.');
      const lastPart = parts[parts.length - 1];
      
      if (!fieldGroups[parentPath]) {
        fieldGroups[parentPath] = {};
      }
      
      fieldGroups[parentPath][lastPart] = metadata;
    }
  });
  
  // Generate values for root level fields
  Object.entries(fieldGroups['']).forEach(([fieldName, metadata]) => {
    // Skip indexed arrays as they'll be handled separately
    if (indexedArrays[fieldName]) {
      return;
    }
    
    const identifiedType = identifyFieldType(fieldName, metadata.type);
    const value = generateValueForField(identifiedType, fieldConfigs[fieldName]);
    
    // Add to entry with appropriate type
    entry[fieldName] = value;
  });
  
  // Process indexed arrays
  Object.keys(indexedArrays).forEach(arrayName => {
    // Check if we have a pre-existing array in the fields
    if (fields[arrayName] && fields[arrayName].type === 'array') {
      const identifiedType = 'array';
      const configuredValue = fieldConfigs[arrayName] ? 
        generateValueForField(identifiedType, fieldConfigs[arrayName]) : 
        fields[arrayName].originalValue;
        
      entry[arrayName] = configuredValue;
    } else {
      // Build the array from the individual indexed fields
      const array: unknown[] = [];
      
      // Group all fields by their index
      const indexedFieldGroups: Record<number, string[]> = {};
      
      // Get all indexed fields for this array and organize by index
      Object.keys(fields)
        .filter(key => key.startsWith(`${arrayName}.`))
        .forEach(field => {
          const parts = field.split('.');
          if (parts.length >= 2) {
            const index = parseInt(parts[1]);
            if (!isNaN(index)) {
              if (!indexedFieldGroups[index]) {
                indexedFieldGroups[index] = [];
              }
              indexedFieldGroups[index].push(field);
            }
          }
        });
      
      // Process each index
      Object.keys(indexedFieldGroups)
        .map(idx => parseInt(idx))
        .sort((a, b) => a - b)
        .forEach(index => {
          const fieldsForIndex = indexedFieldGroups[index];
          
          // Create an object for this index
          const obj: Record<string, unknown> = {};
          
          // Process simple fields (relations.0.name)
          fieldsForIndex.forEach(field => {
            const parts = field.split('.');
            
            // Handle direct properties (like relations.0.name)
            if (parts.length === 3) {
              const propName = parts[2];
              const metadata = fields[field];
              const identifiedType = identifyFieldType(propName, metadata.type);
              const configKey = fieldConfigs[field] ? field : null;
              const value = configKey ? 
                generateValueForField(identifiedType, fieldConfigs[configKey]) : 
                metadata.originalValue;
                
              obj[propName] = value;
            }
            // Handle nested properties (relations.0.address.street)
            else if (parts.length > 3) {
              const nestedPath = parts.slice(2).join('.');
              const nestedParts = nestedPath.split('.');
              
              // Build or update nested object structure
              let current = obj;
              for (let i = 0; i < nestedParts.length - 1; i++) {
                const part = nestedParts[i];
                if (!current[part] || typeof current[part] !== 'object') {
                  current[part] = {};
                }
                current = current[part] as Record<string, unknown>;
              }
              
              // Set the value at the leaf
              const leafProp = nestedParts[nestedParts.length - 1];
              const metadata = fields[field];
              const identifiedType = identifyFieldType(leafProp, metadata.type);
              const configKey = fieldConfigs[field] ? field : null;
              const value = configKey ? 
                generateValueForField(identifiedType, fieldConfigs[configKey]) : 
                metadata.originalValue;
                
              current[leafProp] = value;
            }
          });
          
          // Ensure the object is not empty - for relations specifically
          if (arrayName === 'relations' && Object.keys(obj).length === 0) {
            // Add default properties for relations objects if empty
            obj.id = Math.floor(Math.random() * 1000);
            obj.type = 'default';
          }
          
          // Add the object to the array
          array.push(obj);
        });
      
      // Add the array to the entry
      entry[arrayName] = array;
    }
  });
  
  // Function to recursively build nested objects
  const buildNestedObject = (path: string): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    
    // Process direct child fields
    const childFields = fieldGroups[path] || {};
    
    Object.entries(childFields).forEach(([fieldName, metadata]) => {
      const fullPath = path ? `${path}.${fieldName}` : fieldName;
      const identifiedType = identifyFieldType(fieldName, metadata.type);
      const value = generateValueForField(identifiedType, fieldConfigs[fullPath]);
      
      // Add to result with appropriate type
      result[fieldName] = value;
    });
    
    // Find and process nested child objects
    const childPrefixes = Object.keys(fieldGroups)
      .filter(key => key.startsWith(`${path}.`) && key.split('.').length === path.split('.').length + 1);
    
    childPrefixes.forEach(childPrefix => {
      const childName = childPrefix.substring(path ? path.length + 1 : 0);
      result[childName] = buildNestedObject(childPrefix);
    });
    
    return result;
  };
  
  // Find all top-level nested objects (paths with one dot)
  const topLevelPaths = Object.keys(fieldGroups)
    .filter(key => key !== '' && !key.includes('.'));
  
  // Build nested objects and add them to the entry
  topLevelPaths.forEach(path => {
    // Skip indexed arrays as they've been handled
    if (!indexedArrays[path]) {
      entry[path] = buildNestedObject(path);
    }
  });
  
  return entry;
};

/**
 * Extract field structure from parsed CURL request body
 * @param parsedCurl - The parsed CURL object
 * @returns Record of field names and their data types
 */
const extractFieldsFromParsedCurl = (parsedCurl: ParsedCurl): Record<string, FieldMetadata> => {
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
        
        // Special handling for relations array - extract fields from each relation
        if (key === 'relations' && value.length > 0) {
          value.forEach((relation, index) => {
            if (relation && typeof relation === 'object') {
              Object.entries(relation as Record<string, unknown>).forEach(([relKey, relValue]) => {
                fields[`${fullKey}.${index}.${relKey}`] = { 
                  type: typeof relValue, 
                  originalValue: relValue 
                };
              });
            }
          });
        }
      } else if (typeof value === 'object') {
        // Handle the special case of properties object that contains model fields
        if ((key === 'properties' || key === 'config') && value && !Array.isArray(value)) {
          // For properties and config, we want to both extract the fields and keep the object intact
          fields[fullKey] = { type: 'object', originalValue: value };
          extractFields(value as Record<string, unknown>, fullKey);
          
          // Special handling for recurringTask in config
          if (key === 'config' && (value as Record<string, unknown>).recurringTask) {
            const recurringTask = (value as Record<string, unknown>).recurringTask;
            if (recurringTask && typeof recurringTask === 'object' && !Array.isArray(recurringTask)) {
              fields[`${fullKey}.recurringTask`] = { type: 'object', originalValue: recurringTask };
              extractFields(recurringTask as Record<string, unknown>, `${fullKey}.recurringTask`);
              
              // Handle rruleOptions specifically
              const rruleOptions = (recurringTask as Record<string, unknown>).rruleOptions;
              if (rruleOptions && typeof rruleOptions === 'object' && !Array.isArray(rruleOptions)) {
                fields[`${fullKey}.recurringTask.rruleOptions`] = { type: 'object', originalValue: rruleOptions };
                extractFields(rruleOptions as Record<string, unknown>, `${fullKey}.recurringTask.rruleOptions`);
              }
            }
          }
        } else {
          extractFields(value as Record<string, unknown>, fullKey);
        }
      } else if (typeof value === 'boolean' || 
                 (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) ||
                 key.toLowerCase().includes('is') || 
                 key.toLowerCase().includes('has') || 
                 key.toLowerCase().includes('can') ||
                 key.toLowerCase().includes('enable') ||
                 key.toLowerCase().includes('allow') ||
                 key.toLowerCase().includes('flag')) {
        // Identify boolean fields more reliably by value and naming conventions
        fields[fullKey] = { 
          type: 'boolean', 
          originalValue: typeof value === 'string' ? value.toLowerCase() === 'true' : value
        };
      } else {
        // Check for indexed array patterns like relations.0, relations.1, etc.
        const arrayIndexMatch = /^(.+)\.(\d+)$/.exec(fullKey);
        if (arrayIndexMatch) {
          const arrayName = arrayIndexMatch[1];
          const arrayIndex = parseInt(arrayIndexMatch[2]);
          
          // Create the array if it doesn't exist yet
          if (!fields[arrayName]) {
            fields[arrayName] = { 
              type: 'array', 
              originalValue: []
            };
          }
          
          // Make sure we're working with an array
          if (fields[arrayName].type === 'array') {
            // Ensure the originalValue is an array
            if (!Array.isArray(fields[arrayName].originalValue)) {
              fields[arrayName].originalValue = [];
            }
            
            // Add the value at the appropriate index
            const array = fields[arrayName].originalValue as unknown[];
            // Expand the array if needed to accommodate the index
            while (array.length <= arrayIndex) {
              array.push({});
            }
            
            // Update the value at the index
            if (typeof array[arrayIndex] === 'object') {
              (array[arrayIndex] as Record<string, unknown>)[key] = value;
            } else {
              array[arrayIndex] = value;
            }
          }
          
          // Also keep the individual field for reference
          fields[fullKey] = { 
            type: typeof value,
            originalValue: value
          };
        }
        // If the field name indicates an array but value is not an array (yet)
        else if (/s$|list$|array$|items$|collection$|^additional|^relation/.test(key.toLowerCase())) {
          fields[fullKey] = { 
            type: 'array', 
            originalValue: Array.isArray(value) ? value : [value]
          };
        }
        // If field name indicates it's likely an object
        else if (/^props|^options|^config|^settings|^attributes|^metadata|^data$/.test(key.toLowerCase())) {
          fields[fullKey] = {
            type: 'object',
            originalValue: typeof value === 'object' ? value : { value }
          };
        } else {
          fields[fullKey] = { 
            type: typeof value, 
            originalValue: value
          };
        }
      }
    });
  };
  
  if (typeof parsedCurl.body === 'object') {
    extractFields(parsedCurl.body as Record<string, unknown>);
  } else if (typeof parsedCurl.body === 'string') {
    try {
      const jsonBody = JSON.parse(parsedCurl.body);
      if (typeof jsonBody === 'object' && jsonBody !== null) {
        extractFields(jsonBody as Record<string, unknown>);
      }
    } catch {
      const formParts = parsedCurl.body.split('&');
      formParts.forEach(part => {
        const [key, value] = part.split('=');
        if (key) {
          // Check if the value might be a boolean
          if (value && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false' || 
              key.toLowerCase().includes('is') || key.toLowerCase().includes('has') || 
              key.toLowerCase().includes('can') || key.toLowerCase().includes('enable') ||
              key.toLowerCase().includes('allow') || key.toLowerCase().includes('flag'))) {
            fields[key] = { 
              type: 'boolean',
              originalValue: value ? value.toLowerCase() === 'true' : false
            };
          } else {
            fields[key] = { 
              type: value ? typeof value : 'string',
              originalValue: value || ''
            };
          }
        }
      });
    }
  }
  
  return fields;
};

/**
 * Convert data entries to CSV format
 * @param data - Array of data objects
 * @returns CSV string
 */
export const convertToCSV = (data: Record<string, unknown>[]): string => {
  if (!data || data.length === 0) return '';
  
  // Get headers
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        
        // Handle different types
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
};