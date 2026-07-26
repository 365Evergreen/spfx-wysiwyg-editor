import * as React from 'react';
import type { OutputData, ToolConstructable } from '@editorjs/editorjs';

interface IEditorJsBlockData {
  [key: string]: unknown;
}

interface IEditorJsUploaderResult {
  success: 1;
  file: {
    url: string;
    name: string;
    size: number;
  };
}

// Define the shape of the Editor.js JSON data structure
export interface IEditorJsOutput {
  time?: number;
  blocks: Array<{
    id?: string;
    type: string;
    data: IEditorJsBlockData;
  }>;
  version?: string;
}

interface IEditorJsComponentProps {
  initialData?: IEditorJsOutput;
  onContentChange: (jsonContent: IEditorJsOutput) => void;
}

export const EditorJsComponent: React.FC<IEditorJsComponentProps> = (props) => {
  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const editorInstanceRef = React.useRef<{ destroy?: () => void; save: () => Promise<OutputData> } | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const uploadImageAsDataUrl = async (file: File): Promise<IEditorJsUploaderResult> => {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
            return;
          }

          reject(new Error('Unable to convert the selected image to a data URL.'));
        };

        reader.onerror = () => reject(reader.error || new Error('Unable to read the selected image.'));
        reader.readAsDataURL(file);
      });

      return {
        success: 1,
        file: {
          url,
          name: file.name,
          size: file.size
        }
      };
    };

    // Async function to load modules safely in the client browser
    const initEditor = async (): Promise<void> => {
      // 1. Dynamic imports to prevent SPFx SSR build-time errors
      const { default: EditorJS } = await import(/* webpackChunkName: 'editorjs-core' */ '@editorjs/editorjs');
      const { default: Header } = await import(/* webpackChunkName: 'editorjs-header' */ '@editorjs/header');
      const { default: List } = await import(/* webpackChunkName: 'editorjs-list' */ '@editorjs/list');
      const { default: Checklist } = await import(/* webpackChunkName: 'editorjs-checklist' */ '@editorjs/checklist');
      const { default: Quote } = await import(/* webpackChunkName: 'editorjs-quote' */ '@editorjs/quote');
      const { default: Code } = await import(/* webpackChunkName: 'editorjs-code' */ '@editorjs/code');
      const { default: ImageTool } = await import(/* webpackChunkName: 'editorjs-image' */ '@editorjs/image');
      const { default: Table } = await import(/* webpackChunkName: 'editorjs-table' */ '@editorjs/table');
      const { default: Delimiter } = await import(/* webpackChunkName: 'editorjs-delimiter' */ '@editorjs/delimiter');
      const { default: Warning } = await import(/* webpackChunkName: 'editorjs-warning' */ '@editorjs/warning');
      const { default: Marker } = await import(/* webpackChunkName: 'editorjs-marker' */ '@editorjs/marker');
      const { default: InlineCode } = await import(/* webpackChunkName: 'editorjs-inline-code' */ '@editorjs/inline-code');
      const { default: LinkTool } = await import(/* webpackChunkName: 'editorjs-link' */ '@editorjs/link');
      const { default: Embed } = await import(/* webpackChunkName: 'editorjs-embed' */ '@editorjs/embed');
      const { default: Raw } = await import(/* webpackChunkName: 'editorjs-raw' */ '@editorjs/raw');
      const { default: Paragraph } = await import(/* webpackChunkName: 'editorjs-paragraph' */ '@editorjs/paragraph');

      if (!isMounted || !editorContainerRef.current) return;

      // 2. Initialize the instance
      const editor = new EditorJS({
        holder: editorContainerRef.current,
        placeholder: 'Click here to write structural content...',
        tools: {
          header: {
            class: Header as ToolConstructable,
            inlineToolbar: ['link', 'marker', 'inlineCode', 'bold', 'italic'],
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List as ToolConstructable,
            inlineToolbar: true
          },
          checklist: {
            class: Checklist as ToolConstructable,
            inlineToolbar: true
          },
          quote: {
            class: Quote as ToolConstructable,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Add a quote',
              captionPlaceholder: 'Quote author or source'
            }
          },
          code: {
            class: Code as ToolConstructable
          },
          image: {
            class: ImageTool as ToolConstructable,
            config: {
              uploader: {
                uploadByFile: uploadImageAsDataUrl
              }
            }
          },
          table: {
            class: Table as ToolConstructable,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3
            }
          },
          delimiter: {
            class: Delimiter as ToolConstructable
          },
          warning: {
            class: Warning as ToolConstructable,
            inlineToolbar: true,
            config: {
              titlePlaceholder: 'Warning title',
              messagePlaceholder: 'Warning details'
            }
          },
          marker: {
            class: Marker as ToolConstructable
          },
          inlineCode: {
            class: InlineCode as ToolConstructable
          },
          linkTool: {
            class: LinkTool as ToolConstructable,
            config: {
              endpoint: 'https://no-op.invalid/editorjs/link'
            }
          },
          embed: {
            class: Embed as ToolConstructable,
            config: {
              services: {
                youtube: true,
                coub: true,
                codepen: true,
                vimeo: true
              }
            }
          },
          raw: {
            class: Raw as ToolConstructable
          },
          paragraph: {
            class: Paragraph as ToolConstructable,
            inlineToolbar: true
          }
        },
        data: props.initialData || { blocks: [] },
        async onChange() {
          // 3. Extract the clean JSON object whenever the user edits
          const savedData: IEditorJsOutput = await editor.save();
          props.onContentChange(savedData);
        }
      });

      editorInstanceRef.current = editor;
    };

    initEditor().catch((err) => console.error('Failed to initialize Editor.js', err));

    // Cleanup when web part shifts or unmounts
    return () => {
      isMounted = false;
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}>
      <div ref={editorContainerRef} />
    </div>
  );
};
