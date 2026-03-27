(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,10842,37287,72801,85873,19295,69311,79890,74950,7337,10149,28218,17283,4356,90344,12639,69783,8201,64077,67772,44216,69962,5676,17016,43476,16519,27159,49566,e=>{"use strict";e.i(12207);var t=e.i(8285),i=e.i(54479);e.i(74576);var o=e.i(20119),r=e.i(56350);e.i(34051);var n=e.i(29389),a=e.i(41845),l=e.i(36220),s=e.i(60398),c=e.i(27302),d=e.i(3468),u=e.i(82283);e.i(4041);var p=e.i(45975),h=t;e.i(52634),e.i(64380),e.i(83227),e.i(39009),e.i(73944);var m=e.i(59088),w=e.i(12699);e.i(21803);var g=e.i(62611);let f=g.css`
  :host {
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e["20"]};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[16]};
    height: 32px;
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: box-shadow;
  }

  button wui-flex.avatar-container {
    width: 28px;
    height: 24px;
    position: relative;

    wui-flex.network-image-container {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: 12px;
      height: 12px;
    }

    wui-flex.network-image-container wui-icon {
      background: ${({tokens:e})=>e.theme.foregroundPrimary};
    }

    wui-avatar {
      width: 24px;
      min-width: 24px;
      height: 24px;
    }

    wui-icon {
      width: 12px;
      height: 12px;
    }
  }

  wui-image,
  wui-icon {
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  wui-text {
    white-space: nowrap;
  }

  button wui-flex.balance-container {
    height: 100%;
    border-radius: ${({borderRadius:e})=>e[16]};
    padding-left: ${({spacing:e})=>e[1]};
    padding-right: ${({spacing:e})=>e[1]};
    background: ${({tokens:e})=>e.theme.foregroundSecondary};
    color: ${({tokens:e})=>e.theme.textPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:focus-visible:enabled,
  button:active:enabled {
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.2);

    wui-flex.balance-container {
      background: ${({tokens:e})=>e.theme.foregroundTertiary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled wui-text,
  button:disabled wui-flex.avatar-container {
    opacity: 0.3;
  }
`;var b=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let y=class extends h.LitElement{constructor(){super(...arguments),this.networkSrc=void 0,this.avatarSrc=void 0,this.balance=void 0,this.isUnsupportedChain=void 0,this.disabled=!1,this.loading=!1,this.address="",this.profileName="",this.charsStart=4,this.charsEnd=6}render(){return i.html`
      <button
        ?disabled=${this.disabled}
        class=${(0,n.ifDefined)(this.balance?void 0:"local-no-balance")}
        data-error=${(0,n.ifDefined)(this.isUnsupportedChain)}
      >
        ${this.imageTemplate()} ${this.addressTemplate()} ${this.balanceTemplate()}
      </button>
    `}imageTemplate(){let e=this.networkSrc?i.html`<wui-image src=${this.networkSrc}></wui-image>`:i.html` <wui-icon size="inherit" color="inherit" name="networkPlaceholder"></wui-icon> `;return i.html`<wui-flex class="avatar-container">
      <wui-avatar
        .imageSrc=${this.avatarSrc}
        alt=${this.address}
        address=${this.address}
      ></wui-avatar>

      <wui-flex class="network-image-container">${e}</wui-flex>
    </wui-flex>`}addressTemplate(){return i.html`<wui-text variant="md-regular" color="inherit">
      ${this.address?w.UiHelperUtil.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?18:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?"end":"middle"}):null}
    </wui-text>`}balanceTemplate(){if(this.balance){let e=this.loading?i.html`<wui-loading-spinner size="md" color="inherit"></wui-loading-spinner>`:i.html`<wui-text variant="md-regular" color="inherit"> ${this.balance}</wui-text>`;return i.html`<wui-flex alignItems="center" justifyContent="center" class="balance-container"
        >${e}</wui-flex
      >`}return null}};y.styles=[m.resetStyles,m.elementStyles,f],b([(0,o.property)()],y.prototype,"networkSrc",void 0),b([(0,o.property)()],y.prototype,"avatarSrc",void 0),b([(0,o.property)()],y.prototype,"balance",void 0),b([(0,o.property)({type:Boolean})],y.prototype,"isUnsupportedChain",void 0),b([(0,o.property)({type:Boolean})],y.prototype,"disabled",void 0),b([(0,o.property)({type:Boolean})],y.prototype,"loading",void 0),b([(0,o.property)()],y.prototype,"address",void 0),b([(0,o.property)()],y.prototype,"profileName",void 0),b([(0,o.property)()],y.prototype,"charsStart",void 0),b([(0,o.property)()],y.prototype,"charsEnd",void 0),y=b([(0,p.customElement)("wui-account-button")],y);var C=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};class v extends t.LitElement{constructor(){super(...arguments),this.unsubscribe=[],this.disabled=!1,this.balance="show",this.charsStart=4,this.charsEnd=6,this.namespace=void 0,this.isSupported=!!u.OptionsController.state.allowUnsupportedChain||!s.ChainController.state.activeChain||s.ChainController.checkIfSupportedNetwork(s.ChainController.state.activeChain)}connectedCallback(){super.connectedCallback(),this.setAccountData(s.ChainController.getAccountData(this.namespace)),this.setNetworkData(s.ChainController.getNetworkData(this.namespace))}firstUpdated(){let e=this.namespace;e?this.unsubscribe.push(s.ChainController.subscribeChainProp("accountState",e=>{this.setAccountData(e)},e),s.ChainController.subscribeChainProp("networkState",t=>{this.setNetworkData(t),this.isSupported=s.ChainController.checkIfSupportedNetwork(e,t?.caipNetwork?.caipNetworkId)},e)):this.unsubscribe.push(a.AssetController.subscribeNetworkImages(()=>{this.networkImage=l.AssetUtil.getNetworkImage(this.network)}),s.ChainController.subscribeKey("activeCaipAddress",e=>{this.caipAddress=e}),s.ChainController.subscribeChainProp("accountState",e=>{this.setAccountData(e)}),s.ChainController.subscribeKey("activeCaipNetwork",e=>{this.network=e,this.networkImage=l.AssetUtil.getNetworkImage(e),this.isSupported=!e?.chainNamespace||s.ChainController.checkIfSupportedNetwork(e?.chainNamespace),this.fetchNetworkImage(e)}))}updated(){this.fetchNetworkImage(this.network)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!s.ChainController.state.activeChain)return null;let e="show"===this.balance,t="string"!=typeof this.balanceVal,{formattedText:o}=c.CoreHelperUtil.parseBalance(this.balanceVal,this.balanceSymbol);return i.html`
      <wui-account-button
        .disabled=${!!this.disabled}
        .isUnsupportedChain=${!u.OptionsController.state.allowUnsupportedChain&&!this.isSupported}
        address=${(0,n.ifDefined)(c.CoreHelperUtil.getPlainAddress(this.caipAddress))}
        profileName=${(0,n.ifDefined)(this.profileName)}
        networkSrc=${(0,n.ifDefined)(this.networkImage)}
        avatarSrc=${(0,n.ifDefined)(this.profileImage)}
        balance=${e?o:""}
        @click=${this.onClick.bind(this)}
        data-testid=${`account-button${this.namespace?`-${this.namespace}`:""}`}
        .charsStart=${this.charsStart}
        .charsEnd=${this.charsEnd}
        ?loading=${t}
      >
      </wui-account-button>
    `}onClick(){this.isSupported||u.OptionsController.state.allowUnsupportedChain?d.ModalController.open({namespace:this.namespace}):d.ModalController.open({view:"UnsupportedChain"})}async fetchNetworkImage(e){e?.assets?.imageId&&(this.networkImage=await l.AssetUtil.fetchNetworkImage(e?.assets?.imageId))}setAccountData(e){e&&(this.caipAddress=e.caipAddress,this.balanceVal=e.balance,this.balanceSymbol=e.balanceSymbol,this.profileName=e.profileName,this.profileImage=e.profileImage)}setNetworkData(e){e&&(this.network=e.caipNetwork,this.networkImage=l.AssetUtil.getNetworkImage(e.caipNetwork))}}C([(0,o.property)({type:Boolean})],v.prototype,"disabled",void 0),C([(0,o.property)()],v.prototype,"balance",void 0),C([(0,o.property)()],v.prototype,"charsStart",void 0),C([(0,o.property)()],v.prototype,"charsEnd",void 0),C([(0,o.property)()],v.prototype,"namespace",void 0),C([(0,r.state)()],v.prototype,"caipAddress",void 0),C([(0,r.state)()],v.prototype,"balanceVal",void 0),C([(0,r.state)()],v.prototype,"balanceSymbol",void 0),C([(0,r.state)()],v.prototype,"profileName",void 0),C([(0,r.state)()],v.prototype,"profileImage",void 0),C([(0,r.state)()],v.prototype,"network",void 0),C([(0,r.state)()],v.prototype,"networkImage",void 0),C([(0,r.state)()],v.prototype,"isSupported",void 0);let x=class extends v{};x=C([(0,p.customElement)("w3m-account-button")],x);let $=class extends v{};$=C([(0,p.customElement)("appkit-account-button")],$),e.s(["AppKitAccountButton",0,$,"W3mAccountButton",0,x],37287);var k=t,E=e.i(15193);let S=E.css`
  :host {
    display: block;
    width: max-content;
  }
`;var R=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};class A extends k.LitElement{constructor(){super(...arguments),this.unsubscribe=[],this.disabled=!1,this.balance=void 0,this.size=void 0,this.label=void 0,this.loadingLabel=void 0,this.charsStart=4,this.charsEnd=6,this.namespace=void 0}firstUpdated(){this.caipAddress=this.namespace?s.ChainController.getAccountData(this.namespace)?.caipAddress:s.ChainController.state.activeCaipAddress,this.namespace?this.unsubscribe.push(s.ChainController.subscribeChainProp("accountState",e=>{this.caipAddress=e?.caipAddress},this.namespace)):this.unsubscribe.push(s.ChainController.subscribeKey("activeCaipAddress",e=>this.caipAddress=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return this.caipAddress?i.html`
          <appkit-account-button
            .disabled=${!!this.disabled}
            balance=${(0,n.ifDefined)(this.balance)}
            .charsStart=${(0,n.ifDefined)(this.charsStart)}
            .charsEnd=${(0,n.ifDefined)(this.charsEnd)}
            namespace=${(0,n.ifDefined)(this.namespace)}
          >
          </appkit-account-button>
        `:i.html`
          <appkit-connect-button
            size=${(0,n.ifDefined)(this.size)}
            label=${(0,n.ifDefined)(this.label)}
            loadingLabel=${(0,n.ifDefined)(this.loadingLabel)}
            namespace=${(0,n.ifDefined)(this.namespace)}
          ></appkit-connect-button>
        `}}A.styles=S,R([(0,o.property)({type:Boolean})],A.prototype,"disabled",void 0),R([(0,o.property)()],A.prototype,"balance",void 0),R([(0,o.property)()],A.prototype,"size",void 0),R([(0,o.property)()],A.prototype,"label",void 0),R([(0,o.property)()],A.prototype,"loadingLabel",void 0),R([(0,o.property)()],A.prototype,"charsStart",void 0),R([(0,o.property)()],A.prototype,"charsEnd",void 0),R([(0,o.property)()],A.prototype,"namespace",void 0),R([(0,r.state)()],A.prototype,"caipAddress",void 0);let T=class extends A{};T=R([(0,p.customElement)("w3m-button")],T);let I=class extends A{};I=R([(0,p.customElement)("appkit-button")],I),e.s(["AppKitButton",0,I,"W3mButton",0,T],72801);var O=t,N=t;let U=g.css`
  :host {
    position: relative;
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='sm'] {
    padding: ${({spacing:e})=>e[2]};
  }

  button[data-size='md'] {
    padding: ${({spacing:e})=>e[3]};
  }

  button[data-size='lg'] {
    padding: ${({spacing:e})=>e[4]};
  }

  button[data-variant='primary'] {
    background: ${({tokens:e})=>e.core.backgroundAccentPrimary};
  }

  button[data-variant='secondary'] {
    background: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button:hover:enabled {
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  button:disabled {
    cursor: not-allowed;
  }

  button[data-loading='true'] {
    cursor: not-allowed;
  }

  button[data-loading='true'][data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
  }

  button[data-loading='true'][data-size='md'] {
    border-radius: ${({borderRadius:e})=>e[20]};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[4]};
  }

  button[data-loading='true'][data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[16]};
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[5]};
  }
`;var P=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let D=class extends N.LitElement{constructor(){super(...arguments),this.size="md",this.variant="primary",this.loading=!1,this.text="Connect Wallet"}render(){return i.html`
      <button
        data-loading=${this.loading}
        data-variant=${this.variant}
        data-size=${this.size}
        ?disabled=${this.loading}
      >
        ${this.contentTemplate()}
      </button>
    `}contentTemplate(){let e={primary:"invert",secondary:"accent-primary"};return this.loading?i.html`<wui-loading-spinner
      color=${e[this.variant]}
      size=${this.size}
    ></wui-loading-spinner>`:i.html` <wui-text variant=${({lg:"lg-regular",md:"md-regular",sm:"sm-regular"})[this.size]} color=${e[this.variant]}>
        ${this.text}
      </wui-text>`}};D.styles=[m.resetStyles,m.elementStyles,U],P([(0,o.property)()],D.prototype,"size",void 0),P([(0,o.property)()],D.prototype,"variant",void 0),P([(0,o.property)({type:Boolean})],D.prototype,"loading",void 0),P([(0,o.property)()],D.prototype,"text",void 0),D=P([(0,p.customElement)("wui-connect-button")],D);var L=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};class W extends O.LitElement{constructor(){super(),this.unsubscribe=[],this.size="md",this.label="Connect Wallet",this.loadingLabel="Connecting...",this.open=d.ModalController.state.open,this.loading=this.namespace?d.ModalController.state.loadingNamespaceMap.get(this.namespace):d.ModalController.state.loading,this.unsubscribe.push(d.ModalController.subscribe(e=>{this.open=e.open,this.loading=this.namespace?e.loadingNamespaceMap.get(this.namespace):e.loading}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html`
      <wui-connect-button
        size=${(0,n.ifDefined)(this.size)}
        .loading=${this.loading}
        @click=${this.onClick.bind(this)}
        data-testid=${`connect-button${this.namespace?`-${this.namespace}`:""}`}
      >
        ${this.loading?this.loadingLabel:this.label}
      </wui-connect-button>
    `}onClick(){this.open?d.ModalController.close():this.loading||d.ModalController.open({view:"Connect",namespace:this.namespace})}}L([(0,o.property)()],W.prototype,"size",void 0),L([(0,o.property)()],W.prototype,"label",void 0),L([(0,o.property)()],W.prototype,"loadingLabel",void 0),L([(0,o.property)()],W.prototype,"namespace",void 0),L([(0,r.state)()],W.prototype,"open",void 0),L([(0,r.state)()],W.prototype,"loading",void 0);let j=class extends W{};j=L([(0,p.customElement)("w3m-connect-button")],j);let z=class extends W{};z=L([(0,p.customElement)("appkit-connect-button")],z),e.s(["AppKitConnectButton",0,z,"W3mConnectButton",0,j],85873);var F=t,B=e.i(53157),_=t;e.i(12190);let H=g.css`
  :host {
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[32]};
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]}
      ${({spacing:e})=>e[1]} ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button[data-size='sm'] > wui-icon-box,
  button[data-size='sm'] > wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-icon-box,
  button[data-size='md'] > wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='lg'] > wui-icon-box,
  button[data-size='lg'] > wui-image {
    width: 24px;
    height: 24px;
  }

  wui-image,
  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e[32]};
  }
`;var M=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let V=class extends _.LitElement{constructor(){super(...arguments),this.imageSrc=void 0,this.isUnsupportedChain=void 0,this.disabled=!1,this.size="lg"}render(){return i.html`
      <button data-size=${this.size} data-testid="wui-network-button" ?disabled=${this.disabled}>
        ${this.visualTemplate()}
        <wui-text variant=${({sm:"sm-regular",md:"md-regular",lg:"lg-regular"})[this.size]} color="primary">
          <slot></slot>
        </wui-text>
      </button>
    `}visualTemplate(){return this.isUnsupportedChain?i.html` <wui-icon-box color="error" icon="warningCircle"></wui-icon-box> `:this.imageSrc?i.html`<wui-image src=${this.imageSrc}></wui-image>`:i.html` <wui-icon size="xl" color="default" name="networkPlaceholder"></wui-icon> `}};V.styles=[m.resetStyles,m.elementStyles,H],M([(0,o.property)()],V.prototype,"imageSrc",void 0),M([(0,o.property)({type:Boolean})],V.prototype,"isUnsupportedChain",void 0),M([(0,o.property)({type:Boolean})],V.prototype,"disabled",void 0),M([(0,o.property)()],V.prototype,"size",void 0),V=M([(0,p.customElement)("wui-network-button")],V);let K=E.css`
  :host {
    display: block;
    width: max-content;
  }
`;var q=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};class G extends F.LitElement{constructor(){super(),this.unsubscribe=[],this.disabled=!1,this.network=s.ChainController.state.activeCaipNetwork,this.networkImage=l.AssetUtil.getNetworkImage(this.network),this.caipAddress=s.ChainController.state.activeCaipAddress,this.loading=d.ModalController.state.loading,this.isSupported=!!u.OptionsController.state.allowUnsupportedChain||!s.ChainController.state.activeChain||s.ChainController.checkIfSupportedNetwork(s.ChainController.state.activeChain),this.unsubscribe.push(a.AssetController.subscribeNetworkImages(()=>{this.networkImage=l.AssetUtil.getNetworkImage(this.network)}),s.ChainController.subscribeKey("activeCaipAddress",e=>{this.caipAddress=e}),s.ChainController.subscribeKey("activeCaipNetwork",e=>{this.network=e,this.networkImage=l.AssetUtil.getNetworkImage(e),this.isSupported=!e?.chainNamespace||s.ChainController.checkIfSupportedNetwork(e.chainNamespace),l.AssetUtil.fetchNetworkImage(e?.assets?.imageId)}),d.ModalController.subscribeKey("loading",e=>this.loading=e))}firstUpdated(){l.AssetUtil.fetchNetworkImage(this.network?.assets?.imageId)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=!this.network||s.ChainController.checkIfSupportedNetwork(this.network.chainNamespace);return i.html`
      <wui-network-button
        .disabled=${!!(this.disabled||this.loading)}
        .isUnsupportedChain=${!u.OptionsController.state.allowUnsupportedChain&&!e}
        imageSrc=${(0,n.ifDefined)(this.networkImage)}
        @click=${this.onClick.bind(this)}
        data-testid="w3m-network-button"
      >
        ${this.getLabel()}
        <slot></slot>
      </wui-network-button>
    `}getLabel(){return this.network?this.isSupported||u.OptionsController.state.allowUnsupportedChain?this.network.name:"Switch Network":this.label?this.label:this.caipAddress?"Unknown Network":"Select Network"}onClick(){this.loading||(B.EventsController.sendEvent({type:"track",event:"CLICK_NETWORKS"}),d.ModalController.open({view:"Networks"}))}}G.styles=K,q([(0,o.property)({type:Boolean})],G.prototype,"disabled",void 0),q([(0,o.property)({type:String})],G.prototype,"label",void 0),q([(0,r.state)()],G.prototype,"network",void 0),q([(0,r.state)()],G.prototype,"networkImage",void 0),q([(0,r.state)()],G.prototype,"caipAddress",void 0),q([(0,r.state)()],G.prototype,"loading",void 0),q([(0,r.state)()],G.prototype,"isSupported",void 0);let X=class extends G{};X=q([(0,p.customElement)("w3m-network-button")],X);let Y=class extends G{};Y=q([(0,p.customElement)("appkit-network-button")],Y),e.s(["AppKitNetworkButton",0,Y,"W3mNetworkButton",0,X],19295),e.i(65487),e.i(90404);var Q=t,J=e.i(1564),Z=e.i(71080),ee=e.i(49454),et=e.i(60334),ei=e.i(21728),eo=e.i(11424);e.i(62238),e.i(7170),e.i(43053);var er=t;e.i(24947);let en=g.css`
  :host {
    display: block;
  }

  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[4]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  wui-flex > wui-icon {
    padding: ${({spacing:e})=>e[2]};
    color: ${({tokens:e})=>e.theme.textInvert};
    background-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    border-radius: ${({borderRadius:e})=>e[2]};
    align-items: center;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent020};
    }
  }
`;var ea=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let el=class extends er.LitElement{constructor(){super(...arguments),this.label="",this.description="",this.icon="wallet"}render(){return i.html`
      <button>
        <wui-flex gap="2" alignItems="center">
          <wui-icon weight="fill" size="lg" name=${this.icon} color="inherit"></wui-icon>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.label}</wui-text>
            <wui-text variant="md-regular" color="tertiary">${this.description}</wui-text>
          </wui-flex>
        </wui-flex>
        <wui-icon size="lg" color="accent-primary" name="chevronRight"></wui-icon>
      </button>
    `}};el.styles=[m.resetStyles,m.elementStyles,en],ea([(0,o.property)()],el.prototype,"label",void 0),ea([(0,o.property)()],el.prototype,"description",void 0),ea([(0,o.property)()],el.prototype,"icon",void 0),el=ea([(0,p.customElement)("wui-notice-card")],el),e.i(49536);var es=t,ec=e.i(58331),ed=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let eu=class extends es.LitElement{constructor(){super(),this.unsubscribe=[],this.socialProvider=ec.StorageUtil.getConnectedSocialProvider(),this.socialUsername=ec.StorageUtil.getConnectedSocialUsername(),this.namespace=s.ChainController.state.activeChain,this.unsubscribe.push(s.ChainController.subscribeKey("activeChain",e=>{this.namespace=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=ee.ConnectorController.getConnectorId(this.namespace),t=ee.ConnectorController.getAuthConnector();if(!t||e!==J.ConstantsUtil.CONNECTOR_ID.AUTH)return this.style.cssText="display: none",null;let o=t.provider.getEmail()??"";return o||this.socialUsername?i.html`
      <wui-list-item
        ?rounded=${!0}
        icon=${this.socialProvider??"mail"}
        data-testid="w3m-account-email-update"
        ?chevron=${!this.socialProvider}
        @click=${()=>{this.onGoToUpdateEmail(o,this.socialProvider)}}
      >
        <wui-text variant="lg-regular" color="primary">${this.getAuthName(o)}</wui-text>
      </wui-list-item>
    `:(this.style.cssText="display: none",null)}onGoToUpdateEmail(e,t){t||ei.RouterController.push("UpdateEmailWallet",{email:e,redirectView:"Account"})}getAuthName(e){return this.socialUsername?"discord"===this.socialProvider&&this.socialUsername.endsWith("0")?this.socialUsername.slice(0,-1):this.socialUsername:e.length>30?`${e.slice(0,-3)}...`:e}};ed([(0,r.state)()],eu.prototype,"namespace",void 0),eu=ed([(0,p.customElement)("w3m-account-auth-button")],eu);var ep=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let eh=class extends Q.LitElement{constructor(){super(),this.usubscribe=[],this.networkImages=a.AssetController.state.networkImages,this.address=s.ChainController.getAccountData()?.address,this.profileImage=s.ChainController.getAccountData()?.profileImage,this.profileName=s.ChainController.getAccountData()?.profileName,this.network=s.ChainController.state.activeCaipNetwork,this.disconnecting=!1,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.usubscribe.push(s.ChainController.subscribeChainProp("accountState",e=>{e&&(this.address=e.address,this.profileImage=e.profileImage,this.profileName=e.profileName)}),s.ChainController.subscribeKey("activeCaipNetwork",e=>{e?.id&&(this.network=e)}),u.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.usubscribe.forEach(e=>e())}render(){if(!this.address)throw Error("w3m-account-settings-view: No account provided");let e=this.networkImages[this.network?.assets?.imageId??""];return i.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding=${["0","5","3","5"]}
      >
        <wui-avatar
          alt=${this.address}
          address=${this.address}
          imageSrc=${(0,n.ifDefined)(this.profileImage)}
          size="lg"
        ></wui-avatar>
        <wui-flex flexDirection="column" alignItems="center">
          <wui-flex gap="1" alignItems="center" justifyContent="center">
            <wui-text variant="h5-medium" color="primary" data-testid="account-settings-address">
              ${w.UiHelperUtil.getTruncateString({string:this.address,charsStart:4,charsEnd:6,truncate:"middle"})}
            </wui-text>
            <wui-icon-link
              size="md"
              icon="copy"
              iconColor="default"
              @click=${this.onCopyAddress}
            ></wui-icon-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" gap="4">
        <wui-flex flexDirection="column" gap="2" .padding=${["6","4","3","4"]}>
          ${this.authCardTemplate()}
          <w3m-account-auth-button></w3m-account-auth-button>
          <wui-list-item
            imageSrc=${(0,n.ifDefined)(e)}
            ?chevron=${this.isAllowedNetworkSwitch()}
            ?fullSize=${!0}
            ?rounded=${!0}
            @click=${this.onNetworks.bind(this)}
            data-testid="account-switch-network-button"
          >
            <wui-text variant="lg-regular" color="primary">
              ${this.network?.name??"Unknown"}
            </wui-text>
          </wui-list-item>
          ${this.smartAccountSettingsTemplate()} ${this.chooseNameButtonTemplate()}
          <wui-list-item
            ?rounded=${!0}
            icon="power"
            iconColor="error"
            ?chevron=${!1}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `}chooseNameButtonTemplate(){let e=this.network?.chainNamespace,t=ee.ConnectorController.getConnectorId(e),o=ee.ConnectorController.getAuthConnector();return s.ChainController.checkIfNamesSupported()&&o&&t===J.ConstantsUtil.CONNECTOR_ID.AUTH&&!this.profileName?i.html`
      <wui-list-item
        icon="id"
        ?rounded=${!0}
        ?chevron=${!0}
        @click=${this.onChooseName.bind(this)}
        data-testid="account-choose-name-button"
      >
        <wui-text variant="lg-regular" color="primary">Choose account name </wui-text>
      </wui-list-item>
    `:null}authCardTemplate(){let e=ee.ConnectorController.getConnectorId(this.network?.chainNamespace),t=ee.ConnectorController.getAuthConnector(),{origin:o}=location;return!t||e!==J.ConstantsUtil.CONNECTOR_ID.AUTH||o.includes(et.ConstantsUtil.SECURE_SITE)?null:i.html`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `}isAllowedNetworkSwitch(){let e=s.ChainController.getAllRequestedCaipNetworks(),t=!!e&&e.length>1,i=e?.find(({id:e})=>e===this.network?.id);return t||!i}onCopyAddress(){try{this.address&&(c.CoreHelperUtil.copyToClopboard(this.address),eo.SnackController.showSuccess("Address copied"))}catch{eo.SnackController.showError("Failed to copy")}}smartAccountSettingsTemplate(){let e=this.network?.chainNamespace,t=s.ChainController.checkIfSmartAccountEnabled(),o=ee.ConnectorController.getConnectorId(e);return ee.ConnectorController.getAuthConnector()&&o===J.ConstantsUtil.CONNECTOR_ID.AUTH&&t?i.html`
      <wui-list-item
        icon="user"
        ?rounded=${!0}
        ?chevron=${!0}
        @click=${this.onSmartAccountSettings.bind(this)}
        data-testid="account-smart-account-settings-button"
      >
        <wui-text variant="lg-regular" color="primary">Smart Account Settings</wui-text>
      </wui-list-item>
    `:null}onChooseName(){ei.RouterController.push("ChooseAccountName")}onNetworks(){this.isAllowedNetworkSwitch()&&ei.RouterController.push("Networks")}async onDisconnect(){try{this.disconnecting=!0;let e=this.network?.chainNamespace,t=Z.ConnectionController.getConnections(e).length>0,i=e&&ee.ConnectorController.state.activeConnectorIds[e],o=this.remoteFeatures?.multiWallet;await Z.ConnectionController.disconnect(o?{id:i,namespace:e}:{}),t&&o&&(ei.RouterController.push("ProfileWallets"),eo.SnackController.showSuccess("Wallet deleted"))}catch{B.EventsController.sendEvent({type:"track",event:"DISCONNECT_ERROR",properties:{message:"Failed to disconnect"}}),eo.SnackController.showError("Failed to disconnect")}finally{this.disconnecting=!1}}onGoToUpgradeView(){B.EventsController.sendEvent({type:"track",event:"EMAIL_UPGRADE_FROM_MODAL"}),ei.RouterController.push("UpgradeEmailWallet")}onSmartAccountSettings(){ei.RouterController.push("SmartAccountSettings")}};ep([(0,r.state)()],eh.prototype,"address",void 0),ep([(0,r.state)()],eh.prototype,"profileImage",void 0),ep([(0,r.state)()],eh.prototype,"profileName",void 0),ep([(0,r.state)()],eh.prototype,"network",void 0),ep([(0,r.state)()],eh.prototype,"disconnecting",void 0),ep([(0,r.state)()],eh.prototype,"remoteFeatures",void 0),eh=ep([(0,p.customElement)("w3m-account-settings-view")],eh),e.s(["W3mAccountSettingsView",0,eh],69311);var em=t,ew=t,eg=e.i(49694),ef=e.i(64126);e.i(34420),e.i(43452);var eb=t,ey=t;let eC=g.css`
  :host {
    flex: 1;
    height: 100%;
  }

  button {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    column-gap: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-active='true'] {
    color: ${({tokens:e})=>e.theme.textPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundTertiary};
  }

  button:hover:enabled:not([data-active='true']),
  button:active:enabled:not([data-active='true']) {
    wui-text,
    wui-icon {
      color: ${({tokens:e})=>e.theme.textPrimary};
    }
  }
`;var ev=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let ex={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},e$={lg:"md",md:"sm",sm:"sm"},ek=class extends ey.LitElement{constructor(){super(...arguments),this.icon="mobile",this.size="md",this.label="",this.active=!1}render(){return i.html`
      <button data-active=${this.active}>
        ${this.icon?i.html`<wui-icon size=${e$[this.size]} name=${this.icon}></wui-icon>`:""}
        <wui-text variant=${ex[this.size]}> ${this.label} </wui-text>
      </button>
    `}};ek.styles=[m.resetStyles,m.elementStyles,eC],ev([(0,o.property)()],ek.prototype,"icon",void 0),ev([(0,o.property)()],ek.prototype,"size",void 0),ev([(0,o.property)()],ek.prototype,"label",void 0),ev([(0,o.property)({type:Boolean})],ek.prototype,"active",void 0),ek=ev([(0,p.customElement)("wui-tab-item")],ek);let eE=g.css`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e["01"]};
    box-sizing: border-box;
  }

  :host([data-size='sm']) {
    height: 26px;
  }

  :host([data-size='md']) {
    height: 36px;
  }
`;var eS=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let eR=class extends eb.LitElement{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.size="md",this.activeTab=0}render(){return this.dataset.size=this.size,this.tabs.map((e,t)=>{let o=t===this.activeTab;return i.html`
        <wui-tab-item
          @click=${()=>this.onTabClick(t)}
          icon=${e.icon}
          size=${this.size}
          label=${e.label}
          ?active=${o}
          data-active=${o}
          data-testid="tab-${e.label?.toLowerCase()}"
        ></wui-tab-item>
      `})}onTabClick(e){this.activeTab=e,this.onTabChange(e)}};eR.styles=[m.resetStyles,m.elementStyles,eE],eS([(0,o.property)({type:Array})],eR.prototype,"tabs",void 0),eS([(0,o.property)()],eR.prototype,"onTabChange",void 0),eS([(0,o.property)()],eR.prototype,"size",void 0),eS([(0,r.state)()],eR.prototype,"activeTab",void 0),eR=eS([(0,p.customElement)("wui-tabs")],eR),e.i(88016),e.i(4415);var eA=e.i(79484);let eT=g.css`
  wui-icon-link {
    margin-right: calc(${({spacing:e})=>e["8"]} * -1);
  }

  wui-notice-card {
    margin-bottom: ${({spacing:e})=>e["1"]};
  }

  wui-list-item > wui-text {
    flex: 1;
  }

  w3m-transactions-view {
    max-height: 200px;
  }

  .balance-container {
    display: inline;
  }

  .tab-content-container {
    height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .symbol {
    transform: translateY(-2px);
  }

  .tab-content-container::-webkit-scrollbar {
    display: none;
  }

  .account-button {
    width: auto;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e["3"]};
    height: 48px;
    padding: ${({spacing:e})=>e["2"]};
    padding-right: ${({spacing:e})=>e["3"]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[6]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
  }

  .account-button:hover {
    background-color: ${({tokens:e})=>e.core.glass010};
  }

  .avatar-container {
    position: relative;
  }

  wui-avatar.avatar {
    width: 32px;
    height: 32px;
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.core.glass010};
  }

  wui-wallet-switch {
    margin-top: ${({spacing:e})=>e["2"]};
  }

  wui-avatar.network-avatar {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 100%;
    top: 100%;
    transform: translate(-75%, -75%);
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.core.glass010};
  }

  .account-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .account-links wui-flex {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background: red;
    align-items: center;
    justify-content: center;
    height: 48px;
    padding: 10px;
    flex: 1 0 0;
    border-radius: var(--XS, 16px);
    border: 1px solid var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    background: var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    transition:
      background-color ${({durations:e})=>e.md}
        ${({easings:e})=>e["ease-out-power-1"]},
      opacity ${({durations:e})=>e.md} ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color, opacity;
  }

  .account-links wui-flex:hover {
    background: var(--dark-accent-glass-015, rgba(71, 161, 255, 0.15));
  }

  .account-links wui-flex wui-icon {
    width: var(--S, 20px);
    height: var(--S, 20px);
  }

  .account-links wui-flex wui-icon svg path {
    stroke: #667dff;
  }
`;var eI=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let eO=class extends ew.LitElement{constructor(){super(),this.unsubscribe=[],this.caipAddress=s.ChainController.getAccountData()?.caipAddress,this.address=c.CoreHelperUtil.getPlainAddress(s.ChainController.getAccountData()?.caipAddress),this.profileImage=s.ChainController.getAccountData()?.profileImage,this.profileName=s.ChainController.getAccountData()?.profileName,this.disconnecting=!1,this.balance=s.ChainController.getAccountData()?.balance,this.balanceSymbol=s.ChainController.getAccountData()?.balanceSymbol,this.features=u.OptionsController.state.features,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.namespace=s.ChainController.state.activeChain,this.activeConnectorIds=ee.ConnectorController.state.activeConnectorIds,this.unsubscribe.push(s.ChainController.subscribeChainProp("accountState",e=>{this.address=c.CoreHelperUtil.getPlainAddress(e?.caipAddress),this.caipAddress=e?.caipAddress,this.balance=e?.balance,this.balanceSymbol=e?.balanceSymbol,this.profileName=e?.profileName,this.profileImage=e?.profileImage}),u.OptionsController.subscribeKey("features",e=>this.features=e),u.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e),ee.ConnectorController.subscribeKey("activeConnectorIds",e=>{this.activeConnectorIds=e}),s.ChainController.subscribeKey("activeChain",e=>this.namespace=e),s.ChainController.subscribeKey("activeCaipNetwork",e=>{e?.chainNamespace&&(this.namespace=e?.chainNamespace)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!this.caipAddress||!this.namespace)return null;let e=this.activeConnectorIds[this.namespace],t=e?ee.ConnectorController.getConnectorById(e):void 0,o=l.AssetUtil.getConnectorImage(t),{value:r,decimals:a,symbol:s}=c.CoreHelperUtil.parseBalance(this.balance,this.balanceSymbol);return i.html`<wui-flex
        flexDirection="column"
        .padding=${["0","5","4","5"]}
        alignItems="center"
        gap="3"
      >
        <wui-avatar
          alt=${(0,n.ifDefined)(this.caipAddress)}
          address=${(0,n.ifDefined)(c.CoreHelperUtil.getPlainAddress(this.caipAddress))}
          imageSrc=${(0,n.ifDefined)(null===this.profileImage?void 0:this.profileImage)}
          data-testid="single-account-avatar"
        ></wui-avatar>
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          imageSrc=${o}
          alt=${t?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
        <div class="balance-container">
          <wui-text variant="h3-regular" color="primary">${r}</wui-text>
          <wui-text variant="h3-regular" color="secondary">.${a}</wui-text>
          <wui-text variant="h6-medium" color="primary" class="symbol">${s}</wui-text>
        </div>
        ${this.explorerBtnTemplate()}
      </wui-flex>

      <wui-flex flexDirection="column" gap="2" .padding=${["0","3","3","3"]}>
        ${this.authCardTemplate()} <w3m-account-auth-button></w3m-account-auth-button>
        ${this.orderedFeaturesTemplate()} ${this.activityTemplate()}
        <wui-list-item
          .rounded=${!0}
          icon="power"
          iconColor="error"
          ?chevron=${!1}
          .loading=${this.disconnecting}
          .rightIcon=${!1}
          @click=${this.onDisconnect.bind(this)}
          data-testid="disconnect-button"
        >
          <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>`}fundWalletTemplate(){if(!this.namespace)return null;let e=et.ConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),t=!!this.features?.receive,o=this.remoteFeatures?.onramp&&e,r=eg.ExchangeController.isPayWithExchangeEnabled();return o||t||r?i.html`
      <wui-list-item
        .rounded=${!0}
        data-testid="w3m-account-default-fund-wallet-button"
        iconVariant="blue"
        icon="dollar"
        ?chevron=${!0}
        @click=${this.handleClickFundWallet.bind(this)}
      >
        <wui-text variant="lg-regular" color="primary">Fund wallet</wui-text>
      </wui-list-item>
    `:null}orderedFeaturesTemplate(){return(this.features?.walletFeaturesOrder||et.ConstantsUtil.DEFAULT_FEATURES.walletFeaturesOrder).map(e=>{switch(e){case"onramp":return this.fundWalletTemplate();case"swaps":return this.swapsTemplate();case"send":return this.sendTemplate();default:return null}})}activityTemplate(){return this.namespace&&this.remoteFeatures?.activity&&et.ConstantsUtil.ACTIVITY_ENABLED_CHAIN_NAMESPACES.includes(this.namespace)?i.html` <wui-list-item
          .rounded=${!0}
          icon="clock"
          ?chevron=${!0}
          @click=${this.onTransactions.bind(this)}
          data-testid="w3m-account-default-activity-button"
        >
          <wui-text variant="lg-regular" color="primary">Activity</wui-text>
        </wui-list-item>`:null}swapsTemplate(){let e=this.remoteFeatures?.swaps,t=s.ChainController.state.activeChain===J.ConstantsUtil.CHAIN.EVM;return e&&t?i.html`
      <wui-list-item
        .rounded=${!0}
        icon="recycleHorizontal"
        ?chevron=${!0}
        @click=${this.handleClickSwap.bind(this)}
        data-testid="w3m-account-default-swaps-button"
      >
        <wui-text variant="lg-regular" color="primary">Swap</wui-text>
      </wui-list-item>
    `:null}sendTemplate(){let e=this.features?.send,t=s.ChainController.state.activeChain;if(!t)throw Error("SendController:sendTemplate - namespace is required");let o=et.ConstantsUtil.SEND_SUPPORTED_NAMESPACES.includes(t);return e&&o?i.html`
      <wui-list-item
        .rounded=${!0}
        icon="send"
        ?chevron=${!0}
        @click=${this.handleClickSend.bind(this)}
        data-testid="w3m-account-default-send-button"
      >
        <wui-text variant="lg-regular" color="primary">Send</wui-text>
      </wui-list-item>
    `:null}authCardTemplate(){let e=s.ChainController.state.activeChain;if(!e)throw Error("AuthCardTemplate:authCardTemplate - namespace is required");let t=ee.ConnectorController.getConnectorId(e),o=ee.ConnectorController.getAuthConnector(),{origin:r}=location;return!o||t!==J.ConstantsUtil.CONNECTOR_ID.AUTH||r.includes(et.ConstantsUtil.SECURE_SITE)?null:i.html`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `}handleClickFundWallet(){ei.RouterController.push("FundWallet")}handleClickSwap(){ei.RouterController.push("Swap")}handleClickSend(){ei.RouterController.push("WalletSend")}explorerBtnTemplate(){return s.ChainController.getAccountData()?.addressExplorerUrl?i.html`
      <wui-button size="md" variant="accent-primary" @click=${this.onExplorer.bind(this)}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="compass"></wui-icon>
        Block Explorer
        <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
      </wui-button>
    `:null}onTransactions(){B.EventsController.sendEvent({type:"track",event:"CLICK_TRANSACTIONS",properties:{isSmartAccount:(0,ef.getPreferredAccountType)(s.ChainController.state.activeChain)===eA.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),ei.RouterController.push("Transactions")}async onDisconnect(){try{this.disconnecting=!0;let e=Z.ConnectionController.getConnections(this.namespace).length>0,t=this.namespace&&ee.ConnectorController.state.activeConnectorIds[this.namespace],i=this.remoteFeatures?.multiWallet;await Z.ConnectionController.disconnect(i?{id:t,namespace:this.namespace}:{}),e&&i&&(ei.RouterController.push("ProfileWallets"),eo.SnackController.showSuccess("Wallet deleted"))}catch{B.EventsController.sendEvent({type:"track",event:"DISCONNECT_ERROR",properties:{message:"Failed to disconnect"}}),eo.SnackController.showError("Failed to disconnect")}finally{this.disconnecting=!1}}onExplorer(){let e=s.ChainController.getAccountData()?.addressExplorerUrl;e&&c.CoreHelperUtil.openHref(e,"_blank")}onGoToUpgradeView(){B.EventsController.sendEvent({type:"track",event:"EMAIL_UPGRADE_FROM_MODAL"}),ei.RouterController.push("UpgradeEmailWallet")}onGoToProfileWalletsView(){ei.RouterController.push("ProfileWallets")}};eO.styles=eT,eI([(0,r.state)()],eO.prototype,"caipAddress",void 0),eI([(0,r.state)()],eO.prototype,"address",void 0),eI([(0,r.state)()],eO.prototype,"profileImage",void 0),eI([(0,r.state)()],eO.prototype,"profileName",void 0),eI([(0,r.state)()],eO.prototype,"disconnecting",void 0),eI([(0,r.state)()],eO.prototype,"balance",void 0),eI([(0,r.state)()],eO.prototype,"balanceSymbol",void 0),eI([(0,r.state)()],eO.prototype,"features",void 0),eI([(0,r.state)()],eO.prototype,"remoteFeatures",void 0),eI([(0,r.state)()],eO.prototype,"namespace",void 0),eI([(0,r.state)()],eO.prototype,"activeConnectorIds",void 0),eO=eI([(0,p.customElement)("w3m-account-default-widget")],eO);var eN=t,eU=e.i(70850),eP=t;let eD=g.css`
  span {
    font-weight: 500;
    font-size: 38px;
    color: ${({tokens:e})=>e.theme.textPrimary};
    line-height: 38px;
    letter-spacing: -2%;
    text-align: center;
    font-family: var(--apkt-fontFamily-regular);
  }

  .pennies {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }
`;var eL=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let eW=class extends eP.LitElement{constructor(){super(...arguments),this.dollars="0",this.pennies="00"}render(){return i.html`<span>$${this.dollars}<span class="pennies">.${this.pennies}</span></span>`}};eW.styles=[m.resetStyles,eD],eL([(0,o.property)()],eW.prototype,"dollars",void 0),eL([(0,o.property)()],eW.prototype,"pennies",void 0),eW=eL([(0,p.customElement)("wui-balance")],eW);var ej=t;let ez=g.css`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
  }

  /* -- Variants --------------------------------------------------------- */
  :host([data-variant='fill']) {
    background-color: ${({colors:e})=>e.neutrals100};
  }

  :host([data-variant='shade']) {
    background-color: ${({colors:e})=>e.neutrals900};
  }

  :host([data-variant='fill']) > wui-text {
    color: ${({colors:e})=>e.black};
  }

  :host([data-variant='shade']) > wui-text {
    color: ${({colors:e})=>e.white};
  }

  :host([data-variant='fill']) > wui-icon {
    color: ${({colors:e})=>e.neutrals100};
  }

  :host([data-variant='shade']) > wui-icon {
    color: ${({colors:e})=>e.neutrals900};
  }

  /* -- Sizes --------------------------------------------------------- */
  :host([data-size='sm']) {
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-size='md']) {
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  /* -- Placements --------------------------------------------------------- */
  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }
`;var eF=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let eB={sm:"sm-regular",md:"md-regular"},e_=class extends ej.LitElement{constructor(){super(...arguments),this.placement="top",this.variant="fill",this.size="md",this.message=""}render(){return this.dataset.variant=this.variant,this.dataset.size=this.size,i.html`<wui-icon data-placement=${this.placement} size="inherit" name="cursor"></wui-icon>
      <wui-text variant=${eB[this.size]}>${this.message}</wui-text>`}};e_.styles=[m.resetStyles,m.elementStyles,ez],eF([(0,o.property)()],e_.prototype,"placement",void 0),eF([(0,o.property)()],e_.prototype,"variant",void 0),eF([(0,o.property)()],e_.prototype,"size",void 0),eF([(0,o.property)()],e_.prototype,"message",void 0),e_=eF([(0,p.customElement)("wui-tooltip")],e_);var eH=e.i(5840),eM=t;e.i(89676);let eV=E.css`
  :host {
    width: 100%;
    max-height: 280px;
    overflow: scroll;
    scrollbar-width: none;
  }

  :host::-webkit-scrollbar {
    display: none;
  }
`,eK=class extends eM.LitElement{render(){return i.html`<w3m-activity-list page="account"></w3m-activity-list>`}};eK.styles=eV,eK=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-account-activity-widget")],eK);var eq=t,eG=t;e.i(30352);let eX=g.css`
  :host {
    width: 100%;
  }

  button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({spacing:e})=>e[4]};
    padding: ${({spacing:e})=>e[4]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    max-width: 174px;
  }

  .tag-container {
    width: fit-content;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`;var eY=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let eQ=class extends eG.LitElement{constructor(){super(...arguments),this.icon="card",this.text="",this.description="",this.tag=void 0,this.disabled=!1}render(){return i.html`
      <button ?disabled=${this.disabled}>
        <wui-flex alignItems="center" gap="3">
          <wui-icon-box padding="2" color="secondary" icon=${this.icon} size="lg"></wui-icon-box>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.text}</wui-text>
            ${this.description?i.html`<wui-text variant="md-regular" color="secondary">
                  ${this.description}</wui-text
                >`:null}
          </wui-flex>
        </wui-flex>

        <wui-flex class="tag-container" alignItems="center" gap="1" justifyContent="flex-end">
          ${this.tag?i.html`<wui-tag tagType="main" size="sm">${this.tag}</wui-tag>`:null}
          <wui-icon size="md" name="chevronRight" color="default"></wui-icon>
        </wui-flex>
      </button>
    `}};eQ.styles=[m.resetStyles,m.elementStyles,eX],eY([(0,o.property)()],eQ.prototype,"icon",void 0),eY([(0,o.property)()],eQ.prototype,"text",void 0),eY([(0,o.property)()],eQ.prototype,"description",void 0),eY([(0,o.property)()],eQ.prototype,"tag",void 0),eY([(0,o.property)({type:Boolean})],eQ.prototype,"disabled",void 0),eQ=eY([(0,p.customElement)("wui-list-description")],eQ),e.i(23838);let eJ=E.css`
  :host {
    width: 100%;
  }

  wui-flex {
    width: 100%;
  }

  .contentContainer {
    max-height: 280px;
    overflow: scroll;
    scrollbar-width: none;
  }

  .contentContainer::-webkit-scrollbar {
    display: none;
  }
`;var eZ=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let e0=class extends eq.LitElement{constructor(){super(),this.unsubscribe=[],this.tokenBalance=s.ChainController.getAccountData()?.tokenBalance,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.unsubscribe.push(s.ChainController.subscribeChainProp("accountState",e=>{this.tokenBalance=e?.tokenBalance}),u.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html`${this.tokenTemplate()}`}tokenTemplate(){return this.tokenBalance&&this.tokenBalance?.length>0?i.html`<wui-flex class="contentContainer" flexDirection="column" gap="2">
        ${this.tokenItemTemplate()}
      </wui-flex>`:i.html` <wui-flex flexDirection="column">
      ${this.onRampTemplate()}
      <wui-list-description
        @click=${this.onReceiveClick.bind(this)}
        text="Receive funds"
        description="Scan the QR code and receive funds"
        icon="qrCode"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
        data-testid="w3m-account-receive-button"
      ></wui-list-description
    ></wui-flex>`}onRampTemplate(){return this.remoteFeatures?.onramp?i.html`<wui-list-description
        @click=${this.onBuyClick.bind(this)}
        text="Buy Crypto"
        description="Easy with card or bank account"
        icon="card"
        iconColor="success-100"
        iconBackgroundColor="success-100"
        tag="popular"
        data-testid="w3m-account-onramp-button"
      ></wui-list-description>`:i.html``}tokenItemTemplate(){return this.tokenBalance?.map(e=>i.html`<wui-list-token
          tokenName=${e.name}
          tokenImageUrl=${e.iconUrl}
          tokenAmount=${e.quantity.numeric}
          tokenValue=${e.value}
          tokenCurrency=${e.symbol}
        ></wui-list-token>`)}onReceiveClick(){ei.RouterController.push("WalletReceive")}onBuyClick(){B.EventsController.sendEvent({type:"track",event:"SELECT_BUY_CRYPTO",properties:{isSmartAccount:(0,ef.getPreferredAccountType)(s.ChainController.state.activeChain)===eA.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),ei.RouterController.push("OnRampProviders")}};e0.styles=eJ,eZ([(0,r.state)()],e0.prototype,"tokenBalance",void 0),eZ([(0,r.state)()],e0.prototype,"remoteFeatures",void 0),e0=eZ([(0,p.customElement)("w3m-account-tokens-widget")],e0),e.i(41611),e.i(48449);let e3=g.css`
  wui-flex {
    width: 100%;
  }

  wui-promo {
    position: absolute;
    top: -32px;
  }

  wui-profile-button {
    margin-top: calc(-1 * ${({spacing:e})=>e["4"]});
  }

  wui-promo + wui-profile-button {
    margin-top: ${({spacing:e})=>e["4"]};
  }

  wui-tabs {
    width: 100%;
  }

  .contentContainer {
    height: 280px;
  }

  .contentContainer > wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e["3"]};
  }

  .contentContainer > .textContent {
    width: 65%;
  }
`;var e1=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let e2=class extends eN.LitElement{constructor(){super(...arguments),this.unsubscribe=[],this.network=s.ChainController.state.activeCaipNetwork,this.profileName=s.ChainController.getAccountData()?.profileName,this.address=s.ChainController.getAccountData()?.address,this.currentTab=s.ChainController.getAccountData()?.currentTab,this.tokenBalance=s.ChainController.getAccountData()?.tokenBalance,this.features=u.OptionsController.state.features,this.namespace=s.ChainController.state.activeChain,this.activeConnectorIds=ee.ConnectorController.state.activeConnectorIds,this.remoteFeatures=u.OptionsController.state.remoteFeatures}firstUpdated(){s.ChainController.fetchTokenBalance(),this.unsubscribe.push(s.ChainController.subscribeChainProp("accountState",e=>{e?.address?(this.address=e.address,this.profileName=e.profileName,this.currentTab=e.currentTab,this.tokenBalance=e.tokenBalance):d.ModalController.close()}),ee.ConnectorController.subscribeKey("activeConnectorIds",e=>{this.activeConnectorIds=e}),s.ChainController.subscribeKey("activeChain",e=>this.namespace=e),s.ChainController.subscribeKey("activeCaipNetwork",e=>this.network=e),u.OptionsController.subscribeKey("features",e=>this.features=e),u.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e)),this.watchSwapValues()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),clearInterval(this.watchTokenBalance)}render(){if(!this.address)throw Error("w3m-account-features-widget: No account provided");if(!this.namespace)return null;let e=this.activeConnectorIds[this.namespace],t=e?ee.ConnectorController.getConnectorById(e):void 0,{icon:o,iconSize:r}=this.getAuthData();return i.html`<wui-flex
      flexDirection="column"
      .padding=${["0","3","4","3"]}
      alignItems="center"
      gap="4"
      data-testid="w3m-account-wallet-features-widget"
    >
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center" gap="2">
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          icon=${o}
          iconSize=${r}
          alt=${t?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        ${this.tokenBalanceTemplate()}
      </wui-flex>
      ${this.orderedWalletFeatures()} ${this.tabsTemplate()} ${this.listContentTemplate()}
    </wui-flex>`}orderedWalletFeatures(){let e=this.features?.walletFeaturesOrder||et.ConstantsUtil.DEFAULT_FEATURES.walletFeaturesOrder;if(e.every(e=>"send"===e||"receive"===e?!this.features?.[e]:"swaps"!==e&&"onramp"!==e||!this.remoteFeatures?.[e]))return null;let t=[...new Set(e.map(e=>"receive"===e||"onramp"===e?"fund":e))];return i.html`<wui-flex gap="2">
      ${t.map(e=>{switch(e){case"fund":return this.fundWalletTemplate();case"swaps":return this.swapsTemplate();case"send":return this.sendTemplate();default:return null}})}
    </wui-flex>`}fundWalletTemplate(){if(!this.namespace)return null;let e=et.ConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),t=this.features?.receive,o=this.remoteFeatures?.onramp&&e,r=eg.ExchangeController.isPayWithExchangeEnabled();return o||t||r?i.html`
      <w3m-tooltip-trigger text="Fund wallet">
        <wui-button
          data-testid="wallet-features-fund-wallet-button"
          @click=${this.onFundWalletClick.bind(this)}
          variant="accent-secondary"
          size="lg"
          fullWidth
        >
          <wui-icon name="dollar"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `:null}swapsTemplate(){let e=this.remoteFeatures?.swaps,t=s.ChainController.state.activeChain===J.ConstantsUtil.CHAIN.EVM;return e&&t?i.html`
      <w3m-tooltip-trigger text="Swap">
        <wui-button
          fullWidth
          data-testid="wallet-features-swaps-button"
          @click=${this.onSwapClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="recycleHorizontal"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `:null}sendTemplate(){let e=this.features?.send,t=s.ChainController.state.activeChain,o=et.ConstantsUtil.SEND_SUPPORTED_NAMESPACES.includes(t);return e&&o?i.html`
      <w3m-tooltip-trigger text="Send">
        <wui-button
          fullWidth
          data-testid="wallet-features-send-button"
          @click=${this.onSendClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="send"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `:null}watchSwapValues(){this.watchTokenBalance=setInterval(()=>s.ChainController.fetchTokenBalance(e=>this.onTokenBalanceError(e)),1e4)}onTokenBalanceError(e){e instanceof Error&&e.cause instanceof Response&&e.cause.status===J.ConstantsUtil.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE&&clearInterval(this.watchTokenBalance)}listContentTemplate(){return 0===this.currentTab?i.html`<w3m-account-tokens-widget></w3m-account-tokens-widget>`:1===this.currentTab?i.html`<w3m-account-activity-widget></w3m-account-activity-widget>`:i.html`<w3m-account-tokens-widget></w3m-account-tokens-widget>`}tokenBalanceTemplate(){if(this.tokenBalance&&this.tokenBalance?.length>=0){let e=c.CoreHelperUtil.calculateBalance(this.tokenBalance),{dollars:t="0",pennies:o="00"}=c.CoreHelperUtil.formatTokenBalance(e);return i.html`<wui-balance dollars=${t} pennies=${o}></wui-balance>`}return i.html`<wui-balance dollars="0" pennies="00"></wui-balance>`}tabsTemplate(){let e=eH.HelpersUtil.getTabsByNamespace(s.ChainController.state.activeChain);return 0===e.length?null:i.html`<wui-tabs
      .onTabChange=${this.onTabChange.bind(this)}
      .activeTab=${this.currentTab}
      .tabs=${e}
    ></wui-tabs>`}onTabChange(e){s.ChainController.setAccountProp("currentTab",e,this.namespace)}onFundWalletClick(){ei.RouterController.push("FundWallet")}onSwapClick(){this.network?.caipNetworkId&&!et.ConstantsUtil.SWAP_SUPPORTED_NETWORKS.includes(this.network?.caipNetworkId)?ei.RouterController.push("UnsupportedChain",{swapUnsupportedChain:!0}):(B.EventsController.sendEvent({type:"track",event:"OPEN_SWAP",properties:{network:this.network?.caipNetworkId||"",isSmartAccount:(0,ef.getPreferredAccountType)(s.ChainController.state.activeChain)===eA.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),ei.RouterController.push("Swap"))}getAuthData(){let e=ec.StorageUtil.getConnectedSocialProvider(),t=ec.StorageUtil.getConnectedSocialUsername(),i=ee.ConnectorController.getAuthConnector(),o=i?.provider.getEmail()??"";return{name:eU.ConnectorUtil.getAuthName({email:o,socialUsername:t,socialProvider:e}),icon:e??"mail",iconSize:e?"xl":"md"}}onGoToProfileWalletsView(){ei.RouterController.push("ProfileWallets")}onSendClick(){B.EventsController.sendEvent({type:"track",event:"OPEN_SEND",properties:{network:this.network?.caipNetworkId||"",isSmartAccount:(0,ef.getPreferredAccountType)(s.ChainController.state.activeChain)===eA.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}}),ei.RouterController.push("WalletSend")}};e2.styles=e3,e1([(0,r.state)()],e2.prototype,"watchTokenBalance",void 0),e1([(0,r.state)()],e2.prototype,"network",void 0),e1([(0,r.state)()],e2.prototype,"profileName",void 0),e1([(0,r.state)()],e2.prototype,"address",void 0),e1([(0,r.state)()],e2.prototype,"currentTab",void 0),e1([(0,r.state)()],e2.prototype,"tokenBalance",void 0),e1([(0,r.state)()],e2.prototype,"features",void 0),e1([(0,r.state)()],e2.prototype,"namespace",void 0),e1([(0,r.state)()],e2.prototype,"activeConnectorIds",void 0),e1([(0,r.state)()],e2.prototype,"remoteFeatures",void 0),e2=e1([(0,p.customElement)("w3m-account-wallet-features-widget")],e2);var e5=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let e4=class extends em.LitElement{constructor(){super(),this.unsubscribe=[],this.namespace=s.ChainController.state.activeChain,this.unsubscribe.push(s.ChainController.subscribeKey("activeChain",e=>{this.namespace=e}))}render(){if(!this.namespace)return null;let e=ee.ConnectorController.getConnectorId(this.namespace),t=ee.ConnectorController.getAuthConnector();return i.html`
      ${t&&e===J.ConstantsUtil.CONNECTOR_ID.AUTH?this.walletFeaturesTemplate():this.defaultTemplate()}
    `}walletFeaturesTemplate(){return i.html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`}defaultTemplate(){return i.html`<w3m-account-default-widget></w3m-account-default-widget>`}};e5([(0,r.state)()],e4.prototype,"namespace",void 0),e4=e5([(0,p.customElement)("w3m-account-view")],e4),e.s(["W3mAccountView",0,e4],79890);var e6=t;e.i(53976);var e8=e.i(93090),e7=e.i(50576),e9=e.i(10087),te=e.i(8601),tt=t;e.i(67980),e.i(20226);let ti=g.css`
  wui-image {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-image,
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-icon:not(.custom-icon, .icon-badge) {
    cursor: pointer;
  }

  .icon-box {
    position: relative;
    border-radius: ${({borderRadius:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .icon-badge {
    position: absolute;
    top: 18px;
    left: 23px;
    z-index: 3;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: 50%;
    padding: ${({spacing:e})=>e["01"]};
  }

  .icon-badge {
    width: 8px;
    height: 8px;
  }
`;var to=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let tr=class extends tt.LitElement{constructor(){super(...arguments),this.address="",this.profileName="",this.content=[],this.alt="",this.imageSrc="",this.icon=void 0,this.iconSize="md",this.iconBadge=void 0,this.iconBadgeSize="md",this.buttonVariant="neutral-primary",this.enableMoreButton=!1,this.charsStart=4,this.charsEnd=6}render(){return i.html`
      <wui-flex flexDirection="column" rowgap="2">
        ${this.topTemplate()} ${this.bottomTemplate()}
      </wui-flex>
    `}topTemplate(){return i.html`
      <wui-flex alignItems="flex-start" justifyContent="space-between">
        ${this.imageOrIconTemplate()}
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="copy"
          @click=${this.dispatchCopyEvent}
        ></wui-icon-link>
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="externalLink"
          @click=${this.dispatchExternalLinkEvent}
        ></wui-icon-link>
        ${this.enableMoreButton?i.html`<wui-icon-link
              variant="secondary"
              size="md"
              icon="threeDots"
              @click=${this.dispatchMoreButtonEvent}
              data-testid="wui-active-profile-wallet-item-more-button"
            ></wui-icon-link>`:null}
      </wui-flex>
    `}bottomTemplate(){return i.html` <wui-flex flexDirection="column">${this.contentTemplate()}</wui-flex> `}imageOrIconTemplate(){return this.icon?i.html`
        <wui-flex flexGrow="1" alignItems="center">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge?i.html`<wui-icon
                  color="accent-primary"
                  size="inherit"
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`:null}
          </wui-flex>
        </wui-flex>
      `:i.html`
      <wui-flex flexGrow="1" alignItems="center">
        <wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>
      </wui-flex>
    `}contentTemplate(){return 0===this.content.length?null:i.html`
      <wui-flex flexDirection="column" rowgap="3">
        ${this.content.map(e=>this.labelAndTagTemplate(e))}
      </wui-flex>
    `}labelAndTagTemplate({address:e,profileName:t,label:o,description:r,enableButton:n,buttonType:a,buttonLabel:l,buttonVariant:s,tagVariant:c,tagLabel:d,alignItems:u="flex-end"}){return i.html`
      <wui-flex justifyContent="space-between" alignItems=${u} columngap="1">
        <wui-flex flexDirection="column" rowgap="01">
          ${o?i.html`<wui-text variant="sm-medium" color="secondary">${o}</wui-text>`:null}

          <wui-flex alignItems="center" columngap="1">
            <wui-text variant="md-regular" color="primary">
              ${w.UiHelperUtil.getTruncateString({string:t||e,charsStart:t?16:this.charsStart,charsEnd:t?0:this.charsEnd,truncate:t?"end":"middle"})}
            </wui-text>

            ${c&&d?i.html`<wui-tag variant=${c} size="sm">${d}</wui-tag>`:null}
          </wui-flex>

          ${r?i.html`<wui-text variant="sm-regular" color="secondary">${r}</wui-text>`:null}
        </wui-flex>

        ${n?this.buttonTemplate({buttonType:a,buttonLabel:l,buttonVariant:s}):null}
      </wui-flex>
    `}buttonTemplate({buttonType:e,buttonLabel:t,buttonVariant:o}){return i.html`
      <wui-button
        size="sm"
        variant=${o}
        @click=${"disconnect"===e?this.dispatchDisconnectEvent.bind(this):this.dispatchSwitchEvent.bind(this)}
        data-testid=${"disconnect"===e?"wui-active-profile-wallet-item-disconnect-button":"wui-active-profile-wallet-item-switch-button"}
      >
        ${t}
      </wui-button>
    `}dispatchDisconnectEvent(){this.dispatchEvent(new CustomEvent("disconnect",{bubbles:!0,composed:!0}))}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent("switch",{bubbles:!0,composed:!0}))}dispatchExternalLinkEvent(){this.dispatchEvent(new CustomEvent("externalLink",{bubbles:!0,composed:!0}))}dispatchMoreButtonEvent(){this.dispatchEvent(new CustomEvent("more",{bubbles:!0,composed:!0}))}dispatchCopyEvent(){this.dispatchEvent(new CustomEvent("copy",{bubbles:!0,composed:!0}))}};tr.styles=[m.resetStyles,m.elementStyles,ti],to([(0,o.property)()],tr.prototype,"address",void 0),to([(0,o.property)()],tr.prototype,"profileName",void 0),to([(0,o.property)({type:Array})],tr.prototype,"content",void 0),to([(0,o.property)()],tr.prototype,"alt",void 0),to([(0,o.property)()],tr.prototype,"imageSrc",void 0),to([(0,o.property)()],tr.prototype,"icon",void 0),to([(0,o.property)()],tr.prototype,"iconSize",void 0),to([(0,o.property)()],tr.prototype,"iconBadge",void 0),to([(0,o.property)()],tr.prototype,"iconBadgeSize",void 0),to([(0,o.property)()],tr.prototype,"buttonVariant",void 0),to([(0,o.property)({type:Boolean})],tr.prototype,"enableMoreButton",void 0),to([(0,o.property)({type:Number})],tr.prototype,"charsStart",void 0),to([(0,o.property)({type:Number})],tr.prototype,"charsEnd",void 0),tr=to([(0,p.customElement)("wui-active-profile-wallet-item")],tr),e.i(46650);var tn=t;let ta=g.css`
  wui-image,
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  .right-icon {
    cursor: pointer;
  }

  .icon-box {
    position: relative;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .icon-badge {
    position: absolute;
    top: 18px;
    left: 23px;
    z-index: 3;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: 50%;
    padding: ${({spacing:e})=>e["01"]};
  }

  .icon-badge {
    width: 8px;
    height: 8px;
  }
`;var tl=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let ts=class extends tn.LitElement{constructor(){super(...arguments),this.address="",this.profileName="",this.alt="",this.buttonLabel="",this.buttonVariant="accent-primary",this.imageSrc="",this.icon=void 0,this.iconSize="md",this.iconBadgeSize="md",this.rightIcon="signOut",this.rightIconSize="md",this.loading=!1,this.charsStart=4,this.charsEnd=6}render(){return i.html`
      <wui-flex alignItems="center" columngap="2">
        ${this.imageOrIconTemplate()} ${this.labelAndDescriptionTemplate()}
        ${this.buttonActionTemplate()}
      </wui-flex>
    `}imageOrIconTemplate(){return this.icon?i.html`
        <wui-flex alignItems="center" justifyContent="center" class="icon-box">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge?i.html`<wui-icon
                  color="default"
                  size="inherit"
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`:null}
          </wui-flex>
        </wui-flex>
      `:i.html`<wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>`}labelAndDescriptionTemplate(){return i.html`
      <wui-flex
        flexDirection="column"
        flexGrow="1"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <wui-text variant="lg-regular" color="primary">
          ${w.UiHelperUtil.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?16:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?"end":"middle"})}
        </wui-text>
      </wui-flex>
    `}buttonActionTemplate(){return i.html`
      <wui-flex columngap="1" alignItems="center" justifyContent="center">
        <wui-button
          size="sm"
          variant=${this.buttonVariant}
          .loading=${this.loading}
          @click=${this.handleButtonClick}
          data-testid="wui-inactive-profile-wallet-item-button"
        >
          ${this.buttonLabel}
        </wui-button>

        <wui-icon-link
          variant="secondary"
          size="md"
          icon=${(0,n.ifDefined)(this.rightIcon)}
          class="right-icon"
          @click=${this.handleIconClick}
        ></wui-icon-link>
      </wui-flex>
    `}handleButtonClick(){this.dispatchEvent(new CustomEvent("buttonClick",{bubbles:!0,composed:!0}))}handleIconClick(){this.dispatchEvent(new CustomEvent("iconClick",{bubbles:!0,composed:!0}))}};ts.styles=[m.resetStyles,m.elementStyles,ta],tl([(0,o.property)()],ts.prototype,"address",void 0),tl([(0,o.property)()],ts.prototype,"profileName",void 0),tl([(0,o.property)()],ts.prototype,"alt",void 0),tl([(0,o.property)()],ts.prototype,"buttonLabel",void 0),tl([(0,o.property)()],ts.prototype,"buttonVariant",void 0),tl([(0,o.property)()],ts.prototype,"imageSrc",void 0),tl([(0,o.property)()],ts.prototype,"icon",void 0),tl([(0,o.property)()],ts.prototype,"iconSize",void 0),tl([(0,o.property)()],ts.prototype,"iconBadge",void 0),tl([(0,o.property)()],ts.prototype,"iconBadgeSize",void 0),tl([(0,o.property)()],ts.prototype,"rightIcon",void 0),tl([(0,o.property)()],ts.prototype,"rightIconSize",void 0),tl([(0,o.property)({type:Boolean})],ts.prototype,"loading",void 0),tl([(0,o.property)({type:Number})],ts.prototype,"charsStart",void 0),tl([(0,o.property)({type:Number})],ts.prototype,"charsEnd",void 0),ts=tl([(0,p.customElement)("wui-inactive-profile-wallet-item")],ts),e.i(79929);var tc=e.i(69718);let td={getAuthData(e){let t=e.connectorId===J.ConstantsUtil.CONNECTOR_ID.AUTH;if(!t)return{isAuth:!1,icon:void 0,iconSize:void 0,name:void 0};let i=e?.auth?.name??ec.StorageUtil.getConnectedSocialProvider(),o=e?.auth?.username??ec.StorageUtil.getConnectedSocialUsername(),r=ee.ConnectorController.getAuthConnector(),n=r?.provider.getEmail()??"";return{isAuth:!0,icon:i??"mail",iconSize:i?"xl":"md",name:t?eU.ConnectorUtil.getAuthName({email:n,socialUsername:o,socialProvider:i}):void 0}}},tu=g.css`
  :host {
    --connect-scroll--top-opacity: 0;
    --connect-scroll--bottom-opacity: 0;
  }

  .balance-amount {
    flex: 1;
  }

  .wallet-list {
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: opacity;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
      rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
      black 40px,
      black calc(100% - 40px),
      rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
    );
  }

  .active-wallets {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e["4"]};
  }

  .active-wallets-box {
    height: 330px;
  }

  .empty-wallet-list-box {
    height: 400px;
  }

  .empty-box {
    width: 100%;
    padding: ${({spacing:e})=>e["4"]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e["4"]};
  }

  wui-separator {
    margin: ${({spacing:e})=>e["2"]} 0 ${({spacing:e})=>e["2"]} 0;
  }

  .active-connection {
    padding: ${({spacing:e})=>e["2"]};
  }

  .recent-connection {
    padding: ${({spacing:e})=>e["2"]} 0 ${({spacing:e})=>e["2"]} 0;
  }

  @media (max-width: 430px) {
    .active-wallets-box,
    .empty-wallet-list-box {
      height: auto;
      max-height: clamp(360px, 470px, 80vh);
    }
  }
`;var tp=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let th=4,tm=6,tw="md",tg="lightbulb",tf=[0,1],tb={eip155:"ethereum",solana:"solana",bip122:"bitcoin",ton:"ton",tron:"tron"},ty=[{namespace:"eip155",icon:tb.eip155,label:"EVM"},{namespace:"solana",icon:tb.solana,label:"Solana"},{namespace:"bip122",icon:tb.bip122,label:"Bitcoin"},{namespace:"ton",icon:tb.ton,label:"Ton"},{namespace:"tron",icon:tb.tron,label:"Tron"}],tC={eip155:{title:"Add EVM Wallet",description:"Add your first EVM wallet"},solana:{title:"Add Solana Wallet",description:"Add your first Solana wallet"},bip122:{title:"Add Bitcoin Wallet",description:"Add your first Bitcoin wallet"},ton:{title:"Add TON Wallet",description:"Add your first TON wallet"},tron:{title:"Add TRON Wallet",description:"Add your first TRON wallet"}},tv=class extends e6.LitElement{constructor(){super(),this.unsubscribers=[],this.currentTab=0,this.namespace=s.ChainController.state.activeChain,this.namespaces=Array.from(s.ChainController.state.chains.keys()),this.caipAddress=void 0,this.profileName=void 0,this.activeConnectorIds=ee.ConnectorController.state.activeConnectorIds,this.lastSelectedAddress="",this.lastSelectedConnectorId="",this.isSwitching=!1,this.caipNetwork=s.ChainController.state.activeCaipNetwork,this.user=s.ChainController.getAccountData()?.user,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.currentTab=this.namespace?this.namespaces.indexOf(this.namespace):0,this.caipAddress=s.ChainController.getAccountData(this.namespace)?.caipAddress,this.profileName=s.ChainController.getAccountData(this.namespace)?.profileName,this.unsubscribers.push(Z.ConnectionController.subscribeKey("connections",()=>this.onConnectionsChange()),Z.ConnectionController.subscribeKey("recentConnections",()=>this.requestUpdate()),ee.ConnectorController.subscribeKey("activeConnectorIds",e=>{this.activeConnectorIds=e}),s.ChainController.subscribeKey("activeCaipNetwork",e=>this.caipNetwork=e),s.ChainController.subscribeChainProp("accountState",e=>{this.user=e?.user}),u.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e)),this.chainListener=s.ChainController.subscribeChainProp("accountState",e=>{this.caipAddress=e?.caipAddress,this.profileName=e?.profileName},this.namespace)}disconnectedCallback(){this.unsubscribers.forEach(e=>e()),this.resizeObserver?.disconnect(),this.removeScrollListener(),this.chainListener?.()}firstUpdated(){let e=this.shadowRoot?.querySelector(".wallet-list");if(!e)return;let t=()=>this.updateScrollOpacity(e);requestAnimationFrame(t),e.addEventListener("scroll",t),this.resizeObserver=new ResizeObserver(t),this.resizeObserver.observe(e),t()}render(){let e=this.namespace;if(!e)throw Error("Namespace is not set");return i.html`
      <wui-flex flexDirection="column" .padding=${["0","4","4","4"]} gap="4">
        ${this.renderTabs()} ${this.renderHeader(e)} ${this.renderConnections(e)}
        ${this.renderAddConnectionButton(e)}
      </wui-flex>
    `}renderTabs(){let e=this.namespaces.map(e=>ty.find(t=>t.namespace===e)).filter(Boolean);return e.length>1?i.html`
        <wui-tabs
          .onTabChange=${e=>this.handleTabChange(e)}
          .activeTab=${this.currentTab}
          .tabs=${e}
        ></wui-tabs>
      `:null}renderHeader(e){let t=this.getActiveConnections(e).flatMap(({accounts:e})=>e).length+ +!!this.caipAddress;return i.html`
      <wui-flex alignItems="center" columngap="1">
        <wui-icon
          size="sm"
          name=${tb[e]??tb.eip155}
        ></wui-icon>
        <wui-text color="secondary" variant="lg-regular"
          >${t>1?"Wallets":"Wallet"}</wui-text
        >
        <wui-text
          color="primary"
          variant="lg-regular"
          class="balance-amount"
          data-testid="balance-amount"
        >
          ${t}
        </wui-text>
        <wui-link
          color="secondary"
          variant="secondary"
          @click=${()=>Z.ConnectionController.disconnect({namespace:e})}
          ?disabled=${!this.hasAnyConnections(e)}
          data-testid="disconnect-all-button"
        >
          Disconnect All
        </wui-link>
      </wui-flex>
    `}renderConnections(e){let t=this.hasAnyConnections(e);return i.html`
      <wui-flex flexDirection="column" class=${(0,e8.classMap)({"wallet-list":!0,"active-wallets-box":t,"empty-wallet-list-box":!t})} rowgap="3">
        ${t?this.renderActiveConnections(e):this.renderEmptyState(e)}
      </wui-flex>
    `}renderActiveConnections(e){let t=this.getActiveConnections(e),o=this.activeConnectorIds[e],r=this.getPlainAddress();return i.html`
      ${r||o||t.length>0?i.html`<wui-flex
            flexDirection="column"
            .padding=${["4","0","4","0"]}
            class="active-wallets"
          >
            ${this.renderActiveProfile(e)} ${this.renderActiveConnectionsList(e)}
          </wui-flex>`:null}
      ${this.renderRecentConnections(e)}
    `}renderActiveProfile(e){let t=this.activeConnectorIds[e];if(!t)return null;let{connections:o}=e9.ConnectionControllerUtil.getConnectionsData(e),r=ee.ConnectorController.getConnectorById(t),n=l.AssetUtil.getConnectorImage(r),a=this.getPlainAddress();if(!a)return null;let s=e===J.ConstantsUtil.CHAIN.BITCOIN,c=td.getAuthData({connectorId:t,accounts:[]}),d=this.getActiveConnections(e).flatMap(e=>e.accounts).length>0,u=o.find(e=>e.connectorId===t),p=u?.accounts.filter(e=>!tc.HelpersUtil.isLowerCaseMatch(e.address,a));return i.html`
      <wui-flex flexDirection="column" .padding=${["0","4","0","4"]}>
        <wui-active-profile-wallet-item
          address=${a}
          alt=${r?.name}
          .content=${this.getProfileContent({address:a,connections:o,connectorId:t,namespace:e})}
          .charsStart=${th}
          .charsEnd=${tm}
          .icon=${c.icon}
          .iconSize=${c.iconSize}
          .iconBadge=${this.isSmartAccount(a)?tg:void 0}
          .iconBadgeSize=${this.isSmartAccount(a)?tw:void 0}
          imageSrc=${n}
          ?enableMoreButton=${c.isAuth}
          @copy=${()=>this.handleCopyAddress(a)}
          @disconnect=${()=>this.handleDisconnect(e,t)}
          @switch=${()=>{s&&u&&p?.[0]&&this.handleSwitchWallet(u,p[0].address,e)}}
          @externalLink=${()=>this.handleExternalLink(a)}
          @more=${()=>this.handleMore()}
          data-testid="wui-active-profile-wallet-item"
        ></wui-active-profile-wallet-item>
        ${d?i.html`<wui-separator></wui-separator>`:null}
      </wui-flex>
    `}renderActiveConnectionsList(e){let t=this.getActiveConnections(e);return 0===t.length?null:i.html`
      <wui-flex flexDirection="column" .padding=${["0","2","0","2"]}>
        ${this.renderConnectionList(t,!1,e)}
      </wui-flex>
    `}renderRecentConnections(e){let{recentConnections:t}=e9.ConnectionControllerUtil.getConnectionsData(e);return 0===t.flatMap(e=>e.accounts).length?null:i.html`
      <wui-flex flexDirection="column" .padding=${["0","2","0","2"]} rowGap="2">
        <wui-text color="secondary" variant="sm-medium" data-testid="recently-connected-text"
          >RECENTLY CONNECTED</wui-text
        >
        <wui-flex flexDirection="column" .padding=${["0","2","0","2"]}>
          ${this.renderConnectionList(t,!0,e)}
        </wui-flex>
      </wui-flex>
    `}renderConnectionList(e,t,o){return e.filter(e=>e.accounts.length>0).map((e,r)=>{let n=ee.ConnectorController.getConnectorById(e.connectorId),a=l.AssetUtil.getConnectorImage(n)??"",s=td.getAuthData(e);return e.accounts.map((n,l)=>{let c=this.isAccountLoading(e.connectorId,n.address);return i.html`
            <wui-flex flexDirection="column">
              ${0!==r||0!==l?i.html`<wui-separator></wui-separator>`:null}
              <wui-inactive-profile-wallet-item
                address=${n.address}
                alt=${e.connectorId}
                buttonLabel=${t?"Connect":"Switch"}
                buttonVariant=${t?"neutral-secondary":"accent-secondary"}
                rightIcon=${t?"bin":"power"}
                rightIconSize="sm"
                class=${t?"recent-connection":"active-connection"}
                data-testid=${t?"recent-connection":"active-connection"}
                imageSrc=${a}
                .iconBadge=${this.isSmartAccount(n.address)?tg:void 0}
                .iconBadgeSize=${this.isSmartAccount(n.address)?tw:void 0}
                .icon=${s.icon}
                .iconSize=${s.iconSize}
                .loading=${c}
                .showBalance=${!1}
                .charsStart=${th}
                .charsEnd=${tm}
                @buttonClick=${()=>this.handleSwitchWallet(e,n.address,o)}
                @iconClick=${()=>this.handleWalletAction({connection:e,address:n.address,isRecentConnection:t,namespace:o})}
              ></wui-inactive-profile-wallet-item>
            </wui-flex>
          `})})}renderAddConnectionButton(e){if(!this.isMultiWalletEnabled()&&this.caipAddress||!this.hasAnyConnections(e))return null;let{title:t}=this.getChainLabelInfo(e);return i.html`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon="plus"
        iconSize="sm"
        ?chevron=${!0}
        @click=${()=>this.handleAddConnection(e)}
        data-testid="add-connection-button"
      >
        <wui-text variant="md-medium" color="secondary">${t}</wui-text>
      </wui-list-item>
    `}renderEmptyState(e){let{title:t,description:o}=this.getChainLabelInfo(e);return i.html`
      <wui-flex alignItems="flex-start" class="empty-template" data-testid="empty-template">
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          rowgap="3"
          class="empty-box"
        >
          <wui-icon-box size="xl" icon="wallet" color="secondary"></wui-icon-box>

          <wui-flex flexDirection="column" alignItems="center" justifyContent="center" gap="1">
            <wui-text color="primary" variant="lg-regular" data-testid="empty-state-text"
              >No wallet connected</wui-text
            >
            <wui-text color="secondary" variant="md-regular" data-testid="empty-state-description"
              >${o}</wui-text
            >
          </wui-flex>

          <wui-link
            @click=${()=>this.handleAddConnection(e)}
            data-testid="empty-state-button"
            icon="plus"
          >
            ${t}
          </wui-link>
        </wui-flex>
      </wui-flex>
    `}handleTabChange(e){let t=this.namespaces[e];t&&(this.chainListener?.(),this.currentTab=this.namespaces.indexOf(t),this.namespace=t,this.caipAddress=s.ChainController.getAccountData(t)?.caipAddress,this.profileName=s.ChainController.getAccountData(t)?.profileName,this.chainListener=s.ChainController.subscribeChainProp("accountState",e=>{this.caipAddress=e?.caipAddress},t))}async handleSwitchWallet(e,t,i){try{this.isSwitching=!0,this.lastSelectedConnectorId=e.connectorId,this.lastSelectedAddress=t,this.caipNetwork?.chainNamespace!==i&&e?.caipNetwork&&(ee.ConnectorController.setFilterByNamespace(i),await s.ChainController.switchActiveNetwork(e?.caipNetwork)),await Z.ConnectionController.switchConnection({connection:e,address:t,namespace:i,closeModalOnConnect:!1,onChange({hasSwitchedAccount:e,hasSwitchedWallet:t}){t?eo.SnackController.showSuccess("Wallet switched"):e&&eo.SnackController.showSuccess("Account switched")}})}catch(e){eo.SnackController.showError("Failed to switch wallet")}finally{this.isSwitching=!1}}handleWalletAction(e){let{connection:t,address:i,isRecentConnection:o,namespace:r}=e;o?(ec.StorageUtil.deleteAddressFromConnection({connectorId:t.connectorId,address:i,namespace:r}),Z.ConnectionController.syncStorageConnections(),eo.SnackController.showSuccess("Wallet deleted")):this.handleDisconnect(r,t.connectorId)}async handleDisconnect(e,t){try{await Z.ConnectionController.disconnect({id:t,namespace:e}),eo.SnackController.showSuccess("Wallet disconnected")}catch{eo.SnackController.showError("Failed to disconnect wallet")}}handleCopyAddress(e){c.CoreHelperUtil.copyToClopboard(e),eo.SnackController.showSuccess("Address copied")}handleMore(){ei.RouterController.push("AccountSettings")}handleExternalLink(e){let t=this.caipNetwork?.blockExplorers?.default.url;t&&c.CoreHelperUtil.openHref(`${t}/address/${e}`,"_blank")}handleAddConnection(e){ee.ConnectorController.setFilterByNamespace(e),ei.RouterController.push("Connect",{addWalletForNamespace:e})}getChainLabelInfo(e){return tC[e]??{title:"Add Wallet",description:"Add your first wallet"}}isSmartAccount(e){if(!this.namespace)return!1;let t=this.user?.accounts?.find(e=>"smartAccount"===e.type);return!!t&&!!e&&tc.HelpersUtil.isLowerCaseMatch(t.address,e)}getPlainAddress(){return this.caipAddress?c.CoreHelperUtil.getPlainAddress(this.caipAddress):void 0}getActiveConnections(e){let t=this.activeConnectorIds[e],{connections:i}=e9.ConnectionControllerUtil.getConnectionsData(e),[o]=i.filter(e=>tc.HelpersUtil.isLowerCaseMatch(e.connectorId,t));if(!t)return i;let r=e===J.ConstantsUtil.CHAIN.BITCOIN,{address:n}=this.caipAddress?e7.ParseUtil.parseCaipAddress(this.caipAddress):{},a=[...n?[n]:[]];return r&&o&&(a=o.accounts.map(e=>e.address)||[]),e9.ConnectionControllerUtil.excludeConnectorAddressFromConnections({connectorId:t,addresses:a,connections:i})}hasAnyConnections(e){let t=this.getActiveConnections(e),{recentConnections:i}=e9.ConnectionControllerUtil.getConnectionsData(e);return!!this.caipAddress||t.length>0||i.length>0}isAccountLoading(e,t){return tc.HelpersUtil.isLowerCaseMatch(this.lastSelectedConnectorId,e)&&tc.HelpersUtil.isLowerCaseMatch(this.lastSelectedAddress,t)&&this.isSwitching}getProfileContent(e){let{address:t,connections:i,connectorId:o,namespace:r}=e,[n]=i.filter(e=>tc.HelpersUtil.isLowerCaseMatch(e.connectorId,o));if(r===J.ConstantsUtil.CHAIN.BITCOIN&&n?.accounts.every(e=>"string"==typeof e.type))return this.getBitcoinProfileContent(n.accounts,t);let a=td.getAuthData({connectorId:o,accounts:[]});return[{address:t,tagLabel:"Active",tagVariant:"success",enableButton:!0,profileName:this.profileName,buttonType:"disconnect",buttonLabel:"Disconnect",buttonVariant:"neutral-secondary",...a.isAuth?{description:this.isSmartAccount(t)?"Smart Account":"EOA Account"}:{}}]}getBitcoinProfileContent(e,t){let i=e.length>1,o=this.getPlainAddress();return e.map(e=>{let r=tc.HelpersUtil.isLowerCaseMatch(e.address,o),n="PAYMENT";return"ordinal"===e.type&&(n="ORDINALS"),{address:e.address,tagLabel:tc.HelpersUtil.isLowerCaseMatch(e.address,t)?"Active":void 0,tagVariant:tc.HelpersUtil.isLowerCaseMatch(e.address,t)?"success":void 0,enableButton:!0,...i?{label:n,alignItems:"flex-end",buttonType:r?"disconnect":"switch",buttonLabel:r?"Disconnect":"Switch",buttonVariant:r?"neutral-secondary":"accent-secondary"}:{alignItems:"center",buttonType:"disconnect",buttonLabel:"Disconnect",buttonVariant:"neutral-secondary"}}})}removeScrollListener(){let e=this.shadowRoot?.querySelector(".wallet-list");e&&e.removeEventListener("scroll",()=>this.handleConnectListScroll())}handleConnectListScroll(){let e=this.shadowRoot?.querySelector(".wallet-list");e&&this.updateScrollOpacity(e)}isMultiWalletEnabled(){return!!this.remoteFeatures?.multiWallet}updateScrollOpacity(e){e.style.setProperty("--connect-scroll--top-opacity",te.MathUtil.interpolate([0,50],tf,e.scrollTop).toString()),e.style.setProperty("--connect-scroll--bottom-opacity",te.MathUtil.interpolate([0,50],tf,e.scrollHeight-e.scrollTop-e.offsetHeight).toString())}onConnectionsChange(){if(this.isMultiWalletEnabled()&&this.namespace){let{connections:e}=e9.ConnectionControllerUtil.getConnectionsData(this.namespace);0===e.length&&ei.RouterController.reset("ProfileWallets")}this.requestUpdate()}};tv.styles=tu,tp([(0,r.state)()],tv.prototype,"currentTab",void 0),tp([(0,r.state)()],tv.prototype,"namespace",void 0),tp([(0,r.state)()],tv.prototype,"namespaces",void 0),tp([(0,r.state)()],tv.prototype,"caipAddress",void 0),tp([(0,r.state)()],tv.prototype,"profileName",void 0),tp([(0,r.state)()],tv.prototype,"activeConnectorIds",void 0),tp([(0,r.state)()],tv.prototype,"lastSelectedAddress",void 0),tp([(0,r.state)()],tv.prototype,"lastSelectedConnectorId",void 0),tp([(0,r.state)()],tv.prototype,"isSwitching",void 0),tp([(0,r.state)()],tv.prototype,"caipNetwork",void 0),tp([(0,r.state)()],tv.prototype,"user",void 0),tp([(0,r.state)()],tv.prototype,"remoteFeatures",void 0),tv=tp([(0,p.customElement)("w3m-profile-wallets-view")],tv),e.s(["W3mProfileWalletsView",0,tv],74950);var tx=t,t$=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let tk=class extends tx.LitElement{constructor(){super(),this.unsubscribe=[],this.activeCaipNetwork=s.ChainController.state.activeCaipNetwork,this.features=u.OptionsController.state.features,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.exchangesLoading=eg.ExchangeController.state.isLoading,this.exchanges=eg.ExchangeController.state.exchanges,this.unsubscribe.push(u.OptionsController.subscribeKey("features",e=>this.features=e),u.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e),s.ChainController.subscribeKey("activeCaipNetwork",e=>{this.activeCaipNetwork=e,this.setDefaultPaymentAsset()}),eg.ExchangeController.subscribeKey("isLoading",e=>this.exchangesLoading=e),eg.ExchangeController.subscribeKey("exchanges",e=>this.exchanges=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}async firstUpdated(){eg.ExchangeController.isPayWithExchangeSupported()&&(await this.setDefaultPaymentAsset(),await eg.ExchangeController.fetchExchanges())}render(){return i.html`
      <wui-flex flexDirection="column" .padding=${["1","3","3","3"]} gap="2">
        ${this.onrampTemplate()} ${this.receiveTemplate()} ${this.depositFromExchangeTemplate()}
      </wui-flex>
    `}async setDefaultPaymentAsset(){if(!this.activeCaipNetwork)return;let e=await eg.ExchangeController.getAssetsForNetwork(this.activeCaipNetwork.caipNetworkId),t=e.find(e=>"USDC"===e.metadata.symbol)||e[0];t&&eg.ExchangeController.setPaymentAsset(t)}onrampTemplate(){if(!this.activeCaipNetwork)return null;let e=this.remoteFeatures?.onramp,t=et.ConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.activeCaipNetwork.chainNamespace);return e&&t?i.html`
      <wui-list-item
        @click=${this.onBuyCrypto.bind(this)}
        icon="card"
        data-testid="wallet-features-onramp-button"
      >
        <wui-text variant="lg-regular" color="primary">Buy crypto</wui-text>
      </wui-list-item>
    `:null}depositFromExchangeTemplate(){return this.activeCaipNetwork&&eg.ExchangeController.isPayWithExchangeSupported()?i.html`
      <wui-list-item
        @click=${this.onDepositFromExchange.bind(this)}
        icon="arrowBottomCircle"
        data-testid="wallet-features-deposit-from-exchange-button"
        ?loading=${this.exchangesLoading}
        ?disabled=${this.exchangesLoading||!this.exchanges.length}
      >
        <wui-text variant="lg-regular" color="primary">Deposit from exchange</wui-text>
      </wui-list-item>
    `:null}receiveTemplate(){return this.features?.receive?i.html`
      <wui-list-item
        @click=${this.onReceive.bind(this)}
        icon="qrCode"
        data-testid="wallet-features-receive-button"
      >
        <wui-text variant="lg-regular" color="primary">Receive funds</wui-text>
      </wui-list-item>
    `:null}onBuyCrypto(){ei.RouterController.push("OnRampProviders")}onReceive(){ei.RouterController.push("WalletReceive")}onDepositFromExchange(){eg.ExchangeController.reset(),ei.RouterController.push("PayWithExchange",{redirectView:ei.RouterController.state.data?.redirectView})}};t$([(0,r.state)()],tk.prototype,"activeCaipNetwork",void 0),t$([(0,r.state)()],tk.prototype,"features",void 0),t$([(0,r.state)()],tk.prototype,"remoteFeatures",void 0),t$([(0,r.state)()],tk.prototype,"exchangesLoading",void 0),t$([(0,r.state)()],tk.prototype,"exchanges",void 0),tk=t$([(0,p.customElement)("w3m-fund-wallet-view")],tk),e.s(["W3mFundWalletView",0,tk],7337);var tE=t,tS=t,tR=t;e.i(84326);var tA=e.i(65090);let tT=g.css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    user-select: none;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({colors:e})=>e.neutrals300};
    border-radius: ${({borderRadius:e})=>e.round};
    border: 1px solid transparent;
    will-change: border;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  span:before {
    content: '';
    position: absolute;
    background-color: ${({colors:e})=>e.white};
    border-radius: 50%;
  }

  /* -- Sizes --------------------------------------------------------- */
  label[data-size='lg'] {
    width: 48px;
    height: 32px;
  }

  label[data-size='md'] {
    width: 40px;
    height: 28px;
  }

  label[data-size='sm'] {
    width: 32px;
    height: 22px;
  }

  label[data-size='lg'] > span:before {
    height: 24px;
    width: 24px;
    left: 4px;
    top: 3px;
  }

  label[data-size='md'] > span:before {
    height: 20px;
    width: 20px;
    left: 4px;
    top: 3px;
  }

  label[data-size='sm'] > span:before {
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
  }

  /* -- Focus states --------------------------------------------------- */
  input:focus-visible:not(:checked) + span,
  input:focus:not(:checked) + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    background-color: ${({tokens:e})=>e.theme.textTertiary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  input:focus-visible:checked + span,
  input:focus:checked + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  input:checked + span {
    background-color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  label[data-size='lg'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='md'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='sm'] > input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }

  /* -- Hover states ------------------------------------------------------- */
  label:hover > input:not(:checked):not(:disabled) + span {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  label:hover > input:checked:not(:disabled) + span {
    background-color: ${({colors:e})=>e.accent080};
  }

  /* -- Disabled state --------------------------------------------------- */
  label:has(input:disabled) {
    pointer-events: none;
    user-select: none;
  }

  input:not(:checked):disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:checked:disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:not(:checked):disabled + span::before {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  input:checked:disabled + span::before {
    background-color: ${({tokens:e})=>e.theme.textTertiary};
  }
`;var tI=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let tO=class extends tR.LitElement{constructor(){super(...arguments),this.inputElementRef=(0,tA.createRef)(),this.checked=!1,this.disabled=!1,this.size="md"}render(){return i.html`
      <label data-size=${this.size}>
        <input
          ${(0,tA.ref)(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("switchChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};tO.styles=[m.resetStyles,m.elementStyles,tT],tI([(0,o.property)({type:Boolean})],tO.prototype,"checked",void 0),tI([(0,o.property)({type:Boolean})],tO.prototype,"disabled",void 0),tI([(0,o.property)()],tO.prototype,"size",void 0),tO=tI([(0,p.customElement)("wui-toggle")],tO);let tN=g.css`
  :host {
    height: auto;
  }

  :host > wui-flex {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: ${({spacing:e})=>e["2"]};
    padding: ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["3"]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e["4"]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`;var tU=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let tP=class extends tS.LitElement{constructor(){super(...arguments),this.checked=!1}render(){return i.html`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `}handleToggleChange(e){e.stopPropagation(),this.checked=e.detail,this.dispatchSwitchEvent()}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent("certifiedSwitchChange",{detail:this.checked,bubbles:!0,composed:!0}))}};tP.styles=[m.resetStyles,m.elementStyles,tN],tU([(0,o.property)({type:Boolean})],tP.prototype,"checked",void 0),tP=tU([(0,p.customElement)("wui-certified-switch")],tP);var tD=t;e.i(35902);let tL=g.css`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.iconDefault};
    cursor: pointer;
    padding: ${({spacing:e})=>e[2]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
  }

  @media (hover: hover) {
    wui-icon:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }
`;var tW=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let tj=class extends tD.LitElement{constructor(){super(...arguments),this.inputComponentRef=(0,tA.createRef)(),this.inputValue=""}render(){return i.html`
      <wui-input-text
        ${(0,tA.ref)(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue?i.html`<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`:null}
      </wui-input-text>
    `}onInputChange(e){this.inputValue=e.detail||""}clearValue(){let e=this.inputComponentRef.value,t=e?.inputElementRef.value;t&&(t.value="",this.inputValue="",t.focus(),t.dispatchEvent(new Event("input")))}};tj.styles=[m.resetStyles,tL],tW([(0,o.property)()],tj.prototype,"inputValue",void 0),tj=tW([(0,p.customElement)("wui-search-bar")],tj);var tz=t,tF=e.i(86259),tB=e.i(97730),t_=t,tH=e.i(52157);e.i(64576);let tM=g.css`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 104px;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--apkt-path-network);
    clip-path: var(--apkt-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: ${({tokens:e})=>e.theme.foregroundSecondary};
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`;var tV=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let tK=class extends t_.LitElement{constructor(){super(...arguments),this.type="wallet"}render(){return i.html`
      ${this.shimmerTemplate()}
      <wui-shimmer width="80px" height="20px"></wui-shimmer>
    `}shimmerTemplate(){return"network"===this.type?i.html` <wui-shimmer data-type=${this.type} width="48px" height="54px"></wui-shimmer>
        ${tH.networkSvgMd}`:i.html`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}};tK.styles=[m.resetStyles,m.elementStyles,tM],tV([(0,o.property)()],tK.prototype,"type",void 0),tK=tV([(0,p.customElement)("wui-card-select-loader")],tK);var tq=t;let tG=E.css`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`;var tX=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let tY=class extends tq.LitElement{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--apkt-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--apkt-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--apkt-spacing-${this.gap})`};
      padding-top: ${this.padding&&w.UiHelperUtil.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&w.UiHelperUtil.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&w.UiHelperUtil.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&w.UiHelperUtil.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&w.UiHelperUtil.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&w.UiHelperUtil.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&w.UiHelperUtil.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&w.UiHelperUtil.getSpacingStyles(this.margin,3)};
    `,i.html`<slot></slot>`}};tY.styles=[m.resetStyles,tG],tX([(0,o.property)()],tY.prototype,"gridTemplateRows",void 0),tX([(0,o.property)()],tY.prototype,"gridTemplateColumns",void 0),tX([(0,o.property)()],tY.prototype,"justifyItems",void 0),tX([(0,o.property)()],tY.prototype,"alignItems",void 0),tX([(0,o.property)()],tY.prototype,"justifyContent",void 0),tX([(0,o.property)()],tY.prototype,"alignContent",void 0),tX([(0,o.property)()],tY.prototype,"columnGap",void 0),tX([(0,o.property)()],tY.prototype,"rowGap",void 0),tX([(0,o.property)()],tY.prototype,"gap",void 0),tX([(0,o.property)()],tY.prototype,"padding",void 0),tX([(0,o.property)()],tY.prototype,"margin",void 0),tY=tX([(0,p.customElement)("wui-grid")],tY);var tQ=t;e.i(80313),e.i(56303);let tJ=g.css`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: ${({spacing:e})=>e["2"]};
    padding: ${({spacing:e})=>e["3"]} ${({spacing:e})=>e["0"]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: clamp(0px, ${({borderRadius:e})=>e["4"]}, 20px);
    transition:
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textPrimary};
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled > wui-flex > wui-text {
    color: ${({tokens:e})=>e.core.glass010};
  }

  [data-selected='true'] {
    background-color: ${({colors:e})=>e.accent020};
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: ${({colors:e})=>e.accent010};
    }
  }

  [data-selected='true']:active:enabled {
    background-color: ${({colors:e})=>e.accent010};
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`;var tZ=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let t0=class extends tQ.LitElement{constructor(){super(),this.observer=new IntersectionObserver(()=>void 0),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.isImpressed=!1,this.explorerId="",this.walletQuery="",this.certified=!1,this.displayIndex=0,this.wallet=void 0,this.observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting?(this.visible=!0,this.fetchImageSrc(),this.sendImpressionEvent()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){let e=this.wallet?.badge_type==="certified";return i.html`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
            color="inherit"
            class=${(0,n.ifDefined)(e?"certified":void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${e?i.html`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return(this.visible||this.imageSrc)&&!this.imageLoading?i.html`
      <wui-wallet-image
        size="lg"
        imageSrc=${(0,n.ifDefined)(this.imageSrc)}
        name=${(0,n.ifDefined)(this.wallet?.name)}
        .installed=${this.wallet?.installed??!1}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `:this.shimmerTemplate()}shimmerTemplate(){return i.html`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}async fetchImageSrc(){!this.wallet||(this.imageSrc=l.AssetUtil.getWalletImage(this.wallet),this.imageSrc||(this.imageLoading=!0,this.imageSrc=await l.AssetUtil.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}sendImpressionEvent(){this.wallet&&!this.isImpressed&&(this.isImpressed=!0,B.EventsController.sendWalletImpressionEvent({name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.explorerId,view:ei.RouterController.state.view,query:this.walletQuery,certified:this.certified,displayIndex:this.displayIndex}))}};t0.styles=tJ,tZ([(0,r.state)()],t0.prototype,"visible",void 0),tZ([(0,r.state)()],t0.prototype,"imageSrc",void 0),tZ([(0,r.state)()],t0.prototype,"imageLoading",void 0),tZ([(0,r.state)()],t0.prototype,"isImpressed",void 0),tZ([(0,o.property)()],t0.prototype,"explorerId",void 0),tZ([(0,o.property)()],t0.prototype,"walletQuery",void 0),tZ([(0,o.property)()],t0.prototype,"certified",void 0),tZ([(0,o.property)()],t0.prototype,"displayIndex",void 0),tZ([(0,o.property)({type:Object})],t0.prototype,"wallet",void 0),t0=tZ([(0,p.customElement)("w3m-all-wallets-list-item")],t0);let t3=g.css`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  w3m-all-wallets-list-item {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-inout-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-loading-spinner {
    padding-top: ${({spacing:e})=>e["4"]};
    padding-bottom: ${({spacing:e})=>e["4"]};
    justify-content: center;
    grid-column: 1 / span 4;
  }
`;var t1=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let t2="local-paginator",t5=class extends tz.LitElement{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!tF.ApiController.state.wallets.length,this.wallets=tF.ApiController.state.wallets,this.mobileFullScreen=u.OptionsController.state.enableMobileFullScreen,this.unsubscribe.push(tF.ApiController.subscribeKey("wallets",e=>this.wallets=e))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.paginationObserver?.disconnect()}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),i.html`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","3","3","3"]}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;let e=this.shadowRoot?.querySelector("wui-grid");e&&(await tF.ApiController.fetchWalletsByPage({page:1}),await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(e,t){return[...Array(e)].map(()=>i.html`
        <wui-card-select-loader type="wallet" id=${(0,n.ifDefined)(t)}></wui-card-select-loader>
      `)}walletsTemplate(){return tB.WalletUtil.getWalletConnectWallets(this.wallets).map((e,t)=>i.html`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${e.id}"
          @click=${()=>this.onConnectWallet(e)}
          .wallet=${e}
          explorerId=${e.id}
          certified=${"certified"===this.badge}
          displayIndex=${t}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){let{wallets:e,recommended:t,featured:i,count:o,mobileFilteredOutWalletsLength:r}=tF.ApiController.state,n=window.innerWidth<352?3:4,a=e.length+t.length,l=Math.ceil(a/n)*n-a+n;return(l-=e.length?i.length%n:0,0===o&&i.length>0)?null:0===o||[...i,...e,...t].length<o-(r??0)?this.shimmerTemplate(l,t2):null}createPaginationObserver(){let e=this.shadowRoot?.querySelector(`#${t2}`);e&&(this.paginationObserver=new IntersectionObserver(([e])=>{if(e?.isIntersecting&&!this.loading){let{page:e,count:t,wallets:i}=tF.ApiController.state;i.length<t&&tF.ApiController.fetchWalletsByPage({page:e+1})}}),this.paginationObserver.observe(e))}onConnectWallet(e){ee.ConnectorController.selectWalletConnector(e)}};t5.styles=t3,t1([(0,r.state)()],t5.prototype,"loading",void 0),t1([(0,r.state)()],t5.prototype,"wallets",void 0),t1([(0,r.state)()],t5.prototype,"badge",void 0),t1([(0,r.state)()],t5.prototype,"mobileFullScreen",void 0),t5=t1([(0,p.customElement)("w3m-all-wallets-list")],t5);var t4=t;e.i(21147);let t6=E.css`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  :host([data-mobile-fullscreen='true']) wui-grid {
    max-height: none;
    height: auto;
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;var t8=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let t7=class extends t4.LitElement{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.mobileFullScreen=u.OptionsController.state.enableMobileFullScreen,this.query=""}render(){return this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.onSearch(),this.loading?i.html`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await tF.ApiController.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){let{search:e}=tF.ApiController.state,t=tB.WalletUtil.markWalletsAsInstalled(e),o=tB.WalletUtil.filterWalletsByWcSupport(t);return o.length?i.html`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","3","3","3"]}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${o.map((e,t)=>i.html`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(e)}
              .wallet=${e}
              data-testid="wallet-search-item-${e.id}"
              explorerId=${e.id}
              certified=${"certified"===this.badge}
              walletQuery=${this.query}
              displayIndex=${t}
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:i.html`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(e){ee.ConnectorController.selectWalletConnector(e)}};t7.styles=t6,t8([(0,r.state)()],t7.prototype,"loading",void 0),t8([(0,r.state)()],t7.prototype,"mobileFullScreen",void 0),t8([(0,o.property)()],t7.prototype,"query",void 0),t8([(0,o.property)()],t7.prototype,"badge",void 0),t7=t8([(0,p.customElement)("w3m-all-wallets-search")],t7);var t9=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let ie=class extends tE.LitElement{constructor(){super(...arguments),this.search="",this.badge=void 0,this.onDebouncedSearch=c.CoreHelperUtil.debounce(e=>{this.search=e})}render(){let e=this.search.length>=2;return i.html`
      <wui-flex .padding=${["1","3","3","3"]} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${"certified"===this.badge}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${e||this.badge?i.html`<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`:i.html`<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}onCertifiedSwitchChange(e){e.detail?(this.badge="certified",eo.SnackController.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})):this.badge=void 0}qrButtonTemplate(){return c.CoreHelperUtil.isMobile()?i.html`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){ei.RouterController.push("ConnectingWalletConnect")}};t9([(0,r.state)()],ie.prototype,"search",void 0),t9([(0,r.state)()],ie.prototype,"badge",void 0),ie=t9([(0,p.customElement)("w3m-all-wallets-view")],ie),e.s(["W3mAllWalletsView",0,ie],10149);var it=t,ii=e.i(55587),io=t;let ir=g.css`
  button {
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[4]};
    width: 100%;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    justify-content: center;
    align-items: center;
  }

  :host([data-size='sm']) button {
    padding: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-size='md']) button {
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  button:hover {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  button:disabled {
    opacity: 0.5;
  }
`;var ia=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let il=class extends io.LitElement{constructor(){super(...arguments),this.text="",this.disabled=!1,this.size="lg",this.icon="copy",this.tabIdx=void 0}render(){this.dataset.size=this.size;let e=`${this.size}-regular`;return i.html`
      <button ?disabled=${this.disabled} tabindex=${(0,n.ifDefined)(this.tabIdx)}>
        <wui-icon name=${this.icon} size=${this.size} color="default"></wui-icon>
        <wui-text align="center" variant=${e} color="primary">${this.text}</wui-text>
      </button>
    `}};il.styles=[m.resetStyles,m.elementStyles,ir],ia([(0,o.property)()],il.prototype,"text",void 0),ia([(0,o.property)({type:Boolean})],il.prototype,"disabled",void 0),ia([(0,o.property)()],il.prototype,"size",void 0),ia([(0,o.property)()],il.prototype,"icon",void 0),ia([(0,o.property)()],il.prototype,"tabIdx",void 0),il=ia([(0,p.customElement)("wui-list-button")],il),e.i(3596);var is=e.i(16555),ic=t,id=e.i(51887);e.i(39299);var iu=e.i(35568);let ip=g.css`
  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }

  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }

  wui-icon-link,
  wui-loading-spinner {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  wui-icon-link {
    right: ${({spacing:e})=>e["2"]};
  }

  wui-loading-spinner {
    right: ${({spacing:e})=>e["3"]};
  }

  wui-text {
    margin: ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["3"]}
      ${({spacing:e})=>e["0"]} ${({spacing:e})=>e["3"]};
  }
`;var ih=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let im=class extends ic.LitElement{constructor(){super(),this.unsubscribe=[],this.formRef=(0,tA.createRef)(),this.email="",this.loading=!1,this.error="",this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.hasExceededUsageLimit=tF.ApiController.state.plan.hasExceededUsageLimit,this.unsubscribe.push(u.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e}),tF.ApiController.subscribeKey("plan",e=>this.hasExceededUsageLimit=e.hasExceededUsageLimit))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}firstUpdated(){this.formRef.value?.addEventListener("keydown",e=>{"Enter"===e.key&&this.onSubmitEmail(e)})}render(){let e=Z.ConnectionController.hasAnyConnection(J.ConstantsUtil.CONNECTOR_ID.AUTH);return i.html`
      <form ${(0,tA.ref)(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
        <wui-email-input
          @focus=${this.onFocusEvent.bind(this)}
          .disabled=${this.loading}
          @inputChange=${this.onEmailInputChange.bind(this)}
          tabIdx=${(0,n.ifDefined)(this.tabIdx)}
          ?disabled=${e||this.hasExceededUsageLimit}
        >
        </wui-email-input>

        ${this.submitButtonTemplate()}${this.loadingTemplate()}
        <input type="submit" hidden />
      </form>
      ${this.templateError()}
    `}submitButtonTemplate(){return!this.loading&&this.email.length>3?i.html`
          <wui-icon-link
            size="lg"
            icon="chevronRight"
            iconcolor="accent-100"
            @click=${this.onSubmitEmail.bind(this)}
          >
          </wui-icon-link>
        `:null}loadingTemplate(){return this.loading?i.html`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:null}templateError(){return this.error?i.html`<wui-text variant="sm-medium" color="error">${this.error}</wui-text>`:null}onEmailInputChange(e){this.email=e.detail.trim(),this.error=""}async onSubmitEmail(e){if(!eH.HelpersUtil.isValidEmail(this.email))return void id.AlertController.open({displayMessage:iu.ErrorUtil.ALERT_WARNINGS.INVALID_EMAIL.displayMessage},"warning");if(!J.ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(e=>e===s.ChainController.state.activeChain)){let e=s.ChainController.getFirstCaipNetworkSupportsAuthConnector();if(e)return void ei.RouterController.push("SwitchNetwork",{network:e})}try{if(this.loading)return;this.loading=!0,e.preventDefault();let t=ee.ConnectorController.getAuthConnector();if(!t)throw Error("w3m-email-login-widget: Auth connector not found");let{action:i}=await t.provider.connectEmail({email:this.email});if(B.EventsController.sendEvent({type:"track",event:"EMAIL_SUBMITTED"}),"VERIFY_OTP"===i)B.EventsController.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_SENT"}),ei.RouterController.push("EmailVerifyOtp",{email:this.email});else if("VERIFY_DEVICE"===i)ei.RouterController.push("EmailVerifyDevice",{email:this.email});else if("CONNECT"===i){let e=this.remoteFeatures?.multiWallet;await Z.ConnectionController.connectExternal(t,s.ChainController.state.activeChain),e?(ei.RouterController.replace("ProfileWallets"),eo.SnackController.showSuccess("New Wallet Added")):ei.RouterController.replace("Account")}}catch(t){let e=c.CoreHelperUtil.parseError(t);e?.includes("Invalid email")?this.error="Invalid email. Try again.":eo.SnackController.showError(t)}finally{this.loading=!1}}onFocusEvent(){B.EventsController.sendEvent({type:"track",event:"EMAIL_LOGIN_SELECTED"})}};im.styles=ip,ih([(0,o.property)()],im.prototype,"tabIdx",void 0),ih([(0,r.state)()],im.prototype,"email",void 0),ih([(0,r.state)()],im.prototype,"loading",void 0),ih([(0,r.state)()],im.prototype,"error",void 0),ih([(0,r.state)()],im.prototype,"remoteFeatures",void 0),ih([(0,r.state)()],im.prototype,"hasExceededUsageLimit",void 0),im=ih([(0,p.customElement)("w3m-email-login-widget")],im),e.i(29084);var iw=t,ig=e.i(28182);e.i(55934);var ib=t;e.i(96969);let iy=g.css`
  :host {
    display: block;
    width: 100%;
  }

  button {
    width: 100%;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  @media (hover: hover) {
    button:hover:enabled {
      background: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;var iC=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let iv=class extends ib.LitElement{constructor(){super(...arguments),this.logo="google",this.disabled=!1,this.tabIdx=void 0}render(){return i.html`
      <button ?disabled=${this.disabled} tabindex=${(0,n.ifDefined)(this.tabIdx)}>
        <wui-icon size="xxl" name=${this.logo}></wui-icon>
      </button>
    `}};iv.styles=[m.resetStyles,m.elementStyles,iy],iC([(0,o.property)()],iv.prototype,"logo",void 0),iC([(0,o.property)({type:Boolean})],iv.prototype,"disabled",void 0),iC([(0,o.property)()],iv.prototype,"tabIdx",void 0),iv=iC([(0,p.customElement)("wui-logo-select")],iv);var ix=e.i(42991);let i$=g.css`
  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1)
      ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }
`;var ik=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let iE=class extends iw.LitElement{constructor(){super(),this.unsubscribe=[],this.walletGuide="get-started",this.tabIdx=void 0,this.connectors=ee.ConnectorController.state.connectors,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.authConnector=this.connectors.find(e=>"AUTH"===e.type),this.isPwaLoading=!1,this.hasExceededUsageLimit=tF.ApiController.state.plan.hasExceededUsageLimit,this.unsubscribe.push(ee.ConnectorController.subscribeKey("connectors",e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>"AUTH"===e.type)}),u.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e),tF.ApiController.subscribeKey("plan",e=>this.hasExceededUsageLimit=e.hasExceededUsageLimit))}connectedCallback(){super.connectedCallback(),this.handlePwaFrameLoad()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html`
      <wui-flex
        class="container"
        flexDirection="column"
        gap="2"
        data-testid="w3m-social-login-widget"
      >
        ${this.topViewTemplate()}${this.bottomViewTemplate()}
      </wui-flex>
    `}topViewTemplate(){let e="explore"===this.walletGuide,t=this.remoteFeatures?.socials;return!t&&e?(t=et.ConstantsUtil.DEFAULT_SOCIALS,this.renderTopViewContent(t)):t?this.renderTopViewContent(t):null}renderTopViewContent(e){return 2===e.length?i.html` <wui-flex gap="2">
        ${e.slice(0,2).map(e=>i.html`<wui-logo-select
              data-testid=${`social-selector-${e}`}
              @click=${()=>{this.onSocialClick(e)}}
              logo=${e}
              tabIdx=${(0,n.ifDefined)(this.tabIdx)}
              ?disabled=${this.isPwaLoading||this.hasConnection()}
            ></wui-logo-select>`)}
      </wui-flex>`:i.html` <wui-list-button
      data-testid=${`social-selector-${e[0]}`}
      @click=${()=>{this.onSocialClick(e[0])}}
      size="lg"
      icon=${(0,n.ifDefined)(e[0])}
      text=${`Continue with ${w.UiHelperUtil.capitalize(e[0])}`}
      tabIdx=${(0,n.ifDefined)(this.tabIdx)}
      ?disabled=${this.isPwaLoading||this.hasConnection()}
    ></wui-list-button>`}bottomViewTemplate(){let e=this.remoteFeatures?.socials,t="explore"===this.walletGuide;return(this.authConnector&&e&&0!==e.length||!t||(e=et.ConstantsUtil.DEFAULT_SOCIALS),!e||e.length<=2)?null:e&&e.length>6?i.html`<wui-flex gap="2">
        ${e.slice(1,5).map(e=>i.html`<wui-logo-select
              data-testid=${`social-selector-${e}`}
              @click=${()=>{this.onSocialClick(e)}}
              logo=${e}
              tabIdx=${(0,n.ifDefined)(this.tabIdx)}
              ?focusable=${void 0!==this.tabIdx&&this.tabIdx>=0}
              ?disabled=${this.isPwaLoading||this.hasConnection()}
            ></wui-logo-select>`)}
        <wui-logo-select
          logo="more"
          tabIdx=${(0,n.ifDefined)(this.tabIdx)}
          @click=${this.onMoreSocialsClick.bind(this)}
          ?disabled=${this.isPwaLoading||this.hasConnection()}
          data-testid="social-selector-more"
        ></wui-logo-select>
      </wui-flex>`:e?i.html`<wui-flex gap="2">
      ${e.slice(1,e.length).map(e=>i.html`<wui-logo-select
            data-testid=${`social-selector-${e}`}
            @click=${()=>{this.onSocialClick(e)}}
            logo=${e}
            tabIdx=${(0,n.ifDefined)(this.tabIdx)}
            ?focusable=${void 0!==this.tabIdx&&this.tabIdx>=0}
            ?disabled=${this.isPwaLoading||this.hasConnection()}
          ></wui-logo-select>`)}
    </wui-flex>`:null}onMoreSocialsClick(){ei.RouterController.push("ConnectSocials")}async onSocialClick(e){if(this.hasExceededUsageLimit)return void ei.RouterController.push("UsageExceeded");if(!J.ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(e=>e===s.ChainController.state.activeChain)){let e=s.ChainController.getFirstCaipNetworkSupportsAuthConnector();if(e)return void ei.RouterController.push("SwitchNetwork",{network:e})}e&&await (0,ig.executeSocialLogin)(e)}async handlePwaFrameLoad(){if(c.CoreHelperUtil.isPWA()){this.isPwaLoading=!0;try{this.authConnector?.provider instanceof ix.W3mFrameProvider&&await this.authConnector.provider.init()}catch(e){id.AlertController.open({displayMessage:"Error loading embedded wallet in PWA",debugMessage:e.message},"error")}finally{this.isPwaLoading=!1}}}hasConnection(){return Z.ConnectionController.hasAnyConnection(J.ConstantsUtil.CONNECTOR_ID.AUTH)}};iE.styles=i$,ik([(0,o.property)()],iE.prototype,"walletGuide",void 0),ik([(0,o.property)()],iE.prototype,"tabIdx",void 0),ik([(0,r.state)()],iE.prototype,"connectors",void 0),ik([(0,r.state)()],iE.prototype,"remoteFeatures",void 0),ik([(0,r.state)()],iE.prototype,"authConnector",void 0),ik([(0,r.state)()],iE.prototype,"isPwaLoading",void 0),ik([(0,r.state)()],iE.prototype,"hasExceededUsageLimit",void 0),iE=ik([(0,p.customElement)("w3m-social-login-widget")],iE);var iS=t,iR=t;e.i(87789);var iA=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let iT=class extends iR.LitElement{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=ee.ConnectorController.state.connectors,this.count=tF.ApiController.state.count,this.filteredCount=tF.ApiController.state.filteredWallets.length,this.isFetchingRecommendedWallets=tF.ApiController.state.isFetchingRecommendedWallets,this.unsubscribe.push(ee.ConnectorController.subscribeKey("connectors",e=>this.connectors=e),tF.ApiController.subscribeKey("count",e=>this.count=e),tF.ApiController.subscribeKey("filteredWallets",e=>this.filteredCount=e.length),tF.ApiController.subscribeKey("isFetchingRecommendedWallets",e=>this.isFetchingRecommendedWallets=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.connectors.find(e=>"walletConnect"===e.id),{allWallets:t}=u.OptionsController.state;if(!e||"HIDE"===t||"ONLY_MOBILE"===t&&!c.CoreHelperUtil.isMobile())return null;let o=tF.ApiController.state.featured.length,r=this.count+o,a=r<10?r:10*Math.floor(r/10),l=this.filteredCount>0?this.filteredCount:a,s=`${l}`;this.filteredCount>0?s=`${this.filteredCount}`:l<r&&(s=`${l}+`);let d=Z.ConnectionController.hasAnyConnection(J.ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT);return i.html`
      <wui-list-wallet
        name="Search Wallet"
        walletIcon="search"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${s}
        tagVariant="info"
        data-testid="all-wallets"
        tabIdx=${(0,n.ifDefined)(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        ?disabled=${d}
        size="sm"
      ></wui-list-wallet>
    `}onAllWallets(){B.EventsController.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),ei.RouterController.push("AllWallets",{redirectView:ei.RouterController.state.data?.redirectView})}};iA([(0,o.property)()],iT.prototype,"tabIdx",void 0),iA([(0,r.state)()],iT.prototype,"connectors",void 0),iA([(0,r.state)()],iT.prototype,"count",void 0),iA([(0,r.state)()],iT.prototype,"filteredCount",void 0),iA([(0,r.state)()],iT.prototype,"isFetchingRecommendedWallets",void 0),iT=iA([(0,p.customElement)("w3m-all-wallets-widget")],iT);var iI=t;let iO=g.css`
  :host {
    margin-top: ${({spacing:e})=>e["1"]};
  }
  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1)
      ${({spacing:e})=>e["2"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }
`;var iN=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let iU=class extends iI.LitElement{constructor(){super(),this.unsubscribe=[],this.explorerWallets=tF.ApiController.state.explorerWallets,this.connections=Z.ConnectionController.state.connections,this.connectorImages=a.AssetController.state.connectorImages,this.loadingTelegram=!1,this.unsubscribe.push(Z.ConnectionController.subscribeKey("connections",e=>this.connections=e),a.AssetController.subscribeKey("connectorImages",e=>this.connectorImages=e),tF.ApiController.subscribeKey("explorerFilteredWallets",e=>{this.explorerWallets=e?.length?e:tF.ApiController.state.explorerWallets}),tF.ApiController.subscribeKey("explorerWallets",e=>{this.explorerWallets?.length||(this.explorerWallets=e)})),c.CoreHelperUtil.isTelegram()&&c.CoreHelperUtil.isIos()&&(this.loadingTelegram=!Z.ConnectionController.state.wcUri,this.unsubscribe.push(Z.ConnectionController.subscribeKey("wcUri",e=>this.loadingTelegram=!e)))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `}connectorListTemplate(){return eU.ConnectorUtil.connectorList().map((e,t)=>"connector"===e.kind?this.renderConnector(e,t):this.renderWallet(e,t))}getConnectorNamespaces(e){return"walletConnect"===e.subtype?[]:"multiChain"===e.subtype?e.connector.connectors?.map(e=>e.chain)||[]:[e.connector.chain]}renderConnector(e,t){let o,r,a=e.connector,s=l.AssetUtil.getConnectorImage(a)||this.connectorImages[a?.imageId??""],c=(this.connections.get(a.chain)??[]).some(e=>tc.HelpersUtil.isLowerCaseMatch(e.connectorId,a.id));"walletConnect"===e.subtype?(o="qr code",r="accent"):"injected"===e.subtype||"announced"===e.subtype?(o=c?"connected":"installed",r=c?"info":"success"):(o=void 0,r=void 0);let d=Z.ConnectionController.hasAnyConnection(J.ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT),u=("walletConnect"===e.subtype||"external"===e.subtype)&&d;return i.html`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${(0,n.ifDefined)(s)}
        .installed=${!0}
        name=${a.name??"Unknown"}
        .tagVariant=${r}
        tagLabel=${(0,n.ifDefined)(o)}
        data-testid=${`wallet-selector-${a.id.toLowerCase()}`}
        size="sm"
        @click=${()=>this.onClickConnector(e)}
        tabIdx=${(0,n.ifDefined)(this.tabIdx)}
        ?disabled=${u}
        rdnsId=${(0,n.ifDefined)(a.explorerWallet?.rdns||void 0)}
        walletRank=${(0,n.ifDefined)(a.explorerWallet?.order)}
        .namespaces=${this.getConnectorNamespaces(e)}
      >
      </w3m-list-wallet>
    `}onClickConnector(e){let t=ei.RouterController.state.data?.redirectView;if("walletConnect"===e.subtype){ee.ConnectorController.setActiveConnector(e.connector),c.CoreHelperUtil.isMobile()?ei.RouterController.push("AllWallets"):ei.RouterController.push("ConnectingWalletConnect",{redirectView:t});return}if("multiChain"===e.subtype){ee.ConnectorController.setActiveConnector(e.connector),ei.RouterController.push("ConnectingMultiChain",{redirectView:t});return}if("injected"===e.subtype){ee.ConnectorController.setActiveConnector(e.connector),ei.RouterController.push("ConnectingExternal",{connector:e.connector,redirectView:t,wallet:e.connector.explorerWallet});return}if("announced"===e.subtype)return"walletConnect"===e.connector.id?void(c.CoreHelperUtil.isMobile()?ei.RouterController.push("AllWallets"):ei.RouterController.push("ConnectingWalletConnect",{redirectView:t})):(ei.RouterController.push("ConnectingExternal",{connector:e.connector,redirectView:t,wallet:e.connector.explorerWallet}),void 0);ei.RouterController.push("ConnectingExternal",{connector:e.connector,redirectView:t})}renderWallet(e,t){let o=e.wallet,r=l.AssetUtil.getWalletImage(o),a=Z.ConnectionController.hasAnyConnection(J.ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT),s=this.loadingTelegram,c="recent"===e.subtype?"recent":void 0,d="recent"===e.subtype?"info":void 0;return i.html`
      <w3m-list-wallet
        displayIndex=${t}
        imageSrc=${(0,n.ifDefined)(r)}
        name=${o.name??"Unknown"}
        @click=${()=>this.onClickWallet(e)}
        size="sm"
        data-testid=${`wallet-selector-${o.id}`}
        tabIdx=${(0,n.ifDefined)(this.tabIdx)}
        ?loading=${s}
        ?disabled=${a}
        rdnsId=${(0,n.ifDefined)(o.rdns||void 0)}
        walletRank=${(0,n.ifDefined)(o.order)}
        tagLabel=${(0,n.ifDefined)(c)}
        .tagVariant=${d}
      >
      </w3m-list-wallet>
    `}onClickWallet(e){let t=ei.RouterController.state.data?.redirectView,i=s.ChainController.state.activeChain;if("featured"===e.subtype)return void ee.ConnectorController.selectWalletConnector(e.wallet);if("recent"===e.subtype){if(this.loadingTelegram)return;ee.ConnectorController.selectWalletConnector(e.wallet);return}if("custom"===e.subtype){if(this.loadingTelegram)return;ei.RouterController.push("ConnectingWalletConnect",{wallet:e.wallet,redirectView:t});return}if(this.loadingTelegram)return;let o=i?ee.ConnectorController.getConnector({id:e.wallet.id,namespace:i}):void 0;o?ei.RouterController.push("ConnectingExternal",{connector:o,redirectView:t}):ei.RouterController.push("ConnectingWalletConnect",{wallet:e.wallet,redirectView:t})}};iU.styles=iO,iN([(0,o.property)({type:Number})],iU.prototype,"tabIdx",void 0),iN([(0,r.state)()],iU.prototype,"explorerWallets",void 0),iN([(0,r.state)()],iU.prototype,"connections",void 0),iN([(0,r.state)()],iU.prototype,"connectorImages",void 0),iN([(0,r.state)()],iU.prototype,"loadingTelegram",void 0),iU=iN([(0,p.customElement)("w3m-connector-list")],iU);var iP=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let iD=class extends iS.LitElement{constructor(){super(...arguments),this.tabIdx=void 0}render(){return i.html`
      <wui-flex flexDirection="column" gap="2">
        <w3m-connector-list tabIdx=${(0,n.ifDefined)(this.tabIdx)}></w3m-connector-list>
        <w3m-all-wallets-widget tabIdx=${(0,n.ifDefined)(this.tabIdx)}></w3m-all-wallets-widget>
      </wui-flex>
    `}};iP([(0,o.property)()],iD.prototype,"tabIdx",void 0),iD=iP([(0,p.customElement)("w3m-wallet-login-list")],iD);let iL=g.css`
  :host {
    --connect-scroll--top-opacity: 0;
    --connect-scroll--bottom-opacity: 0;
    --connect-mask-image: none;
  }

  .connect {
    max-height: clamp(360px, 470px, 80vh);
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
    mask-image: var(--connect-mask-image);
  }

  .guide {
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
  }

  .connect::-webkit-scrollbar {
    display: none;
  }

  .all-wallets {
    flex-flow: column;
  }

  .connect.disabled,
  .guide.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }

  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }
`;var iW=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let ij=class extends it.LitElement{constructor(){super(),this.unsubscribe=[],this.connectors=ee.ConnectorController.state.connectors,this.authConnector=this.connectors.find(e=>"AUTH"===e.type),this.features=u.OptionsController.state.features,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.enableWallets=u.OptionsController.state.enableWallets,this.noAdapters=s.ChainController.state.noAdapters,this.walletGuide="get-started",this.checked=ii.OptionsStateController.state.isLegalCheckboxChecked,this.isEmailEnabled=this.remoteFeatures?.email&&!s.ChainController.state.noAdapters,this.isSocialEnabled=this.remoteFeatures?.socials&&this.remoteFeatures.socials.length>0&&!s.ChainController.state.noAdapters,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors),this.unsubscribe.push(ee.ConnectorController.subscribeKey("connectors",e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>"AUTH"===e.type),this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)}),u.OptionsController.subscribeKey("features",e=>{this.features=e}),u.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e,this.setEmailAndSocialEnableCheck(this.noAdapters,this.remoteFeatures)}),u.OptionsController.subscribeKey("enableWallets",e=>this.enableWallets=e),s.ChainController.subscribeKey("noAdapters",e=>this.setEmailAndSocialEnableCheck(e,this.remoteFeatures)),ii.OptionsStateController.subscribeKey("isLegalCheckboxChecked",e=>this.checked=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.resizeObserver?.disconnect();let e=this.shadowRoot?.querySelector(".connect");e?.removeEventListener("scroll",this.handleConnectListScroll.bind(this))}firstUpdated(){let e=this.shadowRoot?.querySelector(".connect");e&&(requestAnimationFrame(this.handleConnectListScroll.bind(this)),e?.addEventListener("scroll",this.handleConnectListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleConnectListScroll()}),this.resizeObserver?.observe(e),this.handleConnectListScroll())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=u.OptionsController.state,o=u.OptionsController.state.features?.legalCheckbox,r=!!(e||t)&&!!o&&"get-started"===this.walletGuide&&!this.checked,n=u.OptionsController.state.enableWalletGuide,a=this.enableWallets,l=this.isSocialEnabled||this.authConnector;return i.html`
      <wui-flex flexDirection="column">
        ${this.legalCheckboxTemplate()}
        <wui-flex
          data-testid="w3m-connect-scroll-view"
          flexDirection="column"
          .padding=${["0","0","4","0"]}
          class=${(0,e8.classMap)({connect:!0,disabled:r})}
        >
          <wui-flex
            class="connect-methods"
            flexDirection="column"
            gap="2"
            .padding=${l&&a&&n&&"get-started"===this.walletGuide?["0","3","0","3"]:["0","3","3","3"]}
          >
            ${this.renderConnectMethod(r?-1:void 0)}
          </wui-flex>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}reownBrandingTemplate(){return eH.HelpersUtil.hasFooter()||!this.remoteFeatures?.reownBranding?null:i.html`<wui-ux-by-reown></wui-ux-by-reown>`}setEmailAndSocialEnableCheck(e,t){this.isEmailEnabled=t?.email&&!e,this.isSocialEnabled=t?.socials&&t.socials.length>0&&!e,this.remoteFeatures=t,this.noAdapters=e}checkIfAuthEnabled(e){let t=e.filter(e=>e.type===is.ConstantsUtil.CONNECTOR_TYPE_AUTH).map(e=>e.chain);return J.ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(e=>t.includes(e))}renderConnectMethod(e){let t=tB.WalletUtil.getConnectOrderMethod(this.features,this.connectors);return i.html`${t.map((t,o)=>{switch(t){case"email":return i.html`${this.emailTemplate(e)} ${this.separatorTemplate(o,"email")}`;case"social":return i.html`${this.socialListTemplate(e)}
          ${this.separatorTemplate(o,"social")}`;case"wallet":return i.html`${this.walletListTemplate(e)}
          ${this.separatorTemplate(o,"wallet")}`;default:return null}})}`}checkMethodEnabled(e){switch(e){case"wallet":return this.enableWallets;case"social":return this.isSocialEnabled&&this.isAuthEnabled;case"email":return this.isEmailEnabled&&this.isAuthEnabled;default:return null}}checkIsThereNextMethod(e){let t=tB.WalletUtil.getConnectOrderMethod(this.features,this.connectors)[e+1];return t?this.checkMethodEnabled(t)?t:this.checkIsThereNextMethod(e+1):void 0}separatorTemplate(e,t){let o=this.checkIsThereNextMethod(e),r="explore"===this.walletGuide;switch(t){case"wallet":return this.enableWallets&&o&&!r?i.html`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`:null;case"email":return this.isAuthEnabled&&this.isEmailEnabled&&"social"!==o&&o?i.html`<wui-separator
              data-testid="w3m-email-login-or-separator"
              text="or"
            ></wui-separator>`:null;case"social":return this.isAuthEnabled&&this.isSocialEnabled&&"email"!==o&&o?i.html`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`:null;default:return null}}emailTemplate(e){return this.isEmailEnabled&&this.isAuthEnabled?i.html`<w3m-email-login-widget tabIdx=${(0,n.ifDefined)(e)}></w3m-email-login-widget>`:null}socialListTemplate(e){return this.isSocialEnabled&&this.isAuthEnabled?i.html`<w3m-social-login-widget
      walletGuide=${this.walletGuide}
      tabIdx=${(0,n.ifDefined)(e)}
    ></w3m-social-login-widget>`:null}walletListTemplate(e){let t=this.enableWallets,o=this.features?.emailShowWallets===!1,r=this.features?.collapseWallets;return t?(c.CoreHelperUtil.isTelegram()&&(c.CoreHelperUtil.isSafari()||c.CoreHelperUtil.isIos())&&Z.ConnectionController.connectWalletConnect().catch(e=>({})),"explore"===this.walletGuide)?null:this.isAuthEnabled&&(this.isEmailEnabled||this.isSocialEnabled)&&(o||r)?i.html`<wui-list-button
        data-testid="w3m-collapse-wallets-button"
        tabIdx=${(0,n.ifDefined)(e)}
        @click=${this.onContinueWalletClick.bind(this)}
        text="Continue with a wallet"
        icon="wallet"
      ></wui-list-button>`:i.html`<w3m-wallet-login-list tabIdx=${(0,n.ifDefined)(e)}></w3m-wallet-login-list>`:null}legalCheckboxTemplate(){return"explore"===this.walletGuide?null:i.html`<w3m-legal-checkbox data-testid="w3m-legal-checkbox"></w3m-legal-checkbox>`}handleConnectListScroll(){let e=this.shadowRoot?.querySelector(".connect");e&&(e.scrollHeight>470?(e.style.setProperty("--connect-mask-image",`linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
          black 100px,
          black calc(100% - 100px),
          rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
        )`),e.style.setProperty("--connect-scroll--top-opacity",te.MathUtil.interpolate([0,50],[0,1],e.scrollTop).toString()),e.style.setProperty("--connect-scroll--bottom-opacity",te.MathUtil.interpolate([0,50],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString())):(e.style.setProperty("--connect-mask-image","none"),e.style.setProperty("--connect-scroll--top-opacity","0"),e.style.setProperty("--connect-scroll--bottom-opacity","0")))}onContinueWalletClick(){ei.RouterController.push("ConnectWallets")}};ij.styles=iL,iW([(0,r.state)()],ij.prototype,"connectors",void 0),iW([(0,r.state)()],ij.prototype,"authConnector",void 0),iW([(0,r.state)()],ij.prototype,"features",void 0),iW([(0,r.state)()],ij.prototype,"remoteFeatures",void 0),iW([(0,r.state)()],ij.prototype,"enableWallets",void 0),iW([(0,r.state)()],ij.prototype,"noAdapters",void 0),iW([(0,o.property)()],ij.prototype,"walletGuide",void 0),iW([(0,r.state)()],ij.prototype,"checked",void 0),iW([(0,r.state)()],ij.prototype,"isEmailEnabled",void 0),iW([(0,r.state)()],ij.prototype,"isSocialEnabled",void 0),iW([(0,r.state)()],ij.prototype,"isAuthEnabled",void 0),ij=iW([(0,p.customElement)("w3m-connect-view")],ij),e.s(["W3mConnectView",0,ij],28218);var iz=e.i(83075),iF=e.i(92279),iB=t,i_=e.i(39403);e.i(10380),e.i(95157);var iH=t,iM=t;let iV=g.css`
  wui-flex {
    width: 100%;
    height: 52px;
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding-left: ${({spacing:e})=>e[3]};
    padding-right: ${({spacing:e})=>e[3]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[6]};
  }

  wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-icon {
    width: 12px;
    height: 12px;
  }
`;var iK=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let iq=class extends iM.LitElement{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return i.html`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="inherit">${this.label}</wui-text>
        <wui-button variant="accent-secondary" size="sm">
          ${this.buttonLabel}
          <wui-icon name="chevronRight" color="inherit" size="inherit" slot="iconRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};iq.styles=[m.resetStyles,m.elementStyles,iV],iK([(0,o.property)({type:Boolean})],iq.prototype,"disabled",void 0),iK([(0,o.property)()],iq.prototype,"label",void 0),iK([(0,o.property)()],iq.prototype,"buttonLabel",void 0),iq=iK([(0,p.customElement)("wui-cta-button")],iq);let iG=g.css`
  :host {
    display: block;
    padding: 0 ${({spacing:e})=>e["5"]} ${({spacing:e})=>e["5"]};
  }
`;var iX=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let iY=class extends iH.LitElement{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;let{name:e,app_store:t,play_store:o,chrome_store:r,homepage:n}=this.wallet,a=c.CoreHelperUtil.isMobile(),l=c.CoreHelperUtil.isIos(),s=c.CoreHelperUtil.isAndroid(),d=[t,o,n,r].filter(Boolean).length>1,u=w.UiHelperUtil.getTruncateString({string:e,charsStart:12,charsEnd:0,truncate:"end"});return d&&!a?i.html`
        <wui-cta-button
          label=${`Don't have ${u}?`}
          buttonLabel="Get"
          @click=${()=>ei.RouterController.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!d&&n?i.html`
        <wui-cta-button
          label=${`Don't have ${u}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:t&&l?i.html`
        <wui-cta-button
          label=${`Don't have ${u}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:o&&s?i.html`
        <wui-cta-button
          label=${`Don't have ${u}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){this.wallet?.app_store&&c.CoreHelperUtil.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&c.CoreHelperUtil.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&c.CoreHelperUtil.openHref(this.wallet.homepage,"_blank")}};iY.styles=[iG],iX([(0,o.property)({type:Object})],iY.prototype,"wallet",void 0),iY=iX([(0,p.customElement)("w3m-mobile-download-links")],iY);let iQ=g.css`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-wallet-image {
    width: 56px;
    height: 56px;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e["1"]} * -1);
    bottom: calc(${({spacing:e})=>e["1"]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: ${({durations:e})=>e.lg};
    transition-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e["4"]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e["ease-out-power-2"]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  w3m-mobile-download-links {
    padding: 0px;
    width: 100%;
  }
`;var iJ=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};class iZ extends iB.LitElement{constructor(){super(),this.wallet=ei.RouterController.state.data?.wallet,this.connector=ei.RouterController.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=l.AssetUtil.getConnectorImage(this.connector)??l.AssetUtil.getWalletImage(this.wallet),this.name=this.wallet?.name??this.connector?.name??"Wallet",this.isRetrying=!1,this.uri=Z.ConnectionController.state.wcUri,this.error=Z.ConnectionController.state.wcError,this.ready=!1,this.showRetry=!1,this.label=void 0,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(Z.ConnectionController.subscribeKey("wcUri",e=>{this.uri=e,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),Z.ConnectionController.subscribeKey("wcError",e=>this.error=e)),(c.CoreHelperUtil.isTelegram()||c.CoreHelperUtil.isSafari())&&c.CoreHelperUtil.isIos()&&Z.ConnectionController.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),Z.ConnectionController.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();let e=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel,t="";return this.label?t=this.label:(t=`Continue in ${this.name}`,this.error&&(t="Connection declined")),i.html`
      <wui-flex
        data-error=${(0,n.ifDefined)(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${(0,n.ifDefined)(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="6"> <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["2","0","0","0"]}
        >
          <wui-text align="center" variant="lg-medium" color=${this.error?"error":"primary"}>
            ${t}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">${e}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?i.html`
                <wui-button
                  variant="neutral-secondary"
                  size="md"
                  ?disabled=${this.isRetrying||this.isLoading}
                  @click=${this.onTryAgain.bind(this)}
                  data-testid="w3m-connecting-widget-secondary-button"
                >
                  <wui-icon
                    color="inherit"
                    slot="iconLeft"
                    name=${this.secondaryBtnIcon}
                  ></wui-icon>
                  ${this.secondaryBtnLabel}
                </wui-button>
              `:null}
      </wui-flex>

      ${this.isWalletConnect?i.html`
              <wui-flex .padding=${["0","5","5","5"]} justifyContent="center">
                <wui-link
                  @click=${this.onCopyUri}
                  variant="secondary"
                  icon="copy"
                  data-testid="wui-link-copy"
                >
                  Copy link
                </wui-link>
              </wui-flex>
            `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links></wui-flex>
      </wui-flex>
    `}onShowRetry(){if(this.error&&!this.showRetry){this.showRetry=!0;let e=this.shadowRoot?.querySelector("wui-button");e?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"})}}onTryAgain(){Z.ConnectionController.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){let e=i_.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return i.html`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(c.CoreHelperUtil.copyToClopboard(this.uri),eo.SnackController.showSuccess("Link copied"))}catch{eo.SnackController.showError("Failed to copy")}}}iZ.styles=iQ,iJ([(0,r.state)()],iZ.prototype,"isRetrying",void 0),iJ([(0,r.state)()],iZ.prototype,"uri",void 0),iJ([(0,r.state)()],iZ.prototype,"error",void 0),iJ([(0,r.state)()],iZ.prototype,"ready",void 0),iJ([(0,r.state)()],iZ.prototype,"showRetry",void 0),iJ([(0,r.state)()],iZ.prototype,"label",void 0),iJ([(0,r.state)()],iZ.prototype,"secondaryBtnLabel",void 0),iJ([(0,r.state)()],iZ.prototype,"secondaryLabel",void 0),iJ([(0,r.state)()],iZ.prototype,"isLoading",void 0),iJ([(0,o.property)({type:Boolean})],iZ.prototype,"isMobile",void 0),iJ([(0,o.property)()],iZ.prototype,"onRetry",void 0);let i0=class extends iZ{constructor(){if(super(),this.externalViewUnsubscribe=[],this.connectionsByNamespace=Z.ConnectionController.getConnections(this.connector?.chain),this.hasMultipleConnections=this.connectionsByNamespace.length>0,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.currentActiveConnectorId=ee.ConnectorController.state.activeConnectorIds[this.connector?.chain],!this.connector)throw Error("w3m-connecting-view: No connector provided");const e=this.connector?.chain;this.isAlreadyConnected(this.connector)&&(this.secondaryBtnLabel=void 0,this.label=`This account is already linked, change your account in ${this.connector.name}`,this.secondaryLabel=`To link a new account, open ${this.connector.name} and switch to the account you want to link`),B.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.connector.name??"Unknown",platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:ei.RouterController.state.view}}),this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),this.isWalletConnect=!1,this.externalViewUnsubscribe.push(ee.ConnectorController.subscribeKey("activeConnectorIds",t=>{let i=t[e],o=this.remoteFeatures?.multiWallet,{redirectView:r}=ei.RouterController.state.data??{};i!==this.currentActiveConnectorId&&(this.hasMultipleConnections&&o?(ei.RouterController.replace("ProfileWallets"),eo.SnackController.showSuccess("New Wallet Added")):r?ei.RouterController.replace(r):d.ModalController.close())}),Z.ConnectionController.subscribeKey("connections",this.onConnectionsChange.bind(this)))}disconnectedCallback(){this.externalViewUnsubscribe.forEach(e=>e())}async onConnectProxy(){try{if(this.error=!1,this.connector){if(this.isAlreadyConnected(this.connector))return;this.connector.id===J.ConstantsUtil.CONNECTOR_ID.COINBASE_SDK&&this.error||await Z.ConnectionController.connectExternal(this.connector,this.connector.chain)}}catch(e){e instanceof iF.AppKitError&&e.originalName===iz.ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?B.EventsController.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):B.EventsController.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),this.error=!0}}onConnectionsChange(e){if(this.connector?.chain&&e.get(this.connector.chain)&&this.isAlreadyConnected(this.connector)){let t=e.get(this.connector.chain)??[],i=this.remoteFeatures?.multiWallet;if(0===t.length)ei.RouterController.replace("Connect");else{let e=e9.ConnectionControllerUtil.getConnectionsByConnectorId(this.connectionsByNamespace,this.connector.id).flatMap(e=>e.accounts),o=e9.ConnectionControllerUtil.getConnectionsByConnectorId(t,this.connector.id).flatMap(e=>e.accounts);0===o.length?this.hasMultipleConnections&&i?(ei.RouterController.replace("ProfileWallets"),eo.SnackController.showSuccess("Wallet deleted")):d.ModalController.close():!e.every(e=>o.some(t=>tc.HelpersUtil.isLowerCaseMatch(e.address,t.address)))&&i&&ei.RouterController.replace("ProfileWallets")}}}isAlreadyConnected(e){return!!e&&this.connectionsByNamespace.some(t=>tc.HelpersUtil.isLowerCaseMatch(t.connectorId,e.id))}};i0=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-connecting-external-view")],i0),e.s(["W3mConnectingExternalView",0,i0],17283);var i3=t;let i1=E.css`
  wui-flex,
  wui-list-wallet {
    width: 100%;
  }
`;var i2=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let i5=class extends i3.LitElement{constructor(){super(),this.unsubscribe=[],this.activeConnector=ee.ConnectorController.state.activeConnector,this.unsubscribe.push(ee.ConnectorController.subscribeKey("activeConnector",e=>this.activeConnector=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["3","5","5","5"]}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image
            size="lg"
            imageSrc=${(0,n.ifDefined)(l.AssetUtil.getConnectorImage(this.activeConnector))}
          ></wui-wallet-image>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["0","3","0","3"]}
        >
          <wui-text variant="lg-medium" color="primary">
            Select Chain for ${this.activeConnector?.name}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary"
            >Select which chain to connect to your multi chain wallet</wui-text
          >
        </wui-flex>
        <wui-flex
          flexGrow="1"
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["2","0","2","0"]}
        >
          ${this.networksTemplate()}
        </wui-flex>
      </wui-flex>
    `}networksTemplate(){return this.activeConnector?.connectors?.map((e,t)=>e.name?i.html`
            <w3m-list-wallet
              displayIndex=${t}
              imageSrc=${(0,n.ifDefined)(l.AssetUtil.getChainImage(e.chain))}
              name=${J.ConstantsUtil.CHAIN_NAME_MAP[e.chain]}
              @click=${()=>this.onConnector(e)}
              size="sm"
              data-testid="wui-list-chain-${e.chain}"
              rdnsId=${e.explorerWallet?.rdns}
            ></w3m-list-wallet>
          `:null)}onConnector(e){let t=this.activeConnector?.connectors?.find(t=>t.chain===e.chain),i=ei.RouterController.state.data?.redirectView;t?"walletConnect"===t.id?c.CoreHelperUtil.isMobile()?ei.RouterController.push("AllWallets"):ei.RouterController.push("ConnectingWalletConnect",{redirectView:i}):ei.RouterController.push("ConnectingExternal",{connector:t,redirectView:i,wallet:this.activeConnector?.explorerWallet}):eo.SnackController.showError("Failed to find connector")}};i5.styles=i1,i2([(0,r.state)()],i5.prototype,"activeConnector",void 0),i5=i2([(0,p.customElement)("w3m-connecting-multi-chain-view")],i5),e.s(["W3mConnectingMultiChainView",0,i5],4356);var i4=t,i6=e.i(11249),i8=e.i(34523),i7=t,i9=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let oe=class extends i7.LitElement{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.generateTabs();return i.html`
      <wui-flex justifyContent="center" .padding=${["0","0","4","0"]}>
        <wui-tabs .tabs=${e} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){let e=this.platforms.map(e=>{if("browser"===e)return{label:"Browser",icon:"extension",platform:"browser"};if("mobile"===e)return{label:"Mobile",icon:"mobile",platform:"mobile"};if("qrcode"===e)return{label:"Mobile",icon:"mobile",platform:"qrcode"};if("web"===e)return{label:"Webapp",icon:"browser",platform:"web"};if("desktop"===e)return{label:"Desktop",icon:"desktop",platform:"desktop"};return{label:"Browser",icon:"extension",platform:"unsupported"}});return this.platformTabs=e.map(({platform:e})=>e),e}onTabChange(e){let t=this.platformTabs[e];t&&this.onSelectPlatfrom?.(t)}};i9([(0,o.property)({type:Array})],oe.prototype,"platforms",void 0),i9([(0,o.property)()],oe.prototype,"onSelectPlatfrom",void 0),oe=i9([(0,p.customElement)("w3m-connecting-header")],oe);let ot=class extends iZ{constructor(){if(super(),!this.wallet)throw Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),B.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:ei.RouterController.state.view}})}async onConnectProxy(){try{this.error=!1;let{connectors:e}=ee.ConnectorController.state,t=e.find(e=>"ANNOUNCED"===e.type&&e.info?.rdns===this.wallet?.rdns||"INJECTED"===e.type||e.name===this.wallet?.name);if(t)await Z.ConnectionController.connectExternal(t,t.chain);else throw Error("w3m-connecting-wc-browser: No connector found");d.ModalController.close()}catch(e){e instanceof iF.AppKitError&&e.originalName===iz.ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?B.EventsController.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):B.EventsController.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),this.error=!0}}};ot=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-connecting-wc-browser")],ot);let oi=class extends iZ{constructor(){if(super(),!this.wallet)throw Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),B.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:ei.RouterController.state.view}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;let{desktop_link:e,name:t}=this.wallet,{redirect:i,href:o}=c.CoreHelperUtil.formatNativeUrl(e,this.uri);Z.ConnectionController.setWcLinking({name:t,href:o}),Z.ConnectionController.setRecentWallet(this.wallet),c.CoreHelperUtil.openHref(i,"_blank")}catch{this.error=!0}}};oi=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-connecting-wc-desktop")],oi);var oo=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let or=class extends iZ{constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=u.OptionsController.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{e9.ConnectionControllerUtil.onConnectMobile(this.wallet)},!this.wallet)throw Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=et.ConstantsUtil.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(Z.ConnectionController.subscribeKey("wcUri",()=>{this.onHandleURI()})),B.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:ei.RouterController.state.view}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){Z.ConnectionController.setWcError(!1),this.onConnect?.()}};oo([(0,r.state)()],or.prototype,"redirectDeeplink",void 0),oo([(0,r.state)()],or.prototype,"redirectUniversalLink",void 0),oo([(0,r.state)()],or.prototype,"target",void 0),oo([(0,r.state)()],or.prototype,"preferUniversalLinks",void 0),oo([(0,r.state)()],or.prototype,"isLoading",void 0),or=oo([(0,p.customElement)("w3m-connecting-wc-mobile")],or),e.i(32965);let on=g.css`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var oa=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let ol=class extends iZ{constructor(){super(),this.basic=!1}firstUpdated(){this.basic||B.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet?.name??"WalletConnect",platform:"qrcode",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:ei.RouterController.state.view}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(e=>e())}render(){return this.onRenderProxy(),i.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["0","5","5","5"]}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0)}qrCodeTemplate(){if(!this.uri||!this.ready)return null;let e=this.wallet?this.wallet.name:void 0;Z.ConnectionController.setWcLinking(void 0),Z.ConnectionController.setRecentWallet(this.wallet);let t=i_.ThemeController.state.themeVariables["--apkt-qr-color"]??i_.ThemeController.state.themeVariables["--w3m-qr-color"];return i.html` <wui-qr-code
      theme=${i_.ThemeController.state.themeMode}
      uri=${this.uri}
      imageSrc=${(0,n.ifDefined)(l.AssetUtil.getWalletImage(this.wallet))}
      color=${(0,n.ifDefined)(t)}
      alt=${(0,n.ifDefined)(e)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){let e=!this.uri||!this.ready;return i.html`<wui-button
      .disabled=${e}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`}};ol.styles=on,oa([(0,o.property)({type:Boolean})],ol.prototype,"basic",void 0),ol=oa([(0,p.customElement)("w3m-connecting-wc-qrcode")],ol);var os=t;let oc=class extends os.LitElement{constructor(){if(super(),this.wallet=ei.RouterController.state.data?.wallet,!this.wallet)throw Error("w3m-connecting-wc-unsupported: No wallet provided");B.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:ei.RouterController.state.view}})}render(){return i.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${(0,n.ifDefined)(l.AssetUtil.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};oc=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-connecting-wc-unsupported")],oc);var od=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let ou=class extends iZ{constructor(){if(super(),this.isLoading=!0,!this.wallet)throw Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=et.ConstantsUtil.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(Z.ConnectionController.subscribeKey("wcUri",()=>{this.updateLoadingState()})),B.EventsController.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:ei.RouterController.state.view}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;let{webapp_link:e,name:t}=this.wallet,{redirect:i,href:o}=c.CoreHelperUtil.formatUniversalUrl(e,this.uri);Z.ConnectionController.setWcLinking({name:t,href:o}),Z.ConnectionController.setRecentWallet(this.wallet),c.CoreHelperUtil.openHref(i,"_blank")}catch{this.error=!0}}};od([(0,r.state)()],ou.prototype,"isLoading",void 0),ou=od([(0,p.customElement)("w3m-connecting-wc-web")],ou);let op=g.css`
  :host([data-mobile-fullscreen='true']) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :host([data-mobile-fullscreen='true']) wui-ux-by-reown {
    margin-top: auto;
  }
`;var oh=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let om=class extends i4.LitElement{constructor(){super(),this.wallet=ei.RouterController.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!u.OptionsController.state.siwx,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.displayBranding=!0,this.basic=!1,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(u.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return u.OptionsController.state.enableMobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),i.html`
      ${this.headerTemplate()}
      <div class="platform-container">${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding&&this.displayBranding?i.html`<wui-ux-by-reown></wui-ux-by-reown>`:null}async initializeConnection(e=!1){if("browser"!==this.platform&&(!u.OptionsController.state.manualWCControl||e))try{let{wcPairingExpiry:t,status:i}=Z.ConnectionController.state,{redirectView:o}=ei.RouterController.state.data??{};if(e||u.OptionsController.state.enableEmbedded||c.CoreHelperUtil.isPairingExpired(t)||"connecting"===i){let e=Z.ConnectionController.getConnections(s.ChainController.state.activeChain),t=this.remoteFeatures?.multiWallet,i=e.length>0;await Z.ConnectionController.connectWalletConnect({cache:"never"}),this.isSiwxEnabled||(i&&t?(ei.RouterController.replace("ProfileWallets"),eo.SnackController.showSuccess("New Wallet Added")):o?ei.RouterController.replace(o):d.ModalController.close())}}catch(e){if(e instanceof Error&&e.message.includes("An error occurred when attempting to switch chain")&&!u.OptionsController.state.enableNetworkSwitch&&s.ChainController.state.activeChain){s.ChainController.setActiveCaipNetwork(i8.CaipNetworksUtil.getUnsupportedNetwork(`${s.ChainController.state.activeChain}:${s.ChainController.state.activeCaipNetwork?.id}`)),s.ChainController.showUnsupportedChainUI();return}e instanceof iF.AppKitError&&e.originalName===iz.ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?B.EventsController.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):B.EventsController.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),Z.ConnectionController.setWcError(!0),eo.SnackController.showError(e.message??"Connection error"),Z.ConnectionController.resetWcConnection(),ei.RouterController.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push("qrcode"),this.platform="qrcode";return}if(this.platform)return;let{mobile_link:e,desktop_link:t,webapp_link:i,injected:o,rdns:r}=this.wallet,n=o?.map(({injected_id:e})=>e).filter(Boolean),a=[...r?[r]:n??[]],l=!u.OptionsController.state.isUniversalProvider&&a.length,d=Z.ConnectionController.checkInstalled(a),p=l&&d,h=t&&!c.CoreHelperUtil.isMobile();p&&!s.ChainController.state.noAdapters&&this.platforms.push("browser"),e&&this.platforms.push(c.CoreHelperUtil.isMobile()?"mobile":"qrcode"),i&&this.platforms.push("web"),h&&this.platforms.push("desktop");let m=i6.MobileWalletUtil.isCustomDeeplinkWallet(this.wallet.id,s.ChainController.state.activeChain);p||!l||s.ChainController.state.noAdapters||m||this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return i.html`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return i.html`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return i.html`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case"mobile":return i.html`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case"qrcode":return i.html`<w3m-connecting-wc-qrcode ?basic=${this.basic}></w3m-connecting-wc-qrcode>`;default:return i.html`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?i.html`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(e){let t=this.shadowRoot?.querySelector("div");t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=e,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};om.styles=op,oh([(0,r.state)()],om.prototype,"platform",void 0),oh([(0,r.state)()],om.prototype,"platforms",void 0),oh([(0,r.state)()],om.prototype,"isSiwxEnabled",void 0),oh([(0,r.state)()],om.prototype,"remoteFeatures",void 0),oh([(0,o.property)({type:Boolean})],om.prototype,"displayBranding",void 0),oh([(0,o.property)({type:Boolean})],om.prototype,"basic",void 0),om=oh([(0,p.customElement)("w3m-connecting-wc-view")],om),e.s(["W3mConnectingWcView",0,om],90344);var ow=t,og=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let of=class extends ow.LitElement{constructor(){super(),this.unsubscribe=[],this.isMobile=c.CoreHelperUtil.isMobile(),this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.unsubscribe.push(u.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(this.isMobile){let{featured:e,recommended:t}=tF.ApiController.state,{customWallets:o}=u.OptionsController.state,r=ec.StorageUtil.getRecentWallets(),n=e.length||t.length||o?.length||r.length;return i.html`<wui-flex flexDirection="column" gap="2" .margin=${["1","3","3","3"]}>
        ${n?i.html`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return i.html`<wui-flex flexDirection="column" .padding=${["0","0","4","0"]}>
        <w3m-connecting-wc-view ?basic=${!0} .displayBranding=${!1}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${["0","3","0","3"]}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?i.html` <wui-flex flexDirection="column" .padding=${["1","0","1","0"]}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`:null}};og([(0,r.state)()],of.prototype,"isMobile",void 0),og([(0,r.state)()],of.prototype,"remoteFeatures",void 0),of=og([(0,p.customElement)("w3m-connecting-wc-basic-view")],of),e.s(["W3mConnectingWcBasicView",0,of],12639);var ob=t,oy=e.i(76599);let oC=E.css`
  .continue-button-container {
    width: 100%;
  }
`;var ov=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let ox=class extends ob.LitElement{constructor(){super(...arguments),this.loading=!1}render(){return i.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="6"
        .padding=${["0","0","4","0"]}
      >
        ${this.onboardingTemplate()} ${this.buttonsTemplate()}
        <wui-link
          @click=${()=>{c.CoreHelperUtil.openHref(oy.NavigationUtil.URLS.FAQ,"_blank")}}
        >
          Learn more about names
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-link>
      </wui-flex>
    `}onboardingTemplate(){return i.html` <wui-flex
      flexDirection="column"
      gap="6"
      alignItems="center"
      .padding=${["0","6","0","6"]}
    >
      <wui-flex gap="3" alignItems="center" justifyContent="center">
        <wui-icon-box icon="id" size="xl" iconSize="xxl" color="default"></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="3">
        <wui-text align="center" variant="lg-medium" color="primary">
          Choose your account name
        </wui-text>
        <wui-text align="center" variant="md-regular" color="primary">
          Finally say goodbye to 0x addresses, name your account to make it easier to exchange
          assets
        </wui-text>
      </wui-flex>
    </wui-flex>`}buttonsTemplate(){return i.html`<wui-flex
      .padding=${["0","8","0","8"]}
      gap="3"
      class="continue-button-container"
    >
      <wui-button
        fullWidth
        .loading=${this.loading}
        size="lg"
        borderRadius="xs"
        @click=${this.handleContinue.bind(this)}
        >Choose name
      </wui-button>
    </wui-flex>`}handleContinue(){ei.RouterController.push("RegisterAccountName"),B.EventsController.sendEvent({type:"track",event:"OPEN_ENS_FLOW",properties:{isSmartAccount:(0,ef.getPreferredAccountType)(s.ChainController.state.activeChain)===eA.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT}})}};ox.styles=oC,ov([(0,r.state)()],ox.prototype,"loading",void 0),ox=ov([(0,p.customElement)("w3m-choose-account-name-view")],ox),e.s(["W3mChooseAccountNameView",0,ox],69783);var o$=t;let ok=class extends o$.LitElement{constructor(){super(...arguments),this.wallet=ei.RouterController.state.data?.wallet}render(){if(!this.wallet)throw Error("w3m-downloads-view");return i.html`
      <wui-flex gap="2" flexDirection="column" .padding=${["3","3","4","3"]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?i.html`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?i.html`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?i.html`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?i.html`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `:null}openStore(e){e.href&&this.wallet&&(B.EventsController.sendEvent({type:"track",event:"GET_WALLET",properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.wallet.id,type:e.type}}),c.CoreHelperUtil.openHref(e.href,"_blank"))}onChromeStore(){this.wallet?.chrome_store&&this.openStore({href:this.wallet.chrome_store,type:"chrome_store"})}onAppStore(){this.wallet?.app_store&&this.openStore({href:this.wallet.app_store,type:"app_store"})}onPlayStore(){this.wallet?.play_store&&this.openStore({href:this.wallet.play_store,type:"play_store"})}onHomePage(){this.wallet?.homepage&&this.openStore({href:this.wallet.homepage,type:"homepage"})}};ok=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-downloads-view")],ok),e.s(["W3mDownloadsView",0,ok],8201);var oE=t;let oS=class extends oE.LitElement{render(){return i.html`
      <wui-flex flexDirection="column" .padding=${["0","3","3","3"]} gap="2">
        ${this.recommendedWalletsTemplate()}
        <w3m-list-wallet
          name="Explore all"
          showAllWallets
          walletIcon="allWallets"
          icon="externalLink"
          size="sm"
          @click=${()=>{c.CoreHelperUtil.openHref("https://walletconnect.com/explorer?type=wallet","_blank")}}
        ></w3m-list-wallet>
      </wui-flex>
    `}recommendedWalletsTemplate(){let{recommended:e,featured:t}=tF.ApiController.state,{customWallets:o}=u.OptionsController.state;return[...t,...o??[],...e].slice(0,4).map((e,t)=>i.html`
        <w3m-list-wallet
          displayIndex=${t}
          name=${e.name??"Unknown"}
          tagVariant="accent"
          size="sm"
          imageSrc=${(0,n.ifDefined)(l.AssetUtil.getWalletImage(e))}
          @click=${()=>{this.onWalletClick(e)}}
        ></w3m-list-wallet>
      `)}onWalletClick(e){B.EventsController.sendEvent({type:"track",event:"GET_WALLET",properties:{name:e.name,walletRank:void 0,explorerId:e.id,type:"homepage"}}),c.CoreHelperUtil.openHref(e.homepage??"https://walletconnect.com/explorer","_blank")}};oS=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-get-wallet-view")],oS),e.s(["W3mGetWalletView",0,oS],64077);var oR=t,oA=t;e.i(57650);var oT=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let oI=class extends oA.LitElement{constructor(){super(...arguments),this.data=[]}render(){return i.html`
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        ${this.data.map(e=>i.html`
            <wui-flex flexDirection="column" alignItems="center" gap="5">
              <wui-flex flexDirection="row" justifyContent="center" gap="1">
                ${e.images.map(e=>i.html`<wui-visual size="sm" name=${e}></wui-visual>`)}
              </wui-flex>
            </wui-flex>
            <wui-flex flexDirection="column" alignItems="center" gap="1">
              <wui-text variant="md-regular" color="primary" align="center">${e.title}</wui-text>
              <wui-text variant="sm-regular" color="secondary" align="center"
                >${e.text}</wui-text
              >
            </wui-flex>
          `)}
      </wui-flex>
    `}};oT([(0,o.property)({type:Array})],oI.prototype,"data",void 0),oI=oT([(0,p.customElement)("w3m-help-widget")],oI);let oO=[{images:["login","profile","lock"],title:"One login for all of web3",text:"Log in to any app by connecting your wallet. Say goodbye to countless passwords!"},{images:["defi","nft","eth"],title:"A home for your digital assets",text:"A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs."},{images:["browser","noun","dao"],title:"Your gateway to a new web",text:"With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more."}],oN=class extends oR.LitElement{render(){return i.html`
      <wui-flex
        flexDirection="column"
        .padding=${["6","5","5","5"]}
        alignItems="center"
        gap="5"
      >
        <w3m-help-widget .data=${oO}></w3m-help-widget>
        <wui-button variant="accent-primary" size="md" @click=${this.onGetWallet.bind(this)}>
          <wui-icon color="inherit" slot="iconLeft" name="wallet"></wui-icon>
          Get a wallet
        </wui-button>
      </wui-flex>
    `}onGetWallet(){B.EventsController.sendEvent({type:"track",event:"CLICK_GET_WALLET_HELP"}),ei.RouterController.push("GetWallet")}};oN=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-what-is-a-wallet-view")],oN),e.s(["W3mWhatIsAWalletView",0,oN],67772);var oU=t;let oP=g.css`
  wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
  }
  wui-flex::-webkit-scrollbar {
    display: none;
  }
  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`;var oD=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let oL=class extends oU.LitElement{constructor(){super(),this.unsubscribe=[],this.checked=ii.OptionsStateController.state.isLegalCheckboxChecked,this.unsubscribe.push(ii.OptionsStateController.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=u.OptionsController.state,o=u.OptionsController.state.features?.legalCheckbox,r=!!(e||t)&&!!o,a=r&&!this.checked;return i.html`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${r?["0","3","3","3"]:"3"}
        gap="2"
        class=${(0,n.ifDefined)(a?"disabled":void 0)}
      >
        <w3m-wallet-login-list tabIdx=${(0,n.ifDefined)(a?-1:void 0)}></w3m-wallet-login-list>
      </wui-flex>
    `}};oL.styles=oP,oD([(0,r.state)()],oL.prototype,"checked",void 0),oL=oD([(0,p.customElement)("w3m-connect-wallets-view")],oL),e.s(["W3mConnectWalletsView",0,oL],44216);var oW=t,oj=e.i(18454),oz=t;let oF=g.css`
  :host {
    display: block;
    width: 120px;
    height: 120px;
  }

  svg {
    width: 120px;
    height: 120px;
    fill: none;
    stroke: transparent;
    stroke-linecap: round;
  }

  use {
    stroke: ${e=>e.colors.accent100};
    stroke-width: 2px;
    stroke-dasharray: 54, 118;
    stroke-dashoffset: 172;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`,oB=class extends oz.LitElement{render(){return i.html`
      <svg viewBox="0 0 54 59">
        <path
          id="wui-loader-path"
          d="M17.22 5.295c3.877-2.277 5.737-3.363 7.72-3.726a11.44 11.44 0 0 1 4.12 0c1.983.363 3.844 1.45 7.72 3.726l6.065 3.562c3.876 2.276 5.731 3.372 7.032 4.938a11.896 11.896 0 0 1 2.06 3.63c.683 1.928.688 4.11.688 8.663v7.124c0 4.553-.005 6.735-.688 8.664a11.896 11.896 0 0 1-2.06 3.63c-1.3 1.565-3.156 2.66-7.032 4.937l-6.065 3.563c-3.877 2.276-5.737 3.362-7.72 3.725a11.46 11.46 0 0 1-4.12 0c-1.983-.363-3.844-1.449-7.72-3.726l-6.065-3.562c-3.876-2.276-5.731-3.372-7.032-4.938a11.885 11.885 0 0 1-2.06-3.63c-.682-1.928-.688-4.11-.688-8.663v-7.124c0-4.553.006-6.735.688-8.664a11.885 11.885 0 0 1 2.06-3.63c1.3-1.565 3.156-2.66 7.032-4.937l6.065-3.562Z"
        />
        <use xlink:href="#wui-loader-path"></use>
      </svg>
    `}};oB.styles=[m.resetStyles,oF],oB=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("wui-loading-hexagon")],oB),e.i(74339);let o_=E.css`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: 4px;
    bottom: 0;
    opacity: 0;
    transform: scale(0.5);
    z-index: 1;
  }

  wui-button {
    display: none;
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  wui-button[data-retry='true'] {
    display: block;
    opacity: 1;
  }
`;var oH=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let oM=class extends oW.LitElement{constructor(){super(),this.network=ei.RouterController.state.data?.network,this.unsubscribe=[],this.showRetry=!1,this.error=!1}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}firstUpdated(){this.onSwitchNetwork()}render(){if(!this.network)throw Error("w3m-network-switch-view: No network provided");this.onShowRetry();let e=this.getLabel(),t=this.getSubLabel();return i.html`
      <wui-flex
        data-error=${this.error}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","10","5"]}
        gap="7"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-network-image
            size="lg"
            imageSrc=${(0,n.ifDefined)(l.AssetUtil.getNetworkImage(this.network))}
          ></wui-network-image>

          ${this.error?null:i.html`<wui-loading-hexagon></wui-loading-hexagon>`}

          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="h6-regular" color="primary">${e}</wui-text>
          <wui-text align="center" variant="md-regular" color="secondary">${t}</wui-text>
        </wui-flex>

        <wui-button
          data-retry=${this.showRetry}
          variant="accent-primary"
          size="md"
          .disabled=${!this.error}
          @click=${this.onSwitchNetwork.bind(this)}
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try again
        </wui-button>
      </wui-flex>
    `}getSubLabel(){let e=ee.ConnectorController.getConnectorId(s.ChainController.state.activeChain);return ee.ConnectorController.getAuthConnector()&&e===J.ConstantsUtil.CONNECTOR_ID.AUTH?"":this.error?"Switch can be declined if chain is not supported by a wallet or previous request is still active":"Accept connection request in your wallet"}getLabel(){let e=ee.ConnectorController.getConnectorId(s.ChainController.state.activeChain);return ee.ConnectorController.getAuthConnector()&&e===J.ConstantsUtil.CONNECTOR_ID.AUTH?`Switching to ${this.network?.name??"Unknown"} network...`:this.error?"Switch declined":"Approve in wallet"}onShowRetry(){if(this.error&&!this.showRetry){this.showRetry=!0;let e=this.shadowRoot?.querySelector("wui-button");e?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"})}}async onSwitchNetwork(){try{this.error=!1,s.ChainController.state.activeChain!==this.network?.chainNamespace&&s.ChainController.setIsSwitchingNamespace(!0),this.network&&(await s.ChainController.switchActiveNetwork(this.network),await oj.SIWXUtil.isAuthenticated()&&ei.RouterController.goBack())}catch(e){this.error=!0}}};oM.styles=o_,oH([(0,r.state)()],oM.prototype,"showRetry",void 0),oH([(0,r.state)()],oM.prototype,"error",void 0),oM=oH([(0,p.customElement)("w3m-network-switch-view")],oM),e.s(["W3mNetworkSwitchView",0,oM],69962);var oV=t,oK=e.i(98852);e.i(6957);var oq=t;let oG=g.css`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    text-transform: capitalize;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var oX=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let oY=class extends oq.LitElement{constructor(){super(...arguments),this.imageSrc=void 0,this.name="Ethereum",this.disabled=!1}render(){return i.html`
      <button ?disabled=${this.disabled} tabindex=${(0,n.ifDefined)(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          ${this.imageTemplate()}
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `}imageTemplate(){return this.imageSrc?i.html`<wui-image ?boxed=${!0} src=${this.imageSrc}></wui-image>`:i.html`<wui-image
      ?boxed=${!0}
      icon="networkPlaceholder"
      size="lg"
      iconColor="default"
    ></wui-image>`}};oY.styles=[m.resetStyles,m.elementStyles,oG],oX([(0,o.property)()],oY.prototype,"imageSrc",void 0),oX([(0,o.property)()],oY.prototype,"name",void 0),oX([(0,o.property)()],oY.prototype,"tabIdx",void 0),oX([(0,o.property)({type:Boolean})],oY.prototype,"disabled",void 0),oY=oX([(0,p.customElement)("wui-list-network")],oY);let oQ=E.css`
  .container {
    max-height: 360px;
    overflow: auto;
  }

  .container::-webkit-scrollbar {
    display: none;
  }
`;var oJ=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let oZ=class extends oV.LitElement{constructor(){super(),this.unsubscribe=[],this.network=s.ChainController.state.activeCaipNetwork,this.requestedCaipNetworks=s.ChainController.getCaipNetworks(),this.search="",this.onDebouncedSearch=c.CoreHelperUtil.debounce(e=>{this.search=e},100),this.unsubscribe.push(a.AssetController.subscribeNetworkImages(()=>this.requestUpdate()),s.ChainController.subscribeKey("activeCaipNetwork",e=>this.network=e),s.ChainController.subscribe(()=>{this.requestedCaipNetworks=s.ChainController.getAllRequestedCaipNetworks()}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html`
      ${this.templateSearchInput()}
      <wui-flex
        class="container"
        .padding=${["0","3","3","3"]}
        flexDirection="column"
        gap="2"
      >
        ${this.networksTemplate()}
      </wui-flex>
    `}templateSearchInput(){return i.html`
      <wui-flex gap="2" .padding=${["0","3","3","3"]}>
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="md"
          placeholder="Search network"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}networksTemplate(){let e=s.ChainController.getAllApprovedCaipNetworkIds(),t=c.CoreHelperUtil.sortRequestedNetworks(e,this.requestedCaipNetworks);return this.search?this.filteredNetworks=t?.filter(e=>e?.name?.toLowerCase().includes(this.search.toLowerCase())):this.filteredNetworks=t,this.filteredNetworks?.map(e=>i.html`
        <wui-list-network
          .selected=${this.network?.id===e.id}
          imageSrc=${(0,n.ifDefined)(l.AssetUtil.getNetworkImage(e))}
          type="network"
          name=${e.name??e.id}
          @click=${()=>this.onSwitchNetwork(e)}
          .disabled=${s.ChainController.isCaipNetworkDisabled(e)}
          data-testid=${`w3m-network-switch-${e.name??e.id}`}
        ></wui-list-network>
      `)}onSwitchNetwork(e){oK.NetworkUtil.onSwitchNetwork({network:e})}};oZ.styles=oQ,oJ([(0,r.state)()],oZ.prototype,"network",void 0),oJ([(0,r.state)()],oZ.prototype,"requestedCaipNetworks",void 0),oJ([(0,r.state)()],oZ.prototype,"filteredNetworks",void 0),oJ([(0,r.state)()],oZ.prototype,"search",void 0),oZ=oJ([(0,p.customElement)("w3m-networks-view")],oZ),e.s(["W3mNetworksView",0,oZ],5676);var o0=t;let o3=g.css`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-visual {
    border-radius: calc(
      ${({borderRadius:e})=>e["1"]} * 9 - ${({borderRadius:e})=>e["3"]}
    );
    position: relative;
    overflow: hidden;
  }

  wui-visual::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(
      ${({borderRadius:e})=>e["1"]} * 9 - ${({borderRadius:e})=>e["3"]}
    );
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e["1"]} * -1);
    bottom: calc(${({spacing:e})=>e["1"]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e["4"]};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e["ease-out-power-2"]} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  wui-link {
    padding: ${({spacing:e})=>e["01"]} ${({spacing:e})=>e["2"]};
  }

  .capitalize {
    text-transform: capitalize;
  }
`;var o1=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let o2={eip155:"eth",solana:"solana",bip122:"bitcoin",polkadot:void 0},o5=class extends o0.LitElement{constructor(){super(...arguments),this.unsubscribe=[],this.switchToChain=ei.RouterController.state.data?.switchToChain,this.caipNetwork=ei.RouterController.state.data?.network,this.activeChain=s.ChainController.state.activeChain}firstUpdated(){this.unsubscribe.push(s.ChainController.subscribeKey("activeChain",e=>this.activeChain=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.switchToChain?J.ConstantsUtil.CHAIN_NAME_MAP[this.switchToChain]:"supported";if(!this.switchToChain)return null;let t=J.ConstantsUtil.CHAIN_NAME_MAP[this.switchToChain];return i.html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["4","2","2","2"]}
        gap="4"
      >
        <wui-flex justifyContent="center" flexDirection="column" alignItems="center" gap="2">
          <wui-visual
            size="md"
            name=${(0,n.ifDefined)(o2[this.switchToChain])}
          ></wui-visual>
          <wui-flex gap="2" flexDirection="column" alignItems="center">
            <wui-text
              data-testid=${`w3m-switch-active-chain-to-${t}`}
              variant="lg-regular"
              color="primary"
              align="center"
              >Switch to <span class="capitalize">${t}</span></wui-text
            >
            <wui-text variant="md-regular" color="secondary" align="center">
              Connected wallet doesn't support connecting to ${e} chain. You
              need to connect with a different wallet.
            </wui-text>
          </wui-flex>
          <wui-button
            data-testid="w3m-switch-active-chain-button"
            size="md"
            @click=${this.switchActiveChain.bind(this)}
            >Switch</wui-button
          >
        </wui-flex>
      </wui-flex>
    `}async switchActiveChain(){this.switchToChain&&(s.ChainController.setIsSwitchingNamespace(!0),ee.ConnectorController.setFilterByNamespace(this.switchToChain),this.caipNetwork?await s.ChainController.switchActiveNetwork(this.caipNetwork):s.ChainController.setActiveNamespace(this.switchToChain),ei.RouterController.reset("Connect"))}};o5.styles=o3,o1([(0,o.property)()],o5.prototype,"activeChain",void 0),o5=o1([(0,p.customElement)("w3m-switch-active-chain-view")],o5),e.s(["W3mSwitchActiveChainView",0,o5],17016);var o4=t;let o6=[{images:["network","layers","system"],title:"The system’s nuts and bolts",text:"A network is what brings the blockchain to life, as this technical infrastructure allows apps to access the ledger and smart contract services."},{images:["noun","defiAlt","dao"],title:"Designed for different uses",text:"Each network is designed differently, and may therefore suit certain apps and experiences."}],o8=class extends o4.LitElement{render(){return i.html`
      <wui-flex
        flexDirection="column"
        .padding=${["6","5","5","5"]}
        alignItems="center"
        gap="5"
      >
        <w3m-help-widget .data=${o6}></w3m-help-widget>
        <wui-button
          variant="accent-primary"
          size="md"
          @click=${()=>{c.CoreHelperUtil.openHref("https://ethereum.org/en/developers/docs/networks/","_blank")}}
        >
          Learn more
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};o8=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-what-is-a-network-view")],o8),e.s(["W3mWhatIsANetworkView",0,o8],43476);var o7=t;let o9=E.css`
  :host > wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }
`;var re=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let rt=class extends o7.LitElement{constructor(){super(),this.swapUnsupportedChain=ei.RouterController.state.data?.swapUnsupportedChain,this.unsubscribe=[],this.disconnecting=!1,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.unsubscribe.push(a.AssetController.subscribeNetworkImages(()=>this.requestUpdate()),u.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html`
      <wui-flex class="container" flexDirection="column" gap="0">
        <wui-flex
          class="container"
          flexDirection="column"
          .padding=${["3","5","2","5"]}
          alignItems="center"
          gap="5"
        >
          ${this.descriptionTemplate()}
        </wui-flex>

        <wui-flex flexDirection="column" padding="3" gap="2"> ${this.networksTemplate()} </wui-flex>

        <wui-separator text="or"></wui-separator>
        <wui-flex flexDirection="column" padding="3" gap="2">
          <wui-list-item
            variant="icon"
            iconVariant="overlay"
            icon="signOut"
            ?chevron=${!1}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="md-medium" color="secondary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `}descriptionTemplate(){return this.swapUnsupportedChain?i.html`
        <wui-text variant="sm-regular" color="secondary" align="center">
          The swap feature doesn’t support your current network. Switch to an available option to
          continue.
        </wui-text>
      `:i.html`
      <wui-text variant="sm-regular" color="secondary" align="center">
        This app doesn’t support your current network. Switch to an available option to continue.
      </wui-text>
    `}networksTemplate(){let e=s.ChainController.getAllRequestedCaipNetworks(),t=s.ChainController.getAllApprovedCaipNetworkIds(),o=c.CoreHelperUtil.sortRequestedNetworks(t,e);return(this.swapUnsupportedChain?o.filter(e=>et.ConstantsUtil.SWAP_SUPPORTED_NETWORKS.includes(e.caipNetworkId)):o).map(e=>i.html`
        <wui-list-network
          imageSrc=${(0,n.ifDefined)(l.AssetUtil.getNetworkImage(e))}
          name=${e.name??"Unknown"}
          @click=${()=>this.onSwitchNetwork(e)}
        >
        </wui-list-network>
      `)}async onDisconnect(){try{this.disconnecting=!0;let e=s.ChainController.state.activeChain,t=Z.ConnectionController.getConnections(e).length>0,i=e&&ee.ConnectorController.state.activeConnectorIds[e],o=this.remoteFeatures?.multiWallet;await Z.ConnectionController.disconnect(o?{id:i,namespace:e}:{}),t&&o&&(ei.RouterController.push("ProfileWallets"),eo.SnackController.showSuccess("Wallet deleted"))}catch{B.EventsController.sendEvent({type:"track",event:"DISCONNECT_ERROR",properties:{message:"Failed to disconnect"}}),eo.SnackController.showError("Failed to disconnect")}finally{this.disconnecting=!1}}async onSwitchNetwork(e){let t=s.ChainController.getActiveCaipAddress(),i=s.ChainController.getAllApprovedCaipNetworkIds(),o=(s.ChainController.getNetworkProp("supportsAllNetworks",e.chainNamespace),ei.RouterController.state.data);t?i?.includes(e.caipNetworkId)?await s.ChainController.switchActiveNetwork(e):ei.RouterController.push("SwitchNetwork",{...o,network:e}):t||(s.ChainController.setActiveCaipNetwork(e),ei.RouterController.push("Connect"))}};rt.styles=o9,re([(0,r.state)()],rt.prototype,"disconnecting",void 0),re([(0,r.state)()],rt.prototype,"remoteFeatures",void 0),rt=re([(0,p.customElement)("w3m-unsupported-chain-view")],rt),e.s(["W3mUnsupportedChainView",0,rt],16519);var ri=t,ro=t;let rr=g.css`
  wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
  }

  /* -- Types --------------------------------------------------------- */
  wui-flex[data-type='info'] {
    color: ${({tokens:e})=>e.theme.textSecondary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-flex[data-type='success'] {
    color: ${({tokens:e})=>e.core.textSuccess};
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] {
    color: ${({tokens:e})=>e.core.textError};
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  wui-flex[data-type='warning'] {
    color: ${({tokens:e})=>e.core.textWarning};
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  wui-flex[data-type='info'] wui-icon-box {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-flex[data-type='success'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  wui-flex[data-type='warning'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  wui-text {
    flex: 1;
  }
`;var rn=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let ra=class extends ro.LitElement{constructor(){super(...arguments),this.icon="externalLink",this.text="",this.type="info"}render(){return i.html`
      <wui-flex alignItems="center" data-type=${this.type}>
        <wui-icon-box size="sm" color="inherit" icon=${this.icon}></wui-icon-box>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
      </wui-flex>
    `}};ra.styles=[m.resetStyles,m.elementStyles,rr],rn([(0,o.property)()],ra.prototype,"icon",void 0),rn([(0,o.property)()],ra.prototype,"text",void 0),rn([(0,o.property)()],ra.prototype,"type",void 0),ra=rn([(0,p.customElement)("wui-banner")],ra);let rl=E.css`
  :host > wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }
`,rs=class extends ri.LitElement{constructor(){super(),this.unsubscribe=[]}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return i.html` <wui-flex flexDirection="column" .padding=${["2","3","3","3"]} gap="2">
      <wui-banner
        icon="warningCircle"
        text="You can only receive assets on these networks"
      ></wui-banner>
      ${this.networkTemplate()}
    </wui-flex>`}networkTemplate(){let e=s.ChainController.getAllRequestedCaipNetworks(),t=s.ChainController.getAllApprovedCaipNetworkIds(),o=s.ChainController.state.activeCaipNetwork,r=s.ChainController.checkIfSmartAccountEnabled(),a=c.CoreHelperUtil.sortRequestedNetworks(t,e);if(r&&(0,ef.getPreferredAccountType)(o?.chainNamespace)===eA.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT){if(!o)return null;a=[o]}return a.filter(e=>e.chainNamespace===o?.chainNamespace).map(e=>i.html`
        <wui-list-network
          imageSrc=${(0,n.ifDefined)(l.AssetUtil.getNetworkImage(e))}
          name=${e.name??"Unknown"}
          ?transparent=${!0}
        >
        </wui-list-network>
      `)}};rs.styles=rl,rs=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-wallet-compatible-networks-view")],rs),e.s(["W3mWalletCompatibleNetworksView",0,rs],27159);var rc=t,rd=t,ru=t;let rp=g.css`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 56px;
    box-shadow: 0 0 0 8px ${({tokens:e})=>e.theme.borderPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    overflow: hidden;
  }

  :host([data-border-radius-full='true']) {
    border-radius: 50px;
  }

  wui-icon {
    width: 32px;
    height: 32px;
  }
`;var rh=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let rm=class extends ru.LitElement{render(){return this.dataset.borderRadiusFull=this.borderRadiusFull?"true":"false",i.html`${this.templateVisual()}`}templateVisual(){return this.imageSrc?i.html`<wui-image src=${this.imageSrc} alt=${this.alt??""}></wui-image>`:i.html`<wui-icon
      data-parent-size="md"
      size="inherit"
      color="inherit"
      name="wallet"
    ></wui-icon>`}};rm.styles=[m.resetStyles,rp],rh([(0,o.property)()],rm.prototype,"imageSrc",void 0),rh([(0,o.property)()],rm.prototype,"alt",void 0),rh([(0,o.property)({type:Boolean})],rm.prototype,"borderRadiusFull",void 0),rm=rh([(0,p.customElement)("wui-visual-thumbnail")],rm);let rw=g.css`
  :host {
    display: flex;
    justify-content: center;
    gap: ${({spacing:e})=>e["4"]};
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`,rg=class extends rd.LitElement{constructor(){super(...arguments),this.dappImageUrl=u.OptionsController.state.metadata?.icons,this.walletImageUrl=s.ChainController.getAccountData()?.connectedWalletInfo?.icon}firstUpdated(){let e=this.shadowRoot?.querySelectorAll("wui-visual-thumbnail");e?.[0]&&this.createAnimation(e[0],"translate(18px)"),e?.[1]&&this.createAnimation(e[1],"translate(-18px)")}render(){return i.html`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${this.dappImageUrl?.[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(e,t){e.animate([{transform:"translateX(0px)"},{transform:t}],{duration:1600,easing:"cubic-bezier(0.56, 0, 0.48, 1)",direction:"alternate",iterations:1/0})}};rg.styles=rw,rg=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,p.customElement)("w3m-siwx-sign-message-thumbnails")],rg);var rf=function(e,t,i,o){var r,n=arguments.length,a=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,o);else for(var l=e.length-1;l>=0;l--)(r=e[l])&&(a=(n<3?r(a):n>3?r(t,i,a):r(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let rb=class extends rc.LitElement{constructor(){super(...arguments),this.dappName=u.OptionsController.state.metadata?.name,this.isCancelling=!1,this.isSigning=!1}render(){return i.html`
      <wui-flex justifyContent="center" .padding=${["8","0","6","0"]}>
        <w3m-siwx-sign-message-thumbnails></w3m-siwx-sign-message-thumbnails>
      </wui-flex>
      <wui-flex .padding=${["0","20","5","20"]} gap="3" justifyContent="space-between">
        <wui-text variant="lg-medium" align="center" color="primary"
          >${this.dappName??"Dapp"} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${["0","10","4","10"]} gap="3" justifyContent="space-between">
        <wui-text variant="md-regular" align="center" color="secondary"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${["4","5","5","5"]} gap="3" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-secondary"
          ?loading=${this.isCancelling}
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          ${this.isCancelling?"Cancelling...":"Cancel"}
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-primary"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning?"Signing...":"Sign"}
        </wui-button>
      </wui-flex>
    `}async onSign(){this.isSigning=!0;try{await oj.SIWXUtil.requestSignMessage()}catch(e){if(e instanceof Error&&e.message.includes("OTP is required")){eo.SnackController.showError({message:"Something went wrong. We need to verify your account again."}),ei.RouterController.replace("DataCapture");return}throw e}finally{this.isSigning=!1}}async onCancel(){this.isCancelling=!0,await oj.SIWXUtil.cancelSignMessage().finally(()=>this.isCancelling=!1)}};rf([(0,r.state)()],rb.prototype,"isCancelling",void 0),rf([(0,r.state)()],rb.prototype,"isSigning",void 0),rb=rf([(0,p.customElement)("w3m-siwx-sign-message-view")],rb),e.s(["W3mSIWXSignMessageView",0,rb],49566),e.s([],10842)}]);