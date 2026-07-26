import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'SpfxWebSiteEditorWebPartStrings';
import { ISpfxWebSiteEditorProps } from './components/ISpfxWebSiteEditorProps';
import { MySpfxWebPartRoot } from './components/SpfxWebSiteEditor';

export interface ISpfxWebSiteEditorWebPartProps {
  description: string;
  pageJsonFieldName?: string;
  exportSiteUrl?: string;
  exportListTitle?: string;
  exportJsonFieldName?: string;
}

export default class SpfxWebSiteEditorWebPart extends BaseClientSideWebPart<ISpfxWebSiteEditorWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<ISpfxWebSiteEditorProps> = (
      <MySpfxWebPartRoot
        description={this.properties.description}
        isDarkTheme={this._isDarkTheme}
        environmentMessage={this._environmentMessage}
        userDisplayName={this.context.pageContext.user.displayName}
        spHttpClient={this.context.spHttpClient}
        siteUrl={this.context.pageContext.web.absoluteUrl}
        pageListId={this.context.pageContext.list?.id.toString()}
        pageItemId={this.context.pageContext.listItem?.id}
        pageJsonFieldName={this.properties.pageJsonFieldName}
        exportSiteUrl={this.properties.exportSiteUrl}
        exportListTitle={this.properties.exportListTitle}
        exportJsonFieldName={this.properties.exportJsonFieldName}
      />
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams':
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('pageJsonFieldName', {
                  label: 'Page JSON field internal name',
                  description: 'Column on the current page item used to store the Editor.js JSON. Defaults to EditorJson.'
                }),
                PropertyPaneTextField('exportSiteUrl', {
                  label: 'Export site URL',
                  description: 'Target site for JSON export. Leave blank to use the current site.'
                }),
                PropertyPaneTextField('exportListTitle', {
                  label: 'Export list title',
                  description: 'List that will receive exported JSON snapshots.'
                }),
                PropertyPaneTextField('exportJsonFieldName', {
                  label: 'Export JSON field internal name',
                  description: 'Multiline text field on the export list used to store the JSON. Defaults to ContentJson.'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}