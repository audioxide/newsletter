
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.41.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Header.svelte generated by Svelte v3.41.0 */

    const file$5 = "src/components/Header.svelte";

    function create_fragment$5(ctx) {
    	let header;
    	let span;
    	let t0;
    	let a0;
    	let t2;
    	let div1;
    	let button;
    	let t3;
    	let i;
    	let t4;
    	let div0;
    	let a1;
    	let t6;
    	let a2;
    	let t8;
    	let a3;

    	const block = {
    		c: function create() {
    			header = element("header");
    			span = element("span");
    			t0 = text("Receive Audioxide roundups every month → ");
    			a0 = element("a");
    			a0.textContent = "Sign up here";
    			t2 = space();
    			div1 = element("div");
    			button = element("button");
    			t3 = text("Browse Archive\n                ");
    			i = element("i");
    			t4 = space();
    			div0 = element("div");
    			a1 = element("a");
    			a1.textContent = "July 02021";
    			t6 = space();
    			a2 = element("a");
    			a2.textContent = "June 02021";
    			t8 = space();
    			a3 = element("a");
    			a3.textContent = "May 02021";
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "signup-link svelte-91g6ys");
    			add_location(a0, file$5, 1, 71, 80);
    			attr_dev(span, "class", "header-text svelte-91g6ys");
    			add_location(span, file$5, 1, 4, 13);
    			attr_dev(i, "class", "fa fa-caret-down");
    			add_location(i, file$5, 4, 16, 234);
    			attr_dev(button, "class", "dropbtn svelte-91g6ys");
    			add_location(button, file$5, 3, 12, 179);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "svelte-91g6ys");
    			add_location(a1, file$5, 7, 16, 348);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "svelte-91g6ys");
    			add_location(a2, file$5, 8, 16, 391);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "class", "svelte-91g6ys");
    			add_location(a3, file$5, 9, 16, 434);
    			attr_dev(div0, "class", "dropdown-content svelte-91g6ys");
    			add_location(div0, file$5, 6, 12, 301);
    			attr_dev(div1, "class", "dropdown svelte-91g6ys");
    			add_location(div1, file$5, 2, 8, 144);
    			attr_dev(header, "class", "svelte-91g6ys");
    			add_location(header, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, span);
    			append_dev(span, t0);
    			append_dev(span, a0);
    			append_dev(header, t2);
    			append_dev(header, div1);
    			append_dev(div1, button);
    			append_dev(button, t3);
    			append_dev(button, i);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, a1);
    			append_dev(div0, t6);
    			append_dev(div0, a2);
    			append_dev(div0, t8);
    			append_dev(div0, a3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/SignupBox.svelte generated by Svelte v3.41.0 */

    const file$4 = "src/components/SignupBox.svelte";

    function create_fragment$4(ctx) {
    	let h2;
    	let t1;
    	let span0;
    	let t3;
    	let div;
    	let label;
    	let t5;
    	let input;
    	let t6;
    	let span1;
    	let t8;
    	let ul;
    	let li0;
    	let t10;
    	let li1;
    	let t12;
    	let li2;
    	let t14;
    	let span2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Audioxide Archive";
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "Blah blah blah";
    			t3 = space();
    			div = element("div");
    			label = element("label");
    			label.textContent = "Enter your email:";
    			t5 = space();
    			input = element("input");
    			t6 = space();
    			span1 = element("span");
    			span1.textContent = "Blah blah blah blah blah blah";
    			t8 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Blah";
    			t10 = space();
    			li1 = element("li");
    			li1.textContent = "Blah";
    			t12 = space();
    			li2 = element("li");
    			li2.textContent = "Blah";
    			t14 = space();
    			span2 = element("span");
    			span2.textContent = "Blah blah blah blah blah blah";
    			add_location(h2, file$4, 0, 0, 0);
    			add_location(span0, file$4, 2, 0, 28);
    			attr_dev(label, "for", "email");
    			add_location(label, file$4, 5, 4, 97);
    			attr_dev(input, "type", "email");
    			attr_dev(input, "id", "email");
    			attr_dev(input, "name", "email");
    			add_location(input, file$4, 6, 4, 146);
    			attr_dev(div, "class", "newsletter-signup-box svelte-5f4kcl");
    			add_location(div, file$4, 4, 0, 57);
    			add_location(span1, file$4, 9, 0, 199);
    			add_location(li0, file$4, 11, 4, 251);
    			add_location(li1, file$4, 12, 4, 269);
    			add_location(li2, file$4, 13, 4, 287);
    			add_location(ul, file$4, 10, 0, 242);
    			add_location(span2, file$4, 15, 0, 307);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t5);
    			append_dev(div, input);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, span1, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(ul, t10);
    			append_dev(ul, li1);
    			append_dev(ul, t12);
    			append_dev(ul, li2);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, span2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(span1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(span2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SignupBox', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SignupBox> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SignupBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SignupBox",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/ArchivePreview.svelte generated by Svelte v3.41.0 */

    const file$3 = "src/components/ArchivePreview.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			span = element("span");
    			span.textContent = "View archives";
    			if (!src_url_equal(img.src, img_src_value = "images/placeholder.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Text");
    			attr_dev(img, "class", "svelte-l2asq3");
    			add_location(img, file$3, 1, 4, 36);
    			add_location(span, file$3, 2, 4, 86);
    			attr_dev(div, "class", "preview-container");
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ArchivePreview', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ArchivePreview> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ArchivePreview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArchivePreview",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/newsletter-editions/TestNewsletter.svelte generated by Svelte v3.41.0 */

    const file$2 = "src/newsletter-editions/TestNewsletter.svelte";

    function create_fragment$2(ctx) {
    	let body;
    	let table7;
    	let tr8;
    	let td8;
    	let br0;
    	let t0;
    	let table6;
    	let tr7;
    	let td7;
    	let br1;
    	let t1;
    	let div0;
    	let t3;
    	let div1;
    	let t5;
    	let br2;
    	let t6;
    	let div2;
    	let p0;
    	let t8;
    	let p1;
    	let t10;
    	let p2;
    	let t12;
    	let p3;
    	let t14;
    	let p4;
    	let t16;
    	let hr0;
    	let t17;
    	let section3;
    	let h20;
    	let table0;
    	let tr0;
    	let td0;
    	let img0;
    	let img0_src_value;
    	let t19;
    	let table1;
    	let tr1;
    	let td1;
    	let h30;
    	let t21;
    	let h31;
    	let t23;
    	let p5;
    	let t25;
    	let span0;
    	let a0;
    	let t27;
    	let t28;
    	let hr1;
    	let t29;
    	let br3;
    	let t30;
    	let br4;
    	let table2;
    	let tr2;
    	let td2;
    	let img1;
    	let img1_src_value;
    	let t31;
    	let table3;
    	let tr3;
    	let td3;
    	let h32;
    	let t33;
    	let h33;
    	let t35;
    	let p6;
    	let t37;
    	let span1;
    	let a1;
    	let t39;
    	let t40;
    	let hr2;
    	let t41;
    	let br5;
    	let t42;
    	let br6;
    	let table4;
    	let tr4;
    	let td4;
    	let img2;
    	let img2_src_value;
    	let t43;
    	let table5;
    	let tr5;
    	let td5;
    	let h34;
    	let t45;
    	let h35;
    	let t47;
    	let p7;
    	let t49;
    	let span2;
    	let a2;
    	let t51;
    	let t52;
    	let hr3;
    	let t53;
    	let br7;
    	let t54;
    	let br8;
    	let t55;
    	let hr4;
    	let t56;
    	let hr5;
    	let t57;
    	let section2;
    	let h21;
    	let t59;
    	let div3;
    	let img3;
    	let img3_src_value;
    	let t60;
    	let h36;
    	let t62;
    	let p8;
    	let t64;
    	let span3;
    	let a3;
    	let t66;
    	let t67;
    	let hr6;
    	let t68;
    	let br9;
    	let t69;
    	let br10;
    	let t70;
    	let div4;
    	let img4;
    	let img4_src_value;
    	let t71;
    	let h37;
    	let t73;
    	let p9;
    	let t75;
    	let span4;
    	let a4;
    	let t77;
    	let t78;
    	let hr7;
    	let t79;
    	let br11;
    	let t80;
    	let br12;
    	let t81;
    	let div5;
    	let img5;
    	let img5_src_value;
    	let t82;
    	let h38;
    	let t84;
    	let p10;
    	let t86;
    	let span5;
    	let a5;
    	let t88;
    	let t89;
    	let hr8;
    	let t90;
    	let br13;
    	let t91;
    	let br14;
    	let t92;
    	let section0;
    	let h22;
    	let t94;
    	let p11;
    	let t96;
    	let div10;
    	let div6;
    	let a6;
    	let img6;
    	let img6_src_value;
    	let t97;
    	let div7;
    	let a7;
    	let img7;
    	let img7_src_value;
    	let t98;
    	let div8;
    	let a8;
    	let img8;
    	let img8_src_value;
    	let t99;
    	let div9;
    	let a9;
    	let img9;
    	let img9_src_value;
    	let t100;
    	let p12;
    	let t102;
    	let hr9;
    	let t103;
    	let hr10;
    	let t104;
    	let section1;
    	let h23;
    	let t106;
    	let p13;
    	let t108;
    	let img10;
    	let img10_src_value;
    	let t109;
    	let p14;
    	let t111;
    	let p15;
    	let t113;
    	let tr6;
    	let td6;
    	let br15;
    	let br16;
    	let t114;
    	let br17;
    	let br18;
    	let t115;
    	let a10;
    	let t117;
    	let a11;
    	let t119;
    	let br19;
    	let br20;
    	let t120;
    	let a12;
    	let br21;
    	let t122;
    	let br22;
    	let br23;

    	const block = {
    		c: function create() {
    			body = element("body");
    			table7 = element("table");
    			tr8 = element("tr");
    			td8 = element("td");
    			br0 = element("br");
    			t0 = space();
    			table6 = element("table");
    			tr7 = element("tr");
    			td7 = element("td");
    			br1 = element("br");
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "January 02021";
    			t3 = space();
    			div1 = element("div");
    			div1.textContent = "Delicious..FOOD";
    			t5 = space();
    			br2 = element("br");
    			t6 = space();
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut placerat felis sed euismod blandit. Donec ac iaculis velit.";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Maecenas cursus leo vel dui ullamcorper tincidunt. Pellentesque at massa sed ex lobortis volutpat. Aenean lorem arcu, ornare sed urna nec, aliquam euismod eros. Donec nisi arcu, fermentum at accumsan at, condimentum eu lorem. Non mollis dui cursus et. In et efficitur leo.";
    			t10 = space();
    			p2 = element("p");
    			p2.textContent = "Mauris eu sapien ac urna fermentum lacinia. Nam eu egestas massa, nec aliquam lorem. Vestibulum molestie metus ant.";
    			t12 = space();
    			p3 = element("p");
    			p3.textContent = "Be well,";
    			t14 = space();
    			p4 = element("p");
    			p4.textContent = "André, Fred, and Andrew";
    			t16 = space();
    			hr0 = element("hr");
    			t17 = space();
    			section3 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Album Reviews";
    			table0 = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			img0 = element("img");
    			t19 = space();
    			table1 = element("table");
    			tr1 = element("tr");
    			td1 = element("td");
    			h30 = element("h3");
    			h30.textContent = "MM..FOOD";
    			t21 = space();
    			h31 = element("h3");
    			h31.textContent = "MF DOOM";
    			t23 = space();
    			p5 = element("p");
    			p5.textContent = "‘Everything about MM..FOOD feels effortless. MF DOOM doesn’t try too hard - in fact it feels like he’s barely trying at all. It’s pure, natural talent that cannot be taught, nor replicated. He defies the expectations of wordplay time and time again.’";
    			t25 = space();
    			span0 = element("span");
    			a0 = element("a");
    			a0.textContent = "Full\n                    review";
    			t27 = text(" →");
    			t28 = space();
    			hr1 = element("hr");
    			t29 = space();
    			br3 = element("br");
    			t30 = space();
    			br4 = element("br");
    			table2 = element("table");
    			tr2 = element("tr");
    			td2 = element("td");
    			img1 = element("img");
    			t31 = space();
    			table3 = element("table");
    			tr3 = element("tr");
    			td3 = element("td");
    			h32 = element("h3");
    			h32.textContent = "Painting the Roses";
    			t33 = space();
    			h33 = element("h3");
    			h33.textContent = "Midnight Sister";
    			t35 = space();
    			p6 = element("p");
    			p6.textContent = "‘An eclectic mixture of indie rock and baroque pop, with not-so-subtle nods to psychedelia, jazz, dance, and classical music. Not every experiment pays off, but there’s bound to be something for everyone to enjoy.’";
    			t37 = space();
    			span1 = element("span");
    			a1 = element("a");
    			a1.textContent = "Full\n                    review";
    			t39 = text(" →");
    			t40 = space();
    			hr2 = element("hr");
    			t41 = space();
    			br5 = element("br");
    			t42 = space();
    			br6 = element("br");
    			table4 = element("table");
    			tr4 = element("tr");
    			td4 = element("td");
    			img2 = element("img");
    			t43 = space();
    			table5 = element("table");
    			tr5 = element("tr");
    			td5 = element("td");
    			h34 = element("h3");
    			h34.textContent = "Isles";
    			t45 = space();
    			h35 = element("h3");
    			h35.textContent = "Bicep";
    			t47 = space();
    			p7 = element("p");
    			p7.textContent = "‘Tracks swirl about at a slower pace than in Bicep’s debut, and it often feels as though in creating a ‘home version’ of their music they have instead cut out the excitement.’";
    			t49 = space();
    			span2 = element("span");
    			a2 = element("a");
    			a2.textContent = "Full\n                    review";
    			t51 = text(" →");
    			t52 = space();
    			hr3 = element("hr");
    			t53 = space();
    			br7 = element("br");
    			t54 = space();
    			br8 = element("br");
    			t55 = space();
    			hr4 = element("hr");
    			t56 = space();
    			hr5 = element("hr");
    			t57 = space();
    			section2 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Articles";
    			t59 = space();
    			div3 = element("div");
    			img3 = element("img");
    			t60 = space();
    			h36 = element("h3");
    			h36.textContent = "What would a music streaming minimum wage look like?";
    			t62 = space();
    			p8 = element("p");
    			p8.textContent = "Artists aren’t working for pennies any more - they’re working for fractions of fractions of pennies, and pressure is growing for systemic changes to the music industry meat grinder";
    			t64 = space();
    			span3 = element("span");
    			a3 = element("a");
    			a3.textContent = "Full\n          article";
    			t66 = text(" →");
    			t67 = space();
    			hr6 = element("hr");
    			t68 = space();
    			br9 = element("br");
    			t69 = space();
    			br10 = element("br");
    			t70 = space();
    			div4 = element("div");
    			img4 = element("img");
    			t71 = space();
    			h37 = element("h3");
    			h37.textContent = "How to Dismantle a Frontloaded Discography: U2’s studio albums ranked";
    			t73 = space();
    			p9 = element("p");
    			p9.textContent = "U2’s music often feels larger than life. Although their bombastic sound will always turn some listeners away, there is no denying the lasting impact of their finest records";
    			t75 = space();
    			span4 = element("span");
    			a4 = element("a");
    			a4.textContent = "Full\n          article";
    			t77 = text(" →");
    			t78 = space();
    			hr7 = element("hr");
    			t79 = space();
    			br11 = element("br");
    			t80 = space();
    			br12 = element("br");
    			t81 = space();
    			div5 = element("div");
    			img5 = element("img");
    			t82 = space();
    			h38 = element("h3");
    			h38.textContent = "The Avalanches marshal star-studded line up to delight in third album";
    			t84 = space();
    			p10 = element("p");
    			p10.textContent = "Gliding in under the radar at the tail end of last year, the Australian duo earned their 70-minute playtime and showed they’ve plenty left in the tank";
    			t86 = space();
    			span5 = element("span");
    			a5 = element("a");
    			a5.textContent = "Full\n          article";
    			t88 = text(" →");
    			t89 = space();
    			hr8 = element("hr");
    			t90 = space();
    			br13 = element("br");
    			t91 = space();
    			br14 = element("br");
    			t92 = space();
    			section0 = element("section");
    			h22 = element("h2");
    			h22.textContent = "Artwork Stories";
    			t94 = space();
    			p11 = element("p");
    			p11.textContent = "We added 24 album artwork credits to the database this month. Not all masterpieces, but not half bad, etc.";
    			t96 = space();
    			div10 = element("div");
    			div6 = element("div");
    			a6 = element("a");
    			img6 = element("img");
    			t97 = space();
    			div7 = element("div");
    			a7 = element("a");
    			img7 = element("img");
    			t98 = space();
    			div8 = element("div");
    			a8 = element("a");
    			img8 = element("img");
    			t99 = space();
    			div9 = element("div");
    			a9 = element("a");
    			img9 = element("img");
    			t100 = space();
    			p12 = element("p");
    			p12.textContent = "In hac habitasse platea dictumst. Suspendisse potenti. Aliquam ornare quis leo in suscipit. Cras at egestas nisi. Nam semper ultricies erat, et hendrerit ligula sagittis non. Integer ac enim eu leo aliquam luctus.";
    			t102 = space();
    			hr9 = element("hr");
    			t103 = space();
    			hr10 = element("hr");
    			t104 = space();
    			section1 = element("section");
    			h23 = element("h2");
    			h23.textContent = "Site Development";
    			t106 = space();
    			p13 = element("p");
    			p13.textContent = "In hac habitasse platea dictumst. Suspendisse potenti. Aliquam ornare quis leo in suscipit. Cras at egestas nisi. Nam semper ultricies erat, et hendrerit ligula sagittis non. Integer ac enim eu leo aliquam luctus.";
    			t108 = space();
    			img10 = element("img");
    			t109 = space();
    			p14 = element("p");
    			p14.textContent = "In hac habitasse platea dictumst. Suspendisse potenti. Aliquam ornare quis leo in suscipit. Cras at egestas nisi. Nam semper ultricies erat, et hendrerit ligula sagittis non. Integer ac enim eu leo aliquam luctus.";
    			t111 = space();
    			p15 = element("p");
    			p15.textContent = "In hac habitasse platea dictumst. Suspendisse potenti. Aliquam ornare quis leo in suscipit. Cras at egestas nisi.";
    			t113 = space();
    			tr6 = element("tr");
    			td6 = element("td");
    			br15 = element("br");
    			br16 = element("br");
    			t114 = text("\n                        © Audioxide. All rights reserved.\n                        ");
    			br17 = element("br");
    			br18 = element("br");
    			t115 = text("\n\n                        You are receiving this newsletter because you opted in on our website, or perhaps someone with your\n                        email address wanted you to suffer. Update your ");
    			a10 = element("a");
    			a10.textContent = "email\n                        preferences";
    			t117 = text(" or ");
    			a11 = element("a");
    			a11.textContent = "unsubscribe";
    			t119 = text(".\n                        ");
    			br19 = element("br");
    			br20 = element("br");
    			t120 = space();
    			a12 = element("a");
    			a12.textContent = "www.audioxide.com";
    			br21 = element("br");
    			t122 = space();
    			br22 = element("br");
    			br23 = element("br");
    			add_location(br0, file$2, 7, 12, 374);
    			add_location(br1, file$2, 13, 24, 646);
    			attr_dev(div0, "class", "title svelte-19hhq21");
    			add_location(div0, file$2, 14, 24, 675);
    			attr_dev(div1, "class", "title-blurb svelte-19hhq21");
    			add_location(div1, file$2, 15, 24, 738);
    			add_location(br2, file$2, 16, 24, 809);
    			add_location(p0, file$2, 19, 28, 891);
    			add_location(p1, file$2, 20, 28, 1046);
    			add_location(p2, file$2, 21, 28, 1355);
    			add_location(p3, file$2, 22, 28, 1506);
    			add_location(p4, file$2, 23, 28, 1550);
    			attr_dev(div2, "class", "body-text svelte-19hhq21");
    			add_location(div2, file$2, 18, 24, 839);
    			attr_dev(hr0, "class", "svelte-19hhq21");
    			add_location(hr0, file$2, 26, 24, 1638);
    			attr_dev(h20, "class", "svelte-19hhq21");
    			add_location(h20, file$2, 31, 28, 1756);
    			attr_dev(img0, "class", "album-artwork svelte-19hhq21");
    			if (!src_url_equal(img0.src, img0_src_value = "https://audioxide.com/api/images/album-artwork/mm-food-mf-doom-medium-square.jpg")) attr_dev(img0, "src", img0_src_value);
    			set_style(img0, "border", "3px solid #a84945");
    			add_location(img0, file$2, 34, 36, 2003);
    			attr_dev(td0, "class", "col svelte-19hhq21");
    			attr_dev(td0, "valign", "top");
    			add_location(td0, file$2, 33, 32, 1937);
    			add_location(tr0, file$2, 32, 28, 1900);
    			attr_dev(table0, "width", "204");
    			attr_dev(table0, "border", "0");
    			attr_dev(table0, "cellpadding", "0");
    			attr_dev(table0, "cellspacing", "0");
    			attr_dev(table0, "align", "left");
    			attr_dev(table0, "class", "force-row svelte-19hhq21");
    			add_location(table0, file$2, 31, 50, 1778);
    			attr_dev(h30, "class", "review-album svelte-19hhq21");
    			set_style(h30, "color", "#a84945");
    			add_location(h30, file$2, 44, 40, 2605);
    			attr_dev(h31, "class", "review-artist svelte-19hhq21");
    			add_location(h31, file$2, 45, 40, 2708);
    			attr_dev(p5, "class", "review-summary svelte-19hhq21");
    			add_location(p5, file$2, 46, 40, 2787);
    			attr_dev(a0, "href", "https://audioxide.com/reviews/mf-doom-mm-food/");
    			attr_dev(a0, "class", "svelte-19hhq21");
    			add_location(a0, file$2, 47, 66, 3134);
    			attr_dev(span0, "class", "review-link svelte-19hhq21");
    			add_location(span0, file$2, 47, 40, 3108);
    			attr_dev(td1, "class", "col svelte-19hhq21");
    			attr_dev(td1, "valign", "top");
    			add_location(td1, file$2, 43, 36, 2535);
    			add_location(tr1, file$2, 42, 32, 2494);
    			attr_dev(table1, "width", "284");
    			attr_dev(table1, "border", "0");
    			attr_dev(table1, "cellpadding", "0");
    			attr_dev(table1, "cellspacing", "0");
    			attr_dev(table1, "align", "right");
    			attr_dev(table1, "class", "force-row svelte-19hhq21");
    			add_location(table1, file$2, 41, 28, 2367);
    			attr_dev(hr1, "class", "invisible-divider svelte-19hhq21");
    			add_location(hr1, file$2, 53, 28, 3382);
    			add_location(br3, file$2, 54, 28, 3441);
    			add_location(br4, file$2, 55, 28, 3476);
    			attr_dev(img1, "class", "album-artwork svelte-19hhq21");
    			if (!src_url_equal(img1.src, img1_src_value = "https://audioxide.com/api/images/album-artwork/painting-the-roses-midnight-sister-medium-square.jpg")) attr_dev(img1, "src", img1_src_value);
    			set_style(img1, "border", "3px solid #6EAC6B");
    			add_location(img1, file$2, 58, 36, 3707);
    			attr_dev(td2, "class", "col svelte-19hhq21");
    			attr_dev(td2, "valign", "top");
    			add_location(td2, file$2, 57, 32, 3641);
    			add_location(tr2, file$2, 56, 28, 3604);
    			attr_dev(table2, "width", "204");
    			attr_dev(table2, "border", "0");
    			attr_dev(table2, "cellpadding", "0");
    			attr_dev(table2, "cellspacing", "0");
    			attr_dev(table2, "align", "left");
    			attr_dev(table2, "class", "force-row svelte-19hhq21");
    			add_location(table2, file$2, 55, 34, 3482);
    			attr_dev(h32, "class", "review-album svelte-19hhq21");
    			set_style(h32, "color", "#6EAC6B");
    			add_location(h32, file$2, 68, 40, 4328);
    			attr_dev(h33, "class", "review-artist svelte-19hhq21");
    			add_location(h33, file$2, 69, 40, 4441);
    			attr_dev(p6, "class", "review-summary svelte-19hhq21");
    			add_location(p6, file$2, 70, 40, 4528);
    			attr_dev(a1, "href", "https://audioxide.com/reviews/midnight-sister-painting-the-roses/");
    			attr_dev(a1, "class", "svelte-19hhq21");
    			add_location(a1, file$2, 71, 66, 4839);
    			attr_dev(span1, "class", "review-link svelte-19hhq21");
    			add_location(span1, file$2, 71, 40, 4813);
    			attr_dev(td3, "class", "col svelte-19hhq21");
    			attr_dev(td3, "valign", "top");
    			add_location(td3, file$2, 67, 36, 4258);
    			add_location(tr3, file$2, 66, 32, 4217);
    			attr_dev(table3, "width", "284");
    			attr_dev(table3, "border", "0");
    			attr_dev(table3, "cellpadding", "0");
    			attr_dev(table3, "cellspacing", "0");
    			attr_dev(table3, "align", "right");
    			attr_dev(table3, "class", "force-row svelte-19hhq21");
    			add_location(table3, file$2, 65, 28, 4090);
    			attr_dev(hr2, "class", "invisible-divider svelte-19hhq21");
    			add_location(hr2, file$2, 77, 28, 5106);
    			add_location(br5, file$2, 78, 28, 5165);
    			add_location(br6, file$2, 79, 28, 5200);
    			attr_dev(img2, "class", "album-artwork svelte-19hhq21");
    			if (!src_url_equal(img2.src, img2_src_value = "https://audioxide.com/api/images/album-artwork/isles-bicep-medium-square.jpg")) attr_dev(img2, "src", img2_src_value);
    			set_style(img2, "border", "3px solid #fb3f36");
    			add_location(img2, file$2, 82, 36, 5431);
    			attr_dev(td4, "class", "col svelte-19hhq21");
    			attr_dev(td4, "valign", "top");
    			add_location(td4, file$2, 81, 32, 5365);
    			add_location(tr4, file$2, 80, 28, 5328);
    			attr_dev(table4, "width", "204");
    			attr_dev(table4, "border", "0");
    			attr_dev(table4, "cellpadding", "0");
    			attr_dev(table4, "cellspacing", "0");
    			attr_dev(table4, "align", "left");
    			attr_dev(table4, "class", "force-row svelte-19hhq21");
    			add_location(table4, file$2, 79, 34, 5206);
    			attr_dev(h34, "class", "review-album svelte-19hhq21");
    			set_style(h34, "color", "#fb3f36");
    			add_location(h34, file$2, 92, 40, 6029);
    			attr_dev(h35, "class", "review-artist svelte-19hhq21");
    			add_location(h35, file$2, 93, 40, 6129);
    			attr_dev(p7, "class", "review-summary svelte-19hhq21");
    			add_location(p7, file$2, 94, 40, 6206);
    			attr_dev(a2, "href", "https://audioxide.com/reviews/bicep-isles/");
    			attr_dev(a2, "class", "svelte-19hhq21");
    			add_location(a2, file$2, 95, 66, 6478);
    			attr_dev(span2, "class", "review-link svelte-19hhq21");
    			add_location(span2, file$2, 95, 40, 6452);
    			attr_dev(td5, "class", "col svelte-19hhq21");
    			attr_dev(td5, "valign", "top");
    			add_location(td5, file$2, 91, 36, 5959);
    			add_location(tr5, file$2, 90, 32, 5918);
    			attr_dev(table5, "width", "284");
    			attr_dev(table5, "border", "0");
    			attr_dev(table5, "cellpadding", "0");
    			attr_dev(table5, "cellspacing", "0");
    			attr_dev(table5, "align", "right");
    			attr_dev(table5, "class", "force-row svelte-19hhq21");
    			add_location(table5, file$2, 89, 28, 5791);
    			attr_dev(hr3, "class", "invisible-divider svelte-19hhq21");
    			add_location(hr3, file$2, 101, 28, 6722);
    			add_location(br7, file$2, 102, 28, 6781);
    			add_location(br8, file$2, 103, 28, 6816);
    			attr_dev(hr4, "class", "invisible-divider svelte-19hhq21");
    			add_location(hr4, file$2, 104, 28, 6851);
    			attr_dev(hr5, "class", "svelte-19hhq21");
    			add_location(hr5, file$2, 106, 28, 6911);
    			attr_dev(h21, "class", "svelte-19hhq21");
    			add_location(h21, file$2, 108, 32, 6988);
    			attr_dev(img3, "class", "article-image svelte-19hhq21");
    			if (!src_url_equal(img3.src, img3_src_value = "https://audioxide.com/api/images/article-images/streaming-minimum-wage-spotify-meat-grinder-medium-original.jpg")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$2, 110, 36, 7101);
    			attr_dev(h36, "class", "article-title svelte-19hhq21");
    			add_location(h36, file$2, 111, 36, 7283);
    			attr_dev(p8, "class", "body-text svelte-19hhq21");
    			add_location(p8, file$2, 112, 36, 7403);
    			attr_dev(a3, "href", "https://audioxide.com/articles/what-would-a-music-streaming-minimum-wage-look-like/");
    			attr_dev(a3, "class", "svelte-19hhq21");
    			add_location(a3, file$2, 113, 63, 7672);
    			attr_dev(span3, "class", "article-link svelte-19hhq21");
    			add_location(span3, file$2, 113, 36, 7645);
    			attr_dev(div3, "class", "article-card svelte-19hhq21");
    			add_location(div3, file$2, 109, 32, 7038);
    			attr_dev(hr6, "class", "invisible-divider svelte-19hhq21");
    			add_location(hr6, file$2, 117, 32, 7874);
    			add_location(br9, file$2, 118, 32, 7937);
    			add_location(br10, file$2, 119, 32, 7976);
    			attr_dev(img4, "class", "article-image svelte-19hhq21");
    			if (!src_url_equal(img4.src, img4_src_value = "https://audioxide.com/api/images/article-images/u2-studio-albums-ranked-medium-original.jpg")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$2, 122, 36, 8079);
    			attr_dev(h37, "class", "article-title svelte-19hhq21");
    			add_location(h37, file$2, 123, 36, 8241);
    			attr_dev(p9, "class", "body-text svelte-19hhq21");
    			add_location(p9, file$2, 124, 36, 8384);
    			attr_dev(a4, "href", "https://audioxide.com/articles/u2-studio-albums-ranked/");
    			attr_dev(a4, "class", "svelte-19hhq21");
    			add_location(a4, file$2, 125, 63, 8645);
    			attr_dev(span4, "class", "article-link svelte-19hhq21");
    			add_location(span4, file$2, 125, 36, 8618);
    			attr_dev(div4, "class", "article-card svelte-19hhq21");
    			add_location(div4, file$2, 121, 32, 8016);
    			attr_dev(hr7, "class", "invisible-divider svelte-19hhq21");
    			add_location(hr7, file$2, 129, 32, 8819);
    			add_location(br11, file$2, 130, 32, 8882);
    			add_location(br12, file$2, 131, 32, 8921);
    			attr_dev(img5, "class", "article-image svelte-19hhq21");
    			if (!src_url_equal(img5.src, img5_src_value = "https://audioxide.com/api/images/article-images/we-will-always-love-you-the-avalanches-medium-original.jpg")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$2, 134, 36, 9024);
    			attr_dev(h38, "class", "article-title svelte-19hhq21");
    			add_location(h38, file$2, 135, 36, 9201);
    			attr_dev(p10, "class", "body-text svelte-19hhq21");
    			add_location(p10, file$2, 136, 36, 9338);
    			attr_dev(a5, "href", "https://audioxide.com/articles/the-avalanches-marshal-star-studded-line-up-in-third-album/");
    			attr_dev(a5, "class", "svelte-19hhq21");
    			add_location(a5, file$2, 137, 63, 9577);
    			attr_dev(span5, "class", "article-link svelte-19hhq21");
    			add_location(span5, file$2, 137, 36, 9550);
    			attr_dev(div5, "class", "article-card svelte-19hhq21");
    			add_location(div5, file$2, 133, 32, 8961);
    			attr_dev(hr8, "class", "invisible-divider svelte-19hhq21");
    			add_location(hr8, file$2, 141, 32, 9786);
    			add_location(br13, file$2, 142, 32, 9849);
    			add_location(br14, file$2, 143, 32, 9888);
    			attr_dev(h22, "class", "svelte-19hhq21");
    			add_location(h22, file$2, 147, 36, 9975);
    			attr_dev(p11, "class", "body-text svelte-19hhq21");
    			add_location(p11, file$2, 149, 36, 10037);
    			attr_dev(img6, "class", "artwork-story-image svelte-19hhq21");
    			if (!src_url_equal(img6.src, img6_src_value = "https://audioxide.com/api/images/album-artwork/straight-outta-compton-nwa-medium-square.jpg")) attr_dev(img6, "src", img6_src_value);
    			set_style(img6, "border", "3px solid black");
    			add_location(img6, file$2, 154, 48, 10401);
    			attr_dev(a6, "href", "#");
    			attr_dev(a6, "class", "svelte-19hhq21");
    			add_location(a6, file$2, 153, 44, 10340);
    			attr_dev(div6, "class", "one svelte-19hhq21");
    			add_location(div6, file$2, 152, 40, 10278);
    			attr_dev(img7, "class", "artwork-story-image svelte-19hhq21");
    			if (!src_url_equal(img7.src, img7_src_value = "https://audioxide.com/api/images/album-artwork/on-the-beach-neil-young-medium-square.jpg")) attr_dev(img7, "src", img7_src_value);
    			set_style(img7, "border", "3px solid lightblue");
    			add_location(img7, file$2, 161, 48, 10931);
    			attr_dev(a7, "href", "#");
    			attr_dev(a7, "class", "svelte-19hhq21");
    			add_location(a7, file$2, 160, 44, 10870);
    			attr_dev(div7, "class", "two svelte-19hhq21");
    			add_location(div7, file$2, 159, 40, 10808);
    			attr_dev(img8, "class", "artwork-story-image svelte-19hhq21");
    			if (!src_url_equal(img8.src, img8_src_value = "https://audioxide.com/api/images/album-artwork/in-utero-nirvana-medium-square.jpg")) attr_dev(img8, "src", img8_src_value);
    			set_style(img8, "border", "3px solid darkred");
    			add_location(img8, file$2, 168, 48, 11464);
    			attr_dev(a8, "href", "#");
    			attr_dev(a8, "class", "svelte-19hhq21");
    			add_location(a8, file$2, 167, 44, 11403);
    			attr_dev(div8, "class", "three svelte-19hhq21");
    			add_location(div8, file$2, 166, 40, 11339);
    			attr_dev(img9, "class", "artwork-story-image svelte-19hhq21");
    			if (!src_url_equal(img9.src, img9_src_value = "https://audioxide.com/api/images/album-artwork/the-specials-the-specials-medium-square.jpg")) attr_dev(img9, "src", img9_src_value);
    			set_style(img9, "border", "3px solid black");
    			add_location(img9, file$2, 175, 48, 11987);
    			attr_dev(a9, "href", "#");
    			attr_dev(a9, "class", "svelte-19hhq21");
    			add_location(a9, file$2, 174, 44, 11926);
    			attr_dev(div9, "class", "four svelte-19hhq21");
    			add_location(div9, file$2, 173, 40, 11863);
    			attr_dev(div10, "class", "artwork-story-box svelte-19hhq21");
    			add_location(div10, file$2, 151, 36, 10206);
    			attr_dev(p12, "class", "body-text svelte-19hhq21");
    			add_location(p12, file$2, 182, 36, 12433);
    			attr_dev(hr9, "class", "invisible-divider svelte-19hhq21");
    			add_location(hr9, file$2, 184, 36, 12709);
    			add_location(section0, file$2, 145, 32, 9928);
    			attr_dev(hr10, "class", "svelte-19hhq21");
    			add_location(hr10, file$2, 188, 32, 12817);
    			attr_dev(h23, "class", "svelte-19hhq21");
    			add_location(h23, file$2, 194, 36, 12963);
    			attr_dev(p13, "class", "body-text svelte-19hhq21");
    			add_location(p13, file$2, 196, 36, 13026);
    			if (!src_url_equal(img10.src, img10_src_value = "https://audioxide-wiki.neocities.org/Images/abbey-road-album-credit.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "class", "svelte-19hhq21");
    			add_location(img10, file$2, 198, 36, 13302);
    			attr_dev(p14, "class", "body-text svelte-19hhq21");
    			add_location(p14, file$2, 200, 36, 13423);
    			attr_dev(p15, "class", "body-text svelte-19hhq21");
    			add_location(p15, file$2, 202, 36, 13699);
    			add_location(section1, file$2, 192, 32, 12916);
    			add_location(br15, file$2, 211, 24, 14060);
    			add_location(br16, file$2, 211, 28, 14064);
    			add_location(br17, file$2, 213, 24, 14156);
    			add_location(br18, file$2, 213, 28, 14160);
    			attr_dev(a10, "href", "#");
    			attr_dev(a10, "class", "svelte-19hhq21");
    			add_location(a10, file$2, 216, 72, 14362);
    			attr_dev(a11, "href", "#");
    			attr_dev(a11, "class", "svelte-19hhq21");
    			add_location(a11, file$2, 217, 43, 14423);
    			add_location(br19, file$2, 218, 24, 14476);
    			add_location(br20, file$2, 218, 28, 14480);
    			attr_dev(a12, "href", "https://www.audioxide.com");
    			attr_dev(a12, "class", "svelte-19hhq21");
    			add_location(a12, file$2, 220, 24, 14510);
    			add_location(br21, file$2, 220, 81, 14567);
    			add_location(br22, file$2, 222, 24, 14597);
    			add_location(br23, file$2, 222, 28, 14601);
    			attr_dev(td6, "class", "container-padding footer-text svelte-19hhq21");
    			attr_dev(td6, "align", "left");
    			add_location(td6, file$2, 210, 20, 13980);
    			add_location(tr6, file$2, 209, 16, 13955);
    			add_location(section2, file$2, 107, 28, 6946);
    			add_location(section3, file$2, 29, 24, 1717);
    			attr_dev(td7, "class", "container-padding content svelte-19hhq21");
    			attr_dev(td7, "align", "left");
    			add_location(td7, file$2, 12, 20, 570);
    			add_location(tr7, file$2, 11, 16, 545);
    			attr_dev(table6, "border", "0");
    			attr_dev(table6, "width", "600");
    			attr_dev(table6, "cellpadding", "0");
    			attr_dev(table6, "cellspacing", "0");
    			attr_dev(table6, "class", "container svelte-19hhq21");
    			add_location(table6, file$2, 10, 12, 448);
    			attr_dev(td8, "align", "center");
    			attr_dev(td8, "valign", "top");
    			attr_dev(td8, "bgcolor", "#F0F0F0");
    			set_style(td8, "background-color", "#fff");
    			attr_dev(td8, "class", "svelte-19hhq21");
    			add_location(td8, file$2, 5, 8, 278);
    			add_location(tr8, file$2, 4, 4, 265);
    			attr_dev(table7, "border", "0");
    			attr_dev(table7, "width", "100%");
    			attr_dev(table7, "height", "100%");
    			attr_dev(table7, "cellpadding", "0");
    			attr_dev(table7, "cellspacing", "0");
    			attr_dev(table7, "bgcolor", "#fff");
    			attr_dev(table7, "class", "svelte-19hhq21");
    			add_location(table7, file$2, 3, 0, 168);
    			set_style(body, "margin", "0");
    			set_style(body, "padding", "0");
    			attr_dev(body, "bgcolor", "#F0F0F0");
    			attr_dev(body, "leftmargin", "0");
    			attr_dev(body, "topmargin", "0");
    			attr_dev(body, "marginwidth", "0");
    			attr_dev(body, "marginheight", "0");
    			attr_dev(body, "class", "svelte-19hhq21");
    			add_location(body, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, table7);
    			append_dev(table7, tr8);
    			append_dev(tr8, td8);
    			append_dev(td8, br0);
    			append_dev(td8, t0);
    			append_dev(td8, table6);
    			append_dev(table6, tr7);
    			append_dev(tr7, td7);
    			append_dev(td7, br1);
    			append_dev(td7, t1);
    			append_dev(td7, div0);
    			append_dev(td7, t3);
    			append_dev(td7, div1);
    			append_dev(td7, t5);
    			append_dev(td7, br2);
    			append_dev(td7, t6);
    			append_dev(td7, div2);
    			append_dev(div2, p0);
    			append_dev(div2, t8);
    			append_dev(div2, p1);
    			append_dev(div2, t10);
    			append_dev(div2, p2);
    			append_dev(div2, t12);
    			append_dev(div2, p3);
    			append_dev(div2, t14);
    			append_dev(div2, p4);
    			append_dev(td7, t16);
    			append_dev(td7, hr0);
    			append_dev(td7, t17);
    			append_dev(td7, section3);
    			append_dev(section3, h20);
    			append_dev(section3, table0);
    			append_dev(table0, tr0);
    			append_dev(tr0, td0);
    			append_dev(td0, img0);
    			append_dev(section3, t19);
    			append_dev(section3, table1);
    			append_dev(table1, tr1);
    			append_dev(tr1, td1);
    			append_dev(td1, h30);
    			append_dev(td1, t21);
    			append_dev(td1, h31);
    			append_dev(td1, t23);
    			append_dev(td1, p5);
    			append_dev(td1, t25);
    			append_dev(td1, span0);
    			append_dev(span0, a0);
    			append_dev(span0, t27);
    			append_dev(section3, t28);
    			append_dev(section3, hr1);
    			append_dev(section3, t29);
    			append_dev(section3, br3);
    			append_dev(section3, t30);
    			append_dev(section3, br4);
    			append_dev(section3, table2);
    			append_dev(table2, tr2);
    			append_dev(tr2, td2);
    			append_dev(td2, img1);
    			append_dev(section3, t31);
    			append_dev(section3, table3);
    			append_dev(table3, tr3);
    			append_dev(tr3, td3);
    			append_dev(td3, h32);
    			append_dev(td3, t33);
    			append_dev(td3, h33);
    			append_dev(td3, t35);
    			append_dev(td3, p6);
    			append_dev(td3, t37);
    			append_dev(td3, span1);
    			append_dev(span1, a1);
    			append_dev(span1, t39);
    			append_dev(section3, t40);
    			append_dev(section3, hr2);
    			append_dev(section3, t41);
    			append_dev(section3, br5);
    			append_dev(section3, t42);
    			append_dev(section3, br6);
    			append_dev(section3, table4);
    			append_dev(table4, tr4);
    			append_dev(tr4, td4);
    			append_dev(td4, img2);
    			append_dev(section3, t43);
    			append_dev(section3, table5);
    			append_dev(table5, tr5);
    			append_dev(tr5, td5);
    			append_dev(td5, h34);
    			append_dev(td5, t45);
    			append_dev(td5, h35);
    			append_dev(td5, t47);
    			append_dev(td5, p7);
    			append_dev(td5, t49);
    			append_dev(td5, span2);
    			append_dev(span2, a2);
    			append_dev(span2, t51);
    			append_dev(section3, t52);
    			append_dev(section3, hr3);
    			append_dev(section3, t53);
    			append_dev(section3, br7);
    			append_dev(section3, t54);
    			append_dev(section3, br8);
    			append_dev(section3, t55);
    			append_dev(section3, hr4);
    			append_dev(section3, t56);
    			append_dev(section3, hr5);
    			append_dev(section3, t57);
    			append_dev(section3, section2);
    			append_dev(section2, h21);
    			append_dev(section2, t59);
    			append_dev(section2, div3);
    			append_dev(div3, img3);
    			append_dev(div3, t60);
    			append_dev(div3, h36);
    			append_dev(div3, t62);
    			append_dev(div3, p8);
    			append_dev(div3, t64);
    			append_dev(div3, span3);
    			append_dev(span3, a3);
    			append_dev(span3, t66);
    			append_dev(section2, t67);
    			append_dev(section2, hr6);
    			append_dev(section2, t68);
    			append_dev(section2, br9);
    			append_dev(section2, t69);
    			append_dev(section2, br10);
    			append_dev(section2, t70);
    			append_dev(section2, div4);
    			append_dev(div4, img4);
    			append_dev(div4, t71);
    			append_dev(div4, h37);
    			append_dev(div4, t73);
    			append_dev(div4, p9);
    			append_dev(div4, t75);
    			append_dev(div4, span4);
    			append_dev(span4, a4);
    			append_dev(span4, t77);
    			append_dev(section2, t78);
    			append_dev(section2, hr7);
    			append_dev(section2, t79);
    			append_dev(section2, br11);
    			append_dev(section2, t80);
    			append_dev(section2, br12);
    			append_dev(section2, t81);
    			append_dev(section2, div5);
    			append_dev(div5, img5);
    			append_dev(div5, t82);
    			append_dev(div5, h38);
    			append_dev(div5, t84);
    			append_dev(div5, p10);
    			append_dev(div5, t86);
    			append_dev(div5, span5);
    			append_dev(span5, a5);
    			append_dev(span5, t88);
    			append_dev(section2, t89);
    			append_dev(section2, hr8);
    			append_dev(section2, t90);
    			append_dev(section2, br13);
    			append_dev(section2, t91);
    			append_dev(section2, br14);
    			append_dev(section2, t92);
    			append_dev(section2, section0);
    			append_dev(section0, h22);
    			append_dev(section0, t94);
    			append_dev(section0, p11);
    			append_dev(section0, t96);
    			append_dev(section0, div10);
    			append_dev(div10, div6);
    			append_dev(div6, a6);
    			append_dev(a6, img6);
    			append_dev(div10, t97);
    			append_dev(div10, div7);
    			append_dev(div7, a7);
    			append_dev(a7, img7);
    			append_dev(div10, t98);
    			append_dev(div10, div8);
    			append_dev(div8, a8);
    			append_dev(a8, img8);
    			append_dev(div10, t99);
    			append_dev(div10, div9);
    			append_dev(div9, a9);
    			append_dev(a9, img9);
    			append_dev(section0, t100);
    			append_dev(section0, p12);
    			append_dev(section0, t102);
    			append_dev(section0, hr9);
    			append_dev(section2, t103);
    			append_dev(section2, hr10);
    			append_dev(section2, t104);
    			append_dev(section2, section1);
    			append_dev(section1, h23);
    			append_dev(section1, t106);
    			append_dev(section1, p13);
    			append_dev(section1, t108);
    			append_dev(section1, img10);
    			append_dev(section1, t109);
    			append_dev(section1, p14);
    			append_dev(section1, t111);
    			append_dev(section1, p15);
    			append_dev(section2, t113);
    			append_dev(section2, tr6);
    			append_dev(tr6, td6);
    			append_dev(td6, br15);
    			append_dev(td6, br16);
    			append_dev(td6, t114);
    			append_dev(td6, br17);
    			append_dev(td6, br18);
    			append_dev(td6, t115);
    			append_dev(td6, a10);
    			append_dev(td6, t117);
    			append_dev(td6, a11);
    			append_dev(td6, t119);
    			append_dev(td6, br19);
    			append_dev(td6, br20);
    			append_dev(td6, t120);
    			append_dev(td6, a12);
    			append_dev(td6, br21);
    			append_dev(td6, t122);
    			append_dev(td6, br22);
    			append_dev(td6, br23);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TestNewsletter', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TestNewsletter> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TestNewsletter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestNewsletter",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/LinkToMainSite.svelte generated by Svelte v3.41.0 */

    const file$1 = "src/components/LinkToMainSite.svelte";

    function create_fragment$1(ctx) {
    	let a;
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			p = element("p");
    			p.textContent = "Go to main site →";
    			add_location(p, file$1, 2, 8, 104);
    			attr_dev(div, "class", "main-site-button button-text svelte-1ar1szn");
    			add_location(div, file$1, 1, 4, 53);
    			attr_dev(a, "href", "https://audioxide.com");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LinkToMainSite', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LinkToMainSite> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LinkToMainSite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LinkToMainSite",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.41.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let t0;
    	let testnewsletter;
    	let t1;
    	let linktomainsite;
    	let current;
    	header = new Header({ $$inline: true });
    	testnewsletter = new TestNewsletter({ $$inline: true });
    	linktomainsite = new LinkToMainSite({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(testnewsletter.$$.fragment);
    			t1 = space();
    			create_component(linktomainsite.$$.fragment);
    			add_location(main, file, 8, 0, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(testnewsletter, main, null);
    			append_dev(main, t1);
    			mount_component(linktomainsite, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(testnewsletter.$$.fragment, local);
    			transition_in(linktomainsite.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(testnewsletter.$$.fragment, local);
    			transition_out(linktomainsite.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(testnewsletter);
    			destroy_component(linktomainsite);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		SignupBox,
    		ArchivePreview,
    		TestNewsletter,
    		LinkToMainSite
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
