# 🖼️ MoMA Gender Disparity Visualizations

This project provides a museum-style data storytelling interface to explore gender disparities in the museum collection. Each visualization is framed like an artwork, embedded into a larger interactive gallery experience.

**Group Members: Xiaonan Li, Molly Han**

---

## 📁 Project Structure

```
/                 ← Root with museum layout
├── /artwork_size/                  ← Embedded visualization: Gender disparities in artwork size
├── /creation_date/                 ← Embedded visualization: Gender disparities in creation dates
├── /department/                    ← Embedded visualization: Gender differences across departments of artwork
├── /gap/                           ← Embedded visualization: Time lag in artwork acquisitions by gender
   └── data.json                             ← JSON dataset for bubble popularization
├── /medium/                        ← Embedded visualization: Gender differences in medium used
├── /puzzle/                        ← Embedded visualization: Average artworks acquired per artist by gender
   └── png files                             ← Image assets used for assembling the puzzle interface
├── MoMA_merged_final.csv           ← Dataset used in visualizations
├── back.png                        ← BAckground image for wall layout
├── index.html                      ← Main interactive museum page that includes all visualizations
└── museum2.jpeg                    ← Background image for the museum layout
```

---

## 🚀 How to Run Locally

No build tools or servers are required — you can run everything directly from your computer.

### 🧾 Steps:

1. **Download or clone the repo**
2. **Go Live for `index.html`**
3. **(Optional) Explore visualizations individually**
   - You can also open any `.html` file inside folders like `/gap/`, `/department/`, etc., to view that chart on its own.

   ✅ All internal visualizations and datasets are already linked correctly

---

## 🌐 View It Live

This project is also hosted via GitHub Pages:

Please access: https://xiashaoyixue.github.io/CS-441/

## 🎨 About the Visuals

Each visualization highlights a unique perspective on gender disparities within the museum's acquisition history. These visualizations are embedded into the main gallery-style interface (`index.html`) using <`iframe`>, allowing viewers to browse them as if walking through a physical exhibit.

- All visualizations are now fully implemented as interactive "artworks", each driven by data and framed like pieces in a digital gallery.
- The main interface (`index.html`) now supports click-based navigation, guided viewing order, and modal zooming to explore each visualization in detail.
- Viewers are encouraged to follow a prescribed path, aligned with the narrative arc of the accompanying poem. Once all visualizations have been explored, the interface unlocks and allows free navigation.
- The visualizations remain modular — each can still be accessed independently by opening its corresponding HTML file.
- The poem component is now fully integrated, both within each individual HTML page and on the main landing page."
