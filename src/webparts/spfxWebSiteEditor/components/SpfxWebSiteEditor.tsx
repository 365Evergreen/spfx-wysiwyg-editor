import * as React from 'react';
import { SPHttpClient } from '@microsoft/sp-http';
import styles from './SpfxWebSiteEditor.module.scss';
import { EditorJsComponent, IEditorJsOutput } from './EditorJsComponent';
import { ISpfxWebSiteEditorProps } from './ISpfxWebSiteEditorProps';

export const MySpfxWebPartRoot: React.FC<ISpfxWebSiteEditorProps> = (props) => {
  const [editorJson, setEditorJson] = React.useState<IEditorJsOutput | null>(null);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [statusMessage, setStatusMessage] = React.useState<string>('');

  const pageJsonFieldName = props.pageJsonFieldName?.trim() || 'EditorJson';
  const exportSiteUrl = props.exportSiteUrl?.trim() || props.siteUrl;
  const exportListTitle = props.exportListTitle?.trim() || '';
  const exportJsonFieldName = props.exportJsonFieldName?.trim() || 'ContentJson';

  const handleEditorChange = (jsonContent: IEditorJsOutput): void => {
    setEditorJson(jsonContent);
    setStatusMessage('');
    
    // Example: Print the strict JSON schema straight to your console
    console.log('Structured JSON block output:', JSON.stringify(jsonContent, null, 2));
  };

  const postJson = async (url: string, options: Parameters<SPHttpClient['post']>[2]): Promise<void> => {
    const response = await props.spHttpClient.post(url, SPHttpClient.configurations.v1, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }
  };

  const saveToCurrentPage = async (jsonContent: IEditorJsOutput): Promise<void> => {
    if (!props.pageListId || !props.pageItemId) {
      throw new Error('Current page context is unavailable. Add this web part to a Site Page before saving.');
    }

    await postJson(
      `${props.siteUrl}/_api/web/lists(guid'${props.pageListId}')/items(${props.pageItemId})`,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'IF-MATCH': '*',
          'X-HTTP-Method': 'MERGE'
        },
        body: JSON.stringify({
          [pageJsonFieldName]: JSON.stringify(jsonContent)
        })
      }
    );
  };

  const exportToList = async (jsonContent: IEditorJsOutput): Promise<void> => {
    if (!exportListTitle) {
      return;
    }

    await postJson(
      `${exportSiteUrl}/_api/web/lists/getbytitle('${exportListTitle.replace(/'/g, "''")}')/items`,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata'
        },
        body: JSON.stringify({
          Title: `${props.description || 'Editor JSON'} ${new Date().toISOString()}`,
          [exportJsonFieldName]: JSON.stringify(jsonContent, null, 2)
        })
      }
    );
  };

  const handleSave = async (): Promise<void> => {
    if (!editorJson) {
      setStatusMessage('Add content before saving.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Saving content...');

    try {
      await saveToCurrentPage(editorJson);
      await exportToList(editorJson);

      setStatusMessage(
        exportListTitle
          ? `Saved to the current page and exported JSON to ${exportListTitle}.`
          : 'Saved to the current page. Configure Export list title to also export JSON to a list.'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown save error.';
      setStatusMessage(`Save failed: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.spfxWebSiteEditor}>
      <h2>{props.description || 'Interactive Structured Editor'}</h2>
      <EditorJsComponent onContentChange={handleEditorChange} />
      
      {editorJson && (
        <div className={styles.counterPanel}>
          <h4>Live JSON Block Counter:</h4>
          <p>You have created <strong>{editorJson.blocks.length}</strong> separate data blocks.</p>
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.saveButton} onClick={handleSave} disabled={isSaving || !editorJson}>
          {isSaving ? 'Saving...' : 'Save Page And Export JSON'}
        </button>
        <p className={styles.metaText}>
          Page field: <strong>{pageJsonFieldName}</strong>{exportListTitle ? ` | Export: ${exportSiteUrl} / ${exportListTitle} / ${exportJsonFieldName}` : ' | Export list not configured'}
        </p>
        {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
      </div>
    </div>
  );
};
export default MySpfxWebPartRoot;