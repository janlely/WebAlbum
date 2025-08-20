export interface PhotoFrame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  placeholder?: string;
}

export interface TextFrame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  placeholder?: string;
}

export interface Page {
  id: string;
  width: number;
  height: number;
  photoFrames: PhotoFrame[];
  textFrames: TextFrame[];
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  pages: Page[];
}

export interface PhotoData {
  id: string;
  url: string;
  frameId: string;
  pageId: string;
}

export interface TextData {
  id: string;
  content: string;
  frameId: string;
  pageId: string;
}
