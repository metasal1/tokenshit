(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,26892,e=>{"use strict";e.i(12207);var t,i=e.i(8285),r=e.i(54479);e.i(74576);var o=e.i(56350),n=e.i(49454),l=e.i(27302),a=e.i(21728),s=e.i(11424);e.i(4041);var c=e.i(45975);e.i(62238),e.i(10380),e.i(21147);var u=i,p=e.i(20119);e.i(73944);var h=e.i(59088),d=e.i(12699),m=i,f=e.i(62611);let w=f.css`
  :host {
    position: relative;
    display: inline-block;
  }

  input {
    width: 48px;
    height: 48px;
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    font-family: ${({fontFamily:e})=>e.regular};
    font-size: ${({textSize:e})=>e.large};
    line-height: 18px;
    letter-spacing: -0.16px;
    text-align: center;
    color: ${({tokens:e})=>e.theme.textPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      border-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, border-color, box-shadow;
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: ${({spacing:e})=>e[4]};
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
    border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }
`;var g=function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l};let v=class extends m.LitElement{constructor(){super(...arguments),this.disabled=!1,this.value=""}render(){return r.html`<input
      type="number"
      maxlength="1"
      inputmode="numeric"
      autofocus
      ?disabled=${this.disabled}
      value=${this.value}
    /> `}};v.styles=[h.resetStyles,h.elementStyles,w],g([(0,p.property)({type:Boolean})],v.prototype,"disabled",void 0),g([(0,p.property)({type:String})],v.prototype,"value",void 0),v=g([(0,c.customElement)("wui-input-numeric")],v);var E=e.i(15193);let y=E.css`
  :host {
    position: relative;
    display: block;
  }
`;var C=function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l};let b=class extends u.LitElement{constructor(){super(...arguments),this.length=6,this.otp="",this.values=Array.from({length:this.length}).map(()=>""),this.numerics=[],this.shouldInputBeEnabled=e=>this.values.slice(0,e).every(e=>""!==e),this.handleKeyDown=(e,t)=>{let i=e.target,r=this.getInputElement(i);if(!r)return;["ArrowLeft","ArrowRight","Shift","Delete"].includes(e.key)&&e.preventDefault();let o=r.selectionStart;switch(e.key){case"ArrowLeft":o&&r.setSelectionRange(o+1,o+1),this.focusInputField("prev",t);break;case"ArrowRight":case"Shift":this.focusInputField("next",t);break;case"Delete":case"Backspace":""===r.value?this.focusInputField("prev",t):this.updateInput(r,t,"")}},this.focusInputField=(e,t)=>{if("next"===e){let e=t+1;if(!this.shouldInputBeEnabled(e))return;let i=this.numerics[e<this.length?e:t],r=i?this.getInputElement(i):void 0;r&&(r.disabled=!1,r.focus())}if("prev"===e){let e=t-1,i=this.numerics[e>-1?e:t],r=i?this.getInputElement(i):void 0;r&&r.focus()}}}firstUpdated(){this.otp&&(this.values=this.otp.split(""));let e=this.shadowRoot?.querySelectorAll("wui-input-numeric");e&&(this.numerics=Array.from(e)),this.numerics[0]?.focus()}render(){return r.html`
      <wui-flex gap="1" data-testid="wui-otp-input">
        ${Array.from({length:this.length}).map((e,t)=>r.html`
            <wui-input-numeric
              @input=${e=>this.handleInput(e,t)}
              @click=${e=>this.selectInput(e)}
              @keydown=${e=>this.handleKeyDown(e,t)}
              .disabled=${!this.shouldInputBeEnabled(t)}
              .value=${this.values[t]||""}
            >
            </wui-input-numeric>
          `)}
      </wui-flex>
    `}updateInput(e,t,i){let r=this.numerics[t],o=e||(r?this.getInputElement(r):void 0);o&&(o.value=i,this.values=this.values.map((e,r)=>r===t?i:e))}selectInput(e){let t=e.target;if(t){let e=this.getInputElement(t);e?.select()}}handleInput(e,t){let i=e.target,r=this.getInputElement(i);if(r){let i=r.value;"insertFromPaste"===e.inputType?this.handlePaste(r,i,t):d.UiHelperUtil.isNumber(i)&&e.data?(this.updateInput(r,t,e.data),this.focusInputField("next",t)):this.updateInput(r,t,"")}this.dispatchInputChangeEvent()}handlePaste(e,t,i){let r=t[0];if(r&&d.UiHelperUtil.isNumber(r)){this.updateInput(e,i,r);let o=t.substring(1);if(i+1<this.length&&o.length){let e=this.numerics[i+1],t=e?this.getInputElement(e):void 0;t&&this.handlePaste(t,o,i+1)}else this.focusInputField("next",i)}else this.updateInput(e,i,"")}getInputElement(e){return e.shadowRoot?.querySelector("input")?e.shadowRoot.querySelector("input"):null}dispatchInputChangeEvent(){let e=this.values.join("");this.dispatchEvent(new CustomEvent("inputChange",{detail:e,bubbles:!0,composed:!0}))}};b.styles=[h.resetStyles,y],C([(0,p.property)({type:Number})],b.prototype,"length",void 0),C([(0,p.property)({type:String})],b.prototype,"otp",void 0),C([(0,o.state)()],b.prototype,"values",void 0),b=C([(0,c.customElement)("wui-otp")],b),e.i(49536);var O=e.i(10923);let x=E.css`
  wui-loading-spinner {
    margin: 9px auto;
  }

  .email-display,
  .email-display wui-text {
    max-width: 100%;
  }
`;var I=function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l};let R=t=class extends i.LitElement{firstUpdated(){this.startOTPTimeout()}disconnectedCallback(){clearTimeout(this.OTPTimeout)}constructor(){super(),this.loading=!1,this.timeoutTimeLeft=O.W3mFrameHelpers.getTimeToNextEmailLogin(),this.error="",this.otp="",this.email=a.RouterController.state.data?.email,this.authConnector=n.ConnectorController.getAuthConnector()}render(){if(!this.email)throw Error("w3m-email-otp-widget: No email provided");let e=!!this.timeoutTimeLeft,t=this.getFooterLabels(e);return r.html`
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
          <wui-text variant="sm-regular" color="secondary">${t.title}</wui-text>
          <wui-link @click=${this.onResendCode.bind(this)} .disabled=${e}>
            ${t.action}
          </wui-link>
        </wui-flex>
      </wui-flex>
    `}startOTPTimeout(){this.timeoutTimeLeft=O.W3mFrameHelpers.getTimeToNextEmailLogin(),this.OTPTimeout=setInterval(()=>{this.timeoutTimeLeft>0?this.timeoutTimeLeft=O.W3mFrameHelpers.getTimeToNextEmailLogin():clearInterval(this.OTPTimeout)},1e3)}async onOtpInputChange(e){try{!this.loading&&(this.otp=e.detail,this.shouldSubmitOnOtpChange()&&(this.loading=!0,await this.onOtpSubmit?.(this.otp)))}catch(e){this.error=l.CoreHelperUtil.parseError(e),this.loading=!1}}async onResendCode(){try{if(this.onOtpResend){if(!this.loading&&!this.timeoutTimeLeft){if(this.error="",this.otp="",!n.ConnectorController.getAuthConnector()||!this.email)throw Error("w3m-email-otp-widget: Unable to resend email");this.loading=!0,await this.onOtpResend(this.email),this.startOTPTimeout(),s.SnackController.showSuccess("Code email resent")}}else this.onStartOver&&this.onStartOver()}catch(e){s.SnackController.showError(e)}finally{this.loading=!1}}getFooterLabels(e){return this.onStartOver?{title:"Something wrong?",action:`Try again ${e?`in ${this.timeoutTimeLeft}s`:""}`}:{title:"Didn't receive it?",action:`Resend ${e?`in ${this.timeoutTimeLeft}s`:"Code"}`}}shouldSubmitOnOtpChange(){return this.authConnector&&this.otp.length===t.OTP_LENGTH}};R.OTP_LENGTH=6,R.styles=x,I([(0,o.state)()],R.prototype,"loading",void 0),I([(0,o.state)()],R.prototype,"timeoutTimeLeft",void 0),I([(0,o.state)()],R.prototype,"error",void 0),R=t=I([(0,c.customElement)("w3m-email-otp-widget")],R),e.s(["W3mEmailOtpWidget",0,R],26892)},86565,e=>{"use strict";var t=e.i(60398),i=e.i(71080),r=e.i(27302),o=e.i(53157),n=e.i(3468),l=e.i(82283),a=e.i(21728),s=e.i(11424);e.i(4041);var c=e.i(45975),u=e.i(26892);let p=class extends u.W3mEmailOtpWidget{constructor(){super(...arguments),this.onOtpSubmit=async e=>{try{if(this.authConnector){let r=t.ChainController.state.activeChain,c=i.ConnectionController.getConnections(r),u=l.OptionsController.state.remoteFeatures?.multiWallet,p=c.length>0;if(await this.authConnector.provider.connectOtp({otp:e}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_PASS"}),r)await i.ConnectionController.connectExternal(this.authConnector,r);else throw Error("Active chain is not set on ChainController");if(l.OptionsController.state.remoteFeatures?.emailCapture)return;if(l.OptionsController.state.siwx)return void n.ModalController.close();if(p&&u){a.RouterController.replace("ProfileWallets"),s.SnackController.showSuccess("New Wallet Added");return}n.ModalController.close()}}catch(e){throw o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_FAIL",properties:{message:r.CoreHelperUtil.parseError(e)}}),e}},this.onOtpResend=async e=>{this.authConnector&&(await this.authConnector.provider.connectEmail({email:e}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_SENT"}))}}};p=function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l}([(0,c.customElement)("w3m-email-verify-otp-view")],p),e.s(["W3mEmailVerifyOtpView",0,p],49468),e.i(12207);var h=e.i(8285),d=e.i(54479);e.i(74576);var m=e.i(56350),f=e.i(49454);e.i(62238),e.i(46650),e.i(10380),e.i(49536);var w=e.i(62611);let g=w.css`
  wui-icon-box {
    height: ${({spacing:e})=>e["16"]};
    width: ${({spacing:e})=>e["16"]};
  }
`;var v=function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l};let E=class extends h.LitElement{constructor(){super(),this.email=a.RouterController.state.data?.email,this.authConnector=f.ConnectorController.getAuthConnector(),this.loading=!1,this.listenForDeviceApproval()}render(){if(!this.email)throw Error("w3m-email-verify-device-view: No email provided");if(!this.authConnector)throw Error("w3m-email-verify-device-view: No auth connector provided");return d.html`
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
    `}async listenForDeviceApproval(){if(this.authConnector)try{await this.authConnector.provider.connectDevice(),o.EventsController.sendEvent({type:"track",event:"DEVICE_REGISTERED_FOR_EMAIL"}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_SENT"}),a.RouterController.replace("EmailVerifyOtp",{email:this.email})}catch(e){a.RouterController.goBack()}}async onResendCode(){try{if(!this.loading){if(!this.authConnector||!this.email)throw Error("w3m-email-login-widget: Unable to resend email");this.loading=!0,await this.authConnector.provider.connectEmail({email:this.email}),this.listenForDeviceApproval(),s.SnackController.showSuccess("Code email resent")}}catch(e){s.SnackController.showError(e)}finally{this.loading=!1}}};E.styles=g,v([(0,m.state)()],E.prototype,"loading",void 0),E=v([(0,c.customElement)("w3m-email-verify-device-view")],E),e.s(["W3mEmailVerifyDeviceView",0,E],39385);var y=h;e.i(84326);var C=e.i(65090);e.i(34420),e.i(39299);var b=e.i(15193);let O=b.css`
  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }
`;var x=function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l};let I=class extends y.LitElement{constructor(){super(...arguments),this.formRef=(0,C.createRef)(),this.initialEmail=a.RouterController.state.data?.email??"",this.redirectView=a.RouterController.state.data?.redirectView,this.email="",this.loading=!1}firstUpdated(){this.formRef.value?.addEventListener("keydown",e=>{"Enter"===e.key&&this.onSubmitEmail(e)})}render(){return d.html`
      <wui-flex flexDirection="column" padding="4" gap="4">
        <form ${(0,C.ref)(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
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
    `}onEmailInputChange(e){this.email=e.detail}async onSubmitEmail(e){try{if(this.loading)return;this.loading=!0,e.preventDefault();let t=f.ConnectorController.getAuthConnector();if(!t)throw Error("w3m-update-email-wallet: Auth connector not found");let i=await t.provider.updateEmail({email:this.email});o.EventsController.sendEvent({type:"track",event:"EMAIL_EDIT"}),"VERIFY_SECONDARY_OTP"===i.action?a.RouterController.push("UpdateEmailSecondaryOtp",{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView}):a.RouterController.push("UpdateEmailPrimaryOtp",{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView})}catch(e){s.SnackController.showError(e),this.loading=!1}}buttonsTemplate(){let e=!this.loading&&this.email.length>3&&this.email!==this.initialEmail;return this.redirectView?d.html`
      <wui-flex gap="3">
        <wui-button size="md" variant="neutral" fullWidth @click=${a.RouterController.goBack}>
          Cancel
        </wui-button>

        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!e}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      </wui-flex>
    `:d.html`
        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!e}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      `}};I.styles=O,x([(0,m.state)()],I.prototype,"email",void 0),x([(0,m.state)()],I.prototype,"loading",void 0),I=x([(0,c.customElement)("w3m-update-email-wallet-view")],I),e.s(["W3mUpdateEmailWalletView",0,I],68265);var R=u;let T=class extends R.W3mEmailOtpWidget{constructor(){super(),this.email=a.RouterController.state.data?.email,this.onOtpSubmit=async e=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailPrimaryOtp({otp:e}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_PASS"}),a.RouterController.replace("UpdateEmailSecondaryOtp",a.RouterController.state.data))}catch(e){throw o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_FAIL",properties:{message:r.CoreHelperUtil.parseError(e)}}),e}},this.onStartOver=()=>{a.RouterController.replace("UpdateEmailWallet",a.RouterController.state.data)}}};T=function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l}([(0,c.customElement)("w3m-update-email-primary-otp-view")],T),e.s(["W3mUpdateEmailPrimaryOtpView",0,T],82746);var $=u;let A=class extends $.W3mEmailOtpWidget{constructor(){super(),this.email=a.RouterController.state.data?.newEmail,this.redirectView=a.RouterController.state.data?.redirectView,this.onOtpSubmit=async e=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailSecondaryOtp({otp:e}),o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_PASS"}),this.redirectView&&a.RouterController.reset(this.redirectView))}catch(e){throw o.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_FAIL",properties:{message:r.CoreHelperUtil.parseError(e)}}),e}},this.onStartOver=()=>{a.RouterController.replace("UpdateEmailWallet",a.RouterController.state.data)}}};A=function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l}([(0,c.customElement)("w3m-update-email-secondary-otp-view")],A),e.s(["W3mUpdateEmailSecondaryOtpView",0,A],34349);var S=h,k=e.i(1564),P=e.i(16555),D=function(e,t,i,r){var o,n=arguments.length,l=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)l=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(l=(n<3?o(l):n>3?o(t,i,l):o(t,i))||l);return n>3&&l&&Object.defineProperty(t,i,l),l};let L=class extends S.LitElement{constructor(){super(),this.authConnector=f.ConnectorController.getAuthConnector(),this.isEmailEnabled=l.OptionsController.state.remoteFeatures?.email,this.isAuthEnabled=this.checkIfAuthEnabled(f.ConnectorController.state.connectors),this.connectors=f.ConnectorController.state.connectors,f.ConnectorController.subscribeKey("connectors",e=>{this.connectors=e,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)})}render(){if(!this.isEmailEnabled)throw Error("w3m-email-login-view: Email is not enabled");if(!this.isAuthEnabled)throw Error("w3m-email-login-view: No auth connector provided");return d.html`<wui-flex flexDirection="column" .padding=${["1","3","3","3"]} gap="4">
      <w3m-email-login-widget></w3m-email-login-widget>
    </wui-flex> `}checkIfAuthEnabled(e){let t=e.filter(e=>e.type===P.ConstantsUtil.CONNECTOR_TYPE_AUTH).map(e=>e.chain);return k.ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(e=>t.includes(e))}};D([(0,m.state)()],L.prototype,"connectors",void 0),L=D([(0,c.customElement)("w3m-email-login-view")],L),e.s(["W3mEmailLoginView",0,L],63611),e.s([],76312),e.i(76312),e.i(49468),e.i(39385),e.i(68265),e.i(82746),e.i(34349),e.i(63611),e.s(["W3mEmailLoginView",0,L,"W3mEmailOtpWidget",()=>u.W3mEmailOtpWidget,"W3mEmailVerifyDeviceView",0,E,"W3mEmailVerifyOtpView",0,p,"W3mUpdateEmailPrimaryOtpView",0,T,"W3mUpdateEmailSecondaryOtpView",0,A,"W3mUpdateEmailWalletView",0,I],86565)}]);