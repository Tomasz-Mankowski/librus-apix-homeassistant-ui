//#region ../opt/ui/node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: ee, getOwnPropertySymbols: te, getPrototypeOf: ne } = Object, f = globalThis, re = f.trustedTypes, ie = re ? re.emptyScript : "", ae = f.reactiveElementPolyfillSupport, p = (e, t) => e, m = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ie : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, oe = (e, t) => !l(e, t), se = {
	attribute: !0,
	type: String,
	converter: m,
	reflect: !1,
	useDefault: !1,
	hasChanged: oe
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var h = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = se) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? se;
	}
	static _$Ei() {
		if (this.hasOwnProperty(p("elementProperties"))) return;
		let e = ne(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(p("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(p("properties"))) {
			let e = this.properties, t = [...ee(e), ...te(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? m : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? m : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? oe)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
h.elementStyles = [], h.shadowRootOptions = { mode: "open" }, h[p("elementProperties")] = /* @__PURE__ */ new Map(), h[p("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: h }), (f.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region ../opt/ui/node_modules/lit-html/lit-html.js
var g = globalThis, ce = (e) => e, _ = g.trustedTypes, le = _ ? _.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ue = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, de = "?" + v, fe = `<${de}>`, y = document, b = () => y.createComment(""), x = (e) => e === null || typeof e != "object" && typeof e != "function", S = Array.isArray, pe = (e) => S(e) || typeof e?.[Symbol.iterator] == "function", me = "[ 	\n\f\r]", C = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, he = /-->/g, ge = />/g, w = RegExp(`>|${me}(?:([^\\s"'>=/]+)(${me}*=${me}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), _e = /'/g, ve = /"/g, ye = /^(?:script|style|textarea|title)$/i, T = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), E = Symbol.for("lit-noChange"), D = Symbol.for("lit-nothing"), be = /* @__PURE__ */ new WeakMap(), O = y.createTreeWalker(y, 129);
function xe(e, t) {
	if (!S(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return le === void 0 ? t : le.createHTML(t);
}
var Se = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = C;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === C ? c[1] === "!--" ? o = he : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = w) : (ye.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = w) : o = ge : o === w ? c[0] === ">" ? (o = i ?? C, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? w : c[3] === "\"" ? ve : _e) : o === ve || o === _e ? o = w : o === he || o === ge ? o = C : (o = w, i = void 0);
		let d = o === w && e[t + 1].startsWith("/>") ? " " : "";
		a += o === C ? n + fe : l >= 0 ? (r.push(s), n.slice(0, l) + ue + n.slice(l) + v + d) : n + v + (l === -2 ? t : d);
	}
	return [xe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, Ce = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = Se(t, n);
		if (this.el = e.createElement(l, r), O.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = O.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ue)) {
					let t = u[o++], n = i.getAttribute(e).split(v), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Te : r[1] === "?" ? Ee : r[1] === "@" ? De : j
					}), i.removeAttribute(e);
				} else e.startsWith(v) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (ye.test(i.tagName)) {
					let e = i.textContent.split(v), t = e.length - 1;
					if (t > 0) {
						i.textContent = _ ? _.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], b()), O.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], b());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === de) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(v, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += v.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = y.createElement("template");
		return n.innerHTML = e, n;
	}
};
function k(e, t, n = e, r) {
	if (t === E) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = x(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = k(e, i._$AS(e, t.values), i, r)), t;
}
var we = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? y).importNode(t, !0);
		O.currentNode = r;
		let i = O.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new A(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Oe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = O.nextNode(), a++);
		}
		return O.currentNode = y, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, A = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = D, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = k(this, e, t), x(e) ? e === D || e == null || e === "" ? (this._$AH !== D && this._$AR(), this._$AH = D) : e !== this._$AH && e !== E && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? pe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== D && x(this._$AH) ? this._$AA.nextSibling.data = e : this.T(y.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = Ce.createElement(xe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new we(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = be.get(e.strings);
		return t === void 0 && be.set(e.strings, t = new Ce(e)), t;
	}
	k(t) {
		S(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(b()), this.O(b()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = ce(e).nextSibling;
			ce(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, j = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = D, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = D;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = k(this, e, t, 0), a = !x(e) || e !== this._$AH && e !== E, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = k(this, r[n + o], t, o), s === E && (s = this._$AH[o]), a ||= !x(s) || s !== this._$AH[o], s === D ? e = D : e !== D && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === D ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Te = class extends j {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === D ? void 0 : e;
	}
}, Ee = class extends j {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== D);
	}
}, De = class extends j {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = k(this, e, t, 0) ?? D) === E) return;
		let n = this._$AH, r = e === D && n !== D || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== D && (n === D || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Oe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		k(this, e);
	}
}, ke = g.litHtmlPolyfillSupport;
ke?.(Ce, A), (g.litHtmlVersions ??= []).push("3.3.3");
var Ae = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new A(t.insertBefore(b(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, M = globalThis, N = class extends h {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ae(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return E;
	}
};
N._$litElement$ = !0, N.finalized = !0, M.litElementHydrateSupport?.({ LitElement: N });
var je = M.litElementPolyfillSupport;
je?.({ LitElement: N }), (M.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region ../opt/ui/node_modules/lit-html/directive.js
var Me = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, Ne = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Pe = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, Fe = "important", Ie = " !" + Fe, P = Ne(class extends Pe {
	constructor(e) {
		if (super(e), e.type !== Me.ATTRIBUTE || e.name !== "style" || e.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
	}
	render(e) {
		return Object.keys(e).reduce((t, n) => {
			let r = e[n];
			return r == null ? t : t + `${n = n.includes("-") ? n : n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${r};`;
		}, "");
	}
	update(e, [t]) {
		let { style: n } = e.element;
		if (this.ft === void 0) return this.ft = new Set(Object.keys(t)), this.render(t);
		for (let e of this.ft) t[e] ?? (this.ft.delete(e), e.includes("-") ? n.removeProperty(e) : n[e] = null);
		for (let e in t) {
			let r = t[e];
			if (r != null) {
				this.ft.add(e);
				let t = typeof r == "string" && r.endsWith(Ie);
				e.includes("-") || t ? n.setProperty(e, t ? r.slice(0, -11) : r, t ? Fe : "") : n[e] = r;
			}
		}
		return E;
	}
}), Le = /* @__PURE__ */ new Set(/* @__PURE__ */ "primary.accent.disabled.red.pink.purple.deep-purple.indigo.blue.light-blue.cyan.teal.green.light-green.lime.yellow.amber.orange.deep-orange.brown.light-grey.grey.dark-grey.blue-grey.black.white".split("."));
function F(e) {
	if (e && e !== "none" && e !== "state") return Le.has(e) ? `var(--${e}-color)` : e;
}
var Re = [
	"excellent",
	"ok",
	"bad"
], ze = {
	bad: "red",
	ok: "amber",
	excellent: "green"
};
function Be(e) {
	if (e == null || e === "") return;
	let t = typeof e == "number" ? e : Number(String(e).replace(",", "."));
	return Number.isFinite(t) ? t : void 0;
}
function Ve(e, t) {
	if (e != null && Number.isFinite(e)) return Re.find((n) => {
		let r = Be(t[`level_${n}`]);
		return r !== void 0 && e >= r;
	});
}
function He(e, t) {
	let n = Ve(e, t);
	return n ? F(t[`color_${n}`] || ze[n]) : void 0;
}
//#endregion
//#region src/common/localize.ts
var Ue = {
	en: {
		common: {
			close: "Close",
			entity_not_found: "Entity not found: {entity}",
			no_items: "Nothing to show",
			loading: "Loading…",
			error: "Something went wrong: {error}",
			yes: "Yes",
			no: "No"
		},
		editor: {
			entity: "Entity",
			title: "Title",
			icon: "Icon",
			count: "Number of items",
			fields: "Shown on the list",
			days: "Days ahead",
			types: "Event types (empty: all)",
			icon_color: "Icon colour",
			unread_color: "Colour of unread messages",
			highlight_unread: "Highlight unread messages",
			highlight_next: "Highlight the nearest event",
			show_next_label: "Show the “Next” label",
			device: "Student",
			exclude: "Hidden subjects",
			show_average: "Show subject averages",
			show_gpa: "Show the GPA",
			level_bad: "Bad average from",
			color_bad: "Colour: bad",
			level_ok: "OK average from",
			color_ok: "Colour: OK",
			level_excellent: "Excellent average from",
			color_excellent: "Colour: excellent"
		},
		messages: {
			name: "Messages",
			empty: "No messages",
			unread: "Unread",
			read: "Read",
			attachment: "Attachment",
			from: "From",
			date: "Date",
			status: "Status",
			attachments: "Attachments",
			field_author: "Author",
			field_date: "Date",
			field_attachment: "Attachment icon",
			field_status: "Read / unread icon",
			read_content: "Read content",
			read_hint: "Reading the content marks the message as read in Librus.",
			cannot_read: "Cannot read the content: {error}",
			retry: "Try again"
		},
		announcements: {
			name: "Announcements",
			empty: "No announcements",
			author: "Author",
			date: "Date",
			field_author: "Author",
			field_date: "Date",
			field_preview: "First line of the text"
		},
		schedule: {
			name: "Schedule",
			empty: "No events in the next {days} days",
			next: "Next",
			all_day: "All day",
			lesson_n: "lesson {n}",
			type: "Type",
			subject: "Subject",
			date: "Date",
			time: "Time",
			lesson: "Lesson",
			teacher: "Teacher",
			added: "Added",
			field_date: "Date",
			field_time: "Time and lesson",
			field_description: "Description",
			field_teacher: "Teacher",
			empty_filtered: "No events of the selected types in the next {days} days",
			group_tests: "Tests",
			group_trips: "Trips",
			group_meetings: "Meetings",
			group_days_off: "Days off",
			group_contests: "Contests",
			group_changes: "Timetable changes"
		},
		grades: {
			name: "Grades",
			gpa: "GPA",
			semester: "semester {n}",
			empty: "No subjects with grades",
			no_grades: "No grades",
			no_student: "No Librus student found for this device.",
			weight_n: "weight {n}",
			not_counted: "does not count to the average"
		}
	},
	pl: {
		common: {
			close: "Zamknij",
			entity_not_found: "Nie znaleziono encji: {entity}",
			no_items: "Brak pozycji",
			loading: "Wczytywanie…",
			error: "Coś poszło nie tak: {error}",
			yes: "Tak",
			no: "Nie"
		},
		editor: {
			entity: "Encja",
			title: "Tytuł",
			icon: "Ikona",
			count: "Liczba pozycji",
			fields: "Pokazywane na liście",
			days: "Liczba dni do przodu",
			types: "Rodzaje wydarzeń (puste: wszystkie)",
			icon_color: "Kolor ikony",
			unread_color: "Kolor nieprzeczytanych wiadomości",
			highlight_unread: "Wyróżnij nieprzeczytane wiadomości",
			highlight_next: "Wyróżnij najbliższe wydarzenie",
			show_next_label: "Pokaż etykietę „Najbliższe”",
			device: "Uczeń",
			exclude: "Ukryte przedmioty",
			show_average: "Pokaż średnie przedmiotów",
			show_gpa: "Pokaż średnią ucznia",
			level_bad: "Średnia słaba od",
			color_bad: "Kolor: słaba",
			level_ok: "Średnia dobra od",
			color_ok: "Kolor: dobra",
			level_excellent: "Średnia bardzo dobra od",
			color_excellent: "Kolor: bardzo dobra"
		},
		messages: {
			name: "Wiadomości",
			empty: "Brak wiadomości",
			unread: "Nieprzeczytana",
			read: "Przeczytana",
			attachment: "Załącznik",
			from: "Od",
			date: "Data",
			status: "Status",
			attachments: "Załączniki",
			field_author: "Autor",
			field_date: "Data",
			field_attachment: "Ikona załącznika",
			field_status: "Ikona przeczytania",
			read_content: "Wczytaj treść",
			read_hint: "Wczytanie treści oznacza wiadomość w Librusie jako przeczytaną.",
			cannot_read: "Nie udało się wczytać treści: {error}",
			retry: "Spróbuj ponownie"
		},
		announcements: {
			name: "Ogłoszenia",
			empty: "Brak ogłoszeń",
			author: "Autor",
			date: "Data",
			field_author: "Autor",
			field_date: "Data",
			field_preview: "Pierwsza linia treści"
		},
		schedule: {
			name: "Terminarz",
			empty: "Brak wydarzeń w ciągu najbliższych {days} dni",
			next: "Najbliższe",
			all_day: "Cały dzień",
			lesson_n: "lekcja {n}",
			type: "Rodzaj",
			subject: "Przedmiot",
			date: "Data",
			time: "Godzina",
			lesson: "Lekcja",
			teacher: "Nauczyciel",
			added: "Dodano",
			field_date: "Data",
			field_time: "Godzina i lekcja",
			field_description: "Opis",
			field_teacher: "Nauczyciel",
			empty_filtered: "Brak wydarzeń wybranych rodzajów w ciągu najbliższych {days} dni",
			group_tests: "Sprawdziany",
			group_trips: "Wycieczki",
			group_meetings: "Zebrania",
			group_days_off: "Dni wolne",
			group_contests: "Konkursy",
			group_changes: "Zmiany w planie"
		},
		grades: {
			name: "Oceny",
			gpa: "Średnia ocen",
			semester: "semestr {n}",
			empty: "Brak przedmiotów z ocenami",
			no_grades: "Brak ocen",
			no_student: "Nie znaleziono ucznia Librus dla tego urządzenia.",
			weight_n: "waga {n}",
			not_counted: "nie liczy się do średniej"
		}
	}
};
function I(e) {
	return (e?.locale?.language ?? e?.language ?? "en").toLowerCase().startsWith("pl") ? "pl" : "en";
}
function We(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object") return;
		n = n[e];
	}
	return typeof n == "string" ? n : void 0;
}
function L(e, t, n = {}) {
	return (We(Ue[I(e)], t) ?? We(Ue.en, t) ?? t).replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e);
}
//#endregion
//#region src/common/styles.ts
var R = o`
  :host {
    display: block;
  }
  ha-card {
    height: 100%;
    overflow: hidden;
  }
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 12px 16px 16px;
    color: var(--ha-card-header-color, var(--primary-text-color));
    font-family: var(--ha-card-header-font-family, inherit);
    font-size: var(--ha-card-header-font-size, var(--ha-font-size-2xl, 24px));
    font-weight: var(--ha-font-weight-normal, 400);
    letter-spacing: -0.012em;
    line-height: var(--ha-line-height-expanded, 1.5);
  }
  .card-header ha-icon {
    color: var(--state-icon-color, var(--secondary-text-color));
  }
  .card-content {
    padding: 0 16px 16px;
    color: var(--primary-text-color);
  }
  .card-header + .card-content {
    padding-top: 0;
  }
  .card-content:first-child {
    padding-top: 16px;
  }
  .secondary {
    color: var(--secondary-text-color);
  }
  .warning {
    padding: 16px;
    color: var(--primary-text-color);
    background: rgba(var(--rgb-warning-color, 255, 166, 0), 0.12);
    border-left: 4px solid var(--warning-color, #ffa600);
  }
  .empty {
    color: var(--secondary-text-color);
  }
  button.link {
    font: inherit;
    color: var(--primary-color);
    background: none;
    border: none;
    padding: 8px 0;
    cursor: pointer;
  }
  button.link:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 4px;
  }
`, z = class extends N {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = R;
	setConfig(e) {
		if (!e || typeof e != "object") throw Error("Invalid configuration");
		this._config = e;
	}
	getCardSize() {
		return 3;
	}
	getGridOptions() {
		return {
			columns: 12,
			min_columns: 6,
			rows: "auto"
		};
	}
	t(e, t) {
		return L(this.hass, e, t);
	}
	get stateObj() {
		let e = this._config?.entity;
		return e ? this.hass?.states[e] : void 0;
	}
	shouldUpdate(e) {
		if (e.size !== 1 || !e.has("hass")) return !0;
		let t = e.get("hass");
		if (!t || !this.hass) return !0;
		let n = this._config?.entity;
		return t.locale?.language !== this.hass.locale?.language || t.themes?.darkMode !== this.hass.themes?.darkMode || n !== void 0 && t.states[n] !== this.hass.states[n];
	}
	renderHeader() {
		let e = this._config?.title ?? this.defaultTitle;
		if (!e) return D;
		let t = this._config?.icon ?? this.defaultIcon;
		return T`
      <h1 class="card-header">
        ${t ? T`<ha-icon .icon=${t} style=${P({ color: F(this._config?.icon_color) })}></ha-icon>` : D}
        <span class="name">${e}</span>
      </h1>
    `;
	}
	renderMissingEntity() {
		return T`
      <ha-card>
        ${this.renderHeader()}
        <div class="warning">${this.t("common.entity_not_found", { entity: this._config?.entity ?? "" })}</div>
      </ha-card>
    `;
	}
}, B = "librus-apix-dialog", Ge = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", V = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
function Ke() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e;
}
var qe = class extends N {
	static properties = {
		heading: { type: String },
		closeLabel: { attribute: !1 },
		open: {
			type: Boolean,
			reflect: !0
		}
	};
	_opener = null;
	constructor() {
		super(), this.heading = "", this.closeLabel = "Close", this.open = !1;
	}
	static styles = o`
    dialog {
      padding: 0;
      border: none;
      background: transparent;
      max-width: min(560px, calc(100vw - 32px));
      width: 100%;
      max-height: calc(100vh - 64px);
      color: var(--primary-text-color);
    }
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.45);
    }
    .panel {
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 64px);
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: var(--ha-dialog-border-radius, var(--ha-card-border-radius, 12px));
      box-shadow: var(--ha-card-box-shadow, 0 8px 24px rgba(0, 0, 0, 0.3));
      overflow: hidden;
    }
    header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 8px 8px 24px;
    }
    h2 {
      flex: 1;
      margin: 0;
      font-size: var(--ha-font-size-xl, 20px);
      font-weight: var(--ha-font-weight-normal, 400);
      line-height: var(--ha-line-height-condensed, 1.2);
    }
    button.close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    button.close:hover {
      background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
    }
    button.close:focus-visible {
      outline: 2px solid var(--primary-color);
    }
    svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    .dialog-content {
      padding: 0 24px 24px;
      overflow-y: auto;
    }
    @media (max-width: 600px) {
      dialog,
      .panel {
        max-width: 100vw;
        max-height: 100vh;
        height: 100%;
        margin: 0;
        border-radius: 0;
      }
    }
  `;
	show() {
		this._opener = Ke(), this.open = !0;
	}
	close() {
		this.open &&= !1;
	}
	get _dialog() {
		return this.renderRoot?.querySelector("dialog") ?? null;
	}
	_focusables() {
		let e = [...this.renderRoot.querySelectorAll(V) ?? []], t = (this.renderRoot.querySelector("slot")?.assignedElements({ flatten: !0 }) ?? []).flatMap((e) => [...e.matches(V) ? [e] : [], ...e.querySelectorAll(V)]);
		return [...e, ...t];
	}
	updated(e) {
		if (!e.has("open")) return;
		let t = this._dialog;
		t && (this.open && !t.open ? (typeof t.showModal == "function" ? t.showModal() : t.setAttribute("open", ""), this._focusables()[0]?.focus()) : !this.open && e.get("open") === !0 && (t.open && t.close(), t.removeAttribute("open"), this._opener instanceof HTMLElement && this._opener.focus(), this._opener = null, this.dispatchEvent(new CustomEvent("closed", {
			bubbles: !0,
			composed: !0
		}))));
	}
	_onKeyDown(e) {
		if (e.key === "Escape") {
			e.preventDefault(), this.close();
			return;
		}
		if (e.key !== "Tab") return;
		let t = this._focusables();
		if (t.length === 0) {
			e.preventDefault();
			return;
		}
		let n = t[0], r = t[t.length - 1], i = Ke();
		e.shiftKey && (i === n || !t.includes(i)) ? (e.preventDefault(), r.focus()) : !e.shiftKey && (i === r || !t.includes(i)) && (e.preventDefault(), n.focus());
	}
	_onClick(e) {
		e.target === this._dialog && this.close();
	}
	_onCancel(e) {
		e.preventDefault(), this.close();
	}
	render() {
		return T`
      <dialog
        aria-labelledby="heading"
        @keydown=${this._onKeyDown}
        @click=${this._onClick}
        @cancel=${this._onCancel}
        @close=${this.close}
      >
        <div class="panel">
          <header>
            <h2 id="heading">${this.heading}</h2>
            <button class="close" aria-label=${this.closeLabel} title=${this.closeLabel} @click=${this.close}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${Ge}></path></svg>
            </button>
          </header>
          <div class="dialog-content"><slot></slot></div>
        </div>
      </dialog>
    `;
	}
}, Je = "librus_apix", Ye = "subject_grades";
function H(e, t) {
	return !e?.entities || !t ? [] : Object.values(e.entities).filter((e) => e.device_id === t && e.platform === "librus_apix");
}
function Xe(e, t) {
	let n = e.states[t]?.attributes ?? {}, r = n.subject;
	if (typeof r == "string" && r) return r;
	let i = n.friendly_name;
	return typeof i == "string" && i ? i : t;
}
function Ze(e, t, n) {
	return e ? H(e, t).filter((e) => e.translation_key === n).map((t) => ({
		entity_id: t.entity_id,
		name: Xe(e, t.entity_id)
	})).sort((e, t) => e.name.localeCompare(t.name, "pl")) : [];
}
function Qe(e, t) {
	return H(e, t).find((e) => e.translation_key === "gpa")?.entity_id;
}
function $e(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of Object.values(e?.entities ?? {})) r.platform === "librus_apix" && r.translation_key === t && r.device_id && n.add(r.device_id);
	return [...n];
}
//#endregion
//#region src/common/editor.ts
var U = class extends N {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	setConfig(e) {
		this._config = e;
	}
	_label = (e) => e.name ? L(this.hass, `editor.${e.name}`) : "";
	_valueChanged(e) {
		e.stopPropagation();
		let t = { ...e.detail.value };
		for (let [e, n] of Object.entries(t)) (n === "" || n == null) && delete t[e];
		this._config = t, this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: t },
			bubbles: !0,
			composed: !0
		}));
	}
	render() {
		return !this.hass || !this._config ? D : T`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this.schema}
        .computeLabel=${this._label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
	}
};
function et() {
	return {
		name: "",
		type: "grid",
		schema: [
			{
				name: "title",
				selector: { text: {} }
			},
			{
				name: "icon",
				selector: { icon: {} }
			},
			{
				name: "icon_color",
				selector: { ui_color: {} }
			}
		]
	};
}
function W(e, t = Je) {
	return [{
		name: "entity",
		required: !0,
		selector: { entity: { filter: [{
			domain: e,
			integration: t
		}] } }
	}, et()];
}
function tt() {
	return {
		name: "device",
		required: !0,
		selector: { device: { filter: [{ integration: Je }] } }
	};
}
function nt(e, t, n = []) {
	return {
		name: e,
		selector: { select: {
			multiple: !0,
			custom_value: !0,
			options: [...t, ...n.filter((e) => !t.includes(e))].map((e) => ({
				value: e,
				label: e
			}))
		} }
	};
}
//#endregion
//#region src/common/format.ts
function G(e) {
	return e?.locale?.time_zone === "server" ? e.config?.time_zone : void 0;
}
function rt(e) {
	if (!e) return;
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? void 0 : t;
}
function K(e, t) {
	let n = rt(t);
	return n ? new Intl.DateTimeFormat(I(e), {
		dateStyle: "short",
		timeStyle: "short",
		timeZone: G(e)
	}).format(n) : t;
}
function it(e, t) {
	let n = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(t);
	if (!n) return t;
	let [, r, i, a, o, s] = n.map(Number);
	return new Intl.DateTimeFormat(I(e), {
		dateStyle: "short",
		timeStyle: "short",
		timeZone: "UTC"
	}).format(new Date(Date.UTC(r, i - 1, a, o, s)));
}
function at(e, t) {
	return new Intl.DateTimeFormat(I(e), {
		timeStyle: "short",
		timeZone: G(e)
	}).format(t);
}
function ot(e, t) {
	let n = typeof t == "string", r = n ? /* @__PURE__ */ new Date(`${t}T12:00:00Z`) : t, i = n ? "UTC" : G(e), a = I(e);
	return {
		day: new Intl.DateTimeFormat(a, {
			day: "numeric",
			timeZone: i
		}).format(r),
		weekday: new Intl.DateTimeFormat(a, {
			weekday: "short",
			timeZone: i
		}).format(r)
	};
}
function q(e, t) {
	let n = /^\d{4}-\d{2}-\d{2}$/.test(t), r = rt(n ? `${t}T12:00:00Z` : t);
	return r ? new Intl.DateTimeFormat(I(e), {
		dateStyle: "short",
		timeZone: n ? "UTC" : G(e)
	}).format(r) : t;
}
function st(e, t) {
	return t == null || !Number.isFinite(t) ? "" : new Intl.NumberFormat(I(e), {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(t);
}
function ct(e) {
	let t = e ?? 5;
	if (!Number.isInteger(t) || t < 1 || t > 100) throw Error("count must be a whole number from 1 to 100");
}
function lt() {
	return {
		name: "count",
		selector: { number: {
			min: 1,
			max: 100,
			mode: "box"
		} }
	};
}
function J(e, t, n) {
	return {
		name: "fields",
		selector: { select: {
			multiple: !0,
			mode: "list",
			options: n.map((n) => ({
				value: n,
				label: L(e, `${t}.field_${n}`)
			}))
		} }
	};
}
var Y = o`
  ul.items {
    list-style: none;
    margin: 0;
    padding: 0 0 8px;
  }
  ul.items > li + li {
    border-top: 1px solid var(--divider-color);
  }
  button.row {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 8px 16px;
    border: none;
    background: none;
    color: var(--primary-text-color);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  button.row:hover {
    background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.04);
  }
  button.row:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .text {
    flex: 1;
    min-width: 0;
  }
  .title,
  .meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .meta {
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-s, 12px);
  }
  .empty {
    padding: 0 16px 16px;
  }
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 8px 16px;
    margin: 0;
  }
  dt {
    color: var(--secondary-text-color);
  }
  dd {
    margin: 0;
  }
  .body {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }
  .content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
`, X = "librus-announcements-card", ut = "librus-announcements-card-editor", dt = [
	"author",
	"date",
	"preview"
], ft = ["author", "date"];
function pt(e) {
	let t = e?.announcements;
	return Array.isArray(t) ? t : [];
}
function mt(e) {
	return Object.values(e?.states ?? {}).find((e) => e.entity_id.startsWith("sensor.") && Array.isArray(e.attributes.announcements))?.entity_id;
}
var ht = class extends z {
	static properties = { _selected: { state: !0 } };
	static styles = [R, Y];
	static getConfigElement() {
		return document.createElement(ut);
	}
	static getStubConfig(e) {
		return {
			type: `custom:${X}`,
			entity: mt(e) ?? ""
		};
	}
	setConfig(e) {
		if (!e?.entity) throw Error("Entity required (the Librus announcements sensor)");
		ct(e.count), super.setConfig(e);
	}
	get defaultTitle() {
		return this.t("announcements.name");
	}
	get defaultIcon() {
		return "mdi:bullhorn-outline";
	}
	get _fields() {
		return new Set(this._config?.fields ?? ft);
	}
	get _items() {
		return pt(this.stateObj?.attributes).slice(0, this._config?.count ?? 5);
	}
	getCardSize() {
		return 1 + Math.max(1, this._items.length);
	}
	_open(e) {
		this._selected = e, this.updateComplete.then(() => this.renderRoot.querySelector(B)?.show());
	}
	_renderRow(e) {
		let t = this._fields, n = [t.has("author") ? e.author : "", t.has("date") ? q(this.hass, e.date) : ""].filter(Boolean);
		return T`
      <li>
        <button class="row" @click=${() => this._open(e)}>
          <span class="text">
            <div class="title">${e.title}</div>
            ${n.length ? T`<div class="meta">${n.join(" · ")}</div>` : D}
            ${t.has("preview") && e.content ? T`<div class="meta preview">${e.content.split("\n")[0]}</div>` : D}
          </span>
        </button>
      </li>
    `;
	}
	_renderDetails(e) {
		return T`
      <dl>
        <dt>${this.t("announcements.author")}</dt>
        <dd>${e.author}</dd>
        <dt>${this.t("announcements.date")}</dt>
        <dd>${q(this.hass, e.date)}</dd>
      </dl>
      <div class="body"><div class="content">${e.content}</div></div>
    `;
	}
	render() {
		if (!this._config || !this.hass) return D;
		if (!this.stateObj) return this.renderMissingEntity();
		let e = this._items, t = this._selected ? pt(this.stateObj.attributes).find((e) => e.id === this._selected?.id) ?? this._selected : void 0;
		return T`
      <ha-card>
        ${this.renderHeader()}
        ${e.length ? T`<ul class="items">${e.map((e) => this._renderRow(e))}</ul>` : T`<div class="empty">${this.t("announcements.empty")}</div>`}
      </ha-card>
      <librus-apix-dialog
        .heading=${t?.title ?? ""}
        .closeLabel=${this.t("common.close")}
        @closed=${() => this._selected = void 0}
      >
        ${t ? this._renderDetails(t) : D}
      </librus-apix-dialog>
    `;
	}
}, gt = class extends U {
	get schema() {
		return [
			...W("sensor"),
			lt(),
			J(this.hass, "announcements", dt)
		];
	}
	setConfig(e) {
		super.setConfig({
			count: 5,
			fields: [...ft],
			...e
		});
	}
};
//#endregion
//#region src/common/api.ts
async function _t(e, t, n) {
	return (await e.callWS({
		type: "call_service",
		domain: "librus_apix",
		service: "get_message_content",
		service_data: {
			entity_id: t,
			message_id: n
		},
		return_response: !0
	})).response;
}
function vt(e) {
	return e && typeof e == "object" && "message" in e ? String(e.message) : String(e);
}
//#endregion
//#region src/cards/messages-card.ts
var Z = "librus-messages-card", yt = "librus-messages-card-editor", Q = [
	"author",
	"date",
	"attachment",
	"status"
];
function bt(e) {
	let t = e?.messages;
	return Array.isArray(t) ? t : [];
}
function xt(e) {
	return Object.values(e?.states ?? {}).find((e) => e.entity_id.startsWith("sensor.") && Array.isArray(e.attributes.messages))?.entity_id;
}
var St = class extends z {
	static properties = {
		_selected: { state: !0 },
		_loading: { state: !0 },
		_error: { state: !0 }
	};
	_contents = /* @__PURE__ */ new Map();
	static styles = [
		R,
		Y,
		o`
      .status {
        flex: none;
        color: var(--secondary-text-color);
      }
      .unread .status {
        color: var(--librus-unread-color);
      }
      li.unread.highlight {
        box-shadow: inset 4px 0 0 var(--librus-unread-color);
        background: color-mix(in srgb, var(--librus-unread-color) 10%, transparent);
      }
      .unread .title {
        font-weight: var(--ha-font-weight-bold, 700);
      }
      .attachment {
        flex: none;
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
      }
      .hint,
      .files {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
      }
      .files {
        list-style: none;
        margin: 12px 0 0;
        padding: 0;
      }
      .files li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 0;
        --mdc-icon-size: 16px;
      }
      .error {
        color: var(--error-color, #db4437);
      }
    `
	];
	static getConfigElement() {
		return document.createElement(yt);
	}
	static getStubConfig(e) {
		return {
			type: `custom:${Z}`,
			entity: xt(e) ?? ""
		};
	}
	setConfig(e) {
		if (!e?.entity) throw Error("Entity required (the Librus messages sensor)");
		ct(e.count), super.setConfig(e);
	}
	get defaultTitle() {
		return this.t("messages.name");
	}
	get defaultIcon() {
		return "mdi:email-outline";
	}
	get _fields() {
		return new Set(this._config?.fields ?? Q);
	}
	get _messages() {
		return bt(this.stateObj?.attributes).slice(0, this._config?.count ?? 5);
	}
	getCardSize() {
		return 1 + Math.max(1, this._messages.length);
	}
	_open(e) {
		this._selected = e, this._error = void 0, this.updateComplete.then(() => this.renderRoot.querySelector(B)?.show()), e.content_cached && !this._contents.has(e.id) && this._readContent(e);
	}
	async _readContent(e) {
		if (this.hass && this._config?.entity && this._loading !== e.id) {
			this._loading = e.id, this._error = void 0;
			try {
				let t = await _t(this.hass, this._config.entity, e.id);
				this._contents.set(e.id, t);
			} catch (t) {
				this._error = {
					id: e.id,
					text: vt(t)
				};
			} finally {
				this._loading = void 0;
			}
		}
	}
	_renderContent(e) {
		let t = this._contents.get(e.id);
		if (t) return T`
        <div class="content">${t.content}</div>
        ${t.attachments.length ? T`<ul class="files" aria-label=${this.t("messages.attachments")}>
              ${t.attachments.map((e) => T`<li><ha-icon .icon=${"mdi:paperclip"}></ha-icon><span>${e}</span></li>`)}
            </ul>` : D}
      `;
		if (this._loading === e.id) return T`<div class="hint">${this.t("common.loading")}</div>`;
		let n = this._error?.id === e.id ? this._error.text : void 0;
		return T`
      ${n ? T`<div class="error">${this.t("messages.cannot_read", { error: n })}</div>` : D}
      <button class="link" @click=${() => this._readContent(e)}>
        ${this.t(n ? "messages.retry" : "messages.read_content")}
      </button>
      ${e.content_cached ? D : T`<div class="hint">${this.t("messages.read_hint")}</div>`}
    `;
	}
	_statusText(e) {
		return this.t(e.unread ? "messages.unread" : "messages.read");
	}
	_renderRow(e) {
		let t = this._fields, n = [t.has("author") ? e.author : "", t.has("date") ? K(this.hass, e.date) : ""].filter(Boolean);
		return T`
      <li class=${e.unread ? this._config?.highlight_unread ? "unread highlight" : "unread" : "read"}>
        <button class="row" @click=${() => this._open(e)}>
          ${t.has("status") ? T`<ha-icon
                class="status"
                .icon=${e.unread ? "mdi:email" : "mdi:email-open-outline"}
                title=${this._statusText(e)}
              ></ha-icon>` : D}
          <span class="text">
            <div class="title">${e.title}</div>
            ${n.length ? T`<div class="meta">${n.join(" · ")}</div>` : D}
          </span>
          ${t.has("attachment") && e.has_attachment ? T`<ha-icon class="attachment" .icon=${"mdi:paperclip"} title=${this.t("messages.attachment")}></ha-icon>` : D}
        </button>
      </li>
    `;
	}
	renderDetails(e) {
		return T`
      <dl>
        <dt>${this.t("messages.from")}</dt>
        <dd>${e.author}</dd>
        <dt>${this.t("messages.date")}</dt>
        <dd>${K(this.hass, e.date)}</dd>
        <dt>${this.t("messages.status")}</dt>
        <dd>${this._statusText(e)}</dd>
        <dt>${this.t("messages.attachments")}</dt>
        <dd>${this.t(e.has_attachment ? "common.yes" : "common.no")}</dd>
      </dl>
      <div class="body">${this._renderContent(e)}</div>
    `;
	}
	render() {
		if (!this._config || !this.hass) return D;
		if (!this.stateObj) return this.renderMissingEntity();
		let e = this._messages, t = this._selected ? bt(this.stateObj.attributes).find((e) => e.id === this._selected?.id) ?? this._selected : void 0;
		return T`
      <ha-card style=${P({ "--librus-unread-color": F(this._config.unread_color) ?? "var(--primary-color)" })}>
        ${this.renderHeader()}
        ${e.length ? T`<ul class="items">${e.map((e) => this._renderRow(e))}</ul>` : T`<div class="empty">${this.t("messages.empty")}</div>`}
      </ha-card>
      <librus-apix-dialog
        .heading=${t?.title ?? ""}
        .closeLabel=${this.t("common.close")}
        @closed=${() => this._selected = void 0}
      >
        ${t ? this.renderDetails(t) : D}
      </librus-apix-dialog>
    `;
	}
}, Ct = class extends U {
	get schema() {
		return [
			...W("sensor"),
			lt(),
			J(this.hass, "messages", Q),
			{
				name: "",
				type: "grid",
				schema: [{
					name: "unread_color",
					selector: { ui_color: {} }
				}, {
					name: "highlight_unread",
					selector: { boolean: {} }
				}]
			}
		];
	}
	setConfig(e) {
		super.setConfig({
			count: 5,
			fields: [...Q],
			unread_color: "primary",
			highlight_unread: !1,
			...e
		});
	}
}, wt = [
	{
		id: "tests",
		types: [
			"Sprawdzian",
			"Kartkówka",
			"Klasówka",
			"Praca klasowa",
			"Test"
		]
	},
	{
		id: "trips",
		types: ["Wycieczka", "Wyjście"]
	},
	{
		id: "meetings",
		types: [
			"Zebranie z rodzicami",
			"Wywiadówka",
			"Konsultacje"
		]
	},
	{
		id: "days_off",
		types: ["Dzień wolny"]
	},
	{
		id: "contests",
		types: ["Konkurs", "Olimpiada"]
	},
	{
		id: "changes",
		types: ["Zastępstwo", "Odwołane zajęcia"]
	}
], Tt = "group:";
function $(e) {
	return e.trim().toLocaleLowerCase("pl");
}
function Et(e) {
	return (e.fields?.type || e.summary.split(":")[0]).trim();
}
function Dt(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Et(n);
		e && !t.has($(e)) && t.set($(e), e);
	}
	return [...t.values()].sort((e, t) => e.localeCompare(t, "pl"));
}
function Ot(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) n.startsWith("group:") ? wt.find((e) => e.id === n.slice(6))?.types.forEach((e) => t.add($(e))) : t.add($(n));
	return t;
}
function kt(e, t) {
	if (!t?.length) return e;
	let n = Ot(t);
	return e.filter((e) => n.has($(Et(e))));
}
//#endregion
//#region src/common/schedule.ts
function At(e) {
	let t = (e ?? "").split("\n");
	for (let e = t.length - 1; e >= 0; e--) if (t[e].startsWith("{")) {
		try {
			let n = JSON.parse(t[e]);
			if (n && typeof n == "object" && "librus_apix" in n) {
				let { librus_apix: r, ...i } = n;
				return {
					text: t.slice(0, e).join("\n").trim(),
					fields: i
				};
			}
		} catch {}
		break;
	}
	return { text: (e ?? "").trim() };
}
function jt(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(t, n - 1, r);
}
function Mt(e) {
	let t = !e.start.dateTime, n = t ? jt(e.start.date ?? "") : new Date(e.start.dateTime), r = t ? jt(e.end.date ?? e.start.date ?? "") : new Date(e.end.dateTime ?? e.start.dateTime), { text: i, fields: a } = At(e.description);
	return {
		uid: e.uid ?? a?.id ?? `${e.summary}|${n.toISOString()}`,
		summary: e.summary,
		start: n,
		end: r,
		allDay: t,
		date: t ? e.start.date : void 0,
		text: i,
		fields: a
	};
}
function Nt(e, t, n) {
	return e.filter((e) => e.end > t && e.start < n).sort((e, t) => e.start.getTime() - t.start.getTime() || e.summary.localeCompare(t.summary));
}
async function Pt(e, t, n, r) {
	let i = `start=${encodeURIComponent(n.toISOString())}&end=${encodeURIComponent(r.toISOString())}`;
	return Nt((await e.callApi("GET", `calendars/${t}?${i}`)).map(Mt), n, r);
}
//#endregion
//#region src/cards/schedule-card.ts
var Ft = "librus-schedule-card", It = "librus-schedule-card-editor", Lt = [
	"date",
	"time",
	"description",
	"teacher"
], Rt = [
	"date",
	"time",
	"description"
], zt = 9e5, Bt = 864e5;
function Vt(e) {
	let t = Object.values(e?.states ?? {});
	return (t.find((e) => e.entity_id.startsWith("calendar.") && String(e.attributes.description ?? "").includes("\"librus_apix\"")) ?? t.find((e) => e.entity_id.startsWith("calendar.")))?.entity_id;
}
var Ht = class extends z {
	static properties = {
		_events: { state: !0 },
		_error: { state: !0 },
		_selected: { state: !0 }
	};
	_timer;
	_fetching;
	static styles = [
		R,
		Y,
		o`
      .badge {
        flex: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 40px;
        line-height: 1.1;
      }
      .badge .day {
        font-size: var(--ha-font-size-l, 18px);
        font-weight: var(--ha-font-weight-medium, 500);
      }
      .badge .weekday {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
        text-transform: uppercase;
      }
      li.next {
        box-shadow: inset 4px 0 0 var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }
      li.next .title {
        font-weight: var(--ha-font-weight-medium, 500);
      }
      .next-label {
        flex: none;
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: var(--ha-font-size-xs, 11px);
      }
      .error {
        padding: 0 16px 16px;
        color: var(--error-color, #db4437);
      }
    `
	];
	static getConfigElement() {
		return document.createElement(It);
	}
	static getStubConfig(e) {
		return {
			type: `custom:${Ft}`,
			entity: Vt(e) ?? ""
		};
	}
	setConfig(e) {
		if (!e?.entity) throw Error("Entity required (the Librus schedule calendar)");
		let t = e.days ?? 14;
		if (!Number.isInteger(t) || t < 1 || t > 200) throw Error("days must be a whole number from 1 to 200");
		let n = this._config?.entity !== e.entity || this._config?.days !== e.days;
		super.setConfig(e), n && (this._events = void 0, this._refresh());
	}
	get defaultTitle() {
		return this.t("schedule.name");
	}
	get defaultIcon() {
		return "mdi:calendar-text";
	}
	get _fields() {
		return new Set(this._config?.fields ?? Rt);
	}
	connectedCallback() {
		super.connectedCallback(), this._timer = setInterval(() => void this._refresh(), zt), this._refresh();
	}
	disconnectedCallback() {
		super.disconnectedCallback(), clearInterval(this._timer), this._timer = void 0;
	}
	updated(e) {
		super.updated(e);
		let t = e.get("hass"), n = this._config?.entity;
		n && t && t.states[n] !== this.hass?.states[n] && this._refresh(), !t && e.has("hass") && this._events === void 0 && this._refresh();
	}
	async _refresh() {
		if (!this.hass || !this._config?.entity || !this.isConnected || this._fetching) return this._fetching;
		let e = /* @__PURE__ */ new Date(), t = new Date(e.getTime() + (this._config.days ?? 14) * Bt);
		return this._fetching = Pt(this.hass, this._config.entity, e, t).then((e) => {
			this._events = e, this._error = void 0;
		}).catch((e) => {
			this._error = vt(e);
		}).finally(() => {
			this._fetching = void 0;
		}), this._fetching;
	}
	get _shown() {
		return this._events && kt(this._events, this._config?.types);
	}
	getCardSize() {
		return 1 + Math.max(1, this._shown?.length ?? 1);
	}
	_open(e) {
		this._selected = e, this.updateComplete.then(() => this.renderRoot.querySelector(B)?.show());
	}
	_when(e) {
		return e.allDay ? this.t("schedule.all_day") : `${at(this.hass, e.start)}–${at(this.hass, e.end)}`;
	}
	_renderRow(e, t) {
		let n = this._fields, r = e.fields?.lesson, i = [
			n.has("time") ? this._when(e) : "",
			n.has("time") && r ? this.t("schedule.lesson_n", { n: r }) : "",
			n.has("teacher") ? e.fields?.teacher ?? "" : "",
			n.has("description") ? e.fields?.description ?? "" : ""
		].filter(Boolean), a = ot(this.hass, e.date ?? e.start);
		return T`
      <li class=${t && this._config?.highlight_next !== !1 ? "next" : ""}>
        <button class="row" @click=${() => this._open(e)}>
          ${n.has("date") ? T`<span class="badge" aria-label=${e.date ? q(this.hass, e.date) : K(this.hass, e.start.toISOString())}>
                <span class="day">${a.day}</span>
                <span class="weekday">${a.weekday}</span>
              </span>` : D}
          <span class="text">
            <div class="title">${e.summary}</div>
            ${i.length ? T`<div class="meta">${i.join(" · ")}</div>` : D}
          </span>
          ${t && this._config?.show_next_label !== !1 ? T`<span class="next-label">${this.t("schedule.next")}</span>` : D}
        </button>
      </li>
    `;
	}
	_renderDetails(e) {
		let t = e.fields, n = e.date ? q(this.hass, e.date) : q(this.hass, e.start.toISOString()), r = [
			[this.t("schedule.type"), t?.type],
			[this.t("schedule.subject"), t?.subject],
			[this.t("schedule.date"), n],
			[this.t("schedule.time"), this._when(e)],
			[this.t("schedule.lesson"), t?.lesson ? String(t.lesson) : void 0],
			[this.t("schedule.teacher"), t?.teacher],
			[this.t("schedule.added"), t?.date_added ? it(this.hass, t.date_added) : void 0]
		], i = /* @__PURE__ */ new Set([
			"Data",
			"Nr lekcji",
			"Rodzaj",
			"Przedmiot",
			"Nauczyciel",
			"Opis",
			"Data dodania",
			"Godzina"
		]), a = Object.entries(t?.details ?? {}).filter(([e, t]) => t && !i.has(e)), o = t ? t.description : e.text;
		return T`
      <dl>
        ${r.filter(([, e]) => e).map(([e, t]) => T`<dt>${e}</dt><dd>${t}</dd>`)}
        ${a.map(([e, t]) => T`<dt>${e}</dt><dd>${t}</dd>`)}
      </dl>
      ${o ? T`<div class="body"><div class="content">${o}</div></div>` : D}
    `;
	}
	render() {
		if (!this._config || !this.hass) return D;
		if (!this.stateObj) return this.renderMissingEntity();
		let e = this._shown, t = Date.now(), n = e?.find((e) => e.end.getTime() > t), r;
		if (this._error && !e) r = T`<div class="error">${this.t("common.error", { error: this._error })}</div>`;
		else if (!e) r = T`<div class="empty">${this.t("common.loading")}</div>`;
		else if (e.length) r = T`<ul class="items">${e.map((e) => this._renderRow(e, e === n))}</ul>`;
		else {
			let e = this._events?.length ? "schedule.empty_filtered" : "schedule.empty";
			r = T`<div class="empty">${this.t(e, { days: this._config.days ?? 14 })}</div>`;
		}
		return T`
      <ha-card>
        ${this.renderHeader()} ${r}
      </ha-card>
      <librus-apix-dialog
        .heading=${this._selected?.summary ?? ""}
        .closeLabel=${this.t("common.close")}
        @closed=${() => this._selected = void 0}
      >
        ${this._selected ? this._renderDetails(this._selected) : D}
      </librus-apix-dialog>
    `;
	}
}, Ut = class extends U {
	static properties = { _found: { state: !0 } };
	_foundFor;
	updated(e) {
		super.updated(e);
		let t = this._config?.entity;
		if (this.hass && t && t !== this._foundFor) {
			this._foundFor = t;
			let e = /* @__PURE__ */ new Date();
			Pt(this.hass, t, e, new Date(e.getTime() + 200 * Bt)).then((e) => {
				this._foundFor === t && (this._found = Dt(e));
			}).catch(() => void 0);
		}
	}
	_typeOptions() {
		let e = wt.map((e) => ({
			value: `${Tt}${e.id}`,
			label: `${L(this.hass, `schedule.group_${e.id}`)} (${e.types.join(", ")})`
		})), t = [...this._found ?? []];
		for (let e of this._config?.types ?? []) !e.startsWith("group:") && !t.includes(e) && t.push(e);
		return [...e, ...t.map((e) => ({
			value: e,
			label: e
		}))];
	}
	get schema() {
		return [
			...W("calendar"),
			{
				name: "days",
				selector: { number: {
					min: 1,
					max: 200,
					mode: "box",
					unit_of_measurement: "d"
				} }
			},
			J(this.hass, "schedule", Lt),
			{
				name: "types",
				selector: { select: {
					multiple: !0,
					custom_value: !0,
					options: this._typeOptions()
				} }
			},
			{
				name: "",
				type: "grid",
				schema: [{
					name: "highlight_next",
					selector: { boolean: {} }
				}, {
					name: "show_next_label",
					selector: { boolean: {} }
				}]
			}
		];
	}
	setConfig(e) {
		super.setConfig({
			days: 14,
			fields: [...Rt],
			highlight_next: !0,
			show_next_label: !0,
			...e
		});
	}
}, Wt = Ne(class extends Pe {
	constructor(e) {
		if (super(e), e.type !== Me.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
	}
	render(e) {
		return " " + Object.keys(e).filter((t) => e[t]).join(" ") + " ";
	}
	update(e, [t]) {
		if (this.st === void 0) {
			this.st = /* @__PURE__ */ new Set(), e.strings !== void 0 && (this.nt = new Set(e.strings.join(" ").split(/\s/).filter((e) => e !== "")));
			for (let e in t) t[e] && !this.nt?.has(e) && this.st.add(e);
			return this.render(t);
		}
		let n = e.element.classList;
		for (let e of this.st) e in t || (n.remove(e), this.st.delete(e));
		for (let e in t) {
			let r = !!t[e];
			r === this.st.has(e) || this.nt?.has(e) || (r ? (n.add(e), this.st.add(e)) : (n.remove(e), this.st.delete(e)));
		}
		return E;
	}
}), Gt = "librus-grades-card", Kt = "librus-grades-card-editor";
function qt(e) {
	let t = e ? Number.parseFloat(e.state) : NaN;
	return Number.isFinite(t) ? t : null;
}
function Jt(e) {
	return e?.attributes.semester === 2 ? 2 : 1;
}
function Yt(e) {
	let t = e?.attributes.grades?.[`semester_${Jt(e)}`];
	return Array.isArray(t) ? [...t].sort((e, t) => e.date.localeCompare(t.date) || e.id.localeCompare(t.id, "en", { numeric: !0 })) : [];
}
var Xt = class extends z {
	static styles = [
		R,
		Y,
		o`
      .gpa {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 0 16px 12px;
        color: var(--secondary-text-color);
      }
      .gpa .value {
        color: var(--librus-level-color, var(--primary-text-color));
        font-size: var(--ha-font-size-l, 16px);
        font-weight: var(--ha-font-weight-bold, 700);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 16px;
      }
      li.level {
        box-shadow: inset 4px 0 0 var(--librus-level-color);
        background: color-mix(in srgb, var(--librus-level-color) 10%, transparent);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
      }
      .chip {
        min-width: 1.5em;
        padding: 0 6px;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        font-size: var(--ha-font-size-s, 12px);
        line-height: 20px;
        text-align: center;
      }
      .chip.not-counted {
        color: var(--secondary-text-color);
        border-style: dashed;
      }
      .average {
        flex: none;
        min-width: 3em;
        text-align: end;
        font-weight: var(--ha-font-weight-bold, 700);
        color: var(--librus-level-color, var(--primary-text-color));
      }
    `
	];
	static getConfigElement() {
		return document.createElement(Kt);
	}
	static getStubConfig(e) {
		return {
			type: `custom:${Gt}`,
			device: $e(e, "subject_grades")[0] ?? ""
		};
	}
	setConfig(e) {
		if (!e?.device) throw Error("Device required (a Librus student)");
		super.setConfig(e);
	}
	get defaultTitle() {
		return this.t("grades.name");
	}
	get defaultIcon() {
		return "mdi:school-outline";
	}
	get shownSubjects() {
		let e = new Set(this._config?.exclude ?? []);
		return Ze(this.hass, this._config?.device, Ye).filter((t) => !e.has(t.name));
	}
	getCardSize() {
		return 1 + Math.max(1, this.shownSubjects.length);
	}
	shouldUpdate(e) {
		if (e.size !== 1 || !e.has("hass")) return !0;
		let t = e.get("hass");
		return !t || !this.hass || t.entities !== this.hass.entities || t.locale?.language !== this.hass.locale?.language || t.themes?.darkMode !== this.hass.themes?.darkMode || H(this.hass, this._config?.device).some((e) => t.states[e.entity_id] !== this.hass?.states[e.entity_id]);
	}
	_level(e) {
		return this._config ? He(e, this._config) : void 0;
	}
	_renderGpa() {
		let e = Qe(this.hass, this._config?.device), t = e ? this.hass?.states[e] : void 0;
		if (this._config?.show_gpa === !1 || !t) return D;
		let n = qt(t);
		return T`
      <div class="gpa" style=${P({ "--librus-level-color": this._level(n) })}>
        <span>${this.t("grades.gpa")}</span>
        <span class="value">${st(this.hass, n) || "–"}</span>
        <span>${this.t("grades.semester", { n: Jt(t) })}</span>
      </div>
    `;
	}
	_gradeTitle(e) {
		let t = [e.category, q(this.hass, e.date)];
		return e.weight && t.push(this.t("grades.weight_n", { n: e.weight })), e.counts || t.push(this.t("grades.not_counted")), t.filter(Boolean).join(" · ");
	}
	renderRow(e) {
		let t = this.hass?.states[e.entity_id], n = qt(t), r = this._level(n), i = Yt(t);
		return T`
      <li class=${Wt({ level: !!r })} style=${P({ "--librus-level-color": r })}>
        <div class="row">
          <span class="text">
            <div class="title">${e.name}</div>
            ${i.length ? T`<div class="chips">
                  ${i.map((e) => T`<span class=${Wt({
			chip: !0,
			"not-counted": !e.counts
		})} title=${this._gradeTitle(e)}
                        >${e.grade}</span
                      >`)}
                </div>` : T`<div class="meta">${this.t("grades.no_grades")}</div>`}
          </span>
          ${this._config?.show_average === !1 ? D : T`<span class="average">${st(this.hass, n) || "–"}</span>`}
        </div>
      </li>
    `;
	}
	render() {
		if (!this._config || !this.hass) return D;
		if (!H(this.hass, this._config.device).length) return T`
        <ha-card>
          ${this.renderHeader()}
          <div class="warning">${this.t("grades.no_student")}</div>
        </ha-card>
      `;
		let e = this.shownSubjects;
		return T`
      <ha-card>
        ${this.renderHeader()} ${this._renderGpa()}
        ${e.length ? T`<ul class="items">${e.map((e) => this.renderRow(e))}</ul>` : T`<div class="empty">${this.t("grades.empty")}</div>`}
      </ha-card>
    `;
	}
};
function Zt() {
	let e = { number: {
		min: 0,
		max: 6,
		step: .01,
		mode: "box"
	} };
	return {
		name: "",
		type: "grid",
		schema: [
			"bad",
			"ok",
			"excellent"
		].flatMap((t) => [{
			name: `level_${t}`,
			selector: e
		}, {
			name: `color_${t}`,
			selector: { ui_color: {} }
		}])
	};
}
//#endregion
//#region src/index.ts
var Qt = [
	[B, qe],
	[Z, St],
	[yt, Ct],
	[X, ht],
	[ut, gt],
	[Ft, Ht],
	[It, Ut],
	[Gt, Xt],
	[Kt, class extends U {
		get schema() {
			let e = Ze(this.hass, this._config?.device, Ye).map((e) => e.name);
			return [
				tt(),
				et(),
				nt("exclude", e, this._config?.exclude),
				{
					name: "",
					type: "grid",
					schema: [{
						name: "show_average",
						selector: { boolean: {} }
					}, {
						name: "show_gpa",
						selector: { boolean: {} }
					}]
				},
				Zt()
			];
		}
		setConfig(e) {
			super.setConfig({
				show_average: !0,
				show_gpa: !0,
				...e
			});
		}
	}]
], $t = [
	{
		type: Ft,
		name: "Librus schedule",
		description: "Upcoming Librus schedule events (tests, trips, meetings) of a student.",
		preview: !0
	},
	{
		type: Z,
		name: "Librus messages",
		description: "Last Librus messages of a student with read and attachment marks.",
		preview: !0
	},
	{
		type: X,
		name: "Librus announcements",
		description: "Last Librus announcements of a student's school with the full text in a pop-up.",
		preview: !0
	},
	{
		type: Gt,
		name: "Librus grades",
		description: "Grades of a student by subject with averages, the GPA and colour levels.",
		preview: !0
	}
];
for (let [e, t] of Qt) customElements.get(e) || customElements.define(e, t);
window.customCards = window.customCards ?? [];
for (let e of $t) window.customCards.some((t) => t.type === e.type) || window.customCards.push(e);
//#endregion
