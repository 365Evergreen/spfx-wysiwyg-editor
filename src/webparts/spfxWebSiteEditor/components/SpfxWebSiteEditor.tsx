import * as React from 'react';
import styles from './SpfxWebSiteEditor.module.scss';
import { EditorJsComponent, IEditorJsOutput } from './EditorJsComponent';
import { ISpfxWebSiteEditorProps } from './ISpfxWebSiteEditorProps';

export const MySpfxWebPartRoot: React.FC<ISpfxWebSiteEditorProps> = (props) => {
  const [editorJson, setEditorJson] = React.useState<IEditorJsOutput | null>(null);

  const handleEditorChange = (jsonContent: IEditorJsOutput): void => {
    setEditorJson(jsonContent);
    
    // Example: Print the strict JSON schema straight to your console
    console.log('Structured JSON block output:', JSON.stringify(jsonContent, null, 2));
  };

  return (
    <div className={styles.spfxWebSiteEditor}>
      <h2>{props.description || 'Interactive Structured Editor'}</h2>
      <EditorJsComponent onContentChange={handleEditorChange} />
      
      {editorJson && (
        <div>
          <h4>Live JSON Block Counter:</h4>
          <p>You have created <strong>{editorJson.blocks.length}</strong> separate data blocks.</p>
        </div>
      )}
    </div>
  );
};
export default MySpfxWebPartRoot;