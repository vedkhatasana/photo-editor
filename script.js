let filters = {
    brightness: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%"
    },
    contrast: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%"
    },
    saturation: {
        value: 100,
        min: 0,
        max: 200,
        unit: "%"
    },
    hueRotation: {
        value: 0,
        min: 0,
        max: 360,
        unit: "deg"
    },
    blur: {
        value: 0,
        min: 0,
        max: 20,
        unit: "px"
    },
    grayscale: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%"
    },
    sepia: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%"
    },
    opacity: {
        value: 100,
        min: 0,
        max: 100,
        unit: "%"
    },
    invert: {
        value: 0,
        min: 0,
        max: 100,
        unit: "%"
    },
}

const defaultFilters = JSON.parse(JSON.stringify(filters))

const imageCanvas = document.querySelector("#image-canvas")
const imgInput = document.querySelector("#image-input")
const canvasCtx = imageCanvas.getContext("2d")
const resetButton = document.querySelector("#reset-btn")
const downloadButton = document.querySelector("#download-btn")
const presetsContainer = document.querySelector(".presets")
const filtersContainer = document.querySelector(".filters")
const bottomContainer = document.querySelector(".bottom")

// new feature buttons
const flipHBtn = document.querySelector("#flip-h-btn")
const flipVBtn = document.querySelector("#flip-v-btn")
const rotateBtn = document.querySelector("#rotate-btn")
const zoomInBtn = document.querySelector("#zoom-in-btn")
const zoomOutBtn = document.querySelector("#zoom-out-btn")

let file = null
let image = null
let flipH = false
let flipV = false
let rotation = 0
let zoom = 1

// ── Tab switching ──
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"))
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"))
        btn.classList.add("active")
        document.querySelector(`#tab-${btn.dataset.tab}`).classList.add("active")
    })
})

// ── Create filter elements ──
function createFilterElement(name, unit = "%", value, min, max) {
    const div = document.createElement("div")
    div.classList.add("filter")

    const header = document.createElement("div")
    header.classList.add("filter-header")

    const p = document.createElement("p")
    p.innerText = name

    const valueLabel = document.createElement("span")
    valueLabel.innerText = value + unit

    header.appendChild(p)
    header.appendChild(valueLabel)

    const input = document.createElement("input")
    input.type = "range"
    input.min = min
    input.max = max
    input.value = value
    input.id = name

    // colored track progress
    const progress = ((value - min) / (max - min)) * 100
    input.style.setProperty("--progress", progress + "%")

    div.appendChild(header)
    div.appendChild(input)

    input.addEventListener("input", (event) => {
        filters[name].value = input.value
        valueLabel.innerText = input.value + unit
        const p = ((input.value - min) / (max - min)) * 100
        input.style.setProperty("--progress", p + "%")
        applyFilters()
    })

    return div
}

function createFilters() {
    Object.keys(filters).forEach(key => {
        const filterElement = createFilterElement(key, filters[key].unit, filters[key].value, filters[key].min, filters[key].max)
        filtersContainer.appendChild(filterElement)
    })
}

createFilters()

// ── Load image ──
imgInput.addEventListener("change", (event) => {
    file = event.target.files[0]
    loadImage(file)
})

function loadImage(file) {
    if (!file) return
    const imagePlaceholder = document.querySelector(".placeholder")
    imageCanvas.style.display = "block"
    imagePlaceholder.style.display = "none"

    const img = new Image()
    img.src = URL.createObjectURL(file)

    img.onload = () => {
        image = img
        imageCanvas.width = img.width
        imageCanvas.height = img.height
        applyFilters()
    }
}

// ── Drag & Drop ──
bottomContainer.addEventListener("dragover", (e) => {
    e.preventDefault()
    bottomContainer.classList.add("drag-over")
})
bottomContainer.addEventListener("dragleave", () => {
    bottomContainer.classList.remove("drag-over")
})
bottomContainer.addEventListener("drop", (e) => {
    e.preventDefault()
    bottomContainer.classList.remove("drag-over")
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
        file = droppedFile
        loadImage(file)
    }
})

// ── Apply filters ──
function applyFilters() {
    if (!image) return

    // recalculate canvas size based on rotation
    const isRotated = rotation % 180 !== 0
    imageCanvas.width = isRotated ? image.height : image.width
    imageCanvas.height = isRotated ? image.width : image.height

    canvasCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height)

    canvasCtx.globalAlpha = filters.opacity.value / 100

    canvasCtx.filter = `
        brightness(${filters.brightness.value}${filters.brightness.unit})
        contrast(${filters.contrast.value}${filters.contrast.unit})
        saturate(${filters.saturation.value}${filters.saturation.unit})
        hue-rotate(${filters.hueRotation.value}${filters.hueRotation.unit})
        blur(${filters.blur.value}${filters.blur.unit})
        grayscale(${filters.grayscale.value}${filters.grayscale.unit})
        sepia(${filters.sepia.value}${filters.sepia.unit})
    `.trim()

    canvasCtx.save()
    canvasCtx.translate(imageCanvas.width / 2, imageCanvas.height / 2)
    canvasCtx.rotate((rotation * Math.PI) / 180)
    canvasCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    canvasCtx.drawImage(image, -image.width / 2, -image.height / 2)
    canvasCtx.restore()

    // invert via pixel manipulation
    if (filters.invert.value > 0) {
        const amount = filters.invert.value / 100
        const imageData = canvasCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
            data[i]     = data[i]     + (255 - 2 * data[i])     * amount
            data[i + 1] = data[i + 1] + (255 - 2 * data[i + 1]) * amount
            data[i + 2] = data[i + 2] + (255 - 2 * data[i + 2]) * amount
        }
        canvasCtx.putImageData(imageData, 0, 0)
    }

    imageCanvas.style.transform = `scale(${zoom})`
}

// ── Transform buttons ──
flipHBtn.addEventListener("click", () => {
    flipH = !flipH
    flipHBtn.style.color = flipH ? "var(--accent-color)" : ""
    applyFilters()
})

flipVBtn.addEventListener("click", () => {
    flipV = !flipV
    flipVBtn.style.color = flipV ? "var(--accent-color)" : ""
    applyFilters()
})

rotateBtn.addEventListener("click", () => {
    rotation = (rotation + 90) % 360
    applyFilters()
})

zoomInBtn.addEventListener("click", () => {
    zoom = Math.min(zoom + 0.1, 3)
    applyFilters()
})

zoomOutBtn.addEventListener("click", () => {
    zoom = Math.max(zoom - 0.1, 0.3)
    applyFilters()
})

// ── Reset ──
resetButton.addEventListener("click", () => {
    Object.keys(filters).forEach(key => {
        filters[key].value = defaultFilters[key].value
    })
    flipH = false
    flipV = false
    rotation = 0
    zoom = 1
    flipHBtn.style.color = ""
    flipVBtn.style.color = ""
    document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"))
    applyFilters()
    filtersContainer.innerHTML = ""
    createFilters()
})

// ── Download ──
downloadButton.addEventListener("click", () => {
    const link = document.createElement("a")
    link.download = "edited-image.png"
    link.href = imageCanvas.toDataURL()
    link.click()
})

// ── Presets ──
const presets = {
    default: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hueRotation: 0,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        opacity: 100,
        invert: 0
    },
    vintage: {
        brightness: 110,
        contrast: 85,
        saturation: 75,
        hueRotation: 10,
        blur: 0,
        grayscale: 0,
        sepia: 40,
        opacity: 100,
        invert: 0
    },
    blackAndWhite: {
        brightness: 100,
        contrast: 120,
        saturation: 0,
        hueRotation: 0,
        blur: 0,
        grayscale: 100,
        sepia: 0,
        opacity: 100,
        invert: 0
    },
    cinematic: {
        brightness: 90,
        contrast: 130,
        saturation: 80,
        hueRotation: 0,
        blur: 0,
        grayscale: 0,
        sepia: 20,
        opacity: 100,
        invert: 0
    },
    cold: {
        brightness: 105,
        contrast: 110,
        saturation: 90,
        hueRotation: 200,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        opacity: 100,
        invert: 0
    },
    warm: {
        brightness: 110,
        contrast: 100,
        saturation: 120,
        hueRotation: 340,
        blur: 0,
        grayscale: 0,
        sepia: 20,
        opacity: 100,
        invert: 0
    },
    dramatic: {
        brightness: 85,
        contrast: 150,
        saturation: 110,
        hueRotation: 0,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        opacity: 100,
        invert: 0
    },
    softGlow: {
        brightness: 120,
        contrast: 90,
        saturation: 110,
        hueRotation: 0,
        blur: 2,
        grayscale: 0,
        sepia: 10,
        opacity: 100,
        invert: 0
    },
    nightmare: {
        brightness: 80,
        contrast: 140,
        saturation: 50,
        hueRotation: 180,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        opacity: 100,
        invert: 100
    },
    faded: {
        brightness: 115,
        contrast: 80,
        saturation: 70,
        hueRotation: 0,
        blur: 0,
        grayscale: 20,
        sepia: 15,
        opacity: 90,
        invert: 0
    }
}

Object.keys(presets).forEach(presetName => {
    const presetButton = document.createElement("button")
    presetButton.classList.add("preset-btn")
    presetButton.innerText = presetName

    presetsContainer.appendChild(presetButton)

    presetButton.addEventListener("click", () => {
        const preset = presets[presetName]

        Object.keys(preset).forEach(filterName => {
            filters[filterName].value = preset[filterName]
        })

        document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"))
        presetButton.classList.add("active")

        applyFilters()
        filtersContainer.innerHTML = ""
        createFilters()
    })
})