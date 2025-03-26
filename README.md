# 🖼️ MoMA Gender Disparity Visualizations

This project provides a museum-style data storytelling interface to explore gender disparities in the museum collection. Each visualization is framed like an artwork, embedded into a larger interactive gallery experience.

---

## 📁 Project Structure

```
/                 ← Root with museum layout (index.html)
├── /artwork_size/        ← Contains embedded visualization about gender disparities in artwork size
└──
├── /creation_date/        ← Contains embedded visualization about gender disparities in creation date
├── /department/        ← Contains embedded visualization about gender differences in department of the artwork
├── /gap/        ← Contains embedded visualization about Gender and the Time Lag in Acquisitions of Artwork
├── /medium/        ← Contains embedded visualization about gender differences in medium of the artwork
├── /puzzle/        ← Contains embedded visualization about gender disparities in average artwork per artist acquired by museum 
├── MoMA_merged_final.csv     ← The dataset we are using for data visualization
├── index.html     ← The large interactive gallery webpage that incorporated all the previous visualizations
└── museum2.jpeg    ← The background of the gallery webpage
```

---

## 🚀 How to Run Locally

No build tools or servers are required — you can run everything directly from your computer.

### 🧾 Steps:

1. **Download or clone the repo:**
2. **Open `index.html` in your browser:**
   - Go Live for `index.html`
3. **(optional) Access each visualization**
   - Click the corresponding folder
   - Go Live for the corresponding html

   ✅ All internal visualizations and datasets are already linked correctly

---

## 🌐 GitHub Pages Deployment

If you'd like to view the project online:

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
