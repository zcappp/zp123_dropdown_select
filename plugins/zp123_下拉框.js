import React from "react"
import css from "../css/zp123_下拉框.css"

function render(ref) {
    if (!ref.props.dbf) return <div>请配置表单字段</div>
    const value = ref.getForm(ref.props.dbf)
    const idx = ref.options.indexOf(value)
    return <React.Fragment>
        <div onClick={() => pop(ref)} className={(ref.open ? "open": "") + (ref.input ? " zfiltered": "")} >
            {ref.open && ref.props.filter && <input onChange={e => {ref.input = e.target.value; ref.render()}} autoComplete="off"/>}
            <p>{ref.labels[idx]}</p>
            {svg}
        </div>
        {ref.open && <ul>{ref.input ? filter(ref) : ref.options.map((o, i) => 
            <li onClick={() => select(ref, o)} className={i === ref.idx ? "selected" : ""} key={i}>{ref.labels[i] === "" ? <br/> : ref.labels[i]}</li>
        )}</ul>}
    </React.Fragment>
}

function onInit(ref) {
    const { exc, props, render } = ref
    ref.options = exc('clone(o)', { o: props.options || ref.children })
    ref.labels = exc('clone(o)', { o: props.labels || ref.options })
    if (!Array.isArray(ref.options) || !Array.isArray(ref.labels)) {
        ref.options = []
        ref.labels = []
        warn("options/labels必须是数组")
    } else {
        if (ref.options.length !== ref.labels.length) warn("options/labels的长度必须一致")
        for (let i = 0; i <= ref.labels.length - 1; i++) {
            if (typeof ref.labels[i] === "string") continue
            warn("labels的元素必须是文本类型", ref.labels[i])
            ref.labels[i] = ref.labels[i] + ""
        }
        if (props.insertEmpty) {
            ref.options.unshift("")
            ref.labels.unshift("")
        }
    }
    ref.clickOutside = e => {
        if (ref.container.contains(e.target)) return // Do nothing if clicking on container's element or descendent elements
        ref.open = false
        render()
    }
    ref.keyDown = e => {
        switch (e.which) {
            case 27: // Esc
                ref.open = false
                return render()
            case 13: // Enter
                return ref.input ? select(ref, ref.options[ref.labels.findIndex(a => a.includes(ref.input))]) : select(ref, ref.options[ref.idx])
            case 38: // Up
            case 40: // Down
                e.preventDefault()
                ref.idx = ((ref.idx <= 0 ? ref.options.length : ref.idx) + (e.which === 38 ? -1 : 1)) % ref.options.length
                return render()
        }
    }
}

function filter(ref) {
    let options = []
    let labels = []
    for (let i = 0; i <= ref.labels.length - 1; i++) {
        if (!ref.labels[i].includes(ref.input)) continue
        labels.push(ref.labels[i])
        options.push(ref.options[i])
    }
    return options.map((o, i) => <li onClick={() => select(ref, o)} key={i}>{labels[i] === "" ? <br/> : labels[i]}</li>)
}

function select(ref, o) {
    ref.input = ""
    ref.open = false
    ref.setForm(ref.props.dbf, o === "" ? undefined : o)
    if (ref.props.onChange) ref.exc(ref.props.onChange, { ...ref.ctx, $x: o }, () => ref.exc("render()"))
}

function pop(ref) {
    ref.open = !ref.open
    if (ref.open) ref.idx = ref.options.indexOf(ref.getForm(ref.props.dbf))
    ref.render()
    setTimeout(() => {
        ref.input = ""
        if (ref.open) {
            ref.container.firstElementChild.firstElementChild.focus()
            document.addEventListener("keydown", ref.keyDown)
            document.addEventListener("mousedown", ref.clickOutside)
            document.addEventListener("touchstart", ref.clickOutside)
        } else {
            document.removeEventListener("keydown", ref.keyDown)
            document.removeEventListener("mousedown", ref.clickOutside)
            document.removeEventListener("touchstart", ref.clickOutside)
        }
    }, 9)
}

function onDestroy(ref) {
    document.removeEventListener("keydown", ref.keyDown)
    document.removeEventListener("mousedown", ref.clickOutside)
    document.removeEventListener("touchstart", ref.clickOutside)
}


$plugin({
    id: "zp123",
    props: [{
        prop: "dbf",
        type: "text",
        label: "表单字段"
    }, {
        prop: "options",
        type: "text",
        label: "options选项数组",
        ph: "用括弧包裹表达式，优先于子组件"
    }, {
        prop: "labels",
        type: "text",
        label: "labels标签数组",
        ph: "不填则同options"
    }, {
        prop: "filter",
        type: "switch",
        label: "可过滤"
    }, {
        prop: "insertEmpty",
        type: "switch",
        label: "添加空白选项"
    }, {
        prop: "onChange",
        type: "exp",
        label: "onChange表达式"
    }],
    render,
    onInit,
    onDestroy,
    css
})

const svg = <svg className="zsvg" viewBox="64 64 896 896"><path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 0 0 0 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"/></svg>