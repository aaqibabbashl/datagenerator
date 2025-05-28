export interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
  error?: string;
}

export interface GeneratedData {
  entries: Record<string, unknown>[];
  format: 'json' | 'csv';
  apiResults?: ApiResult[];
}

export interface ApiResult {
  status: number;
  success: boolean;
  response?: unknown;
  error?: string;
}

export interface AppState {
  curlInput: string;
  parsedCurl: ParsedCurl | null;
  numberOfEntries: number;
  generatedData: GeneratedData | null;
  error: string | null;
  isLoading: boolean;
  fieldConfigs: Record<string, FieldConfig>;
  runApiRequests: boolean;
  expectedStatus: number;
}

export interface FieldConfig {
  type: string;
  isStatic: boolean;
  staticValue?: string;
  randomType?: RandomDataType;
  fieldName?: string;
}

export interface FieldMetadata {
  type: string;
  originalValue: unknown;
}

export enum RandomDataType {
  Default = 'default',
  Name = 'name',
  FirstName = 'firstName',
  LastName = 'lastName',
  Email = 'email',
  Phone = 'phone',
  Address = 'address',
  City = 'city',
  State = 'state',
  Country = 'country',
  ZipCode = 'zip',
  Date = 'date',
  Age = 'age',
  Gender = 'gender',
  URL = 'url',
  Text = 'text',
  Price = 'price',
  Image = 'image',
  Color = 'color',
  Boolean = 'boolean',
  Number = 'number',
  ID = 'id',
  GUID = 'guid',
  CompanyName = 'companyName',
  JobTitle = 'jobTitle',
  Username = 'username',
  Password = 'password',
  CreditCardNumber = 'creditCardNumber',
  CreditCardType = 'creditCardType'
}