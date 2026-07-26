import { SPHttpClient } from '@microsoft/sp-http';

export interface ISpfxWebSiteEditorProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  userDisplayName: string;
  spHttpClient: SPHttpClient;
  siteUrl: string;
  pageListId?: string;
  pageItemId?: number;
  pageJsonFieldName?: string;
  exportSiteUrl?: string;
  exportListTitle?: string;
  exportJsonFieldName?: string;
}
