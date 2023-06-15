/* eslint-disable react/jsx-no-bind */
/* eslint-disable @stencil/render-returns-host */
/* eslint-disable @typescript-eslint/ban-types */

import { Component, Element, Event, EventEmitter, h, Prop, State, Watch, Listen } from '@stencil/core';
import { HelixFormWrapperSubmitEvent } from '../../interfaces/form/helix-form-wrapper';
import { HelixFormConfigModel } from '../../interfaces/form/helix-form-v2';
import { HelixEvent, HelixEventPayload, emitHelixEvent } from '../../events/helix-event';
import { HelixConfig, getHelixConfig } from '../../utils/helix';

const regexApiEndpoint = /^\/([A-z\d-_+]+\/)*([A-z\d]+)|(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

@Component({
  tag: 'helix-form-wrapper',
  styleUrl: 'helix-form-wrapper.scss',
  shadow: true,
})
export class HelixFormWrapper implements HelixEvent {
  /**
   * The Host Element
   */
  @Element() public el: HTMLHelixFormWrapperElement;

  /**
   * Stores the form configuration data for mapping to
   * form elements
   */
  private formConfigData: HelixFormConfigModel;

  /**
   * Holds error(s) from the API calls
   */
  private error: string[] = [];

  /**
   * Holds the success message(s) from the POST API call
   */
  private success: string[] = [];

  /**
   * Holds other messages from the API calls
   */
  private other: string[] = [];

  private config: HelixConfig;
  private configPacket: HelixFormWrapperConfigPacket;

  /**
   * Last injected styles
   */
  private injectedStyles: string;

  /**
   * Observes children added to shadow root
   */
  private shadowChildObserver: MutationObserver;

  /**
   * Rendering state to store the current page display
   */
  @State() private renderState: 'LOADING' | 'INVALID_PARAMETER' | 'ERROR' | 'GET_SUCCESS' | 'POST_SUCCESS' | 'NONE' | 'SUCCESS_AND_ERROR' = 'NONE';

  /**
   * Unique identifier for a particular form configuration.
   */
  @Prop() configToken: string;

  /**
   * The client environment to pass to the API.
   */
  @Prop() clientEnvironment?: string;

  /**
   * Fetch API Endpoint url.
   */
  @Prop() apiEndpointUrl: string;

  /**
   * Form Submission Endpoint url.
   */
  @Prop() submissionEndpointUrl: string;

  /**
   * Instructs the render function what to show when error is encountered
   */
  @Prop() containerVisibility: 'SHOW_ONLY_ERROR' | 'SHOW_ONLY_FORM' | 'SHOW_BOTH' = 'SHOW_BOTH';

  /**
   * Prop to display the form always
   */
  @Prop() showFormOnSuccess = false;

  /**
   * API fetch method
   */
  @Prop() method: 'GET' | 'POST' = 'GET';

  /**
   * Scroll the top of the form to be visible after:
   * - 'submission';
   * - 'response';
   * - 'error' (subset of 'response');
   * - false (never scroll)
   */
  @Prop() scrollAfter: boolean | 'submission' | 'response' | 'error' = false;

  /**
   * Comma-delimited references to stylesheet link hrefs in the page.
   * Will try to find the stylesheets and inject into the component shadow dom.
   */
  @Prop() injectShadowStyles: string;

  /**
   * Name added to checked events for analytics
   */
  @Prop() analyticsName = '';

  /**
   * Watches for a change in the form config token (form to load)
   */
  @Watch('configToken')
  protected onConfigTokenChange(): void {
    this.clearConfigPacket();
    this.loadFormConfig();
  }

  /**
   * Watches for changes for the api endpoint url
   */
  @Watch('apiEndpointUrl')
  protected onEndPointUrlChange(): void {
    this.loadFormConfig();
  }

  /**
   * Event to be raised after successful submission of the form
   */
  @Event({ bubbles: true }) formSubmitted: EventEmitter<HelixFormWrapperSubmitEvent>;

  /**
   * Emmited for Analytics tracking
   */
  @Event({ bubbles: true }) public helixEvent: EventEmitter<HelixEventPayload>;

  /**
   * Helix Event Listener for Analytics.
   * Adds formName to events
   */
  @Listen('helixEvent')
  helixEventHandler(event: CustomEvent): void {
    const eventsArray = ['HelixInputFocus', 'HelixCheckboxSelect', 'HelixSelectChange', 'HelixTextareaFocus', 'HelixDatePickerFocus'];

    if (eventsArray.includes(event.detail.name) && this.renderState !== 'LOADING') {
      event.detail.meta[0].formName = this.analyticsName || this.configToken;
    }
    // Additional check to prevent logging
    // HelixDropdownChange event on initial form load
    if (event.detail.name === 'HelixDropdownChange' && event.detail.meta[0].value.length > 0) {
      event.detail.meta[0].formName = this.analyticsName || this.configToken;
    }
  }

  /**
   * When component will load
   */
  protected async componentWillLoad(): Promise<void> {
    this.config = getHelixConfig();

    await this.loadFormConfig();

    if (Boolean(this.injectShadowStyles)) {
      this.injectStyles(this.injectShadowStyles);
    }
  }

  componentWillRender(): void {
    if (this.injectShadowStyles !== this.injectedStyles) {
      this.injectStyles(this.injectShadowStyles);
    }
  }

  /**
   * When component did render
   */
  componentDidRender(): void {
    const helixEventPayloadMeta = [
      {
        renderState: this.renderState,
      },
    ];

    if (this.renderState === 'ERROR' || this.renderState === 'SUCCESS_AND_ERROR') {
      helixEventPayloadMeta[0]['errorMessage'] = this.error;
    }

    if (this.renderState === 'ERROR' || this.renderState === 'SUCCESS_AND_ERROR' || this.renderState === 'GET_SUCCESS' || this.renderState === 'POST_SUCCESS') {
      helixEventPayloadMeta[0]['formName'] = this.analyticsName || this.configToken;
    }

    emitHelixEvent(this.helixEvent, 'HelixFormWrapperRenderChange', [], helixEventPayloadMeta);
  }

  /**
   * Loads a form configuration
   */
  private async loadFormConfig() {
    this.renderState = 'LOADING';
    this.error = [];
    await this.callGetAPI();
  }

  private async getConfigToken(): Promise<string> {
    return (await this.getConfigurationPacket()).configToken || this.configToken;
  }

  private async getApiEndpointUrl(): Promise<string> {
    return this.apiEndpointUrl || (await this.getConfigurationPacket()).apiEndpointUrl;
  }

  private async getSubmissionEndpointUrl(): Promise<string> {
    if (Boolean(this.submissionEndpointUrl)) {
      return this.submissionEndpointUrl;
    }

    // Fall back to the API Endpoint URL
    return (await this.getConfigurationPacket()).submissionEndpointUrl || this.getApiEndpointUrl();
  }

  private clearConfigPacket() {
    this.configPacket = null;
  }

  private async getConfigurationPacket(): Promise<HelixFormWrapperConfigPacket> {
    if (Boolean(this.configPacket)) {
      return this.configPacket;
    }

    if (!Boolean(this.config)) {
      return {};
    }

    const packet = await this.config.get('forms._defaults', {});

    Object.assign(packet, await this.config.get(`forms.${this.configToken}`, {}));

    this.configPacket = packet;

    return packet;
  }

  /**
   * Finds stylesheets in the page and injects into the shadow root.
   * Observes the shadow root and re-appends the injected style
   * when other stylesheets are added.
   * @param refs Comma-delimited references to stylesheet hrefs.
   */
  private injectStyles(refs: string) {
    this.injectedStyles = refs;
    const styleId = 'helix-form-wrapper-injected';
    const existingStyle = this.el.shadowRoot.querySelector(`#${styleId}`);
    let linkRefs: string[];
    let linkSrcSet: Set<string>;

    if (Boolean(existingStyle)) {
      this.el.shadowRoot.removeChild(existingStyle);
    }

    if (Boolean(refs)) {
      linkRefs = refs.trim().split(',');
      linkSrcSet = this.getHeadLinkHrefs(linkRefs);
    }

    if (Boolean(refs) && Boolean(linkSrcSet.size)) {
      const styleTag = document.createElement('style');
      styleTag.id = styleId;

      for (const link of linkSrcSet) {
        styleTag.innerText += `@import url(${link});`;
      }

      this.el.shadowRoot.appendChild(styleTag);

      if (!Boolean(this.shadowChildObserver)) {
        this.shadowChildObserver = new MutationObserver(() => {
          // Watch for new style tags being added to the shadow root
          const lastChild = this.el.shadowRoot.lastElementChild;
          if (lastChild.nodeName === 'STYLE' && (!Boolean(lastChild.id) || lastChild.id !== styleId)) {
            // Keep injected style last el in shadow root to preserve CSS specificity
            this.el.shadowRoot.appendChild(styleTag);
          }
        });
      }

      this.shadowChildObserver.observe(this.el.shadowRoot, { childList: true });
    } else {
      if (Boolean(this.shadowChildObserver)) {
        this.shadowChildObserver.disconnect();
      }
    }
  }

  /**
   * Returns a Set of link hrefs matching the selectors
   * @param linkSelectors array of link href selectors
   */
  private getHeadLinkHrefs(linkSelectors: string[]): Set<string> {
    const linkSrcSet = new Set<string>();

    for (const ref of linkSelectors) {
      const links = Array.from(document.querySelectorAll(`head > link[href*="${ref.trim()}"]`));

      if (Boolean(links.length)) {
        for (const link of links) {
          if (link.getAttribute('rel').includes('stylesheet')) {
            linkSrcSet.add(link.getAttribute('href'));
          }
        }
      }
    }

    return linkSrcSet;
  }

  /**
   * Gets the html for helix form v2
   */
  private getHelixFormHtml() {
    return (
      <div class="helix-form-wrapper__container" part="form-wrapper-container">
        <helix-form-v2 formConfig={this.formConfigData} onHelixEvent={ev => this.onFormSubmitted(ev)}>
          <slot />
        </helix-form-v2>
      </div>
    );
  }

  /**
   * Builds form messages
   */
  private buildMessage(messages: string[]) {
    if (messages.length > 1) {
      return <ul>{messages.reduce((message, item, index) => message.concat(<li key={index}>{item}</li>), [])}</ul>;
    } else {
      return messages[0];
    }
  }

  /**
   * Gets the html for error
   */
  private getHtmlOnError(containerVisibility: string, error: string[]) {
    switch (containerVisibility) {
      case 'SHOW_BOTH':
        return (
          <div>
            <div class="helix-form-wrapper--error">{this.buildMessage(error)}</div>
            {this.getHelixFormHtml()}
          </div>
        );
      case 'SHOW_ONLY_ERROR':
        return <div class="helix-form-wrapper--error">{this.buildMessage(error)}</div>;
      case 'SHOW_ONLY_FORM':
        return this.getHelixFormHtml();
      default:
        break;
    }
  }

  /**
   * Gets the html on success
   */
  private getHtmlOnSuccess() {
    const output = [
      <div class="helix-form-wrapper--success">
        <slot name="success-message">{this.buildMessage(this.success)}</slot>
      </div>,
    ];
    if (this.showFormOnSuccess) {
      output.push(this.getHelixFormHtml());
    }

    return output;
  }

  /**
   * Checks that the params passed into the component are valid
   */
  private async isParamsValid(): Promise<boolean> {
    const errors = [];
    const configToken = await this.getConfigToken();

    if (!configToken) {
      errors.push('Please provide valid value for config token.');
    }

    const apiEndpointUrl = await this.getApiEndpointUrl();

    if (!apiEndpointUrl || !regexApiEndpoint.test(apiEndpointUrl)) {
      errors.push('Please provide valid value for endpoint URL.');
    }

    const submissionEndpointUrl = await this.getSubmissionEndpointUrl();

    if (!submissionEndpointUrl || !regexApiEndpoint.test(submissionEndpointUrl)) {
      errors.push('Please provide valid value for submission endpoint URL.');
    }

    this.error = errors;

    return errors.length === 0;
  }

  protected async getApiRequestHeaders(): Promise<HeadersInit> {
    const headers = {
      'x-config-token': await this.getConfigToken(),
    };

    if (Boolean(this.clientEnvironment)) {
      headers['x-client-environment'] = this.clientEnvironment;
    }

    return headers;
  }

  /**
   * Call to get the form configuration from the API
   */
  private async callGetAPI() {
    this.error = [];
    if (!(await this.isParamsValid())) {
      this.renderState = 'INVALID_PARAMETER';

      return;
    }

    fetch(await this.getApiEndpointUrl(), {
      method: this.method,
      headers: await this.getApiRequestHeaders(),
    })
      .then(res => res.json())
      .then(response => {
        if (response?.data) {
          this.formConfigData = response.data;
          this.renderState = 'GET_SUCCESS';
        } else {
          if (Boolean(this.error)) {
            this.error.unshift(`Request Id: ${response.requestId}`);
          }

          throw response.errors ?? new Error('Unknown error occurred.');
        }
      })
      .catch(error => {
        this.error = this.error.concat(Array.isArray(error) ? error.reduce((messages, item) => messages.concat(item.detail), []) : [error.message]);
        this.formConfigData = null;
        this.renderState = 'ERROR';
      });
  }

  /**
   * Handles a response from a v1 api call
   */
  private handleV1Response(response) {
    if (response.success) {
      if (response.data.length > 0) {
        response.data.map((item: string) => {
          this.success.push(item);
        });
      }
    } else {
      this.error.push(response.message);
    }
  }

  /**
   * Handles a response from a v2 api call
   */
  private handleV2Response(response) {
    if (response.success === false) {
      if (response.errors.length > 0) {
        response.errors.map(error => {
          this.error.push(error.detail);
        });
      }
    } else {
      response.data.map(item => {
        if (item.success === true) {
          this.success.push(item.message);
        } else if (item.success === false) {
          this.error.push(item.message);
        } else {
          this.other.push(item.message);
        }
      });
    }

    if (this.error.length > 0) {
      this.error.unshift(`Request Id: ${response.requestId}`);
    }
  }

  /**
   * Handles the render state when a response has been returned
   * from the api call
   */
  private handleRenderState() {
    if (this.error.length > 0 && this.success.length > 0) {
      this.renderState = 'SUCCESS_AND_ERROR';
    } else if (this.error.length && this.success.length === 0) {
      this.renderState = 'ERROR';
    } else if (this.success.length && this.error.length === 0) {
      this.renderState = 'POST_SUCCESS';
    }
  }

  /**
   * Calls to post form data to the forms API
   */
  private async callPostAPI(data) {
    const headers = await this.getApiRequestHeaders();

    headers['Content-Type'] = 'application/json';

    fetch(await this.getSubmissionEndpointUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(response => {
        if (!response) {
          throw new Error('No response from server');
        }

        if (!response?.requestId) {
          this.handleV1Response(response);
        } else {
          this.handleV2Response(response);
        }

        this.scrollIntoPosition('response');

        this.handleRenderState();

        const event: HelixFormWrapperSubmitEvent = {
          data: response.data || [],
          error: this.error,
          success: this.success,
          other: this.other,
        };

        this.formSubmitted.emit(event);
      })
      .catch(error => {
        this.error = this.error.concat(Array.isArray(error) ? error.reduce((messages, item) => messages.concat(item.detail), []) : [error.message]);

        this.scrollIntoPosition('error');

        const parsedError: HelixFormWrapperSubmitEvent = {
          data: null,
          success: [],
          error: this.error,
          other: [],
        };

        this.renderState = 'ERROR';
        this.formSubmitted.emit(parsedError);
      });
  }

  /**
   * Event called when a form is submitted from the
   * helix-form-v2 component
   */
  protected onFormSubmitted(event: CustomEvent): void {
    if (event.detail.name === 'HelixFormSubmission') {
      // Form submission analytics event
      const helixPayload = new HelixEventPayload();

      helixPayload.name = 'HelixFormSubmissionAnalytics';
      helixPayload.path = [];
      helixPayload.meta = [
        {
          formName: this.analyticsName || this.configToken,
        },
      ];

      this.helixEvent.emit(helixPayload);

      const data = {
        ...event.detail.meta.find(item => item.name === this.formConfigData.csrfToken).value,
        csrfToken: this.formConfigData.csrfToken,
      };

      this.success = [];
      this.error = [];
      this.renderState = 'LOADING';

      this.scrollIntoPosition('submission');

      this.callPostAPI(data);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  protected scrollIntoPosition(after: any): void {
    let shouldScroll = after === this.scrollAfter;
    if (this.scrollAfter === 'response' && after === 'error') {
      shouldScroll = true;
    }

    if (shouldScroll && Boolean(this.el?.scrollIntoView)) {
      this.el.scrollIntoView();
    }
  }

  public render() {
    switch (this.renderState) {
      case 'LOADING':
        return (
          <div class="helix-form-wrapper__loader">
            <div class="helix-form-wrapper__loader--spinner"></div>
          </div>
        );
      case 'INVALID_PARAMETER':
        return <div class="helix-form-wrapper--invalid-parameter">{this.getHtmlOnError(this.containerVisibility, this.error)}</div>;
      case 'ERROR':
        return this.getHtmlOnError(this.containerVisibility, this.error);
      case 'GET_SUCCESS':
        if (this.formConfigData && this.formConfigData.csrfToken && this.formConfigData.fields && this.formConfigData.fields.length > 0) {
          return this.getHelixFormHtml();
        } else {
          return <div class="helix-form-wrapper--invalid-config">Configuration is invalid, does it contain form fields?</div>;
        }
      case 'POST_SUCCESS':
        return this.getHtmlOnSuccess();
      case 'SUCCESS_AND_ERROR':
        return (
          <div>
            <div class="helix-form-wrapper--success">{this.buildMessage(this.success)}</div>
            {this.getHtmlOnError(this.containerVisibility, this.error)}
          </div>
        );
      case 'NONE':
      default:
        break;
    }
  }
}
