declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '@editorjs/checklist' {
  import type { ToolConstructable } from '@editorjs/editorjs';
  const Checklist: ToolConstructable;
  export default Checklist;
}

declare module '@editorjs/link' {
  import type { ToolConstructable } from '@editorjs/editorjs';
  const LinkTool: ToolConstructable;
  export default LinkTool;
}

declare module '@editorjs/marker' {
  import type { ToolConstructable } from '@editorjs/editorjs';
  const Marker: ToolConstructable;
  export default Marker;
}

declare module '@editorjs/raw' {
  import type { ToolConstructable } from '@editorjs/editorjs';
  const Raw: ToolConstructable;
  export default Raw;
}