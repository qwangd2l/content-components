import '@brightspace-ui/core/components/alert/alert-toast.js';
import '@brightspace-ui/core/components/button/button-icon.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/inputs/input-text.js';
import '@brightspace-ui-labs/file-uploader/d2l-file-uploader.js';
import { formatFileSize } from '@brightspace-ui/intl/lib/fileSize.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { inputStyles } from '@brightspace-ui/core/components/inputs/input-styles.js';
import { InternalLocalizeMixin } from './internal-localize-mixin.js';
import { labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { formatTimestampText, convertSrtTextToVttText }  from './captions-utils.js';
import constants from './constants.js';

class CaptionsCueListItem extends InternalLocalizeMixin(LitElement) {
	static get properties() {
		return {
			endTime: { type: String, attribute: 'end-time' },
			expanded: { type: Boolean },
			startTime: { type: String, attribute: 'start-time' },
			text: { type: String, attribute: 'text' }
		};
	}

	static get styles() {
		return [ inputStyles, labelStyles, css`
			.d2l-video-producer-captions-cues-list-item {
				background-color: var(--d2l-color-gypsum);
				border-radius: var(--d2l-input-border-radius, 0.3rem);
				display: flex;
				flex-direction: column;
				margin-bottom: 15px;
				padding: 12px;
			}

			.d2l-video-producer-captions-cue-main-controls {
				align-items: center;
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				width: 100%;
			}

			.d2l-video-producer-captions-cue-text-input {
				margin-bottom: 10px;
				margin-top: 12px;
				width: 100%;
				/* Disable word wrap and preserve line breaks from uploaded files */
				overflow: auto;
				resize: none;
				white-space: pre;
				/* This is needed to make "white-space: pre;" work on Safari */
				word-wrap: normal;
			}

			.d2l-video-producer-captions-cue-main-controls-buttons {
				align-items: center;
				display: flex;
				flex-direction: column;
			}

			.d2l-video-producer-captions-cue-expanded-controls {
				align-items: flex-end;
				display: flex;
				flex-direction: row;
			}

			.d2l-video-producer-captions-cue-start-end-container {
				align-items: center;
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				width: 100%;
			}

			.d2l-video-producer-captions-cue-timestamp-container {
				align-items: center;
				display: flex;
				flex-direction: column;
			}

			.d2l-video-producer-sync-cue-button-anchor {
				height: 0;
				position: relative;
				width: 0;
			}

			.d2l-video-producer-sync-cue-button {
				left: 35px;
				position: absolute;
				top: -10px;
			}

			.d2l-video-producer-captions-cue-timestamp-container > d2l-input-text {
				width: 135px;
			}
		` ];
	}

	constructor() {
		super();
		this.captionsCue = null;
	}

	render() {
		return html`
			<div class="d2l-video-producer-captions-cues-list-item">
				${this._renderMainControls()}
				${this.expanded ? this._renderExpandedControls() : ''}
			</div>
		`;
	}

	_hideExpandedControls() {
		this.expanded = false;
	}

	_renderExpandedControls() {
		return html`
			<div class="d2l-video-producer-captions-cue-expanded-controls">
				<div class="d2l-video-producer-captions-cue-start-end-container">
					<div class="d2l-video-producer-captions-cue-timestamp-container">
						<div class="d2l-video-producer-sync-cue-button-anchor">
							<d2l-button-icon
								class="d2l-video-producer-sync-cue-button"
								text=${this.localize('syncStartTimeToTimeline')}
								icon="tier1:time"
							></d2l-button-icon>
						</div>
						<d2l-input-text
							class="d2l-video-producer-captions-cue-start-timestamp"
							label=${this.localize('captionsCueStartTimestamp')}
							description=${this.localize('captionsCueStartTimestampDescription')}
							value=${formatTimestampText(this.startTime)}
						></d2l-input-text>
					</div>
					<div class="d2l-video-producer-captions-cue-timestamp-container">
						<div class="d2l-video-producer-sync-cue-button-anchor">
							<d2l-button-icon
								class="d2l-video-producer-sync-cue-button"
								text=${this.localize('syncEndTimeToTimeline')}
								icon="tier1:time"
							></d2l-button-icon>
						</div>
						<d2l-input-text
							class="d2l-video-producer-captions-cue-end-timestamp"
							label=${this.localize('captionsCueEndTimestamp')}
							description=${this.localize('captionsCueEndTimestampDescription')}
							value=${formatTimestampText(this.endTime)}
						></d2l-input-text>
					</div>
				</div>
			</div>
		`;
	}

	_renderMainControls() {
		return html`
			<div class="d2l-video-producer-captions-cue-main-controls">
				<textarea
					class="d2l-input d2l-video-producer-captions-cue-text-input"
					aria-label=${this.localize('captionsCueText')}
					rows="2"
				>${this.text}</textarea>
				<div class="d2l-video-producer-captions-cue-main-controls-buttons">
					<d2l-button-icon
						text=${this.localize('deleteCaptionsCue')}
						icon="tier1:delete"
					></d2l-button-icon>
					${ this.expanded ? (html`
						<d2l-button-icon
							text=${this.localize('hideExpandedCaptionsCueControls')}
							icon="tier1:arrow-collapse"
							@click=${this._hideExpandedControls}
						></d2l-button-icon>
					`) : (html`
						<d2l-button-icon
							text=${this.localize('openExpandedCaptionsCueControls')}
							icon="tier1:arrow-expand"
							@click=${this._showExpandedControls}
						></d2l-button-icon>
					`)}
				</div>
			</div>
		`;
	}

	_showExpandedControls() {
		this.expanded = true;
	}
}

customElements.define('d2l-video-producer-captions-cues-list-item', CaptionsCueListItem);

class VideoProducerCaptions extends InternalLocalizeMixin(LitElement) {
	static get properties() {
		return {
			captions: { type: Object },
			defaultLanguage: { type: Object },
			loading: { type: Boolean },
			selectedLanguage: { type: Object },

			_numberOfVisibleCuesInList: { type: Number, attribute: false }
		};
	}

	static get styles() {
		return [ labelStyles, css`
			.d2l-video-producer-captions {
				align-items: center;
				border: 1px solid var(--d2l-color-mica);
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				height: 532px;
				justify-content: center;
				position: relative;
				width: 360px;
			}

			.d2l-video-producer-empty-captions-menu {
				align-items: center;
				display: flex;
				flex-direction: column;
				height: 100%;
				justify-content: center;
			}

			.d2l-video-producer-captions-cues-list {
				display: flex;
				flex-direction: column;
				height: 481px;
				overflow-x: hidden;
				overflow-y: scroll;
				padding: 39px 10px 10px 10px;
				position: relative;
			}

			.d2l-video-producer-captions-cues-list-bottom {
				align-items: center;
				display: flex;
				justify-content: center;
				padding: 20px;
				width: 100%;
			}
		`];
	}

	constructor() {
		super();
		this.captions = [];
		this._numberOfVisibleCuesInList = 0;
		this.listBottomObserver = null;

		this._loadMoreVisibleCues = this._loadMoreVisibleCues.bind(this);
		this._onFilesAdded = this._onFilesAdded.bind(this);
	}

	render() {
		return html`
			<div class="d2l-video-producer-captions">
				${this._renderContent()}
				<d2l-alert-toast
					id="d2l-video-producer-captions-alert-toast"
				></d2l-alert-toast>
			</div>
		`;
	}

	updated(changedProperties) {
		changedProperties.forEach((oldValue, propName) => {
			if (propName === 'captions') {
				this._updateLazyLoadForCaptionsCuesList(oldValue);
				this._updateNumberOfVisibleCuesInList();
			}
		});
	}

	_dispatchCaptionsUploaded(vttString) {
		this.dispatchEvent(new CustomEvent('captions-uploaded', {
			detail: { vttString },
			composed: false
		}));
	}

	_loadMoreVisibleCues(intersectionEntries) {
		intersectionEntries.forEach(entry => {
			if (entry.isIntersecting) {
				if (this._numberOfVisibleCuesInList === 0) {
					this._numberOfVisibleCuesInList = constants.NUM_OF_VISIBLE_CAPTIONS_CUES;
				} else {
					if (this._numberOfVisibleCuesInList < this.captions.length - 1) {
						this._numberOfVisibleCuesInList += constants.NUM_OF_VISIBLE_CAPTIONS_CUES;
					}
				}
			}
		});
	}

	_onFilesAdded(event) {
		if (!(event?.detail?.files?.length === 1)) {
			return;
		}

		const file = event.detail.files[0];
		const extension = file.name.split('.').pop();
		if (!['srt', 'vtt'].includes(extension.toLowerCase())) {
			this._openAlertToast({type: 'critical', text: this.localize('captionsInvalidFileType') });
		} else if (file.size > constants.MAX_CAPTIONS_UPLOAD_SIZE_IN_BYTES) {
			this._openAlertToast({type: 'critical', text: this.localize('captionsFileTooLarge', { localizedMaxFileSize: formatFileSize(constants.MAX_CAPTIONS_UPLOAD_SIZE_IN_BYTES) }) });
		} else {
			const fileReader = new FileReader();
			fileReader.addEventListener('load', event => {
				try {
					if (extension === 'vtt') {
						this._dispatchCaptionsUploaded(event.target.result);
					} else {
						const vttText = convertSrtTextToVttText(event.target.result);
						this._dispatchCaptionsUploaded(vttText);
					}
				} catch (error) {
					this._openAlertToast({type: 'critical', text: this.localize(error.message) });
					return;
				}
			});
			fileReader.addEventListener('error', () => {
				this._openAlertToast({type: 'critical', text: this.localize('captionsReadError') });
			});
			fileReader.readAsText(file, 'UTF-8');
		}
	}

	_openAlertToast({type, text}) {
		const alertToast = this.shadowRoot.querySelector('#d2l-video-producer-captions-alert-toast');
		alertToast.setAttribute('open', 'open');
		alertToast.setAttribute('type', type);
		alertToast.innerText = text;
	}

	_renderContent() {
		if (this.loading) {
			return this._renderLoadingIndicator();
		} else if (this.captions.length === 0) {
			return this._renderEmptyCaptionsMenu();
		} else {
			return this._renderCuesList();
		}
	}

	_renderCuesList() {
		return html`
			<div class="d2l-video-producer-captions-cues-list">
				${[...Array(Math.min(this._numberOfVisibleCuesInList, this.captions.length)).keys()].map(index => html`
					<d2l-video-producer-captions-cues-list-item
						start-time="${this.captions[index].startTime}"
						end-time="${this.captions[index].endTime}"
						text="${this.captions[index].text}"
					></d2l-video-producer-captions-cues-list-item>
				`)}
				<div class="d2l-video-producer-captions-cues-list-bottom"></div>
			</div>
		`;
	}

	_renderEmptyCaptionsMenu() {
		return html`
			<div class="d2l-video-producer-empty-captions-menu">
				<p class="d2l-label-text">${this.localize('uploadSrtWebVttFile')}</p>
				<d2l-labs-file-uploader
					@d2l-file-uploader-files-added="${this._onFilesAdded}"
					label=${this.localize('browseForCaptionsFile')}>
				</d2l-labs-file-uploader>
			</div>
		`;
	}

	_renderLoadingIndicator() {
		return html`<d2l-loading-spinner size="150"></d2l-loading-spinner>`;
	}

	_resetVisibleCuesInList() {
		this.visibleCuesInList = this.captions.slice(0, constants.NUM_OF_VISIBLE_CAPTIONS_CUES);
	}

	_updateLazyLoadForCaptionsCuesList(oldCaptionsValue) {
		if (!this.loading && oldCaptionsValue && oldCaptionsValue.length === 0 && this.captions.length > 0) {
			const options = {
				root: this.shadowRoot.querySelector('.d2l-video-producer-captions-cues-list'),
				rootMargin: '0px',
				threshold: 0.1,
			};
			const listBottom = this.shadowRoot.querySelector('.d2l-video-producer-captions-cues-list-bottom');
			this.listBottomObserver = new IntersectionObserver(this._loadMoreVisibleCues, options);
			this.listBottomObserver.observe(listBottom);
		} else if (this.listBottomObserver && oldCaptionsValue && oldCaptionsValue.length > 0 && this.captions.length === 0) {
			this.listBottomObserver.disconnect();
		}
	}

	_updateNumberOfVisibleCuesInList() {
		if ((this.captions.length > 0) && (this._numberOfVisibleCuesInList === 0)) {
			this._numberOfVisibleCuesInList = constants.NUM_OF_VISIBLE_CAPTIONS_CUES;
		} else if (this.captions.length < this._numberOfVisibleCuesInList) {
			this._numberOfVisibleCuesInList = this.captions.length;
		}
	}
}

customElements.define('d2l-video-producer-captions', VideoProducerCaptions);
