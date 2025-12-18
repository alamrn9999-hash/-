
export interface Footnote {
  id: string;
  text: string;
}

export interface DocElement {
  type: 'title' | 'heading1' | 'heading2' | 'paragraph';
  text: string; // يحتوي النص على واسمات مثل [[FN:1]] لتحديد موضع الحاشية بدقة
}

export interface StructuredDocument {
  title: string;
  elements: DocElement[];
  footnotes: Footnote[];
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
