import 'file-drop-element';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import { bodyCompactStyles, bodySmallStyles, bodyStandardStyles, heading2Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';
import { inputLabelStyles } from '@brightspace-ui/core/components/inputs/input-label-styles.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { css, html, LitElement } from 'lit-element';
import { RequesterMixin } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { InternalLocalizeMixin } from '../mixins/internal-localize-mixin';

export class Upload extends RtlMixin(RequesterMixin(InternalLocalizeMixin(LitElement))) {
	static get properties() {
		return {
			_supportedMimeTypes: { type: Array, attribute: false },
			_selectedLanguage: { type: String },
			_captionsLanguageCodes: { type: Object },
			errorMessage: { type: String, attribute: 'error-message', reflect: true },
		};
	}

	static get styles() {
		return [ bodySmallStyles,
			bodyStandardStyles,
			heading2Styles,
			bodyCompactStyles,
			selectStyles,
			inputLabelStyles, css`
			file-drop {
				display: block;
				border: 2px dashed var(--d2l-color-corundum);
				padding: 40px 40px 10px 40px;
			}
			@media screen and (max-width: 480px) {
				#no-file-drop-container {
					display: block;
					padding: 30vh 20px 10px 20px;
				}
			}
			@media screen and (min-width: 481px) {
				#no-file-drop-container {
					display: block;
					padding: 8vh 20px 10px 20px;
				}
			}
			file-drop.drop-valid {
				background-color: var(--d2l-color-gypsum);
				border: 2px dashed var(--d2l-color-feedback-action);
			}
			file-drop.drop-invalid {
				background-color: var(--d2l-color-gypsum);
				border: 2px dashed var(--d2l-color-feedback-error);
			}
			#file-select {
				display: none;
			}
			#file-size-limit {
				margin-top: 20px;
			}
			#error-message {
				color: var(--d2l-color-feedback-error);
			}
			.upload-container {
				display: flex;
				flex-direction: column;
			}
			.upload-options-container {
				height: 0px;
				padding-top: 0.5rem;
			}
			.auto-captions-language-selector-container {
				align-items: baseline;
				display: flex;
				flex-wrap: wrap;
				margin-bottom: 5px;
			}
			#auto-captions-language-selector-label {
				margin-right: 0.5rem;
			}
			:host([dir="rtl"]) #auto-captions-language-selector-label {
				margin-left: 0.5rem;
			}
			.auto-captions-options-container {
				display: flex;
				flex-direction: column;
			}
		`];
	}

	constructor() {
		super();
		this._supportedMimeTypes = [];
		this.enableFileDrop = false;
		this.selectALanguageOptionValue = 'selectALanguage';
		this._selectedLanguage = this.selectALanguageOptionValue;
	}

	async connectedCallback() {
		super.connectedCallback();

		this.client = this.requestInstance('content-service-client');
		this._supportedMimeTypes = (await this.client.getSupportedMimeTypes())
			.filter(x => x.startsWith('video/') || x.startsWith('audio/'));

		this.userBrightspaceClient = this.requestInstance('user-brightspace-client');
		this._captionsLanguageCodes = await this.userBrightspaceClient.getCaptionsLanguageCodes();
	}

	render() {
		return html`
			<div class="upload-container">
				<file-drop @filedrop=${this.onFileDrop} accept=${this._supportedMimeTypes.join(',')}>
					<center>
						<h2 class="d2l-heading-2">${this.localize('dropAudioVideoFile')}</h2>
						<p class="d2l-body-standard">${this.localize('or')}</p>
						<d2l-button
							description=${this.localize('browseForFile')}
							@click=${this.onBrowseClick}
						>
							${this.localize('browse')}
							<input
								id="file-select"
								type="file"
								accept=${this._supportedMimeTypes.join(',')}
								@change=${this.onFileInputChange}
							/>
						</d2l-button>
						<p id="file-size-limit" class="d2l-body-small">${this.localize('fileLimit1Gb')}</p>
						<p id="error-message" class="d2l-body-compact">${this.errorMessage}&nbsp;</p>
					</center>
				</file-drop>
				<div class="upload-options-container">
					${this._renderAutoCaptionsOption()}
				</div>
			</div>
		`;
	}

	onBrowseClick() {
		this.shadowRoot.getElementById('file-select').click();
	}

	onFileDrop(event) {
		this.processFiles(event.files);
	}

	onFileInputChange(event) {
		this.processFiles(event.target.files);
	}

	processFiles(files) {
		if (files.length !== 1) {
			this.dispatchEvent(new CustomEvent('file-drop-error', {
				detail: {
					message: this.localize('mayOnlyUpload1File')
				},
				bubbles: true,
				composed: true
			}));
			return;
		}

		const file = files[0];
		if (!this._supportedMimeTypes.includes(file.type)) {
			this.dispatchEvent(new CustomEvent('file-error', {
				detail: {
					message: this.localize('invalidFileType')
				},
				bubbles: true,
				composed: true
			}));
			return;
		}
		if (file.size > Math.pow(2, 30)) {
			this.dispatchEvent(new CustomEvent('file-error', {
				detail: {
					message: this.localize('fileTooLarge')
				},
				bubbles: true,
				composed: true
			}));
			return;
		}

		const uploadAutoCaptionsElement = this.shadowRoot.querySelector('#upload-auto-captions');
		const uploadAutoCaptions = uploadAutoCaptionsElement?.checked;
		const captionLanguages = (uploadAutoCaptions && this._selectedLanguage) ? [this._selectedLanguage] : null;

		this.dispatchEvent(new CustomEvent('file-change', {
			detail: { file, captionLanguages },
			bubbles: true,
			composed: true
		}));
	}

	async _onSelectedLanguageChange(event) {
		if (event && event.target && event.target.value) {
			this._selectedLanguage = event.target.value;
		}
		this.requestUpdate();
		await this.updateComplete;
	}

	_renderAutoCaptionsOption() {
		if (!this._captionsLanguageCodes) {
			return html``;
		}

		return html`
			<div class="auto-captions-options-container">
				<div class="auto-captions-language-selector-container">
					<label
						id="auto-captions-language-selector-label"
						for="auto-captions-language-selector"
						class="d2l-input-label">
						${this.localize('audioLanguageLabel')}
					</label>
					<select
						id="auto-captions-language-selector"
						class="d2l-input-select"
						value=${this._selectedLanguage}
						@change=${this._onSelectedLanguageChange}
						aria-label=${this.localize('selectLanguageForNewCaptions')}
						aria-haspopup="true">
							<option value=${this.selectALanguageOptionValue}>${this.localize('selectALanguage')}</option>
							${Object.entries(this._captionsLanguageCodes).map(([langCode, langLabel]) => this._renderLanguageOptions(langCode, langLabel))}
					</select>
				</div>
				<d2l-input-checkbox
					id="upload-auto-captions"
					?disabled=${this._selectedLanguage && this._selectedLanguage === this.selectALanguageOptionValue}>
					${this.localize('autoGenerateCaptionsFromAudio')}
				</d2l-input-checkbox>
			</div>
		`;
	}

	_renderLanguageOptions(langCode, langLabel) {
		return html`
			<option
				key=${langCode}
				value=${langCode}>
				${langLabel}
			</option>
		`;
	}
}

customElements.define('d2l-content-uploader-upload', Upload);
