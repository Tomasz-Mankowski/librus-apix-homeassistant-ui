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
}, h = (e, t) => !l(e, t), g = {
	attribute: !0,
	type: String,
	converter: m,
	reflect: !1,
	useDefault: !1,
	hasChanged: h
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var _ = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = g) {
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
		return this.elementProperties.get(e) ?? g;
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
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? h)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
_.elementStyles = [], _.shadowRootOptions = { mode: "open" }, _[p("elementProperties")] = /* @__PURE__ */ new Map(), _[p("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: _ }), (f.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region ../opt/ui/node_modules/lit-html/lit-html.js
var v = globalThis, oe = (e) => e, y = v.trustedTypes, b = y ? y.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, x = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, C = "?" + S, se = `<${C}>`, w = document, T = () => w.createComment(""), E = (e) => e === null || typeof e != "object" && typeof e != "function", D = Array.isArray, ce = (e) => D(e) || typeof e?.[Symbol.iterator] == "function", O = "[ 	\n\f\r]", k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, le = /-->/g, ue = />/g, A = RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), j = /'/g, M = /"/g, N = /^(?:script|style|textarea|title)$/i, P = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), F = Symbol.for("lit-noChange"), I = Symbol.for("lit-nothing"), L = /* @__PURE__ */ new WeakMap(), R = w.createTreeWalker(w, 129);
function z(e, t) {
	if (!D(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return b === void 0 ? t : b.createHTML(t);
}
var de = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = k;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === k ? c[1] === "!--" ? o = le : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = A) : (N.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = A) : o = ue : o === A ? c[0] === ">" ? (o = i ?? k, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? A : c[3] === "\"" ? M : j) : o === M || o === j ? o = A : o === le || o === ue ? o = k : (o = A, i = void 0);
		let d = o === A && e[t + 1].startsWith("/>") ? " " : "";
		a += o === k ? n + se : l >= 0 ? (r.push(s), n.slice(0, l) + x + n.slice(l) + S + d) : n + S + (l === -2 ? t : d);
	}
	return [z(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, B = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = de(t, n);
		if (this.el = e.createElement(l, r), R.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = R.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(x)) {
					let t = u[o++], n = i.getAttribute(e).split(S), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? pe : r[1] === "?" ? me : r[1] === "@" ? he : U
					}), i.removeAttribute(e);
				} else e.startsWith(S) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (N.test(i.tagName)) {
					let e = i.textContent.split(S), t = e.length - 1;
					if (t > 0) {
						i.textContent = y ? y.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], T()), R.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], T());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === C) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(S, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += S.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = w.createElement("template");
		return n.innerHTML = e, n;
	}
};
function V(e, t, n = e, r) {
	if (t === F) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = E(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = V(e, i._$AS(e, t.values), i, r)), t;
}
var fe = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? w).importNode(t, !0);
		R.currentNode = r;
		let i = R.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new H(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new ge(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = R.nextNode(), a++);
		}
		return R.currentNode = w, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, H = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = I, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = V(this, e, t), E(e) ? e === I || e == null || e === "" ? (this._$AH !== I && this._$AR(), this._$AH = I) : e !== this._$AH && e !== F && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ce(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== I && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(w.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = B.createElement(z(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new fe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = L.get(e.strings);
		return t === void 0 && L.set(e.strings, t = new B(e)), t;
	}
	k(t) {
		D(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(T()), this.O(T()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = oe(e).nextSibling;
			oe(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, U = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = I, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = I;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = V(this, e, t, 0), a = !E(e) || e !== this._$AH && e !== F, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = V(this, r[n + o], t, o), s === F && (s = this._$AH[o]), a ||= !E(s) || s !== this._$AH[o], s === I ? e = I : e !== I && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === I ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, pe = class extends U {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === I ? void 0 : e;
	}
}, me = class extends U {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== I);
	}
}, he = class extends U {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = V(this, e, t, 0) ?? I) === F) return;
		let n = this._$AH, r = e === I && n !== I || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== I && (n === I || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, ge = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		V(this, e);
	}
}, _e = v.litHtmlPolyfillSupport;
_e?.(B, H), (v.litHtmlVersions ??= []).push("3.3.3");
var ve = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new H(t.insertBefore(T(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, W = globalThis, G = class extends _ {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ve(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return F;
	}
};
G._$litElement$ = !0, G.finalized = !0, W.litElementHydrateSupport?.({ LitElement: G });
var ye = W.litElementPolyfillSupport;
ye?.({ LitElement: G }), (W.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region src/common/localize.ts
var K = {
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
			fields: "Shown on the list"
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
			field_status: "Read / unread icon"
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
			fields: "Pokazywane na liście"
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
			field_status: "Ikona przeczytania"
		}
	}
};
function q(e) {
	return (e?.locale?.language ?? e?.language ?? "en").toLowerCase().startsWith("pl") ? "pl" : "en";
}
function J(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (typeof n != "object") return;
		n = n[e];
	}
	return typeof n == "string" ? n : void 0;
}
function Y(e, t, n = {}) {
	return (J(K[q(e)], t) ?? J(K.en, t) ?? t).replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e);
}
//#endregion
//#region src/common/styles.ts
var be = o`
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
`, xe = class extends G {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = be;
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
		return Y(this.hass, e, t);
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
		if (!e) return I;
		let t = this._config?.icon ?? this.defaultIcon;
		return P`
      <h1 class="card-header">
        ${t ? P`<ha-icon .icon=${t}></ha-icon>` : I}
        <span class="name">${e}</span>
      </h1>
    `;
	}
	renderMissingEntity() {
		return P`
      <ha-card>
        ${this.renderHeader()}
        <div class="warning">${this.t("common.entity_not_found", { entity: this._config?.entity ?? "" })}</div>
      </ha-card>
    `;
	}
}, Se = "librus-apix-dialog", Ce = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", X = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
function we() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e;
}
var Te = class extends G {
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
    .content {
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
		this._opener = we(), this.open = !0;
	}
	close() {
		this.open &&= !1;
	}
	get _dialog() {
		return this.renderRoot?.querySelector("dialog") ?? null;
	}
	_focusables() {
		let e = [...this.renderRoot.querySelectorAll(X) ?? []], t = (this.renderRoot.querySelector("slot")?.assignedElements({ flatten: !0 }) ?? []).flatMap((e) => [...e.matches(X) ? [e] : [], ...e.querySelectorAll(X)]);
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
		let n = t[0], r = t[t.length - 1], i = we();
		e.shiftKey && (i === n || !t.includes(i)) ? (e.preventDefault(), r.focus()) : !e.shiftKey && (i === r || !t.includes(i)) && (e.preventDefault(), n.focus());
	}
	_onClick(e) {
		e.target === this._dialog && this.close();
	}
	_onCancel(e) {
		e.preventDefault(), this.close();
	}
	render() {
		return P`
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
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${Ce}></path></svg>
            </button>
          </header>
          <div class="content"><slot></slot></div>
        </div>
      </dialog>
    `;
	}
}, Ee = class extends G {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	setConfig(e) {
		this._config = e;
	}
	_label = (e) => e.name ? Y(this.hass, `editor.${e.name}`) : "";
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
		return !this.hass || !this._config ? I : P`
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
function De(e, t = "librus_apix") {
	return [{
		name: "entity",
		required: !0,
		selector: { entity: { filter: [{
			domain: e,
			integration: t
		}] } }
	}, {
		name: "",
		type: "grid",
		schema: [{
			name: "title",
			selector: { text: {} }
		}, {
			name: "icon",
			selector: { icon: {} }
		}]
	}];
}
//#endregion
//#region src/common/format.ts
function Oe(e) {
	return e?.locale?.time_zone === "server" ? e.config?.time_zone : void 0;
}
function ke(e) {
	if (!e) return;
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? void 0 : t;
}
function Z(e, t) {
	let n = ke(t);
	return n ? new Intl.DateTimeFormat(q(e), {
		dateStyle: "short",
		timeStyle: "short",
		timeZone: Oe(e)
	}).format(n) : t;
}
//#endregion
//#region src/cards/messages-card.ts
var Q = "librus-messages-card", Ae = "librus-messages-card-editor", $ = [
	"author",
	"date",
	"attachment",
	"status"
];
function je(e) {
	let t = e?.messages;
	return Array.isArray(t) ? t : [];
}
function Me(e) {
	return Object.values(e?.states ?? {}).find((e) => e.entity_id.startsWith("sensor.") && Array.isArray(e.attributes.messages))?.entity_id;
}
var Ne = class extends xe {
	static properties = { _selected: { state: !0 } };
	static styles = [be, o`
      ul {
        list-style: none;
        margin: 0;
        padding: 0 0 8px;
      }
      li + li {
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
      .status {
        flex: none;
        color: var(--secondary-text-color);
      }
      .unread .status {
        color: var(--primary-color);
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
      .unread .title {
        font-weight: var(--ha-font-weight-bold, 700);
      }
      .meta {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-s, 12px);
      }
      .attachment {
        flex: none;
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
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
    `];
	static getConfigElement() {
		return document.createElement(Ae);
	}
	static getStubConfig(e) {
		return {
			type: `custom:${Q}`,
			entity: Me(e) ?? ""
		};
	}
	setConfig(e) {
		if (!e?.entity) throw Error("Entity required (the Librus messages sensor)");
		let t = e.count ?? 5;
		if (!Number.isInteger(t) || t < 1 || t > 100) throw Error("count must be a whole number from 1 to 100");
		super.setConfig(e);
	}
	get defaultTitle() {
		return this.t("messages.name");
	}
	get defaultIcon() {
		return "mdi:email-outline";
	}
	get _fields() {
		return new Set(this._config?.fields ?? $);
	}
	get _messages() {
		return je(this.stateObj?.attributes).slice(0, this._config?.count ?? 5);
	}
	getCardSize() {
		return 1 + Math.max(1, this._messages.length);
	}
	_open(e) {
		this._selected = e, this.updateComplete.then(() => this.renderRoot.querySelector(Se)?.show());
	}
	_statusText(e) {
		return this.t(e.unread ? "messages.unread" : "messages.read");
	}
	_renderRow(e) {
		let t = this._fields, n = [t.has("author") ? e.author : "", t.has("date") ? Z(this.hass, e.date) : ""].filter(Boolean);
		return P`
      <li class=${e.unread ? "unread" : "read"}>
        <button class="row" @click=${() => this._open(e)}>
          ${t.has("status") ? P`<ha-icon
                class="status"
                .icon=${e.unread ? "mdi:email" : "mdi:email-open-outline"}
                title=${this._statusText(e)}
              ></ha-icon>` : I}
          <span class="text">
            <div class="title">${e.title}</div>
            ${n.length ? P`<div class="meta">${n.join(" · ")}</div>` : I}
          </span>
          ${t.has("attachment") && e.has_attachment ? P`<ha-icon class="attachment" .icon=${"mdi:paperclip"} title=${this.t("messages.attachment")}></ha-icon>` : I}
        </button>
      </li>
    `;
	}
	renderDetails(e) {
		return P`
      <dl>
        <dt>${this.t("messages.from")}</dt>
        <dd>${e.author}</dd>
        <dt>${this.t("messages.date")}</dt>
        <dd>${Z(this.hass, e.date)}</dd>
        <dt>${this.t("messages.status")}</dt>
        <dd>${this._statusText(e)}</dd>
        <dt>${this.t("messages.attachments")}</dt>
        <dd>${this.t(e.has_attachment ? "common.yes" : "common.no")}</dd>
      </dl>
    `;
	}
	render() {
		if (!this._config || !this.hass) return I;
		if (!this.stateObj) return this.renderMissingEntity();
		let e = this._messages;
		return P`
      <ha-card>
        ${this.renderHeader()}
        ${e.length ? P`<ul>${e.map((e) => this._renderRow(e))}</ul>` : P`<div class="empty">${this.t("messages.empty")}</div>`}
      </ha-card>
      <librus-apix-dialog
        .heading=${this._selected?.title ?? ""}
        .closeLabel=${this.t("common.close")}
        @closed=${() => this._selected = void 0}
      >
        ${this._selected ? this.renderDetails(this._selected) : I}
      </librus-apix-dialog>
    `;
	}
}, Pe = [
	[Se, Te],
	[Q, Ne],
	[Ae, class extends Ee {
		get schema() {
			return [
				...De("sensor"),
				{
					name: "count",
					selector: { number: {
						min: 1,
						max: 100,
						mode: "box"
					} }
				},
				{
					name: "fields",
					selector: { select: {
						multiple: !0,
						mode: "list",
						options: $.map((e) => ({
							value: e,
							label: Y(this.hass, `messages.field_${e}`)
						}))
					} }
				}
			];
		}
		setConfig(e) {
			super.setConfig({
				count: 5,
				fields: [...$],
				...e
			});
		}
	}]
], Fe = [{
	type: Q,
	name: "Librus messages",
	description: "Last Librus messages of a student with read and attachment marks.",
	preview: !0
}];
for (let [e, t] of Pe) customElements.get(e) || customElements.define(e, t);
window.customCards = window.customCards ?? [];
for (let e of Fe) window.customCards.some((t) => t.type === e.type) || window.customCards.push(e);
//#endregion
