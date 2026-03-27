(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,34051,29389,e=>{"use strict";var t=e.i(54479);e.s(["ifDefined",0,e=>e??t.nothing],29389),e.s([],34051)},64380,e=>{"use strict";e.i(12207);var t=e.i(8285),i=e.i(54479);e.i(74576);var s=e.i(20119);e.i(34051);var o=e.i(29389),r=e.i(59088),a=e.i(45975),l=e.i(62611);let n=l.css`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
    user-select: none;
    user-drag: none;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
  }

  :host([data-boxed='true']) {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-boxed='true']) img {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  :host([data-full='true']) img {
    width: 100%;
    height: 100%;
  }

  :host([data-boxed='true']) wui-icon {
    width: 20px;
    height: 20px;
  }

  :host([data-icon='error']) {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:e})=>e[16]};
  }
`;var c=function(e,t,i,s){var o,r=arguments.length,a=r<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(r<3?o(a):r>3?o(t,i,a):o(t,i))||a);return r>3&&a&&Object.defineProperty(t,i,a),a};let h=class extends t.LitElement{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0,this.boxed=!1,this.rounded=!1,this.fullSize=!1}render(){let e={inherit:"inherit",xxs:"2",xs:"3",sm:"4",md:"4",mdl:"5",lg:"5",xl:"6",xxl:"7","3xl":"8","4xl":"9","5xl":"10"};return(this.style.cssText=`
      --local-width: ${this.size?`var(--apkt-spacing-${e[this.size]});`:"100%"};
      --local-height: ${this.size?`var(--apkt-spacing-${e[this.size]});`:"100%"};
      `,this.dataset.boxed=this.boxed?"true":"false",this.dataset.rounded=this.rounded?"true":"false",this.dataset.full=this.fullSize?"true":"false",this.dataset.icon=this.iconColor||"inherit",this.icon)?i.html`<wui-icon
        color=${this.iconColor||"inherit"}
        name=${this.icon}
        size="lg"
      ></wui-icon> `:this.logo?i.html`<wui-icon size="lg" color="inherit" name=${this.logo}></wui-icon> `:i.html`<img src=${(0,o.ifDefined)(this.src)} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};h.styles=[r.resetStyles,n],c([(0,s.property)()],h.prototype,"src",void 0),c([(0,s.property)()],h.prototype,"logo",void 0),c([(0,s.property)()],h.prototype,"icon",void 0),c([(0,s.property)()],h.prototype,"iconColor",void 0),c([(0,s.property)()],h.prototype,"alt",void 0),c([(0,s.property)()],h.prototype,"size",void 0),c([(0,s.property)({type:Boolean})],h.prototype,"boxed",void 0),c([(0,s.property)({type:Boolean})],h.prototype,"rounded",void 0),c([(0,s.property)({type:Boolean})],h.prototype,"fullSize",void 0),h=c([(0,a.customElement)("wui-image")],h),e.s([],64380)},7876,e=>{"use strict";e.i(12207);var t=e.i(8285),i=e.i(54479);e.i(74576);var s=e.i(56350);e.i(34051);var o=e.i(29389),r=e.i(36220),a=e.i(60398),l=e.i(27302),n=e.i(21728),c=e.i(11424),h=e.i(39403),u=e.i(64126);e.i(4041);var m=e.i(12699),p=e.i(45975),d=t,v=e.i(20119);e.i(52634),e.i(64380),e.i(39009),e.i(73944);var w=e.i(59088),k=e.i(62611);let g=k.css`
  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[4]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[3]};
    border: none;
    padding: ${({spacing:e})=>e[3]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:active:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-text {
    flex: 1;
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-flex {
    width: auto;
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e["01"]};
  }

  wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  .network-icon {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[4]};
    overflow: hidden;
    margin-left: -8px;
  }

  .network-icon:first-child {
    margin-left: 0px;
  }

  .network-icon:after {
    position: absolute;
    inset: 0;
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
  }
`;var f=function(e,t,i,s){var o,r=arguments.length,a=r<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(r<3?o(a):r>3?o(t,i,a):o(t,i))||a);return r>3&&a&&Object.defineProperty(t,i,a),a};let b=class extends d.LitElement{constructor(){super(...arguments),this.networkImages=[""],this.text=""}render(){return i.html`
      <button>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
        <wui-flex>
          ${this.networksTemplate()}
          <wui-icon name="chevronRight" size="sm" color="inherit"></wui-icon>
        </wui-flex>
      </button>
    `}networksTemplate(){let e=this.networkImages.slice(0,5);return i.html` <wui-flex class="networks">
      ${e?.map(e=>i.html` <wui-flex class="network-icon"> <wui-image src=${e}></wui-image> </wui-flex>`)}
    </wui-flex>`}};b.styles=[w.resetStyles,w.elementStyles,g],f([(0,v.property)({type:Array})],b.prototype,"networkImages",void 0),f([(0,v.property)()],b.prototype,"text",void 0),b=f([(0,p.customElement)("wui-compatible-network")],b),e.i(62238),e.i(32965),e.i(49536);var y=e.i(79484);let j=k.css`
  wui-compatible-network {
    margin-top: ${({spacing:e})=>e["4"]};
    width: 100%;
  }

  wui-qr-code {
    width: unset !important;
    height: unset !important;
  }

  wui-icon {
    align-items: normal;
  }
`;var x=function(e,t,i,s){var o,r=arguments.length,a=r<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,s);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(r<3?o(a):r>3?o(t,i,a):o(t,i))||a);return r>3&&a&&Object.defineProperty(t,i,a),a};let P=class extends t.LitElement{constructor(){super(),this.unsubscribe=[],this.address=a.ChainController.getAccountData()?.address,this.profileName=a.ChainController.getAccountData()?.profileName,this.network=a.ChainController.state.activeCaipNetwork,this.unsubscribe.push(a.ChainController.subscribeChainProp("accountState",e=>{e?(this.address=e.address,this.profileName=e.profileName):c.SnackController.showError("Account not found")}),a.ChainController.subscribeKey("activeCaipNetwork",e=>{e?.id&&(this.network=e)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!this.address)throw Error("w3m-wallet-receive-view: No account provided");let e=r.AssetUtil.getNetworkImage(this.network);return i.html` <wui-flex
      flexDirection="column"
      .padding=${["0","4","4","4"]}
      alignItems="center"
    >
      <wui-chip-button
        data-testid="receive-address-copy-button"
        @click=${this.onCopyClick.bind(this)}
        text=${m.UiHelperUtil.getTruncateString({string:this.profileName||this.address||"",charsStart:this.profileName?18:4,charsEnd:4*!this.profileName,truncate:this.profileName?"end":"middle"})}
        icon="copy"
        size="sm"
        imageSrc=${e||""}
        variant="gray"
      ></wui-chip-button>
      <wui-flex
        flexDirection="column"
        .padding=${["4","0","0","0"]}
        alignItems="center"
        gap="4"
      >
        <wui-qr-code
          size=${232}
          theme=${h.ThemeController.state.themeMode}
          uri=${this.address}
          ?arenaClear=${!0}
          color=${(0,o.ifDefined)(h.ThemeController.state.themeVariables["--apkt-qr-color"]??h.ThemeController.state.themeVariables["--w3m-qr-color"])}
          data-testid="wui-qr-code"
        ></wui-qr-code>
        <wui-text variant="lg-regular" color="primary" align="center">
          Copy your address or scan this QR code
        </wui-text>
        <wui-button @click=${this.onCopyClick.bind(this)} size="sm" variant="neutral-secondary">
          <wui-icon slot="iconLeft" size="sm" color="inherit" name="copy"></wui-icon>
          <wui-text variant="md-regular" color="inherit">Copy address</wui-text>
        </wui-button>
      </wui-flex>
      ${this.networkTemplate()}
    </wui-flex>`}networkTemplate(){let e=a.ChainController.getAllRequestedCaipNetworks(),t=a.ChainController.checkIfSmartAccountEnabled(),s=a.ChainController.state.activeCaipNetwork,o=e.filter(e=>e?.chainNamespace===s?.chainNamespace);if((0,u.getPreferredAccountType)(s?.chainNamespace)===y.W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT&&t)return s?i.html`<wui-compatible-network
        @click=${this.onReceiveClick.bind(this)}
        text="Only receive assets on this network"
        .networkImages=${[r.AssetUtil.getNetworkImage(s)??""]}
      ></wui-compatible-network>`:null;let l=(o?.filter(e=>e?.assets?.imageId)?.slice(0,5)).map(r.AssetUtil.getNetworkImage).filter(Boolean);return i.html`<wui-compatible-network
      @click=${this.onReceiveClick.bind(this)}
      text="Only receive assets on these networks"
      .networkImages=${l}
    ></wui-compatible-network>`}onReceiveClick(){n.RouterController.push("WalletCompatibleNetworks")}onCopyClick(){try{this.address&&(l.CoreHelperUtil.copyToClopboard(this.address),c.SnackController.showSuccess("Address copied"))}catch{c.SnackController.showError("Failed to copy")}}};P.styles=j,x([(0,s.state)()],P.prototype,"address",void 0),x([(0,s.state)()],P.prototype,"profileName",void 0),x([(0,s.state)()],P.prototype,"network",void 0),P=x([(0,p.customElement)("w3m-wallet-receive-view")],P),e.s(["W3mWalletReceiveView",0,P],47751),e.s([],67776),e.i(67776),e.i(47751),e.s(["W3mWalletReceiveView",0,P],7876)},82012,e=>{e.v(t=>Promise.all(["static/chunks/04ico-_gjm27w.js"].map(t=>e.l(t))).then(()=>t(96403)))},40171,e=>{e.v(t=>Promise.all(["static/chunks/11v3m7g373ehs.js"].map(t=>e.l(t))).then(()=>t(69592)))},10729,e=>{e.v(t=>Promise.all(["static/chunks/0xc5ogy.4cqt6.js"].map(t=>e.l(t))).then(()=>t(86977)))},80342,e=>{e.v(t=>Promise.all(["static/chunks/0_mewu7cnpsno.js"].map(t=>e.l(t))).then(()=>t(32833)))},95724,e=>{e.v(t=>Promise.all(["static/chunks/11wkp7hpvh7tf.js"].map(t=>e.l(t))).then(()=>t(72412)))},52792,e=>{e.v(t=>Promise.all(["static/chunks/0g3ui2wv8r~wc.js"].map(t=>e.l(t))).then(()=>t(26763)))},96302,e=>{e.v(t=>Promise.all(["static/chunks/0j0k6c8ggdklr.js"].map(t=>e.l(t))).then(()=>t(43229)))},44243,e=>{e.v(t=>Promise.all(["static/chunks/07wddbwvy22f0.js"].map(t=>e.l(t))).then(()=>t(12721)))},59668,e=>{e.v(t=>Promise.all(["static/chunks/09ba7-_iffhw0.js"].map(t=>e.l(t))).then(()=>t(36682)))},41373,e=>{e.v(t=>Promise.all(["static/chunks/10gk0blv0it_k.js"].map(t=>e.l(t))).then(()=>t(51383)))},69595,e=>{e.v(t=>Promise.all(["static/chunks/0bta-jrs6~00o.js"].map(t=>e.l(t))).then(()=>t(4289)))},33052,e=>{e.v(t=>Promise.all(["static/chunks/0762bbcc5~n~v.js"].map(t=>e.l(t))).then(()=>t(56357)))},280,e=>{e.v(t=>Promise.all(["static/chunks/0zft.mxso0wdv.js"].map(t=>e.l(t))).then(()=>t(78319)))},92833,e=>{e.v(t=>Promise.all(["static/chunks/0tdapn46a87b2.js"].map(t=>e.l(t))).then(()=>t(61289)))},17096,e=>{e.v(t=>Promise.all(["static/chunks/0oeos-plb2q06.js"].map(t=>e.l(t))).then(()=>t(26703)))},5963,e=>{e.v(t=>Promise.all(["static/chunks/0vhj_1cq1owug.js"].map(t=>e.l(t))).then(()=>t(9953)))},48774,e=>{e.v(t=>Promise.all(["static/chunks/0vm3duhzxw-u2.js"].map(t=>e.l(t))).then(()=>t(32295)))},50090,e=>{e.v(t=>Promise.all(["static/chunks/12wk3fvygoqg~.js"].map(t=>e.l(t))).then(()=>t(52019)))},38711,e=>{e.v(t=>Promise.all(["static/chunks/1408kbi9bcza3.js"].map(t=>e.l(t))).then(()=>t(64871)))},50621,e=>{e.v(t=>Promise.all(["static/chunks/0881hmc9re8px.js"].map(t=>e.l(t))).then(()=>t(59021)))},5462,e=>{e.v(t=>Promise.all(["static/chunks/04f2_hmveaqeu.js"].map(t=>e.l(t))).then(()=>t(65788)))},70963,e=>{e.v(t=>Promise.all(["static/chunks/0zhiq_0493.r0.js"].map(t=>e.l(t))).then(()=>t(17729)))},56906,e=>{e.v(t=>Promise.all(["static/chunks/0o7t79qo-g.qk.js"].map(t=>e.l(t))).then(()=>t(34056)))},78023,e=>{e.v(t=>Promise.all(["static/chunks/0p-trm74a~_nw.js"].map(t=>e.l(t))).then(()=>t(71507)))},69039,e=>{e.v(t=>Promise.all(["static/chunks/015dz_0fuvoul.js"].map(t=>e.l(t))).then(()=>t(2658)))},63605,e=>{e.v(t=>Promise.all(["static/chunks/0jt_ui_som86b.js"].map(t=>e.l(t))).then(()=>t(39621)))},42324,e=>{e.v(t=>Promise.all(["static/chunks/16ae95zbkbei2.js"].map(t=>e.l(t))).then(()=>t(11923)))},84968,e=>{e.v(t=>Promise.all(["static/chunks/139-5-~k-a9_a.js"].map(t=>e.l(t))).then(()=>t(74571)))},44020,e=>{e.v(t=>Promise.all(["static/chunks/0sj204xziysfx.js"].map(t=>e.l(t))).then(()=>t(84535)))},50711,e=>{e.v(t=>Promise.all(["static/chunks/0mb5g5c08bg3_.js"].map(t=>e.l(t))).then(()=>t(15680)))},56601,e=>{e.v(t=>Promise.all(["static/chunks/04ao4kqg7-71z.js"].map(t=>e.l(t))).then(()=>t(1958)))},81254,e=>{e.v(t=>Promise.all(["static/chunks/0ylfzksb.ysq3.js"].map(t=>e.l(t))).then(()=>t(11420)))},79893,e=>{e.v(t=>Promise.all(["static/chunks/11vp.ou5.wgk..js"].map(t=>e.l(t))).then(()=>t(52452)))},1514,e=>{e.v(t=>Promise.all(["static/chunks/15_vj4ft3pkw2.js"].map(t=>e.l(t))).then(()=>t(35252)))},44980,e=>{e.v(t=>Promise.all(["static/chunks/0abw.we2fvq85.js"].map(t=>e.l(t))).then(()=>t(80835)))},84074,e=>{e.v(t=>Promise.all(["static/chunks/0qu2ipod_3dre.js"].map(t=>e.l(t))).then(()=>t(94301)))},67422,e=>{e.v(t=>Promise.all(["static/chunks/0trdrklutxs6s.js"].map(t=>e.l(t))).then(()=>t(89931)))},13200,e=>{e.v(t=>Promise.all(["static/chunks/0wufvuse0m1df.js"].map(t=>e.l(t))).then(()=>t(69097)))},48479,e=>{e.v(t=>Promise.all(["static/chunks/039hmx6plo.3u.js"].map(t=>e.l(t))).then(()=>t(88299)))},67369,e=>{e.v(t=>Promise.all(["static/chunks/0avogfle0agse.js"].map(t=>e.l(t))).then(()=>t(66712)))},77793,e=>{e.v(t=>Promise.all(["static/chunks/0xub8so4d47.0.js"].map(t=>e.l(t))).then(()=>t(71960)))},4447,e=>{e.v(t=>Promise.all(["static/chunks/144lv8k~l5496.js"].map(t=>e.l(t))).then(()=>t(65425)))},93690,e=>{e.v(t=>Promise.all(["static/chunks/0acgxj--f7i8u.js"].map(t=>e.l(t))).then(()=>t(65891)))},77385,e=>{e.v(t=>Promise.all(["static/chunks/0qk6uu2q1tw_v.js"].map(t=>e.l(t))).then(()=>t(84131)))},65739,e=>{e.v(t=>Promise.all(["static/chunks/12lr98o1.yd7g.js"].map(t=>e.l(t))).then(()=>t(9900)))},80304,e=>{e.v(t=>Promise.all(["static/chunks/10lvb6.5.uxa9.js"].map(t=>e.l(t))).then(()=>t(45017)))},9957,e=>{e.v(t=>Promise.all(["static/chunks/0.7amhpjej0na.js"].map(t=>e.l(t))).then(()=>t(44919)))},22236,e=>{e.v(t=>Promise.all(["static/chunks/0z~mfwxrvgs-s.js"].map(t=>e.l(t))).then(()=>t(6501)))},40934,e=>{e.v(t=>Promise.all(["static/chunks/0c.ugbg-cm92~.js"].map(t=>e.l(t))).then(()=>t(13559)))},71802,e=>{e.v(t=>Promise.all(["static/chunks/0u00gqq-1y.-7.js"].map(t=>e.l(t))).then(()=>t(94384)))},57792,e=>{e.v(t=>Promise.all(["static/chunks/0l23c_y.nej82.js"].map(t=>e.l(t))).then(()=>t(76208)))},7885,e=>{e.v(t=>Promise.all(["static/chunks/047hyf3ib.ncs.js"].map(t=>e.l(t))).then(()=>t(56529)))}]);