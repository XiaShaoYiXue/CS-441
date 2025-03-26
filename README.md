# 🖼️ MoMA Gender Disparity Visualizations

This project provides a museum-style data storytelling interface to explore gender disparities in the museum collection. Each visualization is framed like an artwork, embedded into a larger interactive gallery experience.

---

## 📁 Project Structure

```
/                 ← Root with museum layout (index.html)
├── /artwork_size/            ← Embedded visualization: Gender disparities in artwork size
├── /creation_date/           ← Embedded visualization: Gender disparities in creation dates
├── /department/              ← Embedded visualization: Gender differences across departments of artwork
├── /gap/                     ← Embedded visualization: Time lag in artwork acquisitions by gender
├── /medium/                  ← Embedded visualization: Gender differences in medium used
├── /puzzle/                  ← Embedded visualization: Average artworks acquired per artist by gender
├── MoMA_merged_final.csv     ← Dataset used in visualizations
├── index.html                ← Main interactive museum page that includes all visualizations
└── museum2.jpeg              ← Background image for the museum layout
```

---

## 🚀 How to Run Locally

No build tools or servers are required — you can run everything directly from your computer.

### 🧾 Steps:

1. **Download or clone the repo:**
2. **Open `index.html` in your browser:**
   - Go Live for `index.html`
3. **(Optional) Explore visualizations individually**
   - You can also open any `.html` file inside folders like `/gap/`, `/department/`, etc., to view that chart on its own.

   ✅ All internal visualizations and datasets are already linked correctly

---

## 🌐 View It Live

This project is also hosted via GitHub Pages:

Please access: https://xiashaoyixue.github.io/CS-441/

## 🎨 About the Visuals

Each visualization focuses on a different angle of gender disparities in museum artwork acquisitions. They are imported into the main museum-style interface using `<iframe>` for a cohesive walkthrough experience.

- Artworks are represented with visual figures
- Bubbles, timelines, and scrollable views show data evolution
- Files are modular and can also be explored individually

---

## 🛠️ Credits

This project uses [D3.js](https://d3js.org) and standard web technologies (HTML/CSS/JS).


Feel free to fork, remix, or feature individual visuals in your own data storytelling projects!
