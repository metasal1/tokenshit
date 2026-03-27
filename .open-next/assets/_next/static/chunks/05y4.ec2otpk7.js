(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,83227,t=>{"use strict";t.i(12207);var e=t.i(8285),i=t.i(54479);t.i(74576);var r=t.i(20119),o=t.i(62611),n=t.i(59088),a=t.i(45975),s=t.i(15193);let l=s.css`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 1.4s linear infinite;
    color: var(--local-color);
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
`;var c=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let u=class extends e.LitElement{constructor(){super(...arguments),this.color="primary",this.size="lg"}render(){let t={primary:o.vars.tokens.theme.textPrimary,secondary:o.vars.tokens.theme.textSecondary,tertiary:o.vars.tokens.theme.textTertiary,invert:o.vars.tokens.theme.textInvert,error:o.vars.tokens.core.textError,warning:o.vars.tokens.core.textWarning,"accent-primary":o.vars.tokens.core.textAccentPrimary};return this.style.cssText=`
      --local-color: ${"inherit"===this.color?"inherit":t[this.color]};
      `,this.dataset.size=this.size,i.html`<svg viewBox="0 0 16 17" fill="none">
      <path
        d="M8.75 2.65625V4.65625C8.75 4.85516 8.67098 5.04593 8.53033 5.18658C8.38968 5.32723 8.19891 5.40625 8 5.40625C7.80109 5.40625 7.61032 5.32723 7.46967 5.18658C7.32902 5.04593 7.25 4.85516 7.25 4.65625V2.65625C7.25 2.45734 7.32902 2.26657 7.46967 2.12592C7.61032 1.98527 7.80109 1.90625 8 1.90625C8.19891 1.90625 8.38968 1.98527 8.53033 2.12592C8.67098 2.26657 8.75 2.45734 8.75 2.65625ZM14 7.90625H12C11.8011 7.90625 11.6103 7.98527 11.4697 8.12592C11.329 8.26657 11.25 8.45734 11.25 8.65625C11.25 8.85516 11.329 9.04593 11.4697 9.18658C11.6103 9.32723 11.8011 9.40625 12 9.40625H14C14.1989 9.40625 14.3897 9.32723 14.5303 9.18658C14.671 9.04593 14.75 8.85516 14.75 8.65625C14.75 8.45734 14.671 8.26657 14.5303 8.12592C14.3897 7.98527 14.1989 7.90625 14 7.90625ZM11.3588 10.9544C11.289 10.8846 11.2062 10.8293 11.115 10.7915C11.0239 10.7538 10.9262 10.7343 10.8275 10.7343C10.7288 10.7343 10.6311 10.7538 10.54 10.7915C10.4488 10.8293 10.366 10.8846 10.2963 10.9544C10.2265 11.0241 10.1711 11.107 10.1334 11.1981C10.0956 11.2893 10.0762 11.387 10.0762 11.4856C10.0762 11.5843 10.0956 11.682 10.1334 11.7731C10.1711 11.8643 10.2265 11.9471 10.2963 12.0169L11.7106 13.4312C11.8515 13.5721 12.0426 13.6513 12.2419 13.6513C12.4411 13.6513 12.6322 13.5721 12.7731 13.4312C12.914 13.2904 12.9932 13.0993 12.9932 12.9C12.9932 12.7007 12.914 12.5096 12.7731 12.3687L11.3588 10.9544ZM8 11.9062C7.80109 11.9062 7.61032 11.9853 7.46967 12.1259C7.32902 12.2666 7.25 12.4573 7.25 12.6562V14.6562C7.25 14.8552 7.32902 15.0459 7.46967 15.1866C7.61032 15.3272 7.80109 15.4062 8 15.4062C8.19891 15.4062 8.38968 15.3272 8.53033 15.1866C8.67098 15.0459 8.75 14.8552 8.75 14.6562V12.6562C8.75 12.4573 8.67098 12.2666 8.53033 12.1259C8.38968 11.9853 8.19891 11.9062 8 11.9062ZM4.64125 10.9544L3.22688 12.3687C3.08598 12.5096 3.00682 12.7007 3.00682 12.9C3.00682 13.0993 3.08598 13.2904 3.22688 13.4312C3.36777 13.5721 3.55887 13.6513 3.75813 13.6513C3.95738 13.6513 4.14848 13.5721 4.28937 13.4312L5.70375 12.0169C5.84465 11.876 5.9238 11.6849 5.9238 11.4856C5.9238 11.2864 5.84465 11.0953 5.70375 10.9544C5.56285 10.8135 5.37176 10.7343 5.1725 10.7343C4.97324 10.7343 4.78215 10.8135 4.64125 10.9544ZM4.75 8.65625C4.75 8.45734 4.67098 8.26657 4.53033 8.12592C4.38968 7.98527 4.19891 7.90625 4 7.90625H2C1.80109 7.90625 1.61032 7.98527 1.46967 8.12592C1.32902 8.26657 1.25 8.45734 1.25 8.65625C1.25 8.85516 1.32902 9.04593 1.46967 9.18658C1.61032 9.32723 1.80109 9.40625 2 9.40625H4C4.19891 9.40625 4.38968 9.32723 4.53033 9.18658C4.67098 9.04593 4.75 8.85516 4.75 8.65625ZM4.2875 3.88313C4.1466 3.74223 3.95551 3.66307 3.75625 3.66307C3.55699 3.66307 3.3659 3.74223 3.225 3.88313C3.0841 4.02402 3.00495 4.21512 3.00495 4.41438C3.00495 4.61363 3.0841 4.80473 3.225 4.94562L4.64125 6.35813C4.78215 6.49902 4.97324 6.57818 5.1725 6.57818C5.37176 6.57818 5.56285 6.49902 5.70375 6.35813C5.84465 6.21723 5.9238 6.02613 5.9238 5.82688C5.9238 5.62762 5.84465 5.43652 5.70375 5.29563L4.2875 3.88313Z"
        fill="currentColor"
      />
    </svg>`}};u.styles=[n.resetStyles,l],c([(0,r.property)()],u.prototype,"color",void 0),c([(0,r.property)()],u.prototype,"size",void 0),u=c([(0,a.customElement)("wui-loading-spinner")],u),t.s([],83227)},34051,29389,t=>{"use strict";var e=t.i(54479);t.s(["ifDefined",0,t=>t??e.nothing],29389),t.s([],34051)},12190,t=>{"use strict";t.i(12207);var e=t.i(8285),i=t.i(54479);t.i(74576);var r=t.i(20119);t.i(34051);var o=t.i(29389);t.i(52634);var n=t.i(59088),a=t.i(45975),s=t.i(62611);let l=s.css`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: ${({borderRadius:t})=>t[2]};
    padding: ${({spacing:t})=>t[1]} !important;
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    position: relative;
  }

  :host([data-padding='2']) {
    padding: ${({spacing:t})=>t[2]} !important;
  }

  :host:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  :host > wui-icon {
    z-index: 10;
  }

  /* -- Colors --------------------------------------------------- */
  :host([data-color='accent-primary']) {
    color: ${({tokens:t})=>t.core.iconAccentPrimary};
  }

  :host([data-color='accent-primary']):after {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  :host([data-color='default']),
  :host([data-color='secondary']) {
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  :host([data-color='default']):after {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  :host([data-color='secondary']):after {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  :host([data-color='success']) {
    color: ${({tokens:t})=>t.core.iconSuccess};
  }

  :host([data-color='success']):after {
    background-color: ${({tokens:t})=>t.core.backgroundSuccess};
  }

  :host([data-color='error']) {
    color: ${({tokens:t})=>t.core.iconError};
  }

  :host([data-color='error']):after {
    background-color: ${({tokens:t})=>t.core.backgroundError};
  }

  :host([data-color='warning']) {
    color: ${({tokens:t})=>t.core.iconWarning};
  }

  :host([data-color='warning']):after {
    background-color: ${({tokens:t})=>t.core.backgroundWarning};
  }

  :host([data-color='inverse']) {
    color: ${({tokens:t})=>t.theme.iconInverse};
  }

  :host([data-color='inverse']):after {
    background-color: transparent;
  }
`;var c=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let u=class extends e.LitElement{constructor(){super(...arguments),this.icon="copy",this.size="md",this.padding="1",this.color="default"}render(){return this.dataset.padding=this.padding,this.dataset.color=this.color,i.html`
      <wui-icon size=${(0,o.ifDefined)(this.size)} name=${this.icon} color="inherit"></wui-icon>
    `}};u.styles=[n.resetStyles,n.elementStyles,l],c([(0,r.property)()],u.prototype,"icon",void 0),c([(0,r.property)()],u.prototype,"size",void 0),c([(0,r.property)()],u.prototype,"padding",void 0),c([(0,r.property)()],u.prototype,"color",void 0),u=c([(0,a.customElement)("wui-icon-box")],u),t.s([],12190)},34420,24947,t=>{"use strict";t.i(12207);var e=t.i(8285),i=t.i(54479);t.i(74576);var r=t.i(20119);t.i(52634),t.i(83227),t.i(39009);var o=t.i(59088),n=t.i(45975),a=t.i(62611);let s=a.css`
  :host {
    width: var(--local-width);
  }

  button {
    width: var(--local-width);
    white-space: nowrap;
    column-gap: ${({spacing:t})=>t[2]};
    transition:
      scale ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-1"]},
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      border-radius ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-1"]};
    will-change: scale, background-color, border-radius;
    cursor: pointer;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='sm'] {
    border-radius: ${({borderRadius:t})=>t[2]};
    padding: 0 ${({spacing:t})=>t[2]};
    height: 28px;
  }

  button[data-size='md'] {
    border-radius: ${({borderRadius:t})=>t[3]};
    padding: 0 ${({spacing:t})=>t[4]};
    height: 38px;
  }

  button[data-size='lg'] {
    border-radius: ${({borderRadius:t})=>t[4]};
    padding: 0 ${({spacing:t})=>t[5]};
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent-primary'] {
    background-color: ${({tokens:t})=>t.core.backgroundAccentPrimary};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  button[data-variant='accent-secondary'] {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
    color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  button[data-variant='neutral-primary'] {
    background-color: ${({tokens:t})=>t.theme.backgroundInvert};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  button[data-variant='neutral-secondary'] {
    background-color: transparent;
    border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  button[data-variant='neutral-tertiary'] {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  button[data-variant='error-primary'] {
    background-color: ${({tokens:t})=>t.core.textError};
    color: ${({tokens:t})=>t.theme.textInvert};
  }

  button[data-variant='error-secondary'] {
    background-color: ${({tokens:t})=>t.core.backgroundError};
    color: ${({tokens:t})=>t.core.textError};
  }

  button[data-variant='shade'] {
    background: var(--wui-color-gray-glass-002);
    color: var(--wui-color-fg-200);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-size='sm']:focus-visible:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:focus-visible:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:focus-visible:enabled {
    border-radius: 48px;
  }
  button[data-variant='shade']:focus-visible:enabled {
    background: var(--wui-color-gray-glass-005);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-gray-glass-002);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button[data-size='sm']:hover:enabled {
      border-radius: 28px;
    }

    button[data-size='md']:hover:enabled {
      border-radius: 38px;
    }

    button[data-size='lg']:hover:enabled {
      border-radius: 48px;
    }

    button[data-variant='shade']:hover:enabled {
      background: var(--wui-color-gray-glass-002);
    }

    button[data-variant='shade']:active:enabled {
      background: var(--wui-color-gray-glass-005);
    }
  }

  button[data-size='sm']:active:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:active:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:active:enabled {
    border-radius: 48px;
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    opacity: 0.3;
  }
`;var l=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let c={lg:"lg-regular-mono",md:"md-regular-mono",sm:"sm-regular-mono"},u={lg:"md",md:"md",sm:"sm"},d=class extends e.LitElement{constructor(){super(...arguments),this.size="lg",this.disabled=!1,this.fullWidth=!1,this.loading=!1,this.variant="accent-primary"}render(){this.style.cssText=`
    --local-width: ${this.fullWidth?"100%":"auto"};
     `;let t=this.textVariant??c[this.size];return i.html`
      <button data-variant=${this.variant} data-size=${this.size} ?disabled=${this.disabled}>
        ${this.loadingTemplate()}
        <slot name="iconLeft"></slot>
        <wui-text variant=${t} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `}loadingTemplate(){if(this.loading){let t=u[this.size],e="neutral-primary"===this.variant||"accent-primary"===this.variant?"invert":"primary";return i.html`<wui-loading-spinner color=${e} size=${t}></wui-loading-spinner>`}return null}};d.styles=[o.resetStyles,o.elementStyles,s],l([(0,r.property)()],d.prototype,"size",void 0),l([(0,r.property)({type:Boolean})],d.prototype,"disabled",void 0),l([(0,r.property)({type:Boolean})],d.prototype,"fullWidth",void 0),l([(0,r.property)({type:Boolean})],d.prototype,"loading",void 0),l([(0,r.property)()],d.prototype,"variant",void 0),l([(0,r.property)()],d.prototype,"textVariant",void 0),d=l([(0,n.customElement)("wui-button")],d),t.s([],24947),t.s([],34420)},46650,t=>{"use strict";t.i(12190),t.s([])},84326,65090,t=>{"use strict";var e=t.i(54479);let{I:i}=e._$LH;var r=t.i(91909);let o=(t,e)=>{let i=t._$AN;if(void 0===i)return!1;for(let t of i)t._$AO?.(e,!1),o(t,e);return!0},n=t=>{let e,i;do{if(void 0===(e=t._$AM))break;(i=e._$AN).delete(t),t=e}while(0===i?.size)},a=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(void 0===i)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),c(e)}};function s(t){void 0!==this._$AN?(n(this),this._$AM=t,a(this)):this._$AM=t}function l(t,e=!1,i=0){let r=this._$AH,a=this._$AN;if(void 0!==a&&0!==a.size)if(e)if(Array.isArray(r))for(let t=i;t<r.length;t++)o(r[t],!1),n(r[t]);else null!=r&&(o(r,!1),n(r));else o(this,t)}let c=t=>{t.type==r.PartType.CHILD&&(t._$AP??=l,t._$AQ??=s)};class u extends r.Directive{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,i){super._$AT(t,e,i),a(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(o(this,t),n(this))}setValue(t){if(void 0===this._$Ct.strings)this._$Ct._$AI(t,this);else{let e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}class d{}let h=new WeakMap,p=(0,r.directive)(class extends u{render(t){return e.nothing}update(t,[i]){let r=i!==this.G;return r&&void 0!==this.G&&this.rt(void 0),(r||this.lt!==this.ct)&&(this.G=i,this.ht=t.options?.host,this.rt(this.ct=t.element)),e.nothing}rt(t){if(this.isConnected||(t=void 0),"function"==typeof this.G){let e=this.ht??globalThis,i=h.get(e);void 0===i&&(i=new WeakMap,h.set(e,i)),void 0!==i.get(this.G)&&this.G.call(this.ht,void 0),i.set(this.G,t),void 0!==t&&this.G.call(this.ht,t)}else this.G.value=t}get lt(){return"function"==typeof this.G?h.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});t.s(["createRef",0,()=>new d,"ref",0,p],65090),t.s([],84326)},35902,t=>{"use strict";t.i(12207);var e=t.i(8285),i=t.i(54479);t.i(74576);var r=t.i(20119);t.i(34051);var o=t.i(29389);t.i(84326);var n=t.i(65090);t.i(52634),t.i(39009);var a=t.i(59088),s=t.i(45975),l=t.i(62611);let c=l.css`
  :host {
    position: relative;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    gap: ${({spacing:t})=>t[3]};
    color: ${({tokens:t})=>t.theme.textPrimary};
    caret-color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  .wui-input-text-container {
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    border-radius: ${({borderRadius:t})=>t[4]};
    color: inherit;
    background: transparent;
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
    caret-color: ${({tokens:t})=>t.core.textAccentPrimary};
    padding: ${({spacing:t})=>t[3]} ${({spacing:t})=>t[3]}
      ${({spacing:t})=>t[3]} ${({spacing:t})=>t[10]};
    font-size: ${({textSize:t})=>t.large};
    line-height: ${({typography:t})=>t["lg-regular"].lineHeight};
    letter-spacing: ${({typography:t})=>t["lg-regular"].letterSpacing};
    font-weight: ${({fontWeight:t})=>t.regular};
    font-family: ${({fontFamily:t})=>t.regular};
  }

  input[data-size='lg'] {
    padding: ${({spacing:t})=>t[4]} ${({spacing:t})=>t[3]}
      ${({spacing:t})=>t[4]} ${({spacing:t})=>t[10]};
  }

  @media (hover: hover) and (pointer: fine) {
    input:hover:enabled {
      border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    }
  }

  input:disabled {
    cursor: unset;
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
  }

  input::placeholder {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }

  input:focus:enabled {
    border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
    box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
  }

  div.wui-input-text-container:has(input:disabled) {
    opacity: 0.5;
  }

  wui-icon.wui-input-text-left-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    left: ${({spacing:t})=>t[4]};
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  button.wui-input-text-submit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:t})=>t[3]};
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: ${({borderRadius:t})=>t[2]};
    color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  button.wui-input-text-submit-button:disabled {
    opacity: 1;
  }

  button.wui-input-text-submit-button.loading wui-icon {
    animation: spin 1s linear infinite;
  }

  button.wui-input-text-submit-button:hover {
    background: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  input:has(+ .wui-input-text-submit-button) {
    padding-right: ${({spacing:t})=>t[12]};
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  /* -- Keyframes --------------------------------------------------- */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;var u=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let d=class extends e.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,n.createRef)(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return i.html` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${(0,n.ref)(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${(0,o.ifDefined)(this.enterKeyHint)}
          ?disabled=${this.disabled}
          placeholder=${this.placeholder}
          @input=${this.dispatchInputChangeEvent.bind(this)}
          @keydown=${this.onKeyDown}
          .value=${this.value||""}
        />
        ${this.templateSubmitButton()}
        <slot class="wui-input-text-slot"></slot>
      </div>
      ${this.templateError()} ${this.templateWarning()}`}templateLeftIcon(){return this.icon?i.html`<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}templateSubmitButton(){return this.onSubmit?i.html`<button
        class="wui-input-text-submit-button ${this.loading?"loading":""}"
        @click=${this.onSubmit?.bind(this)}
        ?disabled=${this.disabled||this.loading}
      >
        ${this.loading?i.html`<wui-icon name="spinner" size="md"></wui-icon>`:i.html`<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`:null}templateError(){return this.errorText?i.html`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?i.html`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};d.styles=[a.resetStyles,a.elementStyles,c],u([(0,r.property)()],d.prototype,"icon",void 0),u([(0,r.property)({type:Boolean})],d.prototype,"disabled",void 0),u([(0,r.property)({type:Boolean})],d.prototype,"loading",void 0),u([(0,r.property)()],d.prototype,"placeholder",void 0),u([(0,r.property)()],d.prototype,"type",void 0),u([(0,r.property)()],d.prototype,"value",void 0),u([(0,r.property)()],d.prototype,"errorText",void 0),u([(0,r.property)()],d.prototype,"warningText",void 0),u([(0,r.property)()],d.prototype,"onSubmit",void 0),u([(0,r.property)()],d.prototype,"size",void 0),u([(0,r.property)({attribute:!1})],d.prototype,"onKeyDown",void 0),d=u([(0,s.customElement)("wui-input-text")],d),t.s([],35902)},10380,t=>{"use strict";t.i(12207);var e=t.i(8285),i=t.i(54479);t.i(74576);var r=t.i(20119);t.i(52634),t.i(39009);var o=t.i(59088),n=t.i(45975),a=t.i(62611);let s=a.css`
  button {
    border: none;
    background: transparent;
    height: 20px;
    padding: ${({spacing:t})=>t[2]};
    column-gap: ${({spacing:t})=>t[1]};
    border-radius: ${({borderRadius:t})=>t[1]};
    padding: 0 ${({spacing:t})=>t[1]};
    border-radius: ${({spacing:t})=>t[1]};
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent'] {
    color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  button[data-variant='secondary'] {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[data-variant='accent']:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='secondary']:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-variant='accent']:hover:enabled {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='secondary']:hover:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var l=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let c={sm:"sm-medium",md:"md-medium"},u={accent:"accent-primary",secondary:"secondary"},d=class extends e.LitElement{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.variant="accent",this.icon=void 0}render(){return i.html`
      <button ?disabled=${this.disabled} data-variant=${this.variant}>
        <slot name="iconLeft"></slot>
        <wui-text
          color=${u[this.variant]}
          variant=${c[this.size]}
        >
          <slot></slot>
        </wui-text>
        ${this.iconTemplate()}
      </button>
    `}iconTemplate(){return this.icon?i.html`<wui-icon name=${this.icon} size="sm"></wui-icon>`:null}};d.styles=[o.resetStyles,o.elementStyles,s],l([(0,r.property)()],d.prototype,"size",void 0),l([(0,r.property)({type:Boolean})],d.prototype,"disabled",void 0),l([(0,r.property)()],d.prototype,"variant",void 0),l([(0,r.property)()],d.prototype,"icon",void 0),d=l([(0,n.customElement)("wui-link")],d),t.s([],10380)},21147,t=>{"use strict";t.i(83227),t.s([])},39299,t=>{"use strict";t.i(12207);var e=t.i(8285),i=t.i(54479);t.i(74576);var r=t.i(20119);t.i(34051);var o=t.i(29389);t.i(52634),t.i(39009);var n=t.i(59088),a=t.i(45975);t.i(35902);var s=t.i(15193);let l=s.css`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }
`;var c=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let u=class extends e.LitElement{constructor(){super(...arguments),this.disabled=!1}render(){return i.html`
      <wui-input-text
        type="email"
        placeholder="Email"
        icon="mail"
        size="lg"
        .disabled=${this.disabled}
        .value=${this.value}
        data-testid="wui-email-input"
        tabIdx=${(0,o.ifDefined)(this.tabIdx)}
      ></wui-input-text>
      ${this.templateError()}
    `}templateError(){return this.errorMessage?i.html`<wui-text variant="sm-regular" color="error">${this.errorMessage}</wui-text>`:null}};u.styles=[n.resetStyles,l],c([(0,r.property)()],u.prototype,"errorMessage",void 0),c([(0,r.property)({type:Boolean})],u.prototype,"disabled",void 0),c([(0,r.property)()],u.prototype,"value",void 0),c([(0,r.property)()],u.prototype,"tabIdx",void 0),u=c([(0,a.customElement)("wui-email-input")],u),t.s([],39299)},26892,t=>{"use strict";t.i(12207);var e,i=t.i(8285),r=t.i(54479);t.i(74576);var o=t.i(56350),n=t.i(49454),a=t.i(27302),s=t.i(21728),l=t.i(11424);t.i(4041);var c=t.i(45975);t.i(62238),t.i(10380),t.i(21147);var u=i,d=t.i(20119);t.i(73944);var h=t.i(59088),p=t.i(12699),m=i,v=t.i(62611);let g=v.css`
  :host {
    position: relative;
    display: inline-block;
  }

  input {
    width: 48px;
    height: 48px;
    background: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[4]};
    border: 1px solid ${({tokens:t})=>t.theme.borderPrimary};
    font-family: ${({fontFamily:t})=>t.regular};
    font-size: ${({textSize:t})=>t.large};
    line-height: 18px;
    letter-spacing: -0.16px;
    text-align: center;
    color: ${({tokens:t})=>t.theme.textPrimary};
    caret-color: ${({tokens:t})=>t.core.textAccentPrimary};
    transition:
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      border-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      box-shadow ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color, border-color, box-shadow;
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: ${({spacing:t})=>t[4]};
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  input:focus-visible:enabled {
    background-color: transparent;
    border: 1px solid ${({tokens:t})=>t.theme.borderSecondary};
    box-shadow: 0px 0px 0px 4px ${({tokens:t})=>t.core.foregroundAccent040};
  }
`;var f=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let b=class extends m.LitElement{constructor(){super(...arguments),this.disabled=!1,this.value=""}render(){return r.html`<input
      type="number"
      maxlength="1"
      inputmode="numeric"
      autofocus
      ?disabled=${this.disabled}
      value=${this.value}
    /> `}};b.styles=[h.resetStyles,h.elementStyles,g],f([(0,d.property)({type:Boolean})],b.prototype,"disabled",void 0),f([(0,d.property)({type:String})],b.prototype,"value",void 0),b=f([(0,c.customElement)("wui-input-numeric")],b);var y=t.i(15193);let w=y.css`
  :host {
    position: relative;
    display: block;
  }
`;var x=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let C=class extends u.LitElement{constructor(){super(...arguments),this.length=6,this.otp="",this.values=Array.from({length:this.length}).map(()=>""),this.numerics=[],this.shouldInputBeEnabled=t=>this.values.slice(0,t).every(t=>""!==t),this.handleKeyDown=(t,e)=>{let i=t.target,r=this.getInputElement(i);if(!r)return;["ArrowLeft","ArrowRight","Shift","Delete"].includes(t.key)&&t.preventDefault();let o=r.selectionStart;switch(t.key){case"ArrowLeft":o&&r.setSelectionRange(o+1,o+1),this.focusInputField("prev",e);break;case"ArrowRight":case"Shift":this.focusInputField("next",e);break;case"Delete":case"Backspace":""===r.value?this.focusInputField("prev",e):this.updateInput(r,e,"")}},this.focusInputField=(t,e)=>{if("next"===t){let t=e+1;if(!this.shouldInputBeEnabled(t))return;let i=this.numerics[t<this.length?t:e],r=i?this.getInputElement(i):void 0;r&&(r.disabled=!1,r.focus())}if("prev"===t){let t=e-1,i=this.numerics[t>-1?t:e],r=i?this.getInputElement(i):void 0;r&&r.focus()}}}firstUpdated(){this.otp&&(this.values=this.otp.split(""));let t=this.shadowRoot?.querySelectorAll("wui-input-numeric");t&&(this.numerics=Array.from(t)),this.numerics[0]?.focus()}render(){return r.html`
      <wui-flex gap="1" data-testid="wui-otp-input">
        ${Array.from({length:this.length}).map((t,e)=>r.html`
            <wui-input-numeric
              @input=${t=>this.handleInput(t,e)}
              @click=${t=>this.selectInput(t)}
              @keydown=${t=>this.handleKeyDown(t,e)}
              .disabled=${!this.shouldInputBeEnabled(e)}
              .value=${this.values[e]||""}
            >
            </wui-input-numeric>
          `)}
      </wui-flex>
    `}updateInput(t,e,i){let r=this.numerics[e],o=t||(r?this.getInputElement(r):void 0);o&&(o.value=i,this.values=this.values.map((t,r)=>r===e?i:t))}selectInput(t){let e=t.target;if(e){let t=this.getInputElement(e);t?.select()}}handleInput(t,e){let i=t.target,r=this.getInputElement(i);if(r){let i=r.value;"insertFromPaste"===t.inputType?this.handlePaste(r,i,e):p.UiHelperUtil.isNumber(i)&&t.data?(this.updateInput(r,e,t.data),this.focusInputField("next",e)):this.updateInput(r,e,"")}this.dispatchInputChangeEvent()}handlePaste(t,e,i){let r=e[0];if(r&&p.UiHelperUtil.isNumber(r)){this.updateInput(t,i,r);let o=e.substring(1);if(i+1<this.length&&o.length){let t=this.numerics[i+1],e=t?this.getInputElement(t):void 0;e&&this.handlePaste(e,o,i+1)}else this.focusInputField("next",i)}else this.updateInput(t,i,"")}getInputElement(t){return t.shadowRoot?.querySelector("input")?t.shadowRoot.querySelector("input"):null}dispatchInputChangeEvent(){let t=this.values.join("");this.dispatchEvent(new CustomEvent("inputChange",{detail:t,bubbles:!0,composed:!0}))}};C.styles=[h.resetStyles,w],x([(0,d.property)({type:Number})],C.prototype,"length",void 0),x([(0,d.property)({type:String})],C.prototype,"otp",void 0),x([(0,o.state)()],C.prototype,"values",void 0),C=x([(0,c.customElement)("wui-otp")],C),t.i(49536);var $=t.i(10923);let E=y.css`
  wui-loading-spinner {
    margin: 9px auto;
  }

  .email-display,
  .email-display wui-text {
    max-width: 100%;
  }
`;var k=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let P=e=class extends i.LitElement{firstUpdated(){this.startOTPTimeout()}disconnectedCallback(){clearTimeout(this.OTPTimeout)}constructor(){super(),this.loading=!1,this.timeoutTimeLeft=$.W3mFrameHelpers.getTimeToNextEmailLogin(),this.error="",this.otp="",this.email=s.RouterController.state.data?.email,this.authConnector=n.ConnectorController.getAuthConnector()}render(){if(!this.email)throw Error("w3m-email-otp-widget: No email provided");let t=!!this.timeoutTimeLeft,e=this.getFooterLabels(t);return r.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["4","0","4","0"]}
        gap="4"
      >
        <wui-flex
          class="email-display"
          flexDirection="column"
          alignItems="center"
          .padding=${["0","5","0","5"]}
        >
          <wui-text variant="md-regular" color="primary" align="center">
            Enter the code we sent to
          </wui-text>
          <wui-text variant="md-medium" color="primary" lineClamp="1" align="center">
            ${this.email}
          </wui-text>
        </wui-flex>

        <wui-text variant="sm-regular" color="secondary">The code expires in 20 minutes</wui-text>

        ${this.loading?r.html`<wui-loading-spinner size="xl" color="accent-primary"></wui-loading-spinner>`:r.html` <wui-flex flexDirection="column" alignItems="center" gap="2">
              <wui-otp
                dissabled
                length="6"
                @inputChange=${this.onOtpInputChange.bind(this)}
                .otp=${this.otp}
              ></wui-otp>
              ${this.error?r.html`
                    <wui-text variant="sm-regular" align="center" color="error">
                      ${this.error}. Try Again
                    </wui-text>
                  `:null}
            </wui-flex>`}

        <wui-flex alignItems="center" gap="2">
          <wui-text variant="sm-regular" color="secondary">${e.title}</wui-text>
          <wui-link @click=${this.onResendCode.bind(this)} .disabled=${t}>
            ${e.action}
          </wui-link>
        </wui-flex>
      </wui-flex>
    `}startOTPTimeout(){this.timeoutTimeLeft=$.W3mFrameHelpers.getTimeToNextEmailLogin(),this.OTPTimeout=setInterval(()=>{this.timeoutTimeLeft>0?this.timeoutTimeLeft=$.W3mFrameHelpers.getTimeToNextEmailLogin():clearInterval(this.OTPTimeout)},1e3)}async onOtpInputChange(t){try{!this.loading&&(this.otp=t.detail,this.shouldSubmitOnOtpChange()&&(this.loading=!0,await this.onOtpSubmit?.(this.otp)))}catch(t){this.error=a.CoreHelperUtil.parseError(t),this.loading=!1}}async onResendCode(){try{if(this.onOtpResend){if(!this.loading&&!this.timeoutTimeLeft){if(this.error="",this.otp="",!n.ConnectorController.getAuthConnector()||!this.email)throw Error("w3m-email-otp-widget: Unable to resend email");this.loading=!0,await this.onOtpResend(this.email),this.startOTPTimeout(),l.SnackController.showSuccess("Code email resent")}}else this.onStartOver&&this.onStartOver()}catch(t){l.SnackController.showError(t)}finally{this.loading=!1}}getFooterLabels(t){return this.onStartOver?{title:"Something wrong?",action:`Try again ${t?`in ${this.timeoutTimeLeft}s`:""}`}:{title:"Didn't receive it?",action:`Resend ${t?`in ${this.timeoutTimeLeft}s`:"Code"}`}}shouldSubmitOnOtpChange(){return this.authConnector&&this.otp.length===e.OTP_LENGTH}};P.OTP_LENGTH=6,P.styles=E,k([(0,o.state)()],P.prototype,"loading",void 0),k([(0,o.state)()],P.prototype,"timeoutTimeLeft",void 0),k([(0,o.state)()],P.prototype,"error",void 0),P=e=k([(0,c.customElement)("w3m-email-otp-widget")],P),t.s(["W3mEmailOtpWidget",0,P],26892)},86565,t=>{"use strict";var e=t.i(60398),i=t.i(71080),r=t.i(27302),o=t.i(53157),n=t.i(3468),a=t.i(82283),s=t.i(21728),l=t.i(11424);t.i(4041);var c=t.i(45975),u=t.i(26892);let d=class extends u.W3mEmailOtpWidget{constructor(){super(...arguments),this.onOtpSubmit=async t=>{try{if(this.authConnector){let r=e.ChainController.state.activeChain,c=i.ConnectionController.getConnections(r),u=a.OptionsController.state.remoteFeatures?.multiWallet,d=c.length>0;if(await this.authConnector.provider.connectOtp({otp:t}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_PASS"}),r)await i.ConnectionController.connectExternal(this.authConnector,r);else throw Error("Active chain is not set on ChainController");if(a.OptionsController.state.remoteFeatures?.emailCapture)return;if(a.OptionsController.state.siwx)return void n.ModalController.close();if(d&&u){s.RouterController.replace("ProfileWallets"),l.SnackController.showSuccess("New Wallet Added");return}n.ModalController.close()}}catch(t){throw o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_FAIL",properties:{message:r.CoreHelperUtil.parseError(t)}}),t}},this.onOtpResend=async t=>{this.authConnector&&(await this.authConnector.provider.connectEmail({email:t}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_SENT"}))}}};d=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a}([(0,c.customElement)("w3m-email-verify-otp-view")],d),t.s(["W3mEmailVerifyOtpView",0,d],49468),t.i(12207);var h=t.i(8285),p=t.i(54479);t.i(74576);var m=t.i(56350),v=t.i(49454);t.i(62238),t.i(46650),t.i(10380),t.i(49536);var g=t.i(62611);let f=g.css`
  wui-icon-box {
    height: ${({spacing:t})=>t["16"]};
    width: ${({spacing:t})=>t["16"]};
  }
`;var b=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let y=class extends h.LitElement{constructor(){super(),this.email=s.RouterController.state.data?.email,this.authConnector=v.ConnectorController.getAuthConnector(),this.loading=!1,this.listenForDeviceApproval()}render(){if(!this.email)throw Error("w3m-email-verify-device-view: No email provided");if(!this.authConnector)throw Error("w3m-email-verify-device-view: No auth connector provided");return p.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["6","3","6","3"]}
        gap="4"
      >
        <wui-icon-box size="xl" color="accent-primary" icon="sealCheck"></wui-icon-box>

        <wui-flex flexDirection="column" alignItems="center" gap="3">
          <wui-flex flexDirection="column" alignItems="center">
            <wui-text variant="md-regular" color="primary">
              Approve the login link we sent to
            </wui-text>
            <wui-text variant="md-regular" color="primary"><b>${this.email}</b></wui-text>
          </wui-flex>

          <wui-text variant="sm-regular" color="secondary" align="center">
            The code expires in 20 minutes
          </wui-text>

          <wui-flex alignItems="center" id="w3m-resend-section" gap="2">
            <wui-text variant="sm-regular" color="primary" align="center">
              Didn't receive it?
            </wui-text>
            <wui-link @click=${this.onResendCode.bind(this)} .disabled=${this.loading}>
              Resend email
            </wui-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}async listenForDeviceApproval(){if(this.authConnector)try{await this.authConnector.provider.connectDevice(),o.EventsController.sendEvent({type:"track",event:"DEVICE_REGISTERED_FOR_EMAIL"}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_SENT"}),s.RouterController.replace("EmailVerifyOtp",{email:this.email})}catch(t){s.RouterController.goBack()}}async onResendCode(){try{if(!this.loading){if(!this.authConnector||!this.email)throw Error("w3m-email-login-widget: Unable to resend email");this.loading=!0,await this.authConnector.provider.connectEmail({email:this.email}),this.listenForDeviceApproval(),l.SnackController.showSuccess("Code email resent")}}catch(t){l.SnackController.showError(t)}finally{this.loading=!1}}};y.styles=f,b([(0,m.state)()],y.prototype,"loading",void 0),y=b([(0,c.customElement)("w3m-email-verify-device-view")],y),t.s(["W3mEmailVerifyDeviceView",0,y],39385);var w=h;t.i(84326);var x=t.i(65090);t.i(34420),t.i(39299);var C=t.i(15193);let $=C.css`
  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }
`;var E=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let k=class extends w.LitElement{constructor(){super(...arguments),this.formRef=(0,x.createRef)(),this.initialEmail=s.RouterController.state.data?.email??"",this.redirectView=s.RouterController.state.data?.redirectView,this.email="",this.loading=!1}firstUpdated(){this.formRef.value?.addEventListener("keydown",t=>{"Enter"===t.key&&this.onSubmitEmail(t)})}render(){return p.html`
      <wui-flex flexDirection="column" padding="4" gap="4">
        <form ${(0,x.ref)(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
          <wui-email-input
            value=${this.initialEmail}
            .disabled=${this.loading}
            @inputChange=${this.onEmailInputChange.bind(this)}
          >
          </wui-email-input>
          <input type="submit" hidden />
        </form>
        ${this.buttonsTemplate()}
      </wui-flex>
    `}onEmailInputChange(t){this.email=t.detail}async onSubmitEmail(t){try{if(this.loading)return;this.loading=!0,t.preventDefault();let e=v.ConnectorController.getAuthConnector();if(!e)throw Error("w3m-update-email-wallet: Auth connector not found");let i=await e.provider.updateEmail({email:this.email});o.EventsController.sendEvent({type:"track",event:"EMAIL_EDIT"}),"VERIFY_SECONDARY_OTP"===i.action?s.RouterController.push("UpdateEmailSecondaryOtp",{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView}):s.RouterController.push("UpdateEmailPrimaryOtp",{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView})}catch(t){l.SnackController.showError(t),this.loading=!1}}buttonsTemplate(){let t=!this.loading&&this.email.length>3&&this.email!==this.initialEmail;return this.redirectView?p.html`
      <wui-flex gap="3">
        <wui-button size="md" variant="neutral" fullWidth @click=${s.RouterController.goBack}>
          Cancel
        </wui-button>

        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!t}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      </wui-flex>
    `:p.html`
        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!t}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      `}};k.styles=$,E([(0,m.state)()],k.prototype,"email",void 0),E([(0,m.state)()],k.prototype,"loading",void 0),k=E([(0,c.customElement)("w3m-update-email-wallet-view")],k),t.s(["W3mUpdateEmailWalletView",0,k],68265);var P=u;let O=class extends P.W3mEmailOtpWidget{constructor(){super(),this.email=s.RouterController.state.data?.email,this.onOtpSubmit=async t=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailPrimaryOtp({otp:t}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_PASS"}),s.RouterController.replace("UpdateEmailSecondaryOtp",s.RouterController.state.data))}catch(t){throw o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_FAIL",properties:{message:r.CoreHelperUtil.parseError(t)}}),t}},this.onStartOver=()=>{s.RouterController.replace("UpdateEmailWallet",s.RouterController.state.data)}}};O=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a}([(0,c.customElement)("w3m-update-email-primary-otp-view")],O),t.s(["W3mUpdateEmailPrimaryOtpView",0,O],82746);var j=u;let R=class extends j.W3mEmailOtpWidget{constructor(){super(),this.email=s.RouterController.state.data?.newEmail,this.redirectView=s.RouterController.state.data?.redirectView,this.onOtpSubmit=async t=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailSecondaryOtp({otp:t}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_PASS"}),this.redirectView&&s.RouterController.reset(this.redirectView))}catch(t){throw o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_FAIL",properties:{message:r.CoreHelperUtil.parseError(t)}}),t}},this.onStartOver=()=>{s.RouterController.replace("UpdateEmailWallet",s.RouterController.state.data)}}};R=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a}([(0,c.customElement)("w3m-update-email-secondary-otp-view")],R),t.s(["W3mUpdateEmailSecondaryOtpView",0,R],34349);var I=h,A=t.i(1564),S=t.i(16555),_=function(t,e,i,r){var o,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var s=t.length-1;s>=0;s--)(o=t[s])&&(a=(n<3?o(a):n>3?o(e,i,a):o(e,i))||a);return n>3&&a&&Object.defineProperty(e,i,a),a};let T=class extends I.LitElement{constructor(){super(),this.authConnector=v.ConnectorController.getAuthConnector(),this.isEmailEnabled=a.OptionsController.state.remoteFeatures?.email,this.isAuthEnabled=this.checkIfAuthEnabled(v.ConnectorController.state.connectors),this.connectors=v.ConnectorController.state.connectors,v.ConnectorController.subscribeKey("connectors",t=>{this.connectors=t,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)})}render(){if(!this.isEmailEnabled)throw Error("w3m-email-login-view: Email is not enabled");if(!this.isAuthEnabled)throw Error("w3m-email-login-view: No auth connector provided");return p.html`<wui-flex flexDirection="column" .padding=${["1","3","3","3"]} gap="4">
      <w3m-email-login-widget></w3m-email-login-widget>
    </wui-flex> `}checkIfAuthEnabled(t){let e=t.filter(t=>t.type===S.ConstantsUtil.CONNECTOR_TYPE_AUTH).map(t=>t.chain);return A.ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(t=>e.includes(t))}};_([(0,m.state)()],T.prototype,"connectors",void 0),T=_([(0,c.customElement)("w3m-email-login-view")],T),t.s(["W3mEmailLoginView",0,T],63611),t.s([],76312),t.i(76312),t.i(49468),t.i(39385),t.i(68265),t.i(82746),t.i(34349),t.i(63611),t.s(["W3mEmailLoginView",0,T,"W3mEmailOtpWidget",()=>u.W3mEmailOtpWidget,"W3mEmailVerifyDeviceView",0,y,"W3mEmailVerifyOtpView",0,d,"W3mUpdateEmailPrimaryOtpView",0,O,"W3mUpdateEmailSecondaryOtpView",0,R,"W3mUpdateEmailWalletView",0,k],86565)},82012,t=>{t.v(e=>Promise.all(["static/chunks/04ico-_gjm27w.js"].map(e=>t.l(e))).then(()=>e(96403)))},40171,t=>{t.v(e=>Promise.all(["static/chunks/11v3m7g373ehs.js"].map(e=>t.l(e))).then(()=>e(69592)))},10729,t=>{t.v(e=>Promise.all(["static/chunks/0xc5ogy.4cqt6.js"].map(e=>t.l(e))).then(()=>e(86977)))},80342,t=>{t.v(e=>Promise.all(["static/chunks/0_mewu7cnpsno.js"].map(e=>t.l(e))).then(()=>e(32833)))},95724,t=>{t.v(e=>Promise.all(["static/chunks/11wkp7hpvh7tf.js"].map(e=>t.l(e))).then(()=>e(72412)))},52792,t=>{t.v(e=>Promise.all(["static/chunks/0g3ui2wv8r~wc.js"].map(e=>t.l(e))).then(()=>e(26763)))},96302,t=>{t.v(e=>Promise.all(["static/chunks/0j0k6c8ggdklr.js"].map(e=>t.l(e))).then(()=>e(43229)))},44243,t=>{t.v(e=>Promise.all(["static/chunks/07wddbwvy22f0.js"].map(e=>t.l(e))).then(()=>e(12721)))},59668,t=>{t.v(e=>Promise.all(["static/chunks/09ba7-_iffhw0.js"].map(e=>t.l(e))).then(()=>e(36682)))},41373,t=>{t.v(e=>Promise.all(["static/chunks/10gk0blv0it_k.js"].map(e=>t.l(e))).then(()=>e(51383)))},69595,t=>{t.v(e=>Promise.all(["static/chunks/0bta-jrs6~00o.js"].map(e=>t.l(e))).then(()=>e(4289)))},33052,t=>{t.v(e=>Promise.all(["static/chunks/0762bbcc5~n~v.js"].map(e=>t.l(e))).then(()=>e(56357)))},280,t=>{t.v(e=>Promise.all(["static/chunks/0zft.mxso0wdv.js"].map(e=>t.l(e))).then(()=>e(78319)))},92833,t=>{t.v(e=>Promise.all(["static/chunks/0tdapn46a87b2.js"].map(e=>t.l(e))).then(()=>e(61289)))},17096,t=>{t.v(e=>Promise.all(["static/chunks/0oeos-plb2q06.js"].map(e=>t.l(e))).then(()=>e(26703)))},5963,t=>{t.v(e=>Promise.all(["static/chunks/0vhj_1cq1owug.js"].map(e=>t.l(e))).then(()=>e(9953)))},48774,t=>{t.v(e=>Promise.all(["static/chunks/0vm3duhzxw-u2.js"].map(e=>t.l(e))).then(()=>e(32295)))},50090,t=>{t.v(e=>Promise.all(["static/chunks/12wk3fvygoqg~.js"].map(e=>t.l(e))).then(()=>e(52019)))},38711,t=>{t.v(e=>Promise.all(["static/chunks/1408kbi9bcza3.js"].map(e=>t.l(e))).then(()=>e(64871)))},50621,t=>{t.v(e=>Promise.all(["static/chunks/0881hmc9re8px.js"].map(e=>t.l(e))).then(()=>e(59021)))},5462,t=>{t.v(e=>Promise.all(["static/chunks/04f2_hmveaqeu.js"].map(e=>t.l(e))).then(()=>e(65788)))},70963,t=>{t.v(e=>Promise.all(["static/chunks/0zhiq_0493.r0.js"].map(e=>t.l(e))).then(()=>e(17729)))},56906,t=>{t.v(e=>Promise.all(["static/chunks/0o7t79qo-g.qk.js"].map(e=>t.l(e))).then(()=>e(34056)))},78023,t=>{t.v(e=>Promise.all(["static/chunks/0p-trm74a~_nw.js"].map(e=>t.l(e))).then(()=>e(71507)))},69039,t=>{t.v(e=>Promise.all(["static/chunks/015dz_0fuvoul.js"].map(e=>t.l(e))).then(()=>e(2658)))},63605,t=>{t.v(e=>Promise.all(["static/chunks/0jt_ui_som86b.js"].map(e=>t.l(e))).then(()=>e(39621)))},42324,t=>{t.v(e=>Promise.all(["static/chunks/16ae95zbkbei2.js"].map(e=>t.l(e))).then(()=>e(11923)))},84968,t=>{t.v(e=>Promise.all(["static/chunks/139-5-~k-a9_a.js"].map(e=>t.l(e))).then(()=>e(74571)))},44020,t=>{t.v(e=>Promise.all(["static/chunks/0sj204xziysfx.js"].map(e=>t.l(e))).then(()=>e(84535)))},50711,t=>{t.v(e=>Promise.all(["static/chunks/0mb5g5c08bg3_.js"].map(e=>t.l(e))).then(()=>e(15680)))},56601,t=>{t.v(e=>Promise.all(["static/chunks/04ao4kqg7-71z.js"].map(e=>t.l(e))).then(()=>e(1958)))},81254,t=>{t.v(e=>Promise.all(["static/chunks/0ylfzksb.ysq3.js"].map(e=>t.l(e))).then(()=>e(11420)))},79893,t=>{t.v(e=>Promise.all(["static/chunks/11vp.ou5.wgk..js"].map(e=>t.l(e))).then(()=>e(52452)))},1514,t=>{t.v(e=>Promise.all(["static/chunks/15_vj4ft3pkw2.js"].map(e=>t.l(e))).then(()=>e(35252)))},44980,t=>{t.v(e=>Promise.all(["static/chunks/0abw.we2fvq85.js"].map(e=>t.l(e))).then(()=>e(80835)))},84074,t=>{t.v(e=>Promise.all(["static/chunks/0qu2ipod_3dre.js"].map(e=>t.l(e))).then(()=>e(94301)))},67422,t=>{t.v(e=>Promise.all(["static/chunks/0trdrklutxs6s.js"].map(e=>t.l(e))).then(()=>e(89931)))},13200,t=>{t.v(e=>Promise.all(["static/chunks/0wufvuse0m1df.js"].map(e=>t.l(e))).then(()=>e(69097)))},48479,t=>{t.v(e=>Promise.all(["static/chunks/039hmx6plo.3u.js"].map(e=>t.l(e))).then(()=>e(88299)))},67369,t=>{t.v(e=>Promise.all(["static/chunks/0avogfle0agse.js"].map(e=>t.l(e))).then(()=>e(66712)))},77793,t=>{t.v(e=>Promise.all(["static/chunks/0xub8so4d47.0.js"].map(e=>t.l(e))).then(()=>e(71960)))},4447,t=>{t.v(e=>Promise.all(["static/chunks/144lv8k~l5496.js"].map(e=>t.l(e))).then(()=>e(65425)))},93690,t=>{t.v(e=>Promise.all(["static/chunks/0acgxj--f7i8u.js"].map(e=>t.l(e))).then(()=>e(65891)))},77385,t=>{t.v(e=>Promise.all(["static/chunks/0qk6uu2q1tw_v.js"].map(e=>t.l(e))).then(()=>e(84131)))},65739,t=>{t.v(e=>Promise.all(["static/chunks/12lr98o1.yd7g.js"].map(e=>t.l(e))).then(()=>e(9900)))},80304,t=>{t.v(e=>Promise.all(["static/chunks/10lvb6.5.uxa9.js"].map(e=>t.l(e))).then(()=>e(45017)))},9957,t=>{t.v(e=>Promise.all(["static/chunks/0.7amhpjej0na.js"].map(e=>t.l(e))).then(()=>e(44919)))},22236,t=>{t.v(e=>Promise.all(["static/chunks/0z~mfwxrvgs-s.js"].map(e=>t.l(e))).then(()=>e(6501)))},40934,t=>{t.v(e=>Promise.all(["static/chunks/0c.ugbg-cm92~.js"].map(e=>t.l(e))).then(()=>e(13559)))},71802,t=>{t.v(e=>Promise.all(["static/chunks/0u00gqq-1y.-7.js"].map(e=>t.l(e))).then(()=>e(94384)))},57792,t=>{t.v(e=>Promise.all(["static/chunks/0l23c_y.nej82.js"].map(e=>t.l(e))).then(()=>e(76208)))},7885,t=>{t.v(e=>Promise.all(["static/chunks/047hyf3ib.ncs.js"].map(e=>t.l(e))).then(()=>e(56529)))}]);